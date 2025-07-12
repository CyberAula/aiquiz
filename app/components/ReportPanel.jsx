// ReportPanel.js
import React, { useState, useEffect } from "react";
import { getEvaluationComments, getSpanishComments } from "../constants/evaluationComments.js";
import { DIFFICULTIES } from "../constants/difficulties.js";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";


const ReportPanel = ({
  subject,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reported,
  reportedReasons,
  evaluatedReported,
  difficultySuccess,
  topicSuccessBySubject,
  subtopicSuccessByTopic,
  temporal,
  t,
  loading,
  onUpdate,
}) => {
  const [translatedReasons, setTranslatedReasons] = useState(reportedReasons);
  const [translatedDifficulties, setTranslatedDifficulties] = useState(difficultySuccess);

  // Function to translate report reasons
  const translateReasons = (reasons) => {
    const spanishComments = getSpanishComments();
    const translatedComments = getEvaluationComments(t);
    
    return reasons.map(reason => ({
      ...reason,
      motivo: translatedComments[spanishComments.indexOf(reason.motivo)]
    }));
  };

  // Function to translate difficulties
  const translateDifficulties = (data) => {
    return data.map(item => ({
      ...item,
      dif: DIFFICULTIES[item.dif] ? t(`subject.${DIFFICULTIES[item.dif]}`) : item.dif
    }));
  };

  // Translate reasons and difficulties only on client side
  useEffect(() => {
    setTranslatedReasons(translateReasons(reportedReasons));
    setTranslatedDifficulties(translateDifficulties(difficultySuccess));
  }, [reportedReasons, difficultySuccess, t]);

  return (
  <div className="container-content">
    {loading ? (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg">{t("pregreports.cargando")}</span>
      </div>
    ) : (
      <>
        {/* Update button and date range selector */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mb-2"
            onClick={onUpdate}
          >
            {t("reports.update")}
          </button>
          <div className="flex gap-4 justify-center">
            <div>
              <label className="block mb-1 font-semibold">{t("reports.fechainicio")}:</label>
              <input
                type="date"
                value={startDate || ""}
                onChange={e => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">{t("reports.fechafin")}:</label>
              <input
                type="date"
                value={endDate || ""}
                onChange={e => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>




        {/* 1. Reported questions */}
        <section className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            1. {t("reports.subtitle0")}
          </h2>
          <p className="text-sm mb-4">
            {t("reports.pregreport1")}: {reported}
          </p>
          <p className="text-sm mb-4">
            {t("reports.pregreport2")}: {evaluatedReported}
          </p>

          <h2 className="text-sl font-semibold mt-4 mb-4 text-center">
            {t("reports.graph0_title")}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart layout="vertical" data={translatedReasons}>
              <CartesianGrid strokeDasharray="3 3"  />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                dataKey="motivo"
                type="category"
                tick={{ fontSize: 9 }}
                width={140}
              />
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
              <Legend  />
              <Bar
                dataKey="porcentaje"
                fill="#B57EDC"
                name={t("reports.porcentaje")}
                barSize={80}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* 2. Success percentage by difficulty */}
        <section className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            2. {t("reports.subtitle2")}
          </h2>
          <table className="w-full border-collapse border border-gray-300 mb-12">
            <thead>
              <tr className="bg-200">
                <th className="border p-2">#</th>
                <th className="border p-2">{t("reports.dificultad")}</th>
                <th className="border p-2">N°  {t("reports.preguntas")}</th>
                <th className="border p-2">N° {t("reports.acierto")}</th>
                <th className="border p-2"> {t("reports.porcentaje_acierto")}</th>
              </tr>
            </thead>
            <tbody>
              {translatedDifficulties.map((obj, index) => (
                <tr key={index} className="text-center border-t">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{obj.dif}</td>
                  <td className="border p-2">{obj.npreg}</td>
                  <td className="border p-2">{obj.acierto}</td>
                  <td className="border p-2">{obj.porcentaje}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mb-4">
            <div className="w-1/2 p-2">
              <h2 className="text-sl font-semibold mb-2 text-center">
                {t("reports.graph1_title")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={translatedDifficulties}  >
                  <CartesianGrid strokeDasharray="3 3"  />
                  <XAxis dataKey="dif"  angle={-30} textAnchor="end"  tick={{ fontSize: 8 }}/>
                  <YAxis  domain={[0, 100]} />
                  <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                  <Legend />
                  <Bar
                    dataKey="porcentaje"
                    fill="#86cb98"
                    name={t("reports.porcentaje_acierto")}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 p-2">
              <h2 className="text-sl font-semibold mb-2 text-center">
                {t("reports.graph2_title")}
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={translatedDifficulties}>
                  <CartesianGrid strokeDasharray="3 3"  />
                  <XAxis dataKey="dif"  angle={-30} textAnchor="end"  tick={{ fontSize: 8 }}/>
                  <YAxis />
                  <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                  <Legend  />
                  <Bar
                    dataKey="npreg"
                    fill="#c1daf6 "
                    name={t("reports.numero_preguntas")}
                    barSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 3. Frequency and Success by Topic */}
        <section className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            3. {t("reports.subtitle3")} {subject}
          </h2>
          {Object.keys(topicSuccessBySubject).map((subjectKey) => (
            <section key={subjectKey} >
              <table className="w-full border-collapse border border-gray-300 mb-12">
                <thead>
                  <tr className="bg-200">
                    <th className="border p-2">#</th>
                    <th className="border p-2">{t("reports.tema")}</th>
                    <th className="border p-2">N° {t("reports.preguntas")}</th>
                    <th className="border p-2">N° {t("reports.acierto")}</th>
                    <th className="border p-2">{t("reports.porcentaje_acierto")}</th>
                  </tr>
                </thead>
                <tbody>
                  {topicSuccessBySubject[subjectKey].map((obj, index) => (
                    <tr key={index} className="text-center border-t">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{obj.tema}</td>
                      <td className="border p-2">{obj.npreg}</td>
                      <td className="border p-2">{obj.acierto}</td>
                      <td className="border p-2">{obj.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mb-4">
                <div className="w-1/2 p-2">
                  <h2 className="text-sl font-semibold mb-2 text-center">
                    {t("reports.graph3_title")}
                  </h2>
                  <ResponsiveContainer width="100%"  height={topicSuccessBySubject[subjectKey].length * 40 + 50}>
                    <BarChart
                      layout="vertical"
                      data={topicSuccessBySubject[subjectKey]}
                    >
                      <CartesianGrid strokeDasharray="3 3"  />
                      <XAxis type="number"  domain={[0, 100]} />
                      <YAxis
                        dataKey="tema"
                        type="category"
                        tick={{ fontSize: 9 }}
                        width={120}
                      />
                      <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                      <Legend />
                      <Bar
                        dataKey="porcentaje"
                        fill="#86cb98"
                        name={t("reports.porcentaje_acierto")}
                        barSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 p-2">
                  <h2 className="text-sl font-semibold mb-2 text-center">
                    {t("reports.graph4_title")}
                  </h2>
                  <ResponsiveContainer width="100%" height={topicSuccessBySubject[subjectKey].length * 40 + 50}>
                    <BarChart
                      layout="vertical"
                      data={topicSuccessBySubject[subjectKey]}
                    >
                      <CartesianGrid strokeDasharray="3 3"  />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="tema"
                        type="category"
                        tick={{ fontSize: 9 }}
                        width={120}
                      />
                      <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                      <Legend  />
                      <Bar
                        dataKey="npreg"
                        fill="#c1daf6"
                        name={t("reports.numero_preguntas")}
                        barSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          ))}
        </section>

        {/* 4. Frequency and Success of each Subtopic by Topic */}
        <section className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            4. {t("reports.subtitle4")}
          </h2>
          {Object.keys(subtopicSuccessByTopic).map((topic) => (
            <section key={topic} className="mb-6 p-4 border rounded-lg shadow" >
              <h2 className="text-xl font-semibold mb-4"> - {t("reports.tema")}: {topic}</h2>
              <table className="w-full border-collapse border border-gray-300 mb-12">
                <thead>
                  <tr className="bg-200">
                    <th className="border p-2">#</th>
                    <th className="border p-2">{t("reports.subtema")}</th>
                    <th className="border p-2">N° {t("reports.preguntas")}</th>
                    <th className="border p-2">N° {t("reports.acierto")}</th>
                    <th className="border p-2">{t("reports.porcentaje_acierto")}</th>
                  </tr>
                </thead>
                <tbody>
                  {subtopicSuccessByTopic[topic].map((obj, index) => (
                    <tr key={index} className="text-center border-t">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{obj.subtema}</td>
                      <td className="border p-2">{obj.npreg}</td>
                      <td className="border p-2">{obj.acierto}</td>
                      <td className="border p-2">{obj.porcentaje}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mb-4">
                <div className="w-1/2 p-2">
                  <h2 className="text-sl font-semibold mb-2 text-center">
                    {t("reports.graph5_title")} {topic}
                  </h2>
                    <ResponsiveContainer width="100%" height={subtopicSuccessByTopic[topic].length * 40 + 50}>
                      <BarChart
                        layout="vertical"
                        data={subtopicSuccessByTopic[topic]}
                      >
                      <CartesianGrid strokeDasharray="3 3"  />
                      <XAxis type="number"  domain={[0, 100]} />
                      <YAxis
                        dataKey="subtema"
                        type="category"
                        tick={{ fontSize: 8, textAnchor: "end" }}
                        width={100}
                      />
                      <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" } } />
                      <Legend />
                      <Bar
                        dataKey="porcentaje"
                        fill="#86cb98"
                        name={t("reports.porcentaje_acierto")}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 p-2">
                  <h2 className="text-sl font-semibold mb-2 text-center">
                    {t("reports.graph6_title")} {topic}
                  </h2>
                  <ResponsiveContainer width="100%" height={subtopicSuccessByTopic[topic].length * 40 + 50}>
                    <BarChart
                      layout="vertical"
                      data={subtopicSuccessByTopic[topic]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="subtema"
                        type="category"
                        tick={{ fontSize: 8 }}
                        width={100}
                      />
                      <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                      <Legend  />
                      <Bar
                        dataKey="npreg"
                        fill="#c1daf6"
                        name={t("reports.numero_preguntas")}
                        barSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          ))}
        </section>

        {/*  5. When has the application been used more? */}
        <section className="mb-6 p-4  border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            5.  {t("reports.subtitle5")}
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={temporal}>
              <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={120}    />
              <YAxis   />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#B57EDC" strokeWidth={2} dot={false} name={t("reports.pormeses")}/>
            </LineChart>
          </ResponsiveContainer>
        </section>
      </>
    )}
  </div>
  );
};

export default ReportPanel;