"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";

import {es} from "../../../constants/langs/es.js"

import Footer from "../../../components/ui/Footer.js";
import Header from "../../../components/ui/Header.js";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2'
import { useRouter } from 'next/navigation'
import { HiOutlineXMark } from 'react-icons/hi2'



import nextConfig from "../../../../next.config.js";
import { getEvaluationComments, getSpanishComments } from "../../../constants/evaluationComments.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();

  // Calculate default start date
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-based
  const currentYear = today.getFullYear();
  let defaultStartYear;
  if (currentMonth >= 9) {
    defaultStartYear = currentYear;
  } else {
    defaultStartYear = currentYear - 1;
  }
  const defaultStartDate = `${defaultStartYear}-09-01`;

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState((new Date()).toISOString().split('T')[0]);

  // Local states for temporary dates
  const [tempStartDate, setTempStartDate] = useState(defaultStartDate);
  const [tempEndDate, setTempEndDate] = useState((new Date()).toISOString().split('T')[0]);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportedQuestions, setReportedQuestions] = useState([]);
  const [totalReported, setTotalReported] = useState(0);
  const [unEvaluatedReported, setUnEvaluatedReported] = useState(0);
  const [totalAllReported, setTotalAllReported] = useState(0);

  const [showEvaluation, setShowEvaluation] = useState(false);
  const [selectedOption, setSelectedOption] = useState("todo_correcto");
  const [selectedComments, setSelectedComments] = useState([]);
  const [checkedState, setCheckedState] = useState(new Array(getSpanishComments().length).fill(false));
  const [teacherComment, setTeacherComment] = useState(''); 
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(totalReported / pageSize);
  const [filterEvaluated, setFilterEvaluated] = useState('noevaluadas'); // 'noevaluadas' o 'todas'

  // Function to translate teacherReport values
  const translateTeacherReport = (teacherReport) => {
    if (teacherReport === "todo_correcto") {
      return t("pregreports.todoCorrecto");
    } else if (teacherReport === "fallo") {
      return t("pregreports.tieneFallo");
    }
    return teacherReport;
  };

  // Get the key used for translations from the Spanish content
  const evaluationCommentMap = Object.entries(es.evaluationComments || {}).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
  const translateEvaluationComment = (comment) => {
    const key = evaluationCommentMap[comment];
    if (key && t(`evaluationComments.${key}`) !== `evaluationComments.${key}`) {
      return t(`evaluationComments.${key}`);
    }
    return comment;
  };

  const toggleEvaluation = () => {
    setShowEvaluation(!showEvaluation);
  };

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
    
    let commentsPlusTeacherComment = [...getSpanishComments(), teacherComment];

    const comments = updatedCheckedState.reduce(
      (sum, currentState, index) => {
        if (currentState === true) {
          return [...sum, commentsPlusTeacherComment[index]];
        }
        return sum;
      },
      []
    );
    console.log(comments)
    setSelectedComments(comments);
  };

  const router = useRouter()
  const handlePlayAgain = () => {
    router.push(`/reports/${subject}`);
  }

  const handleUpdateDates = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(1);
  };

  const openEvaluationModal = (question) => {
    setSelectedQuestion(question); 
    toggleEvaluation(); 
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

    setCheckedState(new Array(getSpanishComments().length).fill(false));
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
        
        // Fetch total reported questions
        const responseTotal = await fetch(urljoin(basePath, `/api/reports?studentReport=true&asignatura=${subject}&count=true&fechaInicio=${startDate}&fechaFin=${endDate}`));
        if (!responseTotal.ok)
          throw new Error("Error loading total reported questions");
        const resultTotal = await responseTotal.json();
        setTotalAllReported(resultTotal.count);

        // Fetch reported questions without evaluation
        const responseUnEvaluated = await fetch(urljoin(basePath, `/api/reports?studentReport=true&asignatura=${subject}&count=true&NOevaluadas=true&fechaInicio=${startDate}&fechaFin=${endDate}`));
        if (!responseUnEvaluated.ok)
          throw new Error("Error loading un-evaluated reported questions");
        const resultUnEvaluated = await responseUnEvaluated.json();
        setUnEvaluatedReported(resultUnEvaluated.count);

        // Fetch reported questions for current page
        let query = `/api/reports?studentReport=true&asignatura=${subject}&page=${currentPage}&pageSize=${pageSize}&fechaInicio=${startDate}&fechaFin=${endDate}`;
        if (filterEvaluated === 'noevaluadas') {
          query += `&NOevaluadas=true`;
        }
        const response = await fetch(urljoin(basePath, query));
        if (!response.ok)
          throw new Error("Error loading reported questions");
        const result = await response.json();
        setReportedQuestions(result.preguntas);
        setTotalReported(result.total ?? result.preguntas.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [reloadTrigger, subject, currentPage, filterEvaluated, startDate, endDate]);

  if (loading) return <p className="text-center text-lg">{t("pregreports.cargando")}</p>;
  if (error) return <p className="text-red-500 text-center">{t("pregreports.error")} {error}</p>;

 
      

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

        {/* Filter switch */}
        <div className="mb-4 flex gap-4 items-center">
          <label className="font-semibold">{t("pregreports.ver")}</label>
          <label className="switch">
            <div className="switch-wrapper">
              <input
                type="checkbox"
                checked={filterEvaluated === 'todas'}
                onChange={e => {
                  setFilterEvaluated(e.target.checked ? 'todas' : 'noevaluadas');
                  setCurrentPage(1);
                }}
              />
              <span className="slider round"></span>
            </div>
            <span className="text-sm">
              {filterEvaluated === 'todas' ? t("pregreports.todas") : t("pregreports.noEvaluadas")}
            </span>
          </label>
        </div>

        {/* Date selector */}
        <div className="mb-4 flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm">{t("pregreports.desde")}</label>
            <input
              type="date"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <label className="text-sm">{t("pregreports.hasta")}</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            onClick={handleUpdateDates}
          >
            {t("pregreports.actualizar")}
          </button>
        </div>

        {/* 1. Reported questions */}
        <section className="mb-6 p-4 ">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            {t("reports.subtitle0")}
          </h2>
          <p className="text-sm mb-2">
            {t("pregreports.numeroReportadas")} {totalAllReported}
          </p>
          <p className="text-sm mb-2">
            {t("pregreports.numeroSinEvaluar")} {unEvaluatedReported}
          </p>

          <div className=" border p-2 rounded bg-100">
            {reportedQuestions.map((question, index) => {
              console.log(question)
              const evaluated = question.teacherReport;
              return (
                <div
                  className={`p-1 border-b last:border-b-0${evaluated ? ' bg-gray-100' : ''}`}
                  key={question.id ? question.id : ((currentPage - 1) * pageSize) + index}
                >
                  <p className="text-base font-semibold p-1 ">
                    {((currentPage - 1) * pageSize) + index + 1}. {question.query}
                  </p>
                  <p className="text-sm p-1">
                    <span className="font-bold text-yellow-400">{t("pregreports.opt")}:</span>{" "}
                    {question.choices.join(", ")}
                  </p>
                  <p className="text-sm p-1">
                    <span className="font-bold text-green-400">
                      {t("pregreports.ans")}:
                    </span>{" "}
                    {question.choices[question.answer]}
                  </p>
                  <p className="text-sm p-1">
                    <span className="font-bold text-blue-400">{t("pregreports.exp")}:</span>{" "}
                    {question.explanation}
                  </p>

                  {/* Show evaluation explanation if already evaluated */}
                  {evaluated && (
                    <div className="mt-2 p-2 rounded bg-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">{t("pregreports.evaluacion")}</p>
                      {question.teacherReport && (
                        <p className="text-sm text-gray-700 mb-1">{translateTeacherReport(question.teacherReport)}</p>
                      )}
                      {question.teacherComments && question.teacherComments.length > 0 && (
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                          {question.teacherComments.map((c, i) => (
                            <li key={i}>{translateEvaluationComment(c)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <button
                    style={{marginBottom: '1rem'}}
                    onClick={()=>openEvaluationModal(question)}
                    className="mt-2 p-2 bg-blue-500 text-white rounded"
                  >
                    {t("pregreports.evaluarPregunta")}
                  </button>

                  {showEvaluation && selectedQuestion && selectedQuestion.id === question.id && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-5">
                      <div className="bg-white py-3 px-4 md:py-6 md:px-8 w-11/12  md:w-1/2 rounded shadow-lg">
                        <div className="flex justify-between ">
                          <h2 className="text-2xl font-semibold mb-2">
                            <span className="text-lg font-semibold ">
                              {t("pregreports.title")}
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
                            {t("pregreports.opt")}:
                          </span>{" "}
                          {selectedQuestion.choices.join(", ")}
                        </p>
                        <p className="text-sm p-1">
                          <span className="font-bold text-green-400">
                            {t("pregreports.ans")}:
                          </span>{" "}
                          {selectedQuestion.choices[question.answer]}
                        </p>
                        <p className="text-sm p-1">
                          <span className="font-bold text-blue-400">
                            {t("pregreports.exp")}:
                          </span>{" "}
                          {selectedQuestion.explanation}
                        </p>

                        <div className="mb-4">
                          <label className="block mb-2 font-bold">
                            {t("pregreports.todoCorrectoFallo")}
                          </label>
                          <select
                            value={selectedOption}
                            onChange={handleOptionChange}
                            className="border p-2 w-full"
                          >
                            <option value="todo_correcto">{t("pregreports.todoCorrecto")}</option>
                            <option value="fallo">
                              {t("pregreports.tieneFallo")}
                            </option>
                          </select>
                        </div>

                        {selectedOption === "fallo" && (
                          <div className="toppings-list-item">
                            <div className="left-section">
                              {getEvaluationComments(t).map((name, index) => {
                                return (
                                  <div className="toppings-list-item" key={index}>
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
                                {t("pregreports.otro")}
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
                            {t("pregreports.button")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Pagination controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {t("pregreports.anterior")}
            </button>
            <span>{t("pregreports.pagina")} {currentPage} {t("pregreports.de")} {totalPages}</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {t("pregreports.siguiente")}
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;