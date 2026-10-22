const pool = require('../db-local');

const COLUMNAS_PUBLICAS = 'id, taller_id, nombre_alumno, boleta, fecha_registro';

//registrar asistencia

async function registrarasistencia({taller_id, nombre_alumno, boleta}) {
    const [info] = await pool.query(
        `INSERT INTO asistencias (taller_id, nombre_alumno, boleta) VALUES (?,?,?)`,
        [taller_id, nombre_alumno, boleta]
    );
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS} FROM asistencias WHERE id = ?`,
        [info.insertId]
    );
    return filas[0];
}

//consultar lista de asistencias

async function consultarlistadeasistencia({taller_id} = {}) {
    if (taller_id !== undefined) {
        const [filas] = await pool.query(
            `SELECT ${COLUMNAS_PUBLICAS} FROM asistencias WHERE taller_id = ? ORDER BY id`,
            [taller_id]
        );
        return filas;
    }

    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_PUBLICAS} FROM asistencias ORDER BY id`
    );
    return filas;
}

module.exports = {
    registrarasistencia,
    consultarlistadeasistencia
};