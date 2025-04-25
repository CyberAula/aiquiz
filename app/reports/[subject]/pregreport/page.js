"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";


import Footer from "../../../components/ui/Footer";
import Header from "../../../components/ui/Header";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2'
import { useRouter } from 'next/navigation'
import { HiOutlineXMark } from 'react-icons/hi2'



import nextConfig from "../../../../next.config.js";
const basePath = nextConfig.basePath || "";
const PossibleComments = ["Redacción confusa", "Opciones mal formuladas", "Opciones repetidas", "Varias opciones correctas", "Ninguna opción correcta", "Respuesta marcada incorrecta", "Explicación errónea", "Fuera de temario"]



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportadas, setReportadas] = useState(null);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedOption, setSelectedOption] = useState("todo_correcto");
  const [selectedComments, setSelectedComments] = useState([]);
  const [checkedState, setCheckedState] = useState(new Array(PossibleComments.length + 1 ).fill(false));
  const [teacherComment, setTeacherComment] = useState(''); 
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);


  const toggleEvaluation = () => {
    setShowEvaluation(!showEvaluation);
  };

  // Función para manejar el cambio de opción seleccionada
  const handleOptionChange = (event) => {
    console.log(event.target.value)
    setSelectedOption(event.target.value);
    console.log(event.target.value)
  };


  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
    
    let CommentsPlusTeacherComment = [...PossibleComments, teacherComment];

    const Comments = updatedCheckedState.reduce(
      (sum, currentState, index) => {
        if (currentState === true) {
          return [...sum, CommentsPlusTeacherComment[index]];
        }
        return sum;
      },
      []
    );
    console.log(Comments)
    setSelectedComments(Comments);
  };

  const router = useRouter()
  const handlePlayAgain = () => {
    router.push(`/reports/${subject}`);
  }

  const openEvaluationModal = (question) => {
    setSelectedQuestion(question); // Asignamos la pregunta seleccionada al estado
    toggleEvaluation(); // Abrimos el modal
  };

  const submitEvaluation = async () => {
    const data = {};
      data.id = selectedQuestion.id;
      data.teacherReport = selectedOption;
      data.teacherComments = selectedComments;

    const url = urljoin(basePath, '/api/evaluationReportedQuestions');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            console.error("Failed to save question", await response.text());
        }

    setCheckedState(new Array(PossibleComments.length + 1 ).fill(false));
    setSelectedComments([]);
    setTeacherComment(' ');
    setSelectedQuestion(null);
    setSelectedOption("todo_correcto")
    toggleEvaluation()
    setReloadTrigger(prev => !prev);
  }

  

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&NOevaluadas=true`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = await responseReportadas.json();
        setReportadas(resultReportadas.preguntas);

        
        
        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [reloadTrigger]);

  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

 
      

  return (
    <main className="container-layout">
      <Header />
      <div className=" container-content">
        <h1 className="text-3xl font-bold mb-4 text-center ">{subject}</h1>

        <button
          className="btn-sm-icon btn-ghost flex mb-4"
          onClick={handlePlayAgain}
        >
          <HiArrowLeft sx={{ fontSize: 18 }} className="mt-1" />
          {t("quizpage.back")}
        </button>

        {/* 1. Preguntas reportadas */}
        <section className="mb-6 p-4 ">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            {t("reports.subtitle0")}
          </h2>
          <p className="text-sm mb-2">
            {t("reports.pregreport3")}: {reportadas.length}
          </p>

          <div className=" border p-2 rounded bg-100">
            {reportadas.map((pregunta, index) => (
              <div className="p-1 border-b last:border-b-0">
                <p className="text-base font-semibold p-1 ">
                  {" "}
                  {index + 1}. {pregunta.query}
                </p>
                <p className="text-sm p-1">
                  <span className="font-bold text-yellow-400">OPCIONES:</span>{" "}
                  {pregunta.choices.join(", ")}
                </p>
                <p className="text-sm p-1">
                  <span className="font-bold text-green-400">
                    RESPUESTA CORRECTA:
                  </span>{" "}
                  {pregunta.choices[pregunta.answer]}
                </p>
                <p className="text-sm p-1">
                  <span className="font-bold text-blue-400">EXPLICACIÓN:</span>{" "}
                  {pregunta.explanation}
                </p>

                <button
                style={{marginBottom: '1rem'}}
                  onClick={()=>openEvaluationModal(pregunta)}
                  className="mt-2 p-2 bg-blue-500 text-white rounded"
                >
                  Evaluar Pregunta
                </button>

                {/* Modal para seleccionar la opción */}
                {showEvaluation &&  (
                  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-5">
                    <div className="bg-white py-3 px-4 md:py-6 md:px-8 w-11/12  md:w-1/2 rounded shadow-lg">
                      <div className="flex justify-between ">
                        <h2 className="text-2xl font-semibold mb-2">
                          <span className="text-lg font-semibold ">
                            Evaluar pregunta
                          </span>
                        </h2>
                        <button
                          className="text-text flex mt-1.5 justify-start"
                          onClick={toggleEvaluation}
                        >
                          <HiOutlineXMark size={24} />
                        </button>
                      </div>


                      <p className="text-base font-semibold p-1 ">
                      {selectedQuestion.query}
                      </p>
                      <p className="text-sm p-1">
                        <span className="font-bold text-yellow-400">
                          OPCIONES:
                        </span>{" "}
                        {selectedQuestion.choices.join(", ")}
                      </p>
                      <p className="text-sm p-1">
                        <span className="font-bold text-green-400">
                          RESPUESTA CORRECTA:
                        </span>{" "}
                        {selectedQuestion.choices[pregunta.answer]}
                      </p>
                      <p className="text-sm p-1">
                        <span className="font-bold text-blue-400">
                          EXPLICACIÓN:
                        </span>{" "}
                        {selectedQuestion.explanation}
                      </p>

                      <div className="mb-4">
                        <label className="block mb-2 font-bold">
                          ¿Todo correcto o tiene algún fallo?
                        </label>
                        <select
                          value={selectedOption}
                          onChange={handleOptionChange}
                          className="border p-2 w-full"
                        >
                          <option value="todo_correcto">Todo Correcto</option>
                          <option value="fallo">
                            La pregunta tiene algún fallo
                          </option>
                        </select>
                      </div>

                      {selectedOption === "fallo" && (
                        <div className="toppings-list-item">
                          <div className="left-section">
                            {PossibleComments.map((name, index) => {
                              return (
                                <div className="toppings-list-item">
                                  <label>
                                    <input
                                      type="checkbox"
                                      id={`custom-checkbox-${index}`}
                                      value={name}
                                      checked={checkedState[index]}
                                      onChange={() => handleOnChange(index)}
                                      style={{ marginRight: "6px" }}
                                    />
                                    {name}
                                  </label>
                                </div>
                              );
                            })}

                            <label>
                              <input
                                type="checkbox"
                                value={"Otro"}
                                checked={checkedState[8]}
                                onChange={() => handleOnChange(8)}
                                style={{ marginRight: "6px" }}
                              />
                              Otro:
                              <br></br>
                              <textarea
                                style={{
                                  marginLeft: "22px",
                                  width: "100%",
                                  height: "100px",
                                  resize: "none",
                                }}
                                onChange={(e) => {
                                  setTeacherComment(e.target.value),
                                    handleOnChange();
                                }}
                              ></textarea>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <button
                          className="mt-2 p-2 bg-blue-500 text-white rounded"
                          onClick={submitEvaluation}
                        >
                          Enviar evaluación
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;