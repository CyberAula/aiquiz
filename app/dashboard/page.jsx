'use client'
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';
import Footer from "../components/ui/Footer";
import Logo from "../components/ui/Logo";
import { useTranslation } from "react-i18next";


const DashboardPage = () => {
  const { t, i18n } = useTranslation();

    
    return (
        <div className='animated-bg min-h-screen grid place-items-center'>
        <div className='border rounded border-white/0 '>
         <Logo/>
          <h2 className='text-center text-lg md:text-xl mt-2  custom-gradient q-animate-gradient mb-12'>
          {t('dashboard.choose')}
          </h2>
          <div className='grid grid-cols-4 mt-3 gap-3'>
            <Link  className="subject-button" id="core" href={{pathname: '/dashboard/CORE'}}> <p>Computación en Red </p>
            <p className="subject-acronym ">CORE</p></Link>
            <Link  className="subject-button" id="ibdn" href={{pathname: '/dashboard/IBDN'}}> <p> Ingeniería de Big Data en la Nube</p>
            <p className="subject-acronym ">IBDN</p></Link>
            <Link  className="subject-button" id="tecw" href={{pathname: '/dashboard/TECW'}}> <p> Tecnologías Web </p>
            <p className="subject-acronym ">TECW</p></Link>
            <Link  className="subject-button" id="bbdd" href={{pathname: '/dashboard/BBDD'}}><p> Bases de Datos </p>
            <p className="subject-acronym ">BBDD</p></Link>
            <Link  className="subject-button" id="iweb" href={{pathname: '/dashboard/IWEB'}}>  <p>Ingeniería Web</p>
            <p className="subject-acronym ">IWEB</p></Link>
            <Link  className="subject-button" id="cdps" href={{pathname: '/dashboard/CDPS'}}> <p> Centros de datos y provisión de servicios </p>
            <p className="subject-acronym">CDPS</p></Link>
            <Link  className="subject-button"  id="prg" href={{pathname: '/dashboard/PRG'}}> <p> Programación</p>
            <p className="subject-acronym">PRG</p></Link>
          </div>
        </div>
        <Footer/>
      </div>  
    )
}

export default DashboardPage;