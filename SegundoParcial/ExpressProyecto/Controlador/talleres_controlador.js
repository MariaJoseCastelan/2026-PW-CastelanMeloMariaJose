
const talleresModel = require('../Modelo/talleres');

async function consultarTalleres(req, res) {
    try {
        const talleres = await talleresModel.consultarTalleres();
        res.json(talleres);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

async function registrarTaller(req, res) {
    const {nombre, instructor, fecha, cupo} = req.body || {};
    if (!nombre || !instructor || !fecha || cupo === undefined || cupo === null || cupo === '') {
        return res.status(400).json({error: 'nombre, instructor, fecha y cupo son obligatorios'});
    }

    try {
        const taller = await talleresModel.registrarTaller({nombre, instructor, fecha, cupo});
        res.status(201).json(taller);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = {
    consultarTalleres,
    registrarTaller
};