"use client";

import { useState, useEffect } from "react";
import { subjects } from "../../constants/subjects";
import { useTranslation } from "react-i18next";
import parse from "html-react-parser";
import Footer from "../../components/ui/Footer";

const SubjectPage = ({ params: { subject } }) => {

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

const getDashboardData = async () => {

  try {

    const response = await fetch(
      "/aiquiz/api/dashboard",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject }),
      }
    );

    const data = await response.json();

    console.log(data);

    setDashboardData(data);

  } catch (error) {

    console.error(error);

  } finally {

    setIsLoading(false);

  }

};

  useEffect(() => {

    getDashboardData();

  }, []);

  const subjectName = subjects?.[subject]?.name || subject;

  const subjectLowerCase = subject.toLowerCase();

  // Evitar división por cero
  const total =
    dashboardData?.numQuestionsTotal || 1;

  return (

    <div>

      {isLoading ? (

        <div className="p-6 text-lg">
          Loading...
        </div>

      ) : (

        <div>

          <div className="bg-dashboard">

            <div className="dashboard">

              <div>

                <h1 className="font-semibold text-3xl pt-4 pb-6">

                  {t("dashboard.title")}

                  <span className="mr-2"></span>

                  <b
                    className="uppercase"
                    id={`${subjectLowerCase}-bg`}
                  >
                    {subjectName}
                  </b>

                </h1>

                <div className="w-11/12 flex flex-row gap-8 border-gray-400 border-b pb-4 mb-4">

                  <div className="flex flex-col gap-1 text-gray-500">

                    <p className="font-semibold text-lg">
                      {t("dashboard.totalQuestions")}
                    </p>

                    <p className="text-lg">
                      {t("dashboard.questionsRight")}
                    </p>

                    <p className="text-lg">
                      {t("dashboard.questionsWrong")}
                    </p>

                    <p className="text-lg">
                      {t("dashboard.questionsReported")}
                    </p>

                  </div>

                  <div className="respuestas-numericas gap-1 flex flex-col">

                    <p className="text-lg">
                      <b>
                        {dashboardData?.numQuestionsTotal || 0}
                      </b>
                    </p>

                    <p className="text-green-700 text-lg">

                      <b>
                        {dashboardData?.numQuestionsRight || 0}
                      </b>

                      {" "}(
                      {(
                        (100 *
                          (dashboardData?.numQuestionsRight || 0)) /
                        total
                      ).toFixed(2)}
                      %)

                    </p>

                    <p className="text-red-500 text-lg">

                      <b>
                        {dashboardData?.numQuestionsWrong || 0}
                      </b>

                      {" "}(
                      {(
                        (100 *
                          (dashboardData?.numQuestionsWrong || 0)) /
                        total
                      ).toFixed(2)}
                      %)

                    </p>

                    <p className="text-gray-600 text-lg">

                      <b>
                        {dashboardData?.numQuestionsReported || 0}
                      </b>

                      {" "}(
                      {(
                        (100 *
                          (dashboardData?.numQuestionsReported || 0)) /
                        total
                      ).toFixed(2)}
                      %)

                    </p>

                  </div>

                </div>

              </div>

              <h1 className="font-medium text-xl pt-2 pb-4">

                {t("dashboard.reportTitle")}

              </h1>

              <div className="bg-white p-4 rounded-lg shadow">

                {
                  typeof dashboardData?.response1 === "string"

                    ? parse(dashboardData.response1)

                    : (
                      <p>
                        No hay reporte disponible.
                      </p>
                    )
                }

              </div>

            </div>

            <Footer />

          </div>

        </div>

      )}

    </div>

  );

};

export default SubjectPage;