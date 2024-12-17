'use client'
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';

const DashboardPage = () => {

    
    return (
        <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
          <h1 className='text-center text-5xl md:text-7xl font-bold custom-gradient q-animate-gradient'>
            AIQUIZ
          </h1>
          <h2 className='text-center text-xl md:text-2xl mt-2 font-bold custom-gradient q-animate-gradient'>
            Elige la Asignatura para ver el dashboard:
          </h2>
          <div className='flex flex-col items-center mt-10'>
            <Link className="q-button fuente"href={{pathname: '/dashboard/CORE'}}>Computación en Red (CORE)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/IBDN'}}>Ingeniería de Big Data en la Nube (IBDN)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/TECW'}}>Tecnologías Web (TECW)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/BBDD'}}>Bases de Datos (BBDD)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/IWEB'}}>Ingeniería Web (IWEB)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/CDPS'}}>Centros de datos y provisión de servicios (CDPS)</Link>
            <Link className="q-button fuente"href={{pathname: '/dashboard/PRG'}}>Programación (PRG)</Link>
          </div>
        </div>
      </div>  
    )
}

export default DashboardPage;