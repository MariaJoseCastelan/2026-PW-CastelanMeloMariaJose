import Link from "next/link";

export default function Home() {
    return (
        <main>
            <h1>Esto es un ejemplo de Pagina Principal con Next</h1>
            <p><Link href="/practica/1">Ir a pagina 2</Link></p>
            <p><Link href="/talleres">Talleres</Link></p>
            <p><Link href="/perfil">Mi perfil</Link></p>
        </main>
    );
}