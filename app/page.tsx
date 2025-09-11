"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "./components/ui/Footer";
import Header from "./components/ui/Header";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [inputEmail, setInputEmail] = useState("");
  const [showAlert, setShowAlert] = useState("");

  // Debug i18n
  useEffect(() => {
    console.log('i18n ready:', i18n.isInitialized);
    console.log('Current language:', i18n.language);
    console.log('Available resources:', Object.keys(i18n.getResourceBundle(i18n.language, 'translation') || {}));
    console.log('front.title translation:', t('front.title'));
  }, [i18n, t]);

  useEffect(() => {
    fetchSubjects();
    checkEmailFromStorage();
  }, []);

  // Función para generar color consistente basado en el nombre
  const generateColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      { bg: 'bg-red-100/60', hover: 'hover:bg-red-100', acronym: 'text-red-400', hoverAcronym: 'hover:text-red-500' },
      { bg: 'bg-blue-100/60', hover: 'hover:bg-blue-100', acronym: 'text-blue-400', hoverAcronym: 'hover:text-blue-500' },
      { bg: 'bg-green-100/60', hover: 'hover:bg-green-100', acronym: 'text-green-400', hoverAcronym: 'hover:text-green-500' },
      { bg: 'bg-yellow-100/60', hover: 'hover:bg-yellow-100', acronym: 'text-yellow-500', hoverAcronym: 'hover:text-yellow-600' },
      { bg: 'bg-purple-100/60', hover: 'hover:bg-purple-100', acronym: 'text-purple-400', hoverAcronym: 'hover:text-purple-500' },
      { bg: 'bg-pink-100/60', hover: 'hover:bg-pink-100', acronym: 'text-pink-400', hoverAcronym: 'hover:text-pink-500' },
      { bg: 'bg-indigo-100/60', hover: 'hover:bg-indigo-100', acronym: 'text-indigo-400', hoverAcronym: 'hover:text-indigo-500' },
      { bg: 'bg-orange-100/60', hover: 'hover:bg-orange-100', acronym: 'text-orange-400', hoverAcronym: 'hover:text-orange-500' }
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Comprobar email almacenado
  const checkEmailFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('student_email');
      const timestamp = localStorage.getItem('student_email_timestamp');
      
      if (storedEmail && timestamp) {
        const now = Date.now();
        const stored = parseInt(timestamp);
        // 1 hora = 3600000 ms
        if (now - stored < 3600000) {
          setUserEmail(storedEmail);
        } else {
          // Expiró, limpiar
          localStorage.removeItem('student_email');
          localStorage.removeItem('student_email_timestamp');
        }
      }
    }
  };

  // Guardar email con timestamp
  const saveStudentEmail = () => {
    if (!inputEmail || !inputEmail.endsWith("@alumnos.upm.es")) {
      setShowAlert(inputEmail ? "El email debe terminar con @alumnos.upm.es" : "Por favor, introduce tu email");
      return;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('student_email', inputEmail);
      localStorage.setItem('student_email_timestamp', Date.now().toString());
      setUserEmail(inputEmail);
      setShowAlert("");
    }
  };

  // Cerrar sesión
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('student_email');
      localStorage.removeItem('student_email_timestamp');
      setUserEmail(null);
      setInputEmail("");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects');
      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.subjects);
      } else {
        setError('Error loading subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className='container-layout'>
        <Header/>
        <div className="container-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">{t("common.loading") || "Loading..."}</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className='container-layout'>
        <Header/>
        <div className="container-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Mostrar formulario de email si no está autenticado
  if (!userEmail) {
    return (
      <main className='container-layout'>
        <Header/>
        <div className="container-content">
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="w-96">
              <h2 className="text-left text-2xl mb-2 font-normal">
                {t("login.title") || "Identificación de estudiante"}
              </h2>
              <p className="mb-4">
                {t("login.description") || "Por favor, introduce tu email de estudiante para continuar"}
              </p>
            </div>
            <input
              type="email"
              value={inputEmail}
              className="w-96 p-3 border border-gray-300 rounded-md text-sm"
              placeholder="emailalumno@alumnos.upm.es"
              onChange={(e) => {
                setInputEmail(e.target.value);
                setShowAlert("");
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  saveStudentEmail();
                }
              }}
            />
            {showAlert && (
              <div className="mt-2 text-red-600 text-sm w-96">
                {showAlert}
              </div>
            )}
            <button
              type="button"
              onClick={saveStudentEmail}
              className="btn-quizz btn-md mt-4"
            >
              {t("subject.saveemail") || "Continuar"}
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className='container-layout'> 
     <Header/>
    <div className=" container-content">
      {/* Header con botón de logout */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-left text-2xl mb-2 ">
            {t("front.title")}          
          </h2>
          <p>
            {t("front.description")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-2">{userEmail}</p>
          <button
            onClick={logout}
            className="btn-ghost btn-sm text-xs"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
        <div className="mt-6">
          <div className="text-left text-base md:text-base  font-normal leading-2">
            {/* <h2> Elige la Asignatura:</h2> */}
          </div>
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 mt-3 gap-3">
            {subjects.map((subject) => {
              const colors = generateColorFromName(subject.name);
              return (
                <Link
                  key={subject._id}
                  className={`subject-button ${colors.bg} ${colors.hover}`}
                  href={{ pathname: `/quiz/${subject.acronym}` }}
                  id={subject.acronym.toLowerCase()}
                >
                  <p>{subject.name}</p>
                  <p className={`subject-acronym ${colors.acronym} transition-colors`}>
                    {subject.acronym}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
   
    
    </div>
    <Footer />
    </main>
  );
};

export default HomePage;
