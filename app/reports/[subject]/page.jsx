"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import urljoin from "url-join";


import { subjects } from '../../constants/subjects';

import Footer from "../../components/ui/Footer";
import Header from "../../components/ui/Header";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';


import ReportPanel from "../../components/ReportPanel";
import { getEvaluationComments, getSpanishComments } from "../../constants/evaluationComments.js";

import nextConfig from "../../../next.config.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();

  const [loadingPanel1, setLoadingPanel1] = useState(true);
  const [loadingPanel2, setLoadingPanel2] = useState(true);
  const [error, setError] = useState(null);

  const [comparatorActive, setComparatorActive] = useState(false);


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

  const [startDate1, setStartDate1] = useState(defaultStartDate);
  const [endDate1, setEndDate1] = useState((new Date()).toISOString().split('T')[0]);

  const [startDate2, setStartDate2] = useState(defaultStartDate);
  const [endDate2, setEndDate2] = useState((new Date()).toISOString().split('T')[0]);

  const [totalAnsweredAllPeriod, seTtotalAnsweredAllPeriod] = useState(0);

  const [totalAnsweredPeriod, setTotalAnsweredPeriod] = useState(0);
  const [reported, setReported] = useState([]);
  const [reportedReasons, setReportedReasons] = useState([]);
  const [evaluatedReported, setEvaluatedReported] = useState([]);
  const [difficultySuccess, setDifficultySuccess] = useState([]);
  const [topicSuccessBySubject, setTopicSuccessBySubject] = useState([]);
  const [subtopicSuccessByTopic, setSubtopicSuccessByTopic] = useState([]);
  const [temporal, setTemporal] = useState([]);

  const [totalAnsweredPeriodComparator, setTotalAnsweredPeriodComparator] = useState(0);
  const [reportedComparator, setReportedComparator] = useState([]);
  const [reportedReasonsComparator, setReportedReasonsComparator] = useState([]);
  const [evaluatedReportedComparator, setEvaluatedReportedComparator] = useState([]);
  const [difficultySuccessComparator, setDifficultySuccessComparator] = useState([]);
  const [topicSuccessBySubjectComparator, setTopicSuccessBySubjectComparator] = useState([]);
  const [subtopicSuccessByTopicComparator, setSubtopicSuccessByTopicComparator] = useState([]);
  const [temporalComparator, setTemporalComparator] = useState([]);



  const sortBySuccessPercentage = (object) => {
    const sorted = {};
    Object.keys(object).forEach((subject) => {
      // Sort topics of each subject by success percentage
      const sortedTopics = [...object[subject]].sort((a, b) => {
        return parseFloat(b.porcentaje) - parseFloat(a.porcentaje);
      });
      // Assign sorted topics to final object
      sorted[subject] = sortedTopics;
    });
    return sorted;
  };

  const router = useRouter()
  const handleBack = () => {
    router.push(`/reports`);
  }

  // Local states for temporary dates
  const [tempStartDate1, setTempStartDate1] = useState(startDate1);
  const [tempEndDate1, setTempEndDate1] = useState(endDate1);
  const [tempStartDate2, setTempStartDate2] = useState(startDate2);
  const [tempEndDate2, setTempEndDate2] = useState(endDate2);

  // Triggers to update panels
  const [triggerPanel1, setTriggerPanel1] = useState(0);
  const [triggerPanel2, setTriggerPanel2] = useState(0);

  const handleUpdatePanel1 = () => {
    setStartDate1(tempStartDate1);
    setEndDate1(tempEndDate1);
    setTriggerPanel1(t => t + 1);
  };
  const handleUpdatePanel2 = () => {
    setStartDate2(tempStartDate2);
    setEndDate2(tempEndDate2);
    setTriggerPanel2(t => t + 1);
  };


  useEffect(() => {
    const fetchReports = async () => {
      try {
        setError(null);
        setLoadingPanel1(true);

        const token = localStorage.getItem("jwt_token") || localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("Token de autenticación no disponible");
        }
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch total answered questions for the subject (all time)
        const responsetotalAnsweredAllPeriod = await fetch(
          urljoin(basePath, `/api/reports?asignatura=${subject}&&count=true`),
          { headers: authHeaders }
        );
        if (!responsetotalAnsweredAllPeriod.ok)
          throw new Error("Error loading total answered questions");
        const resulttotalAnsweredAllPeriod = (await responsetotalAnsweredAllPeriod.json()).count;
        seTtotalAnsweredAllPeriod(resulttotalAnsweredAllPeriod);

        // Fetch total answered questions for the subject in the selected period
        const responseTotalAnsweredPeriod = await fetch(
          urljoin(basePath, `/api/reports?asignatura=${subject}&&count=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
          { headers: authHeaders }
        );
        if (!responseTotalAnsweredPeriod.ok)
          throw new Error("Error loading total answered questions for period");
        const resultTotalAnsweredPeriod = (await responseTotalAnsweredPeriod.json()).count;
        setTotalAnsweredPeriod(resultTotalAnsweredPeriod);


        // Fetch reported questions
        const responseReported = await fetch(
          urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
          { headers: authHeaders }
        );
        if (!responseReported.ok)
          throw new Error("Error loading reported questions");
        const resultReported = (await responseReported.json()).count;
        setReported(resultReported);



        // Fetch EVALUATED reported questions
        const responseEvaluatedReported = await fetch(
          urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
          { headers: authHeaders }
        );
        if (!responseEvaluatedReported.ok)
          throw new Error("Error loading reported questions");
        const resultEvaluatedReported = (await responseEvaluatedReported.json()).count;
        setEvaluatedReported(resultEvaluatedReported);

        //Fetch report reasons
        let reasonsArray = [];
        let comments = getSpanishComments();

        await Promise.all(
          comments.map(async (reason) => {
            const responseReason = await fetch(
              urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&motivo=${reason}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const nReason = (await responseReason.json()).count;

            const responseEvaluatedReported = await fetch(
              urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const resultEvaluatedReported = (await responseEvaluatedReported.json()).count;

            if (!responseReason.ok || !responseEvaluatedReported.ok)
              throw new Error("Error loading reported question reason data");

            reasonsArray.push({ motivo: reason, n: nReason, porcentaje: (nReason / resultEvaluatedReported * 100).toFixed(2) });
          })
        );
        setReportedReasons(reasonsArray);
        console.log(reasonsArray)





        //Fetch frequency and success by DIFFICULTY 2.0
        let difficultyArray = [];
        let difficulties = ["facil", "intermedio", "avanzado"];

        await Promise.all(
          difficulties.map(async (difficulty) => {
            const responseDifficultyFrequency = await fetch(
              urljoin(basePath, `/api/reports?dificultad=${difficulty}&&asignatura=${subject}&&count=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const nDifficultyFrequency = (await responseDifficultyFrequency.json()).count;

            const responseDifficultySuccess = await fetch(
              urljoin(basePath, `/api/reports?dificultad=${difficulty}&&count=true&&asignatura=${subject}&&acierto=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const nDifficultySuccess = (await responseDifficultySuccess.json()).count;

            if (!responseDifficultyFrequency.ok || !responseDifficultySuccess.ok)
              throw new Error("Error loading difficulty frequency and success data");

            let percentage = (nDifficultySuccess * 100) / nDifficultyFrequency;
            if (nDifficultyFrequency === 0) {
              percentage = 0;
            }

            difficultyArray.push({ dif: difficulty, npreg: nDifficultyFrequency, acierto: nDifficultySuccess, porcentaje: percentage.toFixed(2) });
          })
        );
        setDifficultySuccess(difficultyArray);
        console.log(difficultyArray)



        //Fetch frequency and success by topic
        let topicArray = {};
        let subjectTopics = [];
        if (subjects[subject] && subjects[subject].topics) {
          subjectTopics = subjects[subject].topics.map(topic => topic.label);
        }

        await Promise.all(
          subjectTopics.map(async (topic) => {

            const responseTopicFrequency = await fetch(
              urljoin(basePath, `/api/reports?tema=${topic}&&asignatura=${subject}&&count=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const nTopicFrequency = (await responseTopicFrequency.json()).count;

            const responseTopicSuccess = await fetch(
              urljoin(basePath, `/api/reports?tema=${topic}&&asignatura=${subject}&&count=true&&acierto=true&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
              { headers: authHeaders }
            );
            const nTopicSuccess = (await responseTopicSuccess.json()).count;

            if (!responseTopicFrequency.ok || !responseTopicSuccess.ok)
              throw new Error("Error loading topic frequency and success data");

            let percentage = (nTopicSuccess * 100) / nTopicFrequency;
            if (nTopicFrequency === 0) {
              percentage = 0;
            }

            if (!topicArray[subject]) {
              topicArray[subject] = [];
            }

            topicArray[subject].push({ tema: topic, npreg: nTopicFrequency, acierto: nTopicSuccess, porcentaje: percentage.toFixed(2) });
          })
        );

        setTopicSuccessBySubject(sortBySuccessPercentage(topicArray));


        ////Fetch frequency and success by subtopic
        let subtopicArray = {};
        if (subjects[subject] && subjects[subject].topics) {
          await Promise.all(
            subjects[subject].topics.map(async (topic) => {
              const topicName = topic.label;
              if (!subtopicArray[topicName]) {
                subtopicArray[topicName] = [];
              }
              if (topic.subtopics) {
                await Promise.all(
                  topic.subtopics.map(async (sub) => {
                    const subtopic = sub.title;
                    const responseSubtopicFrequency = await fetch(
                      urljoin(basePath, `/api/reports?subtema=${subtopic.toLowerCase()}&&count=true&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
                      { headers: authHeaders }
                    );
                    const nSubtopicFrequency = (await responseSubtopicFrequency.json()).count;

                    const responseSubtopicSuccess = await fetch(
                      urljoin(basePath, `/api/reports?subtema=${subtopic.toLowerCase()}&&count=true&&acierto=true&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
                      { headers: authHeaders }
                    );
                    const nSubtopicSuccess = (await responseSubtopicSuccess.json()).count;

                    if (!responseSubtopicFrequency.ok || !responseSubtopicSuccess.ok)
                      throw new Error("Error loading subtopic frequency and success data");

                    let percentage = (nSubtopicSuccess * 100) / nSubtopicFrequency;
                    if (nSubtopicFrequency === 0) {
                      percentage = 0;
                    }


                    subtopicArray[topicName].push({
                      subtema: subtopic,
                      npreg: nSubtopicFrequency,
                      acierto: nSubtopicSuccess,
                      porcentaje: percentage.toFixed(2)
                    });
                  })
                );
              }
            })
          );
        }

        setSubtopicSuccessByTopic(sortBySuccessPercentage(subtopicArray));




        // //Fetch usage by months

        let monthlyArray = [];

        if (startDate1 != null) {

          const start = new Date(startDate1);
          const end = new Date(endDate1);

          const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

          if (diffMonths <= 3) { // If range is 3 months or less, show and query by days
            let current = new Date(start);
            while (current <= end) {
              const day = current.getDate();
              const month = current.getMonth() + 1;
              const year = current.getFullYear();
              const monthName = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: "long" }).format(current);
              const dateLabel = `${day} ${monthName} ${year}`;

              try {
                const response = await fetch(
                  urljoin(basePath, `/api/reports?temporal=true&&count=true&&dia=${day}&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
                  { headers: authHeaders }
                );
                if (!response.ok)
                  throw new Error("Error loading daily usage data");

                const nUsagePerDay = (await response.json()).count;
                monthlyArray.push({ fecha: dateLabel, count: nUsagePerDay });
              } catch (error) {
                console.error(
                  `Error getting data for ${dateLabel}:`,
                  error
                );
              }
              // Move to next day
              current.setDate(current.getDate() + 1);
            }
          } else {
            // If range is more than 3 months, show and query by months
            start.setDate(1);
            end.setDate(1);
            let current = new Date(start);
            while (current <= end) {
              const month = current.getMonth() + 1;
              const year = current.getFullYear();
              const monthName = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: "long" }).format(current);
              const dateLabel = `${monthName} ${year}`;

              try {
                // Query by month
                const response = await fetch(
                  `${basePath}/api/reports?temporal=true&&count=true&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`,
                  { headers: authHeaders }
                );
                if (!response.ok)
                  throw new Error("Error loading monthly usage data");

                const nUsagePerMonth = (await response.json()).count;
                monthlyArray.push({ fecha: dateLabel, count: nUsagePerMonth });
              } catch (error) {
                console.error(
                  `Error getting data for ${dateLabel}:`,
                  error
                );
              }
              current.setMonth(current.getMonth() + 1);
            }
          }

        } else {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          const startYear = currentYear - 1;

          for (let year = startYear; year <= currentYear; year++) {
            for (
              let month = year === startYear ? currentMonth : 1;
              month <= 12;
              month++
            ) {
              if (year === currentYear && month > currentMonth) break;

              const monthName = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                month: "long",
              }).format(new Date(year, month - 1, 1));

              try {
                console.log("here" + subject)
                const response = await fetch(
                  `${basePath}/api/reports?temporal=true&&count=true&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`,
                  { headers: authHeaders }
                );

                if (!response.ok)
                  throw new Error("Error loading monthly usage data");

                const nUsagePerMonth = (await response.json()).count;
                const dateLabel = `${monthName} ${year}`;

                monthlyArray.push({ fecha: dateLabel, count: nUsagePerMonth });
              } catch (error) {
                console.error(
                  `Error getting data for ${monthName} ${year}:`,
                  error
                );
              }
            }
          }

        }
        setTemporal(monthlyArray);



      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPanel1(false);
      }
    };



    fetchReports();


  }, [triggerPanel1]);

  useEffect(() => {
    if (!comparatorActive) return;
    const fetchComparator = async () => {

      try {
        setError(null);
        setLoadingPanel2(true);

        const token = localStorage.getItem("jwt_token") || localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("Token de autenticación no disponible");
        }
        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch total answered questions for the subject in the comparator period
        const responseTotalAnsweredPeriodComparator = await fetch(
          urljoin(basePath, `/api/reports?asignatura=${subject}&&count=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
          { headers: authHeaders }
        );
        if (!responseTotalAnsweredPeriodComparator.ok)
          throw new Error("Error loading total answered questions for comparator period");
        const resultTotalAnsweredPeriodComparator = (await responseTotalAnsweredPeriodComparator.json()).count;
        setTotalAnsweredPeriodComparator(resultTotalAnsweredPeriodComparator);


        // Fetch reported questions
        const responseReported = await fetch(
          urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
          { headers: authHeaders }
        );
        if (!responseReported.ok)
          throw new Error("Error loading reported questions");
        const resultReported = (await responseReported.json()).count;
        setReportedComparator(resultReported);



        // Fetch EVALUATED reported questions
        const responseEvaluatedReported = await fetch(
          urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
          { headers: authHeaders }
        );
        if (!responseEvaluatedReported.ok)
          throw new Error("Error loading reported questions");
        const resultEvaluatedReported = (await responseEvaluatedReported.json()).count;
        setEvaluatedReportedComparator(resultEvaluatedReported);

        //Fetch report reasons
        let reasonsArray = [];
        let comments = getSpanishComments();

        await Promise.all(
          comments.map(async (reason) => {
            const responseReason = await fetch(
              urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&motivo=${reason}&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const nReason = (await responseReason.json()).count;

            const responseEvaluatedReported = await fetch(
              urljoin(basePath, `/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const resultEvaluatedReported = (await responseEvaluatedReported.json()).count;

            if (!responseReason.ok || !responseEvaluatedReported.ok)
              throw new Error("Error loading reported question reason data");

            reasonsArray.push({ motivo: reason, n: nReason, porcentaje: (nReason / resultEvaluatedReported * 100).toFixed(2) });
          })
        );
        setReportedReasonsComparator(reasonsArray);
        console.log(reasonsArray)





        //Fetch frequency and success by DIFFICULTY 2.0
        let difficultyArray = [];
        let difficulties = ["facil", "intermedio", "avanzado"];

        await Promise.all(
          difficulties.map(async (difficulty) => {
            const responseDifficultyFrequency = await fetch(
              urljoin(basePath, `/api/reports?dificultad=${difficulty}&&asignatura=${subject}&&count=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const nDifficultyFrequency = (await responseDifficultyFrequency.json()).count;

            const responseDifficultySuccess = await fetch(
              urljoin(basePath, `/api/reports?dificultad=${difficulty}&&count=true&&asignatura=${subject}&&acierto=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const nDifficultySuccess = (await responseDifficultySuccess.json()).count;

            if (!responseDifficultyFrequency.ok || !responseDifficultySuccess.ok)
              throw new Error("Error loading difficulty frequency and success data");

            let percentage = (nDifficultySuccess * 100) / nDifficultyFrequency;
            if (nDifficultyFrequency === 0) {
              percentage = 0;
            }

            difficultyArray.push({ dif: difficulty, npreg: nDifficultyFrequency, acierto: nDifficultySuccess, porcentaje: percentage.toFixed(2) });
          })
        );
        setDifficultySuccessComparator(difficultyArray);
        console.log(difficultyArray)



        //Fetch frequency and success by topic
        let topicArray = {};
        let subjectTopics = [];
        if (subjects[subject] && subjects[subject].topics) {
          subjectTopics = subjects[subject].topics.map(topic => topic.label);
        }

        await Promise.all(
          subjectTopics.map(async (topic) => {

            const responseTopicFrequency = await fetch(
              urljoin(basePath, `/api/reports?tema=${topic}&&asignatura=${subject}&&count=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const nTopicFrequency = (await responseTopicFrequency.json()).count;

            const responseTopicSuccess = await fetch(
              urljoin(basePath, `/api/reports?tema=${topic}&&asignatura=${subject}&&count=true&&acierto=true&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
              { headers: authHeaders }
            );
            const nTopicSuccess = (await responseTopicSuccess.json()).count;

            if (!responseTopicFrequency.ok || !responseTopicSuccess.ok)
              throw new Error("Error loading topic frequency and success data");

            let percentage = (nTopicSuccess * 100) / nTopicFrequency;
            if (nTopicFrequency === 0) {
              percentage = 0;
            }

            if (!topicArray[subject]) {
              topicArray[subject] = [];
            }

            topicArray[subject].push({ tema: topic, npreg: nTopicFrequency, acierto: nTopicSuccess, porcentaje: percentage.toFixed(2) });
          })
        );

        setTopicSuccessBySubjectComparator(sortBySuccessPercentage(topicArray));


        ////Fetch frequency and success by subtopic
        let subtopicArray = {};
        if (subjects[subject] && subjects[subject].topics) {
          await Promise.all(
            subjects[subject].topics.map(async (topic) => {
              const topicName = topic.label;
              if (!subtopicArray[topicName]) {
                subtopicArray[topicName] = [];
              }
              if (topic.subtopics) {
                await Promise.all(
                  topic.subtopics.map(async (sub) => {
                    const subtopic = sub.title;
                    const responseSubtopicFrequency = await fetch(
                      urljoin(basePath, `/api/reports?subtema=${subtopic.toLowerCase()}&&count=true&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
                      { headers: authHeaders }
                    );
                    const nSubtopicFrequency = (await responseSubtopicFrequency.json()).count;

                    const responseSubtopicSuccess = await fetch(
                      urljoin(basePath, `/api/reports?subtema=${subtopic.toLowerCase()}&&count=true&&acierto=true&&asignatura=${subject}&&fechaInicio=${startDate1}&&fechaFin=${endDate1}`),
                      { headers: authHeaders }
                    );
                    const nSubtopicSuccess = (await responseSubtopicSuccess.json()).count;

                    if (!responseSubtopicFrequency.ok || !responseSubtopicSuccess.ok)
                      throw new Error("Error loading subtopic frequency and success data");

                    let percentage = (nSubtopicSuccess * 100) / nSubtopicFrequency;
                    if (nSubtopicFrequency === 0) {
                      percentage = 0;
                    }


                    subtopicArray[topicName].push({
                      subtema: subtopic,
                      npreg: nSubtopicFrequency,
                      acierto: nSubtopicSuccess,
                      porcentaje: percentage.toFixed(2)
                    });
                  })
                );
              }
            })
          );
        }

        setSubtopicSuccessByTopicComparator(sortBySuccessPercentage(subtopicArray));

        // //Fetch usage by months

        let monthlyArray = [];

        if (startDate2 != null) {

          const start = new Date(startDate2);
          const end = new Date(endDate2);
          const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

          if (diffMonths <= 3) {
            // If range is 3 months or less, show and query by days
            let current = new Date(start);
            while (current <= end) {
              const day = current.getDate();
              const month = current.getMonth() + 1;
              const year = current.getFullYear();
              const monthName = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(current);
              const dateLabel = `${day} ${monthName} ${year}`;

              try {
                // Query by day
                const response = await fetch(
                  urljoin(basePath, `/api/reports?temporal=true&&count=true&&dia=${day}&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`),
                  { headers: authHeaders }
                );
                if (!response.ok)
                  throw new Error("Error loading daily usage data");

                const nUsagePerDay = (await response.json()).count;
                monthlyArray.push({ fecha: dateLabel, count: nUsagePerDay });
              } catch (error) {
                console.error(
                  `Error getting data for ${dateLabel}:`,
                  error
                );
              }
              // Move to next day
              current.setDate(current.getDate() + 1);
            }
          } else {
            // If range is more than 3 months, show and query by months
            start.setDate(1);
            end.setDate(1);
            let current = new Date(start);
            while (current <= end) {
              const month = current.getMonth() + 1;
              const year = current.getFullYear();
              const monthName = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', { month: "long" }).format(current);
              const dateLabel = `${monthName} ${year}`;

              try {
                // Query by month
                const response = await fetch(
                  `${basePath}/api/reports?temporal=true&&count=true&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`,
                  { headers: authHeaders }
                );
                if (!response.ok)
                  throw new Error("Error loading monthly usage data");

                const nUsagePerMonth = (await response.json()).count;
                monthlyArray.push({ fecha: dateLabel, count: nUsagePerMonth });
              } catch (error) {
                console.error(
                  `Error getting data for ${dateLabel}:`,
                  error
                );
              }
              current.setMonth(current.getMonth() + 1);
            }
          }

        } else {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          const startYear = currentYear - 1;

          for (let year = startYear; year <= currentYear; year++) {
            for (
              let month = year === startYear ? currentMonth : 1;
              month <= 12;
              month++
            ) {
              if (year === currentYear && month > currentMonth) break;

              const monthName = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-ES', {
                month: "long",
              }).format(new Date(year, month - 1, 1));

              try {
                console.log("here" + subject)
                const response = await fetch(
                  `${basePath}/api/reports?temporal=true&&count=true&&mes=${month}&&anio=${year}&&asignatura=${subject}&&fechaInicio=${startDate2}&&fechaFin=${endDate2}`,
                  { headers: authHeaders }
                );

                if (!response.ok)
                  throw new Error("Error loading monthly usage data");

                const nUsagePerMonth = (await response.json()).count;
                const dateLabel = `${monthName} ${year}`;

                monthlyArray.push({ fecha: dateLabel, count: nUsagePerMonth });
              } catch (error) {
                console.error(
                  `Error getting data for ${monthName} ${year}:`,
                  error
                );
              }
            }
          }

        }
        setTemporalComparator(monthlyArray);



      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingPanel2(false);
      }
    };


    fetchComparator();
  }, [comparatorActive, triggerPanel2]);


  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <main className="container-layout-reports">
      <Header />
      <div className="container-content" >

        <button className='btn-sm-icon btn-ghost flex mb-4' onClick={handleBack}>
          <HiArrowLeft sx={{ fontSize: 18 }} className='mt-1' />
          {t('quizpage.back')}
        </button>

        <h1 className="flex-1 text-3xl font-bold text-center">{subject}</h1>


        <div className="flex items-center justify-between mb-8">



          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => setComparatorActive(!comparatorActive)}
          >
            {comparatorActive ? t("reports.scomparator") : t("reports.comparator")}
          </button>

          <Link
            className="px-4 py-2 bg-teal-400 text-white rounded"
            href={{ pathname: '/reports/' + subject + '/pregreport' }}
            id={subject}
          >{t("reports.subtitle1")}</Link>

        </div>


        {!comparatorActive ? (
          <ReportPanel
            subject={subject}
            startDate={tempStartDate1}
            setStartDate={setTempStartDate1}
            endDate={tempEndDate1}
            setEndDate={setTempEndDate1}
            reported={reported}
            totalAnsweredAllPeriod={totalAnsweredAllPeriod}
            totalAnsweredPeriod={totalAnsweredPeriod}
            reportedReasons={reportedReasons}
            evaluatedReported={evaluatedReported}
            difficultySuccess={difficultySuccess}
            topicSuccessBySubject={topicSuccessBySubject}
            subtopicSuccessByTopic={subtopicSuccessByTopic}
            temporal={temporal}
            t={t}
            loading={loadingPanel1}
            onUpdate={handleUpdatePanel1}
          />
        ) : (
          <div className="flex gap-8">
            <div className="w-1/2">
              <ReportPanel
                subject={subject}
                startDate={tempStartDate1}
                setStartDate={setTempStartDate1}
                endDate={tempEndDate1}
                setEndDate={setTempEndDate1}
                reported={reported}
                totalAnsweredAllPeriod={totalAnsweredAllPeriod}
                totalAnsweredPeriod={totalAnsweredPeriod}
                reportedReasons={reportedReasons}
                evaluatedReported={evaluatedReported}
                difficultySuccess={difficultySuccess}
                topicSuccessBySubject={topicSuccessBySubject}
                subtopicSuccessByTopic={subtopicSuccessByTopic}
                temporal={temporal}
                t={t}
                loading={loadingPanel1}
                onUpdate={handleUpdatePanel1}
              />
            </div>
            <div className="w-1/2 border-l ">
              <ReportPanel
                subject={subject}
                startDate={tempStartDate2}
                setStartDate={setTempStartDate2}
                endDate={tempEndDate2}
                setEndDate={setTempEndDate2}
                reported={reportedComparator}
                totalAnsweredAllPeriod={totalAnsweredAllPeriod}
                totalAnsweredPeriod={totalAnsweredPeriodComparator}
                reportedReasons={reportedReasonsComparator}
                evaluatedReported={evaluatedReportedComparator}
                difficultySuccess={difficultySuccessComparator}
                topicSuccessBySubject={topicSuccessBySubjectComparator}
                subtopicSuccessByTopic={subtopicSuccessByTopicComparator}
                temporal={temporalComparator}
                t={t}
                loading={loadingPanel2}
                onUpdate={handleUpdatePanel2}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;