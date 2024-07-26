'use client';
import { useState, useEffect } from 'react';


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

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1>Asignatura {subject}</h1>
          <h2>Información sobre las preguntas respondidas:</h2>
          <p>Total de preguntas: {dashboardData.numQuestionsTotal}</p>
          <p>Preguntas reportadas: {dashboardData.numQuestionsReported}. ({100*dashboardData.numQuestionsReported/dashboardData.numQuestionsTotal}%)</p> 
          <p>Preguntas correctas: {dashboardData.numQuestionsRight}. ({100*dashboardData.numQuestionsRight/dashboardData.numQuestionsTotal}%)</p>
          <p>Preguntas incorrectas: {dashboardData.numQuestionsWrong}. ({100*dashboardData.numQuestionsWrong/dashboardData.numQuestionsTotal}%)</p>

        </div>
      )}
      
    </div>
  );
};

export default SubjectPage;