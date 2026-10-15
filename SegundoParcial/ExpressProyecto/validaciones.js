//vamos a tener funciones que se encargan de validar correo, boleta y contraseña

//wiii mas tarea siiii

//aqui va funcion de correo
function validarCorreo(correo){

}

//aqui va funcion de boleta
function validarBoleta(boleta){

}


//aqui va funcion de contraseña

function validarContrasena(contrasena){
    if(typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {
    validarCorreo,
    validarBoleta,
    validarContrasena
}
