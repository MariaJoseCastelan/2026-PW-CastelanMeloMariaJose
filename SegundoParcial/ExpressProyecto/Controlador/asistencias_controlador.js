
const asistenciasModel = require('../Modelo/asistencias');

async function registrarAsistencia(req, res) {
    const {taller_id, nombre_alumno, boleta} = req.body || {};
    if (!taller_id || !nombre_alumno || !boleta) {
        return res.status(400).json({error: 'taller_id, nombre_alumno y boleta son obligatorios'});
    }

    try {
        const asistencia = await asistenciasModel.registrarasistencia({
            taller_id,
            nombre_alumno,
            boleta
        });
        res.status(201).json(asistencia);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

async function consultarListaDeAsistencia(req, res) {
    const {taller_id} = req.query;
    if (taller_id !== undefined && (!/^\d+$/.test(taller_id) || Number(taller_id) < 1)) {
        return res.status(400).json({error: 'taller_id debe ser un número entero positivo'});
    }

    try {
        const asistencias = await asistenciasModel.consultarlistadeasistencia(
            taller_id === undefined ? {} : {taller_id: Number(taller_id)}
        );
        res.json(asistencias);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    registrarAsistencia,
    consultarListaDeAsistencia
};