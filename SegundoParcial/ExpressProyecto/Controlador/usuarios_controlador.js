const bcrypt = require('bcryptjs');
//necesitamos al modelo
const usuariosModel = require('../Modelo/usuarios');

const {validarCorreo, validarBoleta, validarContrasena} = require('../validaciones');

//que pasa si el correo y la boleta se duplican

function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';

}

async function listarUsuarios(req, res) {
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

async function obtenerUsuario(req, res) {
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
       res.status(500).json({error: error.message});
    }
}

async function crearUsuario(req, res) {
   const {nombre, correo, contrasena, boleta, rol} = req.body;
    if (!nombre || !correo || !contrasena || !boleta ) {
        return res.status(400).json({error: 'nombre, correo, contrasena y boleta son obliogatorios, favor de verificar los datos'});
    }
    if(!validarCorreo(correo)) return res.status(400).json({error: 'El correo tiene un formato no valido'});
    if(!validarBoleta(boleta)) return res.status(400).json({error: 'La boleta debe tener 8 digitos'});
    if(!validarContrasena(contrasena)) return res.status(400).json({error: 'La contraseña debe tener al menos 8 caracteres'});

   try{
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const usuario = await usuariosModel.crear({nombre, correo, contrasenaHash, boleta, rol});
        res.status(201).json(usuario);
   } catch (error) {
        if(esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con esa boleta o correo'});
        res.status(500).json({error: error.message});
   }
    
}

async function actualizarUsuario(req, res) {
    const {nombre, correo, rol} = req.body;
    if(nombre === undefined && correo === undefined && rol === undefined){
        return res.status(400).json({error: 'Debe de ingresar alguno de los siguientes datos para actualizar: nombre, correo o rol'});
    }
    if(correo !== undefined && !validarCorreo(correo)) {
        return res.status(400).json({error: 'El correo no tiene un formato valido'});

    }
    //faltaria agregar una validación más especifica para el nombre
    try{
        const usuario = await usuariosModel.actualizar(req.params.id, {nombre, correo, rol});
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    } catch (error) {
        if(esDuplicado(error)) return res.status(409).json({error: 'Ya existe un usuario con ese correo, ingresa uno diferente'});
        res.status(500).json({error: error.message});

    }

}

async function eliminarUsuario(req, res) {
    try{
        const eliminado = await usuariosModel.eliminar(req.params.id);
        if(!eliminado) return res.status(404).json({error: 'Usuario no encontrado'});
        res.status(204).send();

    }catch (error) {
        res.status(500).json({error: error.message});   
    }
}

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario

}


//funciones de validacion, modelos de taller y de consulta y programar los controladores de taller y consulta
