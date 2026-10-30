import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import { formatearFecha, ocultarBoleta } from '../../lib/formato';
import { normalizarNombre, validarBoleta, validarNombre } from '../../lib/validaciones';
import estilos from '../../styles/Talleres.module.css';

// /talleres/[id] — detalle de un taller.
// PASO 4: datos del taller, barra de lugares y lista de inscritos
//         (GET /api/talleres/:id y GET /api/talleres/:id/asistencias).
// PASO 5: formulario de inscripción (POST /api/asistencias).
export default function DetalleTaller() {
  const router = useRouter();
  const { id } = router.query;

  const [taller, setTaller] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [errorCarga, setErrorCarga] = useState('');

  // TODO paso 5.1: estados del formulario.
  const [nombre, setNombre] = useState('');
  const [boleta, setBoleta] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  // TODO paso 4.1: useEffect que espere a router.isReady y llame a cargar().
 useEffect(() => {
    // En el primer render router.query todavía viene vacío: hay que esperar a router.isReady.
    if (!router.isReady) return;

    // Si se llegó desde /perfil, la boleta y el nombre vienen en la URL (?boleta=...&nombre=...).
    if (router.query.boleta) setBoleta(String(router.query.boleta));
    if (router.query.nombre) setNombre(String(router.query.nombre));

    cargar();
  }, [router.isReady, id]);

  async function cargar() {
    try {
      setTaller(await pedirJSON(`/talleres/${id}`));
      setAsistencias(await pedirJSON(`/talleres/${id}/asistencias`));
      setErrorCarga('');
    } catch (err) {
      setErrorCarga(err.message);
    }
  }

  // TODO paso 4.2: cálculo de lugares (ocupados, libres, lleno).
  // Lugares: se calculan con lo que ya está en el estado (cada vez que cambia, React vuelve a calcular).
  const ocupados = asistencias.length;
  const libres = taller ? Math.max(0, taller.cupo - ocupados) : 0;
  const lleno = taller !== null && libres === 0;

  // TODO paso 5.2: función inscribir(e).
    async function inscribir(e) {
    e.preventDefault();
    setErrorForm('');
    setExito('');

    // El backend de esta semana no revisa cupo ni inscripciones repetidas: lo cuida el front.
    const nombreLimpio = nombre.trim();
    const boletaLimpia = boleta.trim();
    if (!nombreLimpio) return setErrorForm('Escribe tu nombre.');
    if (!validarNombre(nombreLimpio)) {
      return setErrorForm('El nombre solo puede contener letras y espacios, y tener máximo 50 caracteres.');
    }
    if (!validarBoleta(boletaLimpia)) return setErrorForm('La boleta debe tener 10 dígitos y solo deben ser números.');
    if (lleno) return setErrorForm('El taller ya no tiene lugares.');

    setEnviando(true);
    try {
      const talleres = await pedirJSON('/talleres');
      const listasAsistencias = await Promise.all(
        talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`))
      );
      const asistenciasRegistradas = listasAsistencias.flat();
      const boletaRegistrada = asistenciasRegistradas.some(
        (asistencia) => asistencia.boleta === boletaLimpia
      );
      if (boletaRegistrada) {
        return setErrorForm('Esta boleta ya está inscrita en un taller. Cada boleta solo puede inscribirse a un taller.');
      }
      const boletaDiferente = asistenciasRegistradas
        .some(
          (asistencia) =>
            normalizarNombre(asistencia.nombre_alumno) === normalizarNombre(nombreLimpio) &&
            asistencia.boleta !== boletaLimpia
        );
      if (boletaDiferente) {
        return setErrorForm('Este nombre ya está asociado con otra boleta.');
      }

      await pedirJSON('/asistencias', {
        method: 'POST',
        body: JSON.stringify({ taller_id: id, nombre_alumno: nombreLimpio, boleta: boletaLimpia }),
      });
      setExito(`¡Listo! ${nombreLimpio} quedó inscrito(a) en el taller.`);
      setNombre('');
      setBoleta('');
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  }

    if (errorCarga) {
    return (
      <main>
        <p className="error">{errorCarga}</p>
        <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
      </main>
    );
  }
  if (!taller) return <main><p>Cargando taller…</p></main>;

  const porcentaje = Math.min(100, (ocupados / taller.cupo) * 100);

  return (
    <main>
      <Link className={estilos.volver} href="/talleres">← Volver a talleres</Link>
      <h1>{taller.nombre}</h1>
      <section className={estilos.panel}>
        <p><strong>Instructor:</strong> {taller.instructor || 'Por confirmar'}</p>
        <p><strong>Fecha:</strong> {formatearFecha(taller.fecha)}</p>
        <div className={estilos.barra}>
          <div className={estilos.relleno} style={{ width: `${porcentaje}%` }} />
        </div>
        <p>
          {ocupados} de {taller.cupo} lugares ocupados ·{' '}
          {lleno ? (
            <span className={estilos.lleno}>Taller lleno</span>
          ) : (
            `${libres} ${libres === 1 ? 'lugar libre' : 'lugares libres'}`
          )}
        </p>
      </section>

       <section className={estilos.panel}>
        <h2>Inscribirme</h2>
        <form onSubmit={inscribir} className="formulario">
          <input
            placeholder="Nombre completo"
            value={nombre}
            maxLength={50}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input placeholder="Boleta (10 dígitos)" value={boleta} onChange={(e) => setBoleta(e.target.value)} />
          <button type="submit" disabled={lleno || enviando}>
            {lleno ? 'Sin lugares' : enviando ? 'Inscribiendo…' : 'Inscribirme'}
          </button>
        </form>
        {errorForm && <p className="error">{errorForm}</p>}
        {exito && <p className={estilos.exito}>{exito}</p>}
      </section>

      <h2>Inscritos ({ocupados})</h2>
            {ocupados === 0 ? (
        <p>Todavía no hay inscritos. ¡Sé el primero!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Boleta</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a, i) => (
              <tr key={a.id}>
                <td>{i + 1}</td>
                <td>{a.nombre_alumno}</td>
                <td>{ocultarBoleta(a.boleta)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
 );

}
