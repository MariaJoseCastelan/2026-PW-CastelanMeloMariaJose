import Link from 'next/link';

export default function Menu() {
  return (
    <nav>
      <Link href="/">Inicio</Link>
      <Link href="/practica/1">Práctica /1</Link>
      <Link href="/talleres">Talleres</Link>
      <Link href="/talleres/crear">Crear taller</Link>
      <Link href="/perfil">Mi perfil</Link>
      <Link href="/usuarios/crear">Crear cuenta</Link>
    </nav>
  );
}
