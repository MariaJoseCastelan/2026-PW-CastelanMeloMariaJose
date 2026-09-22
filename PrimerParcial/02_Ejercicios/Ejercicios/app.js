const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];

function pintarTabla(){
    //debe obtener la tabla y lllenarla con los datos de talleres.
    const tbody = document.querySelector('#tabla-talleres tbody');
    const filasHTML = talleres.map((t) => {
        return `<tr>
                    <td>${t.nombre}</td>
                    <td>${t.instructor}</td>
                    <td>${t.cupo}</td>
                    <td>${t.inscritos}</td>
                </tr>`;
    }).join('');
    tbody.innerHTML = filasHTML;
}

pintarTabla();

const formArreglos = document.getElementById('form-arreglos');
const resultadoArreglos = document.getElementById('resultado-arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

formArreglos.addEventListener('submit', (event) => {event.preventDefault();
    const operacion = selectOperacionArreglo.value;
    let resultado;
    switch(operacion){
        case 'forEach' :
            resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
            break;
        case 'map' :
            resultado = talleres.map((t) => t.nombre).join(', ');
            break;
        case 'filter' :
            resultado = talleres.filter((t) => t.inscritos >= t.cupo).map((t) => t.nombre).join(', ');
            break;
        case 'find' :
            const tallerEncontrado = talleres.find((t) => t.instructor === 'Ing. María López');
            resultado = tallerEncontrado ? tallerEncontrado.nombre : 'No se encontró taller';
            break;
        case 'reduce' :
            resultado = talleres.reduce((total, t) => total + t.inscritos, 0);
            break;
        case 'filtermap' :
            resultado = talleres.filter((t) => t.inscritos < t.cupo).map((t) => t.nombre).join(', ');
            break;
    }
    resultadoArreglos.textContent = resultado;
});