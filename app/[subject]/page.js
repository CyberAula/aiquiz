'use client';
import { useState, useEffect } from 'react';
import { topics } from '../constants/topics';
import { language } from '../constants/language';
import Link from 'next/link';
import Image from 'next/image';

import nextConfig from '../../next.config';
import urljoin from 'url-join';
const basePath = nextConfig.basePath || '/';

const HomePage = ({ params: { subject } }) => {
  const [languageSelected, setLanguageSelected] = useState('java');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermedio');
  const [numQuestions, setNumQuestions] = useState('5');
  const [defaultTopic, setDefaultTopic] = useState('');
  const [isTopicSelected, setIsTopicSelected] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [myUserEmail, setMyUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languageText, setLanguageText] = useState('');
  const baseUrl = urljoin(basePath)

  useEffect(() => {
    // Actualizar el lenguaje seleccionado
    let newLanguage = languageSelected;
    const subjectLanguages = language[subject] || []
    if (!subjectLanguages.find(lang => lang.value === newLanguage)){
      newLanguage = language[subject][0].value;
      setLanguageSelected(newLanguage);
      setLanguageText(language[subject][0].label);
    }

    // Asignar el primer tema del lenguaje automáticamente
    if (topics[newLanguage]?.length > 0) {
      setDefaultTopic(topics[newLanguage][0]);
      setTopic('');  // Seleccionar automáticamente el primer tema
    } else {
      setDefaultTopic('');  // Si no hay temas, restablecer el valor predeterminado
      setTopic('');  // También restablecer el tema actual
    }
  }, [languageSelected]);

  useEffect(() => {
    setEmailFromLocalStorage();
  }, []);

  const setEmailFromLocalStorage = () => {
    let studentEmail = window.localStorage.getItem('student_email');
    if (studentEmail != null && studentEmail != "" && studentEmail != "undefined" && studentEmail != "null") {
      console.log("GETTING EMAIL FROM LOCALSTORAGE", studentEmail);
      setMyUserEmail(studentEmail);
      console.log("setMyUserEmail was set  : ", studentEmail);
    } else {
      console.log("NO EMAIL IN LOCALSTORAGE, WE WILL ASK FOR IT");
    }
    setLoading(false);
  }

  const saveStudentEmail = () => {
    console.log("Saving email to localstorage: ", inputEmail);
    if(inputEmail.endsWith("@alumnos.upm.es") == false) {
      alert("El email debe ser de alumno de la UPM");
      return;
    } else {
      setMyUserEmail(inputEmail);
      window.localStorage.setItem('student_email', inputEmail);
    }
  }


  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic || !difficulty || !numQuestions) {
      alert('Por favor, selecciona una opción para "Tema", "Dificultad" y "Preguntas" antes de crear el test.');
      return;
    }

    // Utilizar el primer tema del lenguaje si no se ha seleccionado explícitamente
    const selectedTopic = topic || defaultTopic || (topics[languageSelected]?.length > 0 && topics[languageSelected][0]);
    setTopic(selectedTopic);

    console.log(languageSelected, difficulty, selectedTopic, numQuestions);
  };

  const handleLanguageSelect = (e) => {
    setLanguageSelected(e.target.value);
    // save option text content
    setLanguageText(e.target.options[e.target.selectedIndex].text);
    setTopic('');
  };

  return (
    <div className='animated-bg min-h-screen grid place-items-center'>
      <div className='border rounded border-white/0 '>
        <a href={baseUrl}>
          <h1 className='text-center text-5xl md:text-7xl font-bold custom-gradient q-animate-gradient'>
            ETSI(A)T
          </h1>
        </a>
        <h2 className='text-center text-xl md:text-2xl mt-2 font-bold custom-gradient q-animate-gradient'>
          ¡Haz cuestionarios sobre temas de la asignatura hasta que no puedas más!
        </h2>
        {loading && <div className="flex items-center justify-center w-screen bg-myBg"><Image src="/spinner.gif" height={250} width={250} alt="loading"/></div>}

        {loading==false && myUserEmail==null && <div className="flex flex-col items-center justify-center mt-5">
          <p className="text-center text-red-600 fuente">⚠️ Debes introducir tu email de alumno para empezar ⚠️</p>
          <input type="email" value={inputEmail} className="q-input" placeholder="emailalumno@alumnos.upm.es" onChange={(e) => setInputEmail(e.target.value)} />
          <button type="button" onClick={() => saveStudentEmail()} className="q-button fuente">
            Guardar email
          </button>
        </div>}
        {loading==false && myUserEmail!=null && <form onSubmit={handleSubmit} className='mt-5 flex flex-col gap-6 w-[80%] mx-auto'>
          <div className='grid grid-cols-4 gap-x-8 gap-y-6'>
            {/* LENGUAJE */}
            <div className='flex flex-col'>
              <label
                htmlFor='language'
                className='uppercase text-xs font-bold custom-gradient q-animate-gradient'
              >
                Tema
              </label>
              <select
                value={languageSelected}
                onChange={handleLanguageSelect}
                name='language'
                className='quiz-select'
              >
                {language[subject].map((option) => (
                  <option key={option.value} value={option.value} style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TEMA */}
            <div className='flex flex-col'>
              <label
                htmlFor='topic'
                className='uppercase text-xs font-bold custom-gradient q-animate-gradient'
              >
                Sub-tema
              </label>
              <select
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setIsTopicSelected(!!e.target.value); // Actualizar el estado de isTopicSelected
                }}
                name='topic'
                className='quiz-select'
              >
                <option value='' disabled hidden className='italic-option'>
                  ¡Elige tema!
                </option>
                {topics[languageSelected]?.map((option, index) => (
                  <option key={index} value={option} style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* DIFICULTAD, quitado para BBDD */}
            {subject!=="BBDD" && <div className='flex flex-col'>
              <label
                htmlFor='difficult'
                className='uppercase text-xs font-bold custom-gradient q-animate-gradient'
              >
                Dificultad
              </label>
              <select
                name='difficulty'
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className='quiz-select'
              >
                <option value='' disabled hidden>
                  ¡Elige dificultad!
                </option>
                <option value='facil' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>Fácil</option>
                <option value='intermedio' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>Intermedio</option>
                <option value='avanzado' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>Avanzado</option>
              </select>
            </div>}

            {/* NUMERO DE PREGUNTAS, quitado para BBDD, siempre 5 */}
            {subject!=="BBDD" && <div className='flex flex-col'>
              <label
                htmlFor='numQuestions'
                className='uppercase text-xs font-bold custom-gradient q-animate-gradient'
              >
                Nº de preguntas
              </label>
              <select
                name='numQuestions'
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className='quiz-select'
              >
                <option value='' disabled hidden>
                  ¿Cuántas?
                </option>
                <option value='5' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>5</option>
                <option value='10' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>10</option>
                <option value='15' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>15</option>
                <option value='20' style={{ color: '#86efac', backgroundColor: 'black' }} className='font-bold'>20</option>
              </select>
            </div>}
          </div>

          <div className='mx-auto mt-2'>
            {isTopicSelected ? (
              <Link
                className="q-button fuente"
                href={{
                  pathname: '/quiz',
                  query: {
                    language: languageText,
                    difficulty: difficulty.toLowerCase(),
                    topic: topic.toLowerCase(), // Utilizamos el tema seleccionado
                    numQuestions: numQuestions,
                    subject: subject
                  },
                }}
              >
                Crear test
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <p className="text-center text-red-600 fuente">⚠️ Debes elegir tema para empezar ⚠️</p>
                <button type="button" disabled className="q-button opacity-50 cursor-not-allowed fuente">
                  Crear test
                </button>
              </div>
            )}
          </div>
        </form>
        }
      </div>

      <a
        className='fixed bottom-0 flex items-center gap-2 pb-2 font-mono text-sm text-white/70 transition hover:text-emerald-300 sm:m-0'
        href='https://nextjs.org/'
        target='_blank'
      >
        TFG - Hecho con Next.js / Tailwind / OpenAI
      </a>
    </div>
  );
};

export default HomePage;