// Reglas de validación de los datos de un usuario. Son las mismas que valida el backend y las que
// Pruebas de Software prueba con Jest: el front valida para avisar rápido a quien llena el
// formulario; el backend valida para que nadie se las salte mandando la petición con Postman.

export function validarCorreo(correo) {
  if (typeof correo !== 'string') return false;
  return /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)+$/.test(correo.trim());
}

export function validarBoleta(boleta) {
  if (typeof boleta !== 'string') return false;
  return /^\d{10}$/.test(boleta.trim());
}

export function validarNombre(nombre) {
  if (typeof nombre !== 'string') return false;
  const nombreLimpio = nombre.trim().normalize('NFC');
  return Array.from(nombreLimpio).length <= 25 && /^[\p{L}]+(?: +[\p{L}]+)*$/u.test(nombreLimpio);
}

export function normalizarNombre(nombre) {
  if (typeof nombre !== 'string') return '';
  return nombre
    .trim()
    .replace(/ +/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('es');
}

export function validarTaller({ nombre, fecha, cupo }) {
  if (typeof nombre !== 'string' || !nombre.trim()) return false;
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  if (!Number.isInteger(Number(cupo)) || Number(cupo) < 1) return false;
  return true;
}

export function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string') return false;
  return contrasena.length >= 8;
}
