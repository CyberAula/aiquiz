'use client';
import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { subjectNames } from '../../constants/language';
import { useTranslation } from "react-i18next";


const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const getDashboardData = async () => {
      const response = await fetch('/aiquiz/api/dashboard', {
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
          <h1 class="bigger"><b>{t('dashboard.title')}</b></h1>
          <h1><b>{t('dashboard.subject')} <u>&quot;{subjectName}&quot;</u></b></h1>
          <h1><b>{t('dashboard.infoQuestions')}</b></h1>
          <p>{t('dashboard.totalQuestions')} {dashboardData.numQuestionsTotal}</p>
          <p>{t('dashboard.questionsReported')} {dashboardData.numQuestionsReported}. ({100*dashboardData.numQuestionsReported/dashboardData.numQuestionsTotal}%)</p> 
          <p>{t('dashboard.questionsRight')} {dashboardData.numQuestionsRight}. ({100*dashboardData.numQuestionsRight/dashboardData.numQuestionsTotal}%)</p>
          <p>{t('dashboard.questionsWrong')} {dashboardData.numQuestionsWrong}. ({100*dashboardData.numQuestionsWrong/dashboardData.numQuestionsTotal}%)</p>

          <h1><b>{t('dashboard.totalQuestions')}</b></h1>
          <p><Markdown>{dashboardData.response1}</Markdown></p>
          <button  className='bg-outline  active:bg-red-600'
                        onClick={() => window.history.back()}>
              « {t('dashboard.back')}
          </button>
        </div>
      )}
      
    </div>
  );
};

export default SubjectPage;