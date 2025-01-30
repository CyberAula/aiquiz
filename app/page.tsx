"use client";
import Link from "next/link";
import Logo from "./components/ui/Logo";
import Footer from "./components/ui/Footer";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen grid px-12">
      <div className="border rounded border-white/0 ">
        <Logo />
        <h2 className="text-center mb-6 text-xl">
          {t("front.description")}          
        </h2>
        <div className="">
          <div className="text-left text-base md:text-base  font-normal leading-2">
            {/* <h2> Elige la Asignatura:</h2> */}
          </div>
          <div className="grid grid-cols-4 mt-3 gap-3">
            <Link
              className="subject-button "
              href={{ pathname: "/CORE" }}
              id="core"
            >
              <p>Computación en Red </p>
              <p className="subject-acronym ">CORE</p>
            </Link>
            <Link
              className="subject-button "
              href={{ pathname: "/IBDN" }}
              id="ibdn"
            >
              <p> Ingeniería de Big Data en la Nube</p>
              <p className="subject-acronym ">IBDN</p>
            </Link>
            <Link
              className="subject-button "
              href={{ pathname: "/TECW" }}
              id="tecw"
            >
              <p> Tecnologías Web </p>
              <p className="subject-acronym ">TECW</p>
            </Link>
            <Link
              className="subject-button"
              href={{ pathname: "/BBDD" }}
              id="bbdd"
            >
              <p> Bases de Datos </p>
              <p className="subject-acronym ">BBDD</p>
            </Link>
            <Link
              className="subject-button"
              href={{ pathname: "/IWEB" }}
              id="iweb"
            >
              <p>Ingeniería Web</p>
              <p className="subject-acronym ">IWEB</p>
            </Link>
            <Link
              className="subject-button "
              href={{ pathname: "/CDPS" }}
              id="cdps"
            >
              <p> Centros de datos y provisión de servicios </p>
              <p className="subject-acronym">CDPS</p>
            </Link>
            <Link
              className="subject-button"
              href={{ pathname: "/PRG" }}
              id="prg"
            >
              <p> Programación</p>
              <p className="subject-acronym">PRG</p>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
