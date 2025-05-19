// PanelGraficas.js
import React from "react";
import Link from 'next/link';
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
import { HiArrowLeft } from 'react-icons/hi2';

const PanelGraficas = ({
  subject,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  reportadas,
  motivosReportadas,
  reportadasCorregidas,
  aciertosDificultad,
  frecuenciaAciertoTemaporAsignatura,
  frecuenciaAciertoSubtemaporTema,
  Temporal,
  t,
  handlePlayAgain
}) => (
  <div className="container-content">
    {/* Selector de rango de fechas */}
    <div className="flex gap-4 mb-6 justify-center">
      <div>
        <label className="block mb-1 font-semibold">Fecha inicio:</label>
        <input
          type="date"
          value={fechaInicio || ""}
          onChange={e => setFechaInicio(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Fecha fin:</label>
        <input
          type="date"
          value={fechaFin || ""}
          onChange={e => setFechaFin(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
    </div>

    <h1 className="text-3xl font-bold mb-4 text-center ">{subject}</h1>

    <button className='btn-sm-icon btn-ghost flex mb-4' onClick={handlePlayAgain}>
      <HiArrowLeft sx={{fontSize: 18}} className='mt-1'/>
      {t('quizpage.back')}
    </button>

    {/* 1. Preguntas reportadas */}
    <section className="mb-6 p-4 border rounded-lg shadow">
      <h2 className="text-left text-2xl mb-4 font-semibold">
        1. {t("reports.subtitle0")}
      </h2>
      <p className="text-sm mb-4">
        {t("reports.pregreport1")}: {reportadas}
      </p>
      <p className="text-sm mb-4">
        {t("reports.pregreport2")}: {reportadasCorregidas}
      </p>
      <div className="mb-2">
        <Link className="text-sm p-3 bg-yellow-200 rounded transition-all duration-300 hover:bg-yellow-300 hover:shadow-lg hover:-translate-y-1" href={{ pathname: '/reports/'+ subject + '/pregreport' }} id={subject}>
          {t("reports.subtitle1")}
        </Link>
      </div>
      <h2 className="text-sl font-semibold mt-4 mb-4 text-center">
        {t("reports.graph0_title")}
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart layout="vertical" data={motivosReportadas}>
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

    {/* 2. Porcentaje acierto segun dificultad */}
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
          {aciertosDificultad.map((obj, index) => (
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
            <BarChart data={aciertosDificultad}>
              <CartesianGrid strokeDasharray="3 3"  />
              <XAxis dataKey="dif"  />
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
            <BarChart data={aciertosDificultad}>
              <CartesianGrid strokeDasharray="3 3"  />
              <XAxis dataKey="dif"  />
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

    {/* 3. Frecuencia y Acierto por cada Tema */}
    <section className="mb-6 p-4 border rounded-lg shadow">
      <h2 className="text-left text-2xl mb-4 font-semibold">
        3. {t("reports.subtitle3")} {subject}
      </h2>
      {Object.keys(frecuenciaAciertoTemaporAsignatura).map((as) => (
        <section key={as} >
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
              {frecuenciaAciertoTemaporAsignatura[as].map((obj, index) => (
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={frecuenciaAciertoTemaporAsignatura[as]}
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={frecuenciaAciertoTemaporAsignatura[as]}
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

    {/* 4. Frecuencia y Acierto de cada Subtema por Tema */}
    <section className="mb-6 p-4 border rounded-lg shadow">
      <h2 className="text-left text-2xl mb-4 font-semibold">
        4. {t("reports.subtitle4")}
      </h2>
      {Object.keys(frecuenciaAciertoSubtemaporTema).map((tema) => (
        <section key={tema} className="mb-6 p-4 border rounded-lg shadow" >
          <h2 className="text-xl font-semibold mb-4"> - {t("reports.tema")}: {tema}</h2>
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
              {frecuenciaAciertoSubtemaporTema[tema].map((obj, index) => (
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
                {t("reports.graph5_title")} {tema}
              </h2>
              <ResponsiveContainer width="100%" height={440}>
                <BarChart
                  layout="vertical"
                  data={frecuenciaAciertoSubtemaporTema[tema]}
                >
                  <CartesianGrid strokeDasharray="3 3"  />
                  <XAxis type="number"  domain={[0, 100]} />
                  <YAxis
                    dataKey="subtema"
                    type="category"
                    tick={{ fontSize: 8, textAnchor: "end" }}
                    width={200}
                  />
                  <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" } } />
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
                {t("reports.graph6_title")} {tema}
              </h2>
              <ResponsiveContainer width="100%" height={440}>
                <BarChart
                  layout="vertical"
                  data={frecuenciaAciertoSubtemaporTema[tema]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="subtema"
                    type="category"
                    tick={{ fontSize: 8 }}
                    width={200}
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

    {/*  5. ¿Cuándo se ha utilizado más la aplicación? */}
    <section className="mb-6 p-4  border rounded-lg shadow">
      <h2 className="text-left text-2xl mb-4 font-semibold">
        5.  {t("reports.subtitle5")}
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={Temporal}>
          <XAxis dataKey="fecha" angle={-45} textAnchor="end" height={120}    /> 
          <YAxis   />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#B57EDC" strokeWidth={2} dot={false} name={t("reports.pormeses")}/>
        </LineChart>
      </ResponsiveContainer>
    </section>
  </div>
);

export default PanelGraficas;