"use client";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { subjectNames } from "../../constants/language";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";
import Footer from "../../components/ui/Footer"

const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const getDashboardData = async () => {
    const response = await fetch("/aiquiz/api/dashboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }
    console.log("Respuesta del servidor:", response);

    const data = await response.json();
    console.log("data", data);
    setDashboardData(data);
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("useEffect called. Getting dashboard data...");
    console.log("loading...");
    setIsLoading(true);

    getDashboardData();
  }, []);

  const subjectName = subjectNames[subject];

  console.log(subjectName + " subjectName");
  const subjectLowerCase = subject.toLowerCase();

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
        {/* <button
        className="btn-outline btn-sm mt-6 mb-2"
        onClick={() => window.history.back()}
      >
        « {t("dashboard.back")}
      </button> */}
      <div class="bg-dashboard">
        <div class="dashboard ">
          
          <div>
            <h1 className="font-semibold text-3xl pt-4 pb-6">
              {t("dashboard.title")} 
              {console.log(subject + " subject")}
              <span className="mr-2"></span> <b className="uppercase" id={`${subjectLowerCase + "-bg"}`}>{subjectName}</b>
            </h1>
            {/* <h1 className="text-xl pb-4">
              <b>{t("dashboard.infoQuestions")}</b>
            </h1> */}
            <div className="w-11/12 flex flex-row gap-8 border-gray-400 border-b pb-4 mb-4">
              <div className="flex flex-col gap-1 text-gray-500 ">
                <p className="font-semibold text-lg">{t("dashboard.totalQuestions")} </p>
                <p className="text-lg">{t("dashboard.questionsRight")} </p>
                <p className="text-lg">{t("dashboard.questionsWrong")} </p>
                <p className="text-lg">{t("dashboard.questionsReported")} </p>
              </div>
              <div className="respuestas-numericas  gap-1 flex flex-col">
                <p className="text-lg">
                
                  <b>{dashboardData.numQuestionsTotal}</b>
                </p>
                <p className="text-green-700 text-lg">
                  <b>{dashboardData.numQuestionsRight}</b> (
                  {(
                    (100 * dashboardData.numQuestionsRight) /
                    dashboardData.numQuestionsTotal
                  ).toFixed(2)}
                  %)
                </p>
                <p className="text-red-500 text-lg">
                  <b> {dashboardData.numQuestionsWrong}</b> (
                  {(
                    (100 * dashboardData.numQuestionsWrong) /
                    dashboardData.numQuestionsTotal
                  ).toFixed(2)}
                  %)
                </p>
                <p className="text-gray-600 text-lg">
                  <b> {dashboardData.numQuestionsReported}</b> (
                  {(
                    (100 * dashboardData.numQuestionsReported) /
                    dashboardData.numQuestionsTotal
                  ).toFixed(2)}
                  %)
                </p>
              </div>
            </div>
          </div>
           <h1 className="font-medium text-xl pt-2 pb-4">{t('dashboard.reportTitle')}</h1> 
          {console.log(dashboardData.response1)}
          {parse(dashboardData.response1)}
         
        </div>
        <Footer/>
        </div>
        
        </div>
   
      )}
    </div>

  );
};


export default SubjectPage;
