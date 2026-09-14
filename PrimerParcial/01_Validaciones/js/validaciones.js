/* Las validaciones de formulario son expresiones regulares, Las cuales en este momento las podemos dividir en 3 partes:

1.-Para el texto (nombre)
2.-Para el número de boleta (boleta)
3.-Para la fecha (fecha)

Una expresion regular. es un patrón donde se identifica que elementos seran validos vs cuales no, son reglas mediante las cuales realizamos la validación de los datos ingresados por el usuario, en este caso, en un formulario. (Leer documentación oficial de Mozzila)

*/

const patrones = {
    nombre : /^[A-Za-zÁÉÍÓÚÑáéíóúñüÜ\s{2,60}]$/,
    boleta : /^\d{10}/,
    fecha : /^(0[1-9] | [12]\d | 3[01]\/(0[1-9] | 1 [0-2])\/\d{4}$/
}