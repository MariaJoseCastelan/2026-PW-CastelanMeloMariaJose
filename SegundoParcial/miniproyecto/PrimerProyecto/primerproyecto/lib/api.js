// Todas las peticiones al backend pasan por aquí, para no repetir en cada página el mismo manejo de errores.
// La ruta es relativa (/api/...): next.config.js la reenvía al backend del puerto 3001.
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BACKEND_CAIDO = 'El backend no responde: arráncalo con npm start en backend-memoria (puerto 3001).';

// PASO 1 de la guía: escribe esta función.
// pedirJSON('/talleres') debe hacer fetch a `${API_URL}/api/talleres`, regresar el JSON de la respuesta
// y, si algo sale mal, lanzar un Error con un mensaje que se pueda mostrar en pantalla.
export async function pedirJSON(ruta, opciones = {}) {
  // TODO paso 1
  let res;
  try {
    res = await fetch(`${API_URL}/api${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
  } catch {
    // Sin proxy (NEXT_PUBLIC_API_URL) y con el backend apagado, fetch falla antes de recibir respuesta.
    throw new Error(BACKEND_CAIDO);
  }

  // Un 204 no trae cuerpo, y con el backend apagado el proxy de Next responde 500 en texto, no en JSON.
  let datos = null;
  try {
    datos = await res.json();
  } catch {
    datos = null;
  }

  if (!res.ok) {
    if (datos && datos.error) throw new Error(datos.error);
    throw new Error(res.status === 500 ? BACKEND_CAIDO : `El backend respondió ${res.status}`);
  }
  return datos;
}
