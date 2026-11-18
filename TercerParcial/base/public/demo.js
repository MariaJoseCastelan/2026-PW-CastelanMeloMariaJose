// Esta página solo le hace fetch a la API y pinta lo que responde.
// No me encargo de las cookies: el navegador las manda solo porque
// la página y el servidor están en el mismo lugar (mismo origen).

// Atajo para no escribir document.getElementById todo el tiempo
const $ = (id) => document.getElementById(id);

// Una sola función para hablar con la API, así no se repite el fetch en cada botón.
// Regresa { status, datos } porque fetch no truena con un 401 o 403.
async function llamar(metodo, url, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  // El Content-Type solo va si se manda cuerpo; sin esto express.json() no lee el JSON.
  if (cuerpo) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }
  // No se pone credentials: 'include' porque es el mismo servidor.
  const respuesta = await fetch(url, opciones);
  let datos = null;
  // Si la respuesta no es JSON, .json() ya no sirve; con el try/catch se deja datos en null y no se cae toda la página.
  try { datos = await respuesta.json(); } catch { datos = null; }
  return { status: respuesta.status, datos };
}

// Agrega una línea a la bitácora con el código, el método, la URL y el JSON.
// Sirve para ver en la página qué contestó el servidor sin abrir F12.
function anotar(metodo, url, status, datos) {
  const li = document.createElement('li');
  const clase = status < 300 ? 'ok' : status === 401 ? 'e401' : status === 403 ? 'e403' : 'error';
  // Aquí se usa innerHTML porque status, metodo y url se ponen aquí,no vienen del servidor.
  li.innerHTML = `<span class="codigo ${clase}">${status}</span> <code>${metodo} ${url}</code>`;
  const cuerpo = document.createElement('pre');
  // El JSON sí viene del servidor, por eso va con textContent: así se muestra como texto y no se ejecuta.
  cuerpo.textContent = JSON.stringify(datos, null, 2);
  li.appendChild(cuerpo);
  // prepend para que lo más nuevo quede hasta arriba
  $('bitacora').prepend(li);
}

// Le pregunta al servidor quién soy y lo muestra en la tarjeta 1
async function refrescarEstado() {
  const { status, datos } = await llamar('GET', '/api/sesion');
  const estado = $('estado');
  // Solo el 200 significa que hay sesión; cualquier otro código es "sin sesión"
  if (status === 200) {
    estado.textContent = `${datos.usuario.nombre} · rol ${datos.usuario.rol} · sesión ${datos.sesion} · vence en ${datos.expiraEnSegundos} s`;
    estado.className = 'estado con-sesion';
  } else {
    estado.textContent = 'Sin sesión (el servidor responde 401)';
    estado.className = 'estado sin-sesion';
  }
 
  $('cookie-js').textContent = document.cookie || '(vacío)';
}

// Pinta la tabla de la tarjeta 4 con las sesiones que tiene el servidor.
// Es solo para la clase, un servidor de verdad nunca enseñaría esto.
async function refrescarSesiones() {
  const { datos: respuesta } = await llamar('GET', '/api/diagnostico/sesiones');
  // Si la petición falló, uso un arreglo vacío para que no truene más abajo
  const datos = respuesta ? respuesta.sesiones : [];
  if (respuesta) {
    // Según el almacén se le dice al usuario dónde viven las sesiones
    $('donde').textContent = respuesta.almacen === 'memoria'
      ? 'En la MEMORIA del servidor: se borra al reiniciarlo.'
      : 'En MySQL, tabla sessions. En Workbench: SELECT * FROM demo_sesiones.sessions;';
  }
  const cuerpo = $('tabla-sesiones');
  // Vacía el tbody antes de llenarlo; si no, las filas se duplican cada vez que se le da a "Actualizar tabla".
  cuerpo.innerHTML = '';
  if (!datos || datos.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="4">(sin sesiones)</td></tr>';
    return;
  }
  for (const s of datos) {
    const fila = document.createElement('tr');
    // La clase "tuya" resalta mi propia sesión entre las demás
    if (s.esLaTuya) fila.className = 'tuya';
    const vence = s.expira ? new Date(s.expira).toLocaleTimeString() : '—';
    for (const valor of [s.sesion + (s.esLaTuya ? ' (la tuya)' : ''), s.usuario, s.visitas, vence]) {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.appendChild(celda);
    }
    cuerpo.appendChild(fila);
  }
}

// Después de cada acción se actualizan las dos cosas (estado y tabla).
async function refrescarTodo() {
  await refrescarEstado();
  await refrescarSesiones();
}

// Al cambiar de usuario se pone su contraseña de ejemplo (usuario + 12345)
$('usuario').addEventListener('change', () => {
  $('contrasena').value = `${$('usuario').value}12345`;
});

$('form-login').addEventListener('submit', async (evento) => {
  // Sin preventDefault el formulario recarga la página y se pierde todo
  evento.preventDefault();
  const cuerpo = { usuario: $('usuario').value, contrasena: $('contrasena').value };
  const { status, datos } = await llamar('POST', '/api/login', cuerpo);
  anotar('POST', '/api/login', status, datos);
  await refrescarTodo();
});

for (const boton of document.querySelectorAll('[data-url]')) {
  boton.addEventListener('click', async () => {
    const { metodo, url } = boton.dataset;
    const { status, datos } = await llamar(metodo, url);
    anotar(metodo, url, status, datos);
    await refrescarTodo();
  });
}

$('btn-refrescar').addEventListener('click', refrescarTodo);
// Este botón solo actualiza la tabla, no el estado
$('btn-sesiones').addEventListener('click', refrescarSesiones);

llamar('GET', '/api/config').then(({ datos }) => {
  $('config').textContent = JSON.stringify(datos, null, 2);
});
refrescarTodo();
