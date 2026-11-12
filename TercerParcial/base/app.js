// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');

const NOMBRE_COOKIE = 'connect.sid';

// Regresa todas las sesiones del almacén (MemoryStore usa callback; MySQLStore regresa una promesa).
function todasLasSesiones(almacen) {
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) => (error ? reject(error) : resolve(sesiones)));
    if (promesa && typeof promesa.then === 'function') promesa.then(resolve, reject);
  });
}

// Respuesta para lo que todavía no programamos.
const pendiente = (paso) => (req, res) =>
  res.status(501).json({ error: `501 · Falta programarlo en clase (paso ${paso})` });

// pool: la conexión a MySQL (db.js). Los usuarios SIEMPRE se leen de MySQL.
function crearApp(config, pool) {
  const app = express();
  app.use(express.json());
  const usuarios = crearModeloUsuarios(pool);

  // Aquí vive lo que el servidor recuerda de cada sesión:
  //  - 'mysql':   en la tabla sessions. Sobrevive a un reinicio y la puedes ver en Workbench.
  //  - 'memoria': en la memoria del proceso. Si el servidor se reinicia, se pierde todo.
  const almacen =
    config.almacen === 'memoria'
      ? new session.MemoryStore()
      : new MySQLStore({ createDatabaseTable: false, clearExpired: false }, pool);
  app.locals.almacen = almacen;

  // Paso 1 (en clase): configurar express-session aquí, ANTES de las rutas.
  app.use(session({
    name: NOMBRE_COOKIE,
    //aqui tenemos que definir si es secreta, si es publica o como es su acceso
    secret: process.env.SESSION_SECRET || 'secreto-solo-para-mi',
    resave: false,
    saveUninitialized: false,
    rolling: config.rolling,
    cookie: {
      maxAge: config.maxAge || 1000 * 60 * 60 * 24, // 1 día
      httpOnly: config.httpOnly || true,
      sameSite: config.sameSite || 'lax',
      secure: config.secure || false,
    }
  }));

  // necesitamos los primeros 8 caracteres del id de sesion, para compartirlos en pantalla para visualizarlos, en la realidad, muy pocas veces se hace esto. Los primeros 8 caracteres del id de sesión, para poder compararlos en pantalla.
  const idCorto = (id) => (id ? `${id.slice(0, 8)}…` : null);

  // ---------- Middlewares de protección ----------

   //como estamos ocupando un middleware de la app, necesitamos verificar el vencimiento de la sesión express-session alarga por defecto el vencimiento guardando en el servidor por cada petición aunque el rolling sea en false, si solo confiamos enesto alguien nos puede copiar la cookie y mantener viva la sesión creando un defecto de seguridad.


  // Paso 5 (en clase): función vencida(sesion).

  function vencida(idSesion) {
    const desde = config.rolling ? sesion.ultimoUso : sesion.creada;
    return Date.now() - desde > config.maxAge;
  }

  // 401: "no sé quién eres" (no hay sesión o ya venció).
  function requiereSesion(req, res, next) {
    if(req.session.usuario && vencida(req.session)) {
      return req.session.destroy(() =>{
        res.clearExpiredCookie(NOMBRE_COOKIE);
        res.status(401).json({ error: '401 · Tu sesión se vencio, vuelve a iniciar sesión' });
      });
    }
    if (!req.session.usuario) {
      return res.status(401).json({ error: '401 · No has inciado sesión con tu usuario' });
    }
    req.session.ultimoUso = Date.now();
    next();
  }

  // 403: "sé quién eres, pero no tienes permiso".
  function requiereRol(rol) {
    return (req, res, next) => {
      if (req.session.usuario.rol !== rol) {
        return res.json({error: `403. Eres ${req.session.usuario.rol}, pero esta ruta es solo para ${rol}`});
      }
      next();
    };
  }


  // ---------- Rutas ----------

  app.get('/api/config', (req, res) => res.config);
  //vamos a crear una ruta para un perfil visitante y obtener su sesión a partir de una cookie.
  // Guarda un contador en la sesión. Sirve para ver que la sesión existe antes de entrar
  // (y para la demostración de fijación de sesión).
  app.post('/api/visita', (req, res) => {
    if (!req.session) return res.json({error: 'No tiene una sesión asociada'});
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({ visitas: req.session.visitas, sesion: idCorto(req.sessionID) });
  });

  // Paso 2 (en clase): iniciar sesión. Paso 7 (en clase): regenerar el id al entrar.
  app.post('/api/login', async (req, res, next) => {
    try{
      const {usuario, contrasena} = req.body || {};
      const datos = await usuarios.verificar(usuario, contrasena);
      if(!datos) return res.status(401).json({error: 'Usuario o contraseña incorrecto'});

      //debemos de crear la sesión
      const antes = req.session.visitas !== undefined ? idCorto(req.sessionID) : null;
      const visitas = req.session.visitas || 0;
      //que vamos a guardar
      const guardar = () => {
        req.session.usuario = datos;
        req.session.visitas = visitas;
        req.session.ultimoUso = Date.now();
        req.session.save((error) => {
          if(error) return next(error);
          res.json({usuario : datos, sesionAntes : antes, sesionDespues : idCorto(req.sessionID)});
        });
      };
      if(config.regenerarAlEntrar){
        //vamos a regenerar la sesión
        req.session.regenerate((error) =>  (error ? next(error) : guardar()));
      }else{
        guardar();
      }
    }catch(error){
      next(error);
    }
  });

  // Paso 2 (en clase): cerrar sesión.
  app.post('/api/logout', (req, res, next) => {
    req.session.destroy((error) => {
     res.clearCookie(NOMBRE_COOKIE);
     res.json({mensaje : 'Sesión cerrada'});
    });
  });

  app.get('/api/sesion', requiereSesion, (req, res) => {
    const desde = config.rolling ? req.session.ultimoUso : req.session.creada;
    res.json({
      usuario: req.session.usuario,
      sesion: idCorto(req.sessionID),
      expiraEnSegundos: Math.max(0, Math.round((desde + config.maxAgeMs - Date.now()) / 1000)),
    });
  });

  app.get('/api/perfil', requiereSesion, (req, res) => {
    req.session.visitas = (req.session.visitas || 0) + 1;
    res.json({ mensaje: `Hola, ${req.session.usuario.nombre}`, rol: req.session.usuario.rol, visitas: req.session.visitas });
  });

 
  app.get('/api/admin/reporte', requiereSesion, requiereRol('admin'), (req, res) => {
    res.json({ reporte: 'Talleres: 3 · Inscritos: 57 · Cupo libre: 18' });
  });

  // SOLO PARA LA CLASE: muestra lo que el servidor guarda de cada sesión.
  // Un servidor real NUNCA expone esto.
  //para verificar que la sesion tiene un comportamiento adecuado es necesario realizar una prueba unitaria al código
  app.get('/api/diagnostico/sesiones', async (req, res, next) => {
    try {
      const sesiones = await todasLasSesiones(almacen);
      const lista = Object.entries(sesiones || {}).map(([id, s]) => ({
        sesion: idCorto(id),
        esLaTuya: id === req.sessionID,
        usuario: s.usuario ? s.usuario.usuario : '(sin iniciar sesión)',
        visitas: s.visitas || 0,
        expira: s.cookie && s.cookie.expires,
      })); 
      res.json({ almacen: config.almacen, sesiones: lista });
    } catch (error) {
      next(error);
    }
  });

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  });

  return app;
}

module.exports = { crearApp, NOMBRE_COOKIE };

//primera tarea : Deberán desarrollar una infografía sobre el uso de jwt para el inicio de sesion para el dia Domingo 15 de Noviembre
//segunda tarea : Deberán de desarrollar la implementación del codigo para realizar la autenticacion y pruebas de sesiones conforme al documento para el archivo (demo.js)