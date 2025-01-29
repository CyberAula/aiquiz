"use client";
import { useState, useEffect } from "react";
import { topics } from "../constants/topics";
import { language } from "../constants/language";
import Link from "next/link";
import Image from "next/image";
import Logo from "../components/ui/Logo";
import Footer from "../components/ui/Footer";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import nextConfig from "../../next.config";
import urljoin from "url-join";
const basePath = nextConfig.basePath || "/";

const HomePage = ({ params: { subject } }) => {
  const [languageSelected, setLanguageSelected] = useState("");
  const [topic, setTopic] = useState("");
  const [isTopicSelected, setIsTopicSelected] = useState(false);
  const [difficulty, setDifficulty] = useState("intermedio");
  const [numQuestions, setNumQuestions] = useState("5");
  const [defaultTopic, setDefaultTopic] = useState("");

  const [inputEmail, setInputEmail] = useState("");
  const [myUserEmail, setMyUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [languageText, setLanguageText] = useState("");
  const baseUrl = urljoin(basePath);
  const [showAlert, setShowAlert] = useState("");
  const [showAlertLang, setShowAlertLang] = useState("");
  const [showAlertTopic, setShowAlertTopic] = useState("")

  console.log(languageSelected + " language selected");
  console.log(defaultTopic + " defaultTopic");
  console.log(topic + " topic");
  console.log(isTopicSelected + " isTopicSelected");
  console.log(showAlert + " showAlert");

//alerts
  let alertEmptyMail = "Debes introducir tu email de alumno para empezar "
  let alertUPMMail = "El email debe ser de alumno de la UPM"
  let alertPickLang = "Debes elegir tema para empezar"
  let alertPickTopic = "Debes elegir sub-tema para empezar"


  useEffect(() => {
    // Actualizar el lenguaje seleccionado
    let newLanguage = languageSelected;
    const subjectLanguages = language[subject] || [];

    if (!subjectLanguages.find((lang) => lang.value === newLanguage)) {
      // esta declaración era para asignar un lenguaje aún cuando no había ninguno asignado
      // newLanguage = language[subject][0].value;
      newLanguage = "";
      setLanguageSelected(newLanguage);
      setLanguageText(language[subject][0].label);
    }

    // Asignar el primer tema del lenguaje automáticamente
    if (topics[newLanguage]?.length > 0) {
      // setDefaultTopic(topics[newLanguage][0]);
      setDefaultTopic("puta");
      setTopic(""); // Seleccionar automáticamente el primer tema
    } else {
      setDefaultTopic(""); // Si no hay temas, restablecer el valor predeterminado
      setTopic(""); // También restablecer el tema actual
    }
  }, [languageSelected]);

  useEffect(() => {
    setEmailFromLocalStorage();
  }, []);

  const setEmailFromLocalStorage = () => {
    let studentEmail = window.localStorage.getItem("student_email");
  //  let studentEmail = null;
    if (
      studentEmail != null &&
      studentEmail != "" &&
      studentEmail != "undefined" &&
      studentEmail != "null"
    ) {
      console.log("GETTING EMAIL FROM LOCALSTORAGE", studentEmail);
      setMyUserEmail(studentEmail);
      console.log("setMyUserEmail was set  : ", studentEmail);

    } else {
      console.log("NO EMAIL IN LOCALSTORAGE, WE WILL ASK FOR IT");
    }
    setLoading(false);
  };

  const saveStudentEmail = () => {
    console.log("Saving email to localstorage: ", inputEmail);
    // comprobar si el input está vacío
    if (
      inputEmail == "" ||
      inputEmail == null ||
      inputEmail == "" ||
      inputEmail == "undefined" ||
      inputEmail == "null"
    ) {
      setShowAlert(alertEmptyMail);
    } 
    // si el input no está vacío, comprobar que el final del input vaya con @alumnos.upm.es
    else {
      if (inputEmail.endsWith("@alumnos.upm.es") == false) {
        setShowAlert(alertUPMMail)
      } else {
        setMyUserEmail(inputEmail);
        window.localStorage.setItem("student_email", inputEmail);
      } 
    }
   
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!topic || !difficulty || !numQuestions) {
      // alert(
      //   'Por favor, selecciona una opción para "Tema", "Dificultad" y "Preguntas" antes de crear el test.'
      // );
      if (!languageSelected ) {
        setShowAlertLang(alertPickLang)
      }
      return;

   
    }

    // Utilizar el primer tema del lenguaje si no se ha seleccionado explícitamente
    const selectedTopic =
      topic ||
      defaultTopic ||
      (topics[languageSelected]?.length > 0 && topics[languageSelected][0]);
    setTopic(selectedTopic);

    console.log(languageSelected, difficulty, selectedTopic, numQuestions);
  };

  const handleLanguageSelect = (e) => {
    setLanguageSelected(e.target.value);
    // save option text content
    setLanguageText(e.target.options[e.target.selectedIndex].text);
    setTopic("");
    // setShowAlertTopic(alertPickTopic)
  };

  return (
    <div className="min-h-screen grid ">
      <div className="border rounded border-white/0 ">
        <a href={baseUrl}>
          <Logo />
        </a>
        <h2 className="text-center text-xl md:text-xl mt-2 font-normal leading-4">
          ¡Haz todos los cuestionarios que quieras sobre temas de la asignatura!
        </h2>
        {/* {loading && (
          <div className="flex items-center justify-center w-screen bg-myBg">
            <Image src="/spinner.gif" height={250} width={250} alt="loading" />
          </div>
        )} */}

        {loading == false && myUserEmail == null && (
          <div className="flex flex-col items-center justify-center mt-5">
            <input
              type="email"
              value={inputEmail}
              className="input"
              placeholder="emailalumno@alumnos.upm.es"
              onChange={(e) => {setInputEmail(e.target.value);
              setShowAlert("")} }
            />
            {console.log(!inputEmail + " aquii")}
               {!inputEmail && <div className="alert"> {showAlert ? <ErrorOutlineOutlinedIcon className="text-red-500" sx= {{fontSize: 16}}></ErrorOutlineOutlinedIcon> : ""} {showAlert} </div>}    
               {inputEmail && !inputEmail.endsWith("@alumnos.upm.es") && <div className="alert">  {showAlert ? <ErrorOutlineOutlinedIcon className="text-red-500" sx= {{fontSize: 16}}></ErrorOutlineOutlinedIcon> : ""} {showAlert} </div>} 
            <button
              type="button"
              onClick={() => { saveStudentEmail();} }
              className="btn-quizz btn-md mt-4"
            >
            
              Guardar email
            </button>
    
          </div>
        )}
        {loading == false && myUserEmail != null && (
          <form
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-3 w-[80%] mx-auto"
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              <div className={`container-settings-quiz`}  >
              {/* LENGUAJE /TEMA */}
              <h2 className={`mb-1 text-lg font-bold `}>Asignatura: <b > {subject} </b></h2>
              <p className="mb-6 text-base">Elige el tema que quieres repasar</p>
              <div className="flex flex-col parameters">
                <label
                  htmlFor="language"
                  className="label-parameters-quiz"
                >
                  Tema
                </label>
           
                <select
                  value={languageSelected}
                  onChange={handleLanguageSelect}
                  name="language"
                  className="quiz-select"
                >
                     <option value="" disabled hidden className="italic-option">
                    ¡Elige tema!
                  </option>
                  {language[subject].map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="font-bold"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                {!languageSelected && <div className="alert" > {showAlertLang ?  <ErrorOutlineOutlinedIcon className="text-red-500" sx={{ fontSize: 16 }}></ErrorOutlineOutlinedIcon> : ""} {showAlertLang} </div>}
              </div>

              {/* SUB-TEMA */}
             
              <div className={languageSelected ? "flex flex-col parameters" : "flex flex-col parameters select-disabled"}>
                <label
                  htmlFor="topic"
                  className="label-parameters-quiz"
                >
                  Sub-tema
                </label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setIsTopicSelected(!!e.target.value); // Actualizar el estado de isTopicSelected
                    setShowAlertTopic("")
                  }}
                  disabled = {languageSelected ? false : true }
                  name="topic"
                  className="quiz-select"
                >
                  <option value="" disabled hidden className="italic-option">
                    ¡Elige tema!
                  </option>
                  {topics[languageSelected]?.map((option, index) => (
                    <option
                      key={index}
                      value={option}
                      className="font-normal"
                    >
                      {option}
                    </option>
                  ))}
                </select>
                {showAlertTopic == !alertPickTopic ? "" : <div className="alert"><ErrorOutlineOutlinedIcon className="text-red-500" sx={{ fontSize: 16 }}></ErrorOutlineOutlinedIcon>{showAlertTopic}</div>}
             
            
              </div>
              </div>
              <div className="container-settings-quiz">
              {/* DIFICULTAD, quitado para BBDD */}
              <h2 className="mb-1 text-lg font-bold">Ajustes del quiz </h2>
              <p className="mb-6">Elige el nivel de dificultad y el número de preguntas</p>
              {subject !== "BBDD" && (
                <div className="flex flex-col parameters ">
                  <label
                    htmlFor="difficult"
                    className="label-parameters-quiz"
                  >
                    Dificultad
                  </label>
                  <div className="grid grid-cols-3 gap-2 items-stretch justify-stretch">
                  <label for="radio-card-facil" className="radio-card-difficulty grow">
                   
                    <input
                      type="radio"
                      name="radio-card-difficulty"
                      id="radio-card-facil"
                      value="facil"
                      onChange={(e) => setDifficulty(e.target.value)}
                      checked={difficulty === "facil"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-xs uppercase">Fácil 🙂</h4>
                    </div>
                  </label>
                  <label for="radio-card-intermedio" className="radio-card-difficulty grow">
                    <input
                      type="radio"
                      name="radio-card-difficulty"
                      id="radio-card-intermedio"
                      value="intermedio"
                      onChange={(e) => setDifficulty(e.target.value)}
                      
                      checked={difficulty === "intermedio"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-xs uppercase">Intermedio 🧐</h4>
                    </div>
                  </label>
                  <label for="radio-card-avanzado" className="radio-card-difficulty grow">
                    <input
                      type="radio"
                      name="radio-card-difficulty"
                      id="radio-card-avanzado"
                      value="avanzado"
                      onChange={(e) => setDifficulty(e.target.value)}
                      checked={difficulty === "avanzado"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-xs uppercase">Avanzado 🥵</h4>
                    </div>
                  </label>
                </div>
                </div>
              
              )}  {console.log( "dificultad" + difficulty)}

              {/* NUMERO DE PREGUNTAS, quitado para BBDD, siempre 5 */}
              {subject !== "BBDD" && (
                <div className="flex flex-col parameters">
                  <label
                    htmlFor="numQuestions"
                    className="label-parameters-quiz"
                  >
                    Nº de preguntas
                  </label>
                  <div className="flex flex-row gap-2 ">
                  <label for="radio-card-five" class="radio-card">
                    <input
                      type="radio"
                      name="radio-card"
                      id="radio-card-five"
                      value="5"
                      onChange={(e) => setNumQuestions(e.target.value)}
                      checked={numQuestions === "5"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-base uppercase">5</h4>
                    </div>
                  </label>
                  <label for="radio-card-ten" class="radio-card">
                    <input
                      type="radio"
                      name="radio-card"
                      id="radio-card-ten"
                      value="10"
                      onChange={(e) => setNumQuestions(e.target.value)                      }
                      checked={numQuestions === "10"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-base uppercase">10</h4>
                    </div>
                  </label>
                  <label for="radio-card-fifteen" className="radio-card">
                    <input
                      type="radio"
                      name="radio-card"
                      id="radio-card-fifteen"
                      value="15"
                      onChange={(e) => setNumQuestions(e.target.value)}
                      checked={numQuestions === "15"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-base uppercase">15</h4>
                    </div>
                  </label>
                  <label for="radio-card-twenty" className="radio-card grow">
                    <input
                      type="radio"
                      name="radio-card"
                      id="radio-card-twenty"
                      value="20"
                      onChange={(e) => setNumQuestions(e.target.value)}
                      checked={numQuestions === "20"} // Controla si debe estar marcado
                    />
                    <div class="card-content-wrapper">
                      <h4 className="text-base uppercase">20</h4>
                    </div>
                  </label>
                </div>
                </div>
              )}    {console.log( "numero preguntas " + numQuestions)}
            </div>
</div>

            <div className="flex justify-end mt-1">
           
              {isTopicSelected ? (
                <Link
                  className="btn-quizz btn-lg fuente"
                  href={{
                    pathname: "/quiz",
                    query: {
                      language: languageText,
                      difficulty: difficulty.toLowerCase(),
                      topic: topic.toLowerCase(), // Utilizamos el tema seleccionado
                      numQuestions: numQuestions,
                      subject: subject,
                    },
                  }}
                >
                  Crear test
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center">
              
                  <button
                    href="#"
                    onClick={() => setShowAlertTopic(alertPickTopic)}
                    className="btn-quizz-disabled btn-lg opacity-50 cursor-not-allowed"
                  >
                    Crear test
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      <Footer/>
    </div>
  );
};

export default HomePage;
