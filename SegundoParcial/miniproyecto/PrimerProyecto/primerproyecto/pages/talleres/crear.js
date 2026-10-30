import Link from 'next/link';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import { validarTaller } from '../../lib/validaciones';

export default function CrearTaller() {
  const [rol, setRol] = useState(null);
  const [nombre, setNombre] = useState('');
  const [instructor, setInstructor] = useState('');
  const [fecha, setFecha] = useState('');
  const [cupo, setCupo] = useState('30');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setRol(window.sessionStorage.getItem('primerproyecto_rol'));
  }, []);

  async function registrar(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!validarTaller({ nombre, fecha, cupo })) {
      return setError('Escribe un nombre y una fecha válidos, y un cupo entero mayor que cero.');
    }

    setGuardando(true);
    try {
      const taller = await pedirJSON('/talleres', {
        method: 'POST',
        body: JSON.stringify({
          nombre: nombre.trim(),
          instructor: instructor.trim(),
          fecha,
          cupo: Number(cupo),
        }),
      });
      setExito(`El taller "${taller.nombre}" se creó correctamente.`);
      setNombre('');
      setInstructor('');
      setFecha('');
      setCupo('30');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (rol === null) {
    return (
      <main>
        <h1>Crear taller</h1>
        <p>Esta opción está disponible para cuentas de administrador.</p>
        <p><Link href="/usuarios/crear">Crea una cuenta de administrador</Link> para continuar.</p>
      </main>
    );
  }

  if (rol !== 'admin') {
    return (
      <main>
        <h1>Crear taller</h1>
        <p className="error">Solo una cuenta de administrador puede crear talleres.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Crear taller</h1>
      <form onSubmit={registrar} className="formulario">
        <label htmlFor="nombre-taller">Nombre del taller</label>
        <input
          id="nombre-taller"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label htmlFor="instructor">Instructor (opcional)</label>
        <input
          id="instructor"
          value={instructor}
          onChange={(e) => setInstructor(e.target.value)}
        />

        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />

        <label htmlFor="cupo">Cupo</label>
        <input
          id="cupo"
          type="number"
          min="1"
          step="1"
          value={cupo}
          onChange={(e) => setCupo(e.target.value)}
          required
        />

        <button type="submit" disabled={guardando}>
          {guardando ? 'Creando…' : 'Crear taller'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {exito && <p className="exito">{exito}</p>}
      {exito && <p><Link href="/talleres">Ver talleres</Link></p>}
    </main>
  );
}