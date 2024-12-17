'use client';
import Link from 'next/link';

const HomePage = () => {
    
  
    return (
      <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
          <h1 className='text-center text-5xl md:text-7xl font-bold custom-gradient q-animate-gradient'>
            AIQUIZ
          </h1>
          <h2 className='text-center text-xl md:text-2xl mt-2 font-bold custom-gradient q-animate-gradient'>
            ¡Entrena la asignatura hasta que no puedas más! <br/><br/>
            Elige la Asignatura:
          </h2>
          <div className='flex flex-col items-center'>
            <Link className="q-button fuente"href={{pathname: '/CORE'}}>Computación en Red (CORE)</Link>
            <Link className="q-button fuente"href={{pathname: '/IBDN'}}>Ingeniería de Big Data en la Nube (IBDN)</Link>
            <Link className="q-button fuente"href={{pathname: '/TECW'}}>Tecnologías Web (TECW)</Link>
            <Link className="q-button fuente"href={{pathname: '/BBDD'}}>Bases de Datos (BBDD)</Link>
            <Link className="q-button fuente"href={{pathname: '/IWEB'}}>Ingeniería Web (IWEB)</Link>
            <Link className="q-button fuente"href={{pathname: '/CDPS'}}>Centros de datos y provisión de servicios (CDPS)</Link>
            <Link className="q-button fuente"href={{pathname: '/PRG'}}>Programación (PRG)</Link>
          </div>
        </div>
      </div>      
    );
  };
  
  export default HomePage;