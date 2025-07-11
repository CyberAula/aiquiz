'use client'
import Link from 'next/link';
import 'highlight.js/styles/atom-one-dark.css';

import Footer from "../components/ui/Footer";
import Header from "../components/ui/Header";
import { useTranslation } from "react-i18next";

const ReportPruebaPage = () => {
  const { t, i18n } = useTranslation();
    
    return (
         <main className='container-layout'> 
             <Header/>
            <div className=" container-content">
          
                <h2 className="text-left text-2xl mb-2 ">
                {t("reports.title")}        
                </h2>
                <p>
                {t("reports.description")} 
                </p>
                <div className="mt-6">
                  <div className="text-left text-base md:text-base  font-normal leading-2">
                    {/* <h2> Elige la Asignatura:</h2> */}
                  </div>
                  <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 mt-3 gap-3">
                    <Link
                      className="subject-button "
                      href={{ pathname: "/reports/CORE" }}
                      id="core"
                    >
                      <p>Computación en Red </p>
                      <p className="subject-acronym ">CORE</p>
                    </Link>
                    <Link
                      className="subject-button "
                      href={{ pathname: "/reports/IBDN" }}
                      id="ibdn"
                    >
                      <p> Ingeniería de Big Data en la Nube</p>
                      <p className="subject-acronym ">IBDN</p>
                    </Link>
                    <Link
                      className="subject-button "
                      href={{ pathname: "/reports/TECW" }}
                      id="tecw"
                    >
                      <p> Tecnologías Web </p>
                      <p className="subject-acronym ">TECW</p>
                    </Link>
                    <Link
                      className="subject-button"
                      href={{ pathname: "/reports/BBDD" }}
                      id="bbdd"
                    >
                      <p> Bases de Datos </p>
                      <p className="subject-acronym ">BBDD</p>
                    </Link>
                    <Link
                      className="subject-button"
                      href={{ pathname: "/reports/IWEB" }}
                      id="iweb"
                    >
                      <p>Ingeniería Web</p>
                      <p className="subject-acronym ">IWEB</p>
                    </Link>
                    <Link
                      className="subject-button "
                      href={{ pathname: "/reports/CDPS" }}
                      id="cdps"
                    >
                      <p> Centros de datos y provisión de servicios </p>
                      <p className="subject-acronym">CDPS</p>
                    </Link>
                    <Link
                      className="subject-button"
                      href={{ pathname: "/reports/PRG" }}
                      id="prg"
                    >
                      <p> Programación</p>
                      <p className="subject-acronym">PRG</p>
                    </Link>
                  </div>
                </div>
           
            
            </div>
            <Footer />
            </main>
    )
}

export default ReportPruebaPage;