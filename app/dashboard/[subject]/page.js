'use client';
import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { subjectNames } from '../../constants/language';


const SubjectPage = ({ params: { subject } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const getDashboardData = async () => {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subject
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    console.log('Respuesta del servidor:', response);

    const data = await response.json();
    console.log('data', data)
    setDashboardData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('useEffect called. Getting dashboard data...');       
    console.log('loading...');
    setIsLoading(true); 

    getDashboardData();
}, [])

  const subjectName = subjectNames[subject];

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div class="dashboard">
          <h1 class="bigger"><b>Dashboard del profesor:</b></h1>
          <h1><b>Asignatura <u>"{subjectName}"</u></b></h1>
          <h1><b>Información sobre las preguntas respondidas:</b></h1>
          <p>Total de preguntas: {dashboardData.numQuestionsTotal}</p>
          <p>Preguntas reportadas: {dashboardData.numQuestionsReported}. ({100*dashboardData.numQuestionsReported/dashboardData.numQuestionsTotal}%)</p> 
          <p>Preguntas correctas: {dashboardData.numQuestionsRight}. ({100*dashboardData.numQuestionsRight/dashboardData.numQuestionsTotal}%)</p>
          <p>Preguntas incorrectas: {dashboardData.numQuestionsWrong}. ({100*dashboardData.numQuestionsWrong/dashboardData.numQuestionsTotal}%)</p>

          <h1><b>Insights generados por el modelo sobre los conocimientos de los alumnos:</b></h1>
          <p><Markdown>{dashboardData.response1}</Markdown></p>
          <button  className='inline-block border-2 border-purple-400 rounded text-purple-400 text-center uppercase text-lg font-semibold mx-auto mt-8 px-6 py-2 hover:bg-red-400/40 hover:border-red-400 hover:text-white duration-75 active:bg-red-600 fuente'
                        onClick={() => window.history.back()}>
              « Volver  
          </button>
        </div>
      )}
      
    </div>
  );
};

export default SubjectPage;