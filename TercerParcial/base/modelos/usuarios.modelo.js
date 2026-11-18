// Consultas a la tabla usuarios. Siempre con ? (consulta parametrizada), nunca pegando texto en el SQL.
const bcrypt = require('bcryptjs');

function crearModeloUsuarios(pool) {
  // Regresa el usuario (sin el hash) si la contraseña es correcta, o null si no.
  async function verificar(usuario, contrasena) {
    // Paso 2 (en clase)
    // Si no mandan texto (por ejemplo el body vino vacío) regreso null de una vez,
    // porque bcrypt.compare truena si le pasas undefined.
    if (typeof usuario !== 'string' || typeof contrasena !== 'string') return null;

    // Con ? el valor viaja aparte del SQL, así nadie puede meter SQL en el campo usuario.
    const [filas] = await pool.query(
      'SELECT id, usuario, nombre, rol, contrasena_hash FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    // Si el usuario no existe regreso null, igual que cuando la contraseña está mal:
    // así el servidor contesta lo mismo en los dos casos y no le damos pistas al atacante.
    if (filas.length === 0) return null;

    const fila = filas[0];
    // bcrypt.compare cifra lo escrito y lo compara con el hash guardado.
    const coincide = await bcrypt.compare(contrasena, fila.contrasena_hash);
    if (!coincide) return null;

    // Regreso solo lo que la página necesita: el hash nunca sale de aquí.
    return { id: fila.id, usuario: fila.usuario, nombre: fila.nombre, rol: fila.rol };
  }

  return { verificar };
}

module.exports = { crearModeloUsuarios };
