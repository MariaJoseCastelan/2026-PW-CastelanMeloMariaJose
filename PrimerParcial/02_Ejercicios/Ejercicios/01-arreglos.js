// 01-arreglos.js
// Métodos de arreglo más usados en JS/Node — practícalos sobre esta lista
// de talleres (misma forma que la API real de CECyT9). Completa cada TODO.

const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];

// TODO: forEach — imprime "- <nombre> (<inscritos>/<cupo>)" de cada taller
//forEach:(función flecha).
//t: es el iterador.
//$:Indica que queremos obtener un parametro.
console.log('Aplicando un forEach para imprimir talleres:');
talleres.forEach((t) => console.log(`- ${t.nombre} (${t.inscritos}/${t.cupo})`));

// TODO: map — crea un arreglo `nombres` solo con los nombres de los talleres
//map: crea una copia del arreglo original (cookies).(función flecha). Aqui no hay iterador, lo que tiene es un any (un vector). Este vector sera la función para buscar.
console.log('Aplicando función map con solo nombres:');
const nombres = talleres.map((t) => t.nombre);
console.log(nombres);

// TODO: filter — crea un arreglo `llenos` con los talleres donde inscritos >= cupo
//filter recibe de argumento una función flecha. tiene una condición, un argumento y un resultado.
console.log('Aplicando función filter en los talleres:');
const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
console.log(llenos.map((t) => t.nombre));

// TODO: find — encuentra el PRIMER taller impartido por 'Ing. María López'
//find:(función flecha). Encuentra el primer elemento que cumpla con la condición. Si no encuentra ninguno, devuelve undefined.
console.log('Aplicando función find para encontrar el primer taller impartido por Ing. María López:');
const tallerEncontrado = talleres.find((t) => t.instructor === 'Ing. María López');
let resultado = tallerEncontrado ? tallerEncontrado.nombre : 'No se encontró taller';

// TODO: reduce — calcula `totalInscritos`, la suma de inscritos de todos los talleres
//reduce: (función flecha). Acumula un valor a partir de los elementos del arreglo. En este caso, suma los inscritos de todos los talleres.
console.log('Aplicando función reduce para calcular el total de inscritos:');
const totalInscritos = talleres.reduce((suma, t) => suma + t.inscritos, 0);
console.log(`Total de inscritos: ${totalInscritos}`);

// TODO: filter + map encadenados — nombres de los talleres que SÍ tienen cupo disponible
//filter: Encuentra los talleres que tienen cupo disponible. Luego, map: función flecha). Crea un arreglo con los nombres de los talleres que tienen cupo disponible.
console.log('Aplicando filter + map encadenados para obtener los talleres con cupo disponible:');
resultado = talleres.filter((t) => t.inscritos < t.cupo).map((t) => t.nombre).join(', ');
