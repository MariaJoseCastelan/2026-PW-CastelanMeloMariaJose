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
//forEach: función callback (función flecha).
//t: es el iterador.
//$:Indica que queremos obtener un parametro.
console.log('Aplicando un forEach para imprimir talleres:');
talleres.forEach((t) => console.log(`- ${t.nombre} (${t.inscritos}/${t.cupo})`));

// TODO: map — crea un arreglo `nombres` solo con los nombres de los talleres
//map: crea una copia del arreglo original (cookies). función callback (función flecha). Aqui no hay iterador, lo que tiene es un any (un vector). Este vector sera la función para buscar.
console.log('Aplicando función map con solo nombres:');
const nombres = talleres.map((t) => t.nombre);
console.log(nombres);

// TODO: filter — crea un arreglo `llenos` con los talleres donde inscritos >= cupo
//filter no es una función callback, tiene una condición, un argumento y un resultado.
console.log('Aplicando función filter en los talleres:');
const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
console.log(llenos.map((t) => t.nombre));

// TODO: find — encuentra el PRIMER taller impartido por 'Ing. María López'

// TODO: reduce — calcula `totalInscritos`, la suma de inscritos de todos los talleres

// TODO: filter + map encadenados — nombres de los talleres que SÍ tienen cupo disponible
