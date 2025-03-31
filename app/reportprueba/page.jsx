'use client'
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';

const ReportPruebaPage = () => {

    
    return (
        <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
          <h1 className='text-center text-5xl md:text-7xl font-bold custom-gradient q-animate-gradient'>
            ETSI(A)T
          </h1>
          <h2 className='text-center text-xl md:text-2xl mt-2 font-bold custom-gradient q-animate-gradient'>
            Elige la Asignatura para ver el dashboard:
          </h2>
          <div className='flex flex-col items-center mt-10'>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/CORE'}}>Computación en Red (CORE)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/IBDN'}}>Ingeniería de Big Data en la Nube (IBDN)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/TECW'}}>Tecnologías Web (TECW)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/BBDD'}}>Bases de Datos (BBDD)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/IWEB'}}>Ingeniería Web (IWEB)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/CDPS'}}>Centros de datos y provisión de servicios (CDPS)</Link>
            <Link className="q-button fuente"href={{pathname: '/reportprueba/PRG'}}>Programación (PRG)</Link>
          </div>
        </div>
      </div>  
    )
}

export default ReportPruebaPage;