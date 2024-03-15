'use client';

const HomePage = () => {
    
  
    return (
      <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
          <h1 className='text-center text-5xl md:text-7xl font-bold custom-gradient q-animate-gradient'>
            ETSI(A)T
          </h1>
          <h2 className='text-center text-xl md:text-2xl mt-2 font-bold custom-gradient q-animate-gradient'>
            ¡Entrena esta asignatura hasta que no puedas más! <br/>
            Elige la Asignatura
          </h2>
          <div className='flex flex-col items-center mt-10'>
            <a href="/CORE" className="q-button fuente">Computación en Red (CORE)</a>
            <a href="/TECW" className="q-button fuente">Tecnologías Web (TECW)</a>
            <a href="/BBDD" className="q-button fuente">Bases de Datos (BBDD)</a>
            <a href="/IWEB" className="q-button fuente">Ingeniería Web (IWEB)</a>
            <a href="/CDPS" className="q-button fuente">Centros de datos y provisión de servicios (CDPS)</a>
            <a href="/PRG" className="q-button fuente">Programación (PRG)</a>
          </div>
        </div>
      </div>      
    );
  };
  
  export default HomePage;