import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../../lib/api';
import { validarBoleta, validarContrasena, validarCorreo, validarNombre } from '../../lib/validaciones';

export default function CrearUsuario() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [boleta, setBoleta] = useState('');
  const [rol, setRol] = useState('alumno');
  const [errores, setErrores] = useState({});
  const [errorRegistro, setErrorRegistro] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo(campo, actualizar, valor) {
    actualizar(valor);
    setErrores((actuales) => ({ ...actuales, [campo]: '' }));
    setErrorRegistro('');
    setExito('');
  }

  async function registrar(e) {
    e.preventDefault();
    setErrores({});
    setErrorRegistro('');
    setExito('');

    const datos = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      contrasena,
      boleta: boleta.trim(),
      rol,
    };
    const nuevosErrores = {};
    if (!validarNombre(datos.nombre)) {
      nuevosErrores.nombre = 'Usa solo letras y espacios (máximo 25 caracteres).';
    }
    if (!validarCorreo(datos.correo)) {
      nuevosErrores.correo = 'Usa solo letras, números, puntos y @ (ejemplo: usuario@dominio.com).';
    }
    if (!validarBoleta(datos.boleta)) nuevosErrores.boleta = 'La boleta debe tener exactamente 10 dígitos y solo números.';
    if (!validarContrasena(datos.contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (Object.keys(nuevosErrores).length > 0) return setErrores(nuevosErrores);

    setGuardando(true);
    try {
      const usuarios = await pedirJSON('/usuarios');
      const cuentaExistente = usuarios.some(
        (usuario) =>
          usuario.correo.toLowerCase() === datos.correo.toLowerCase() ||
          usuario.boleta === datos.boleta
      );
      if (cuentaExistente) {
        setErrorRegistro('Ya existe una cuenta con ese correo o boleta. No puedes registrarte de nuevo con otro tipo de cuenta.');
        return;
      }

      const usuario = await pedirJSON('/usuarios', {
        method: 'POST',
        body: JSON.stringify(datos),
      });
      window.sessionStorage.setItem('primerproyecto_rol', usuario.rol);
      setExito(
        usuario.rol === 'admin'
          ? 'Cuenta de administrador creada. Ya puedes crear talleres.'
          : 'Cuenta de alumno creada correctamente.'
      );
      setNombre('');
      setCorreo('');
      setContrasena('');
      setBoleta('');
    } catch (err) {
      setErrorRegistro(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main>
      <h1>Crear cuenta</h1>
      <p>Regístrate como alumno o administrador.</p>
      <form onSubmit={registrar} className="formulario" noValidate>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          value={nombre}
          maxLength={50}
          onChange={(e) => actualizarCampo('nombre', setNombre, e.target.value)}
          aria-invalid={Boolean(errores.nombre)}
          aria-describedby={errores.nombre ? 'error-nombre' : undefined}
          required
        />
        {errores.nombre && <span id="error-nombre" className="error-campo">{errores.nombre}</span>}

        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => actualizarCampo('correo', setCorreo, e.target.value)}
          aria-invalid={Boolean(errores.correo)}
          aria-describedby={errores.correo ? 'error-correo' : undefined}
          required
        />
        {errores.correo && <span id="error-correo" className="error-campo">{errores.correo}</span>}

        <label htmlFor="boleta">Boleta (10 dígitos)</label>
        <input
          id="boleta"
          inputMode="numeric"
          value={boleta}
          onChange={(e) => actualizarCampo('boleta', setBoleta, e.target.value)}
          aria-invalid={Boolean(errores.boleta)}
          aria-describedby={errores.boleta ? 'error-boleta' : undefined}
          required
        />
        {errores.boleta && <span id="error-boleta" className="error-campo">{errores.boleta}</span>}

        <label htmlFor="contrasena">Contraseña (mínimo 8 caracteres)</label>
        <input
          id="contrasena"
          type="password"
          minLength={8}
          value={contrasena}
          onChange={(e) => actualizarCampo('contrasena', setContrasena, e.target.value)}
          aria-invalid={Boolean(errores.contrasena)}
          aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
          required
        />
        {errores.contrasena && (
          <span id="error-contrasena" className="error-campo">{errores.contrasena}</span>
        )}

        <label htmlFor="rol">Tipo de cuenta</label>
        <select
          id="rol"
          value={rol}
          onChange={(e) => {
            setRol(e.target.value);
            setExito('');
          }}
        >
          <option value="alumno">Alumno</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" disabled={guardando}>
          {guardando ? 'Registrando…' : 'Registrar cuenta'}
        </button>
      </form>
      {errorRegistro && <p className="error" role="alert">{errorRegistro}</p>}
      {exito && <p className="exito">{exito}</p>}
      {exito && rol === 'admin' && <p><Link href="/talleres/crear">Ir a crear talleres</Link></p>}
    </main>
  );
}