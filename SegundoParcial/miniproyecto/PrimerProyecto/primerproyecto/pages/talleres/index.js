import { useEffect, useState } from 'react';
import { pedirJSON } from '../../lib/api';
import TarjetaTaller from '../../components/TarjetaTaller';
import estilos from '../../styles/Talleres.module.css';

// /talleres — lista de talleres (GET /api/talleres).
// PASO 2: lista sencilla con estados de carga y error.
// PASO 3: cambia la lista por tarjetas (components/TarjetaTaller.js) en una rejilla.
// PASO 7: agrega el buscador.
export default function Talleres() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // TODO paso 2: useEffect que llame a cargarTalleres() una sola vez, al abrir la página.
   useEffect(() => {
    cargarTalleres();
  }, []);

  async function cargarTalleres() {
    // TODO paso 2: pide '/talleres' con pedirJSON y guarda el resultado en el estado.
    try {
      setTalleres(await pedirJSON('/talleres'));
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // El filtro no vuelve a pedir datos al backend: trabaja sobre el arreglo que ya está en el estado.
  const texto = busqueda.trim().toLowerCase();
  const visibles = talleres.filter((t) => `${t.nombre} ${t.instructor || ''}`.toLowerCase().includes(texto));

    return (
    <main>
      <h1>Talleres</h1>
      <input
        className={estilos.buscador}
        placeholder="Buscar por nombre o instructor"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p>Cargando talleres…</p>}
      {error && <p className="error">{error}</p>}
      {!cargando && !error && talleres.length === 0 && <p>No hay talleres registrados.</p>}
      {!cargando && !error && talleres.length > 0 && visibles.length === 0 && (
        <p>No hay talleres que coincidan con la búsqueda.</p>
      )}

      <div className={estilos.rejilla}>
        {visibles.map((t) => (
          <TarjetaTaller key={t.id} taller={t} />
        ))}
      </div>
    </main>
  );
}

