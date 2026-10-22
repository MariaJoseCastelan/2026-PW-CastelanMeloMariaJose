const pool = require('../db-local');

const COLUMNAS_PUBLICAS = 'id, nombre, instructor, fecha, cupo';

//consultar todos los talleres (función de usuario)
async function consultarTalleres() {
    const [filas] = await pool.query(`SELECT ${COLUMNAS_PUBLICAS} FROM talleres ORDER BY id`);
    return filas;
}

//registrar taller (función de usuario)
async function registrarTaller({nombre, instructor, fecha, cupo}) {
    const [info] = await pool.query(`INSERT INTO talleres (nombre, instructor, fecha, cupo) VALUES (?,?,?,?)`, [nombre, instructor, fecha, cupo]);
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS} FROM talleres WHERE id = ?`,
        [info.insertId]
    );
    return filas[0];
}


module.exports = {
    consultarTalleres,
    registrarTaller
};