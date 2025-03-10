"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";

import { language } from '../constants/language';
import { subjectNames } from '../constants/language';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import nextConfig from "../../next.config.js";
const basePath = nextConfig.basePath || "";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportadas, setReportadas] = useState(null);
  const [aciertosDificultad, setAciertosDificultad] = useState(null);
  const [frecuenciaAciertoTemaporAsignatura, setfrecuenciaAciertoTemaporAsignatura] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,"/api/reportgg?studentReport=true"));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = await responseReportadas.json();
        setReportadas(resultReportadas.preguntas);

        //Fetch frecuencia y acierto por dificultad
        const responseFacilFrecuencia = await fetch(urljoin(basePath, "/api/reportgg?dificultad=facil&&count=true"));
        const nFacilFrencuencia = (await responseFacilFrecuencia.json()).count;
        const responseFacilAcierto = await fetch(urljoin(basePath,"/api/reportgg?dificultad=facil&&acierto=true&&count=true"));
        const nFacilAcierto = (await responseFacilAcierto.json()).count;

        const responseIntermedioFrecuencia = await fetch(urljoin(basePath, "/api/reportgg?dificultad=intermedio&&count=true"));
        const nIntermedioFrencuencia =(await responseIntermedioFrecuencia.json()).count;
        const responseIntermedioAcierto = await fetch(urljoin(basePath,"/api/reportgg?dificultad=intermedio&&acierto=true&&count=true"));
        const nIntermedioAcierto = (await responseIntermedioAcierto.json()).count;

        const responseAvanzadoFrecuencia = await fetch(urljoin(basePath, "/api/reportgg?dificultad=avanzado&&count=true"));
        const nAvanzadoFrencuencia =( await responseAvanzadoFrecuencia.json()).count;
        const responseAvanzadoAcierto = await fetch(urljoin(basePath,"/api/reportgg?dificultad=avanzado&&acierto=true&&count=true"));
        const nAvanzadoAcierto = (await responseAvanzadoAcierto.json()).count;

        if (!responseFacilFrecuencia.ok || !responseFacilAcierto.ok || !responseIntermedioAcierto.ok|| !responseIntermedioFrecuencia.ok|| !responseAvanzadoAcierto.ok|| !responseAvanzadoFrecuencia.ok)
          throw new Error("Error cargando preguntas dificultad");

        let array = [
          { dificultad: "facil", nacierto: nFacilAcierto, npreguntas: nFacilFrencuencia, porcentaje: (nFacilAcierto*100/nFacilFrencuencia).toFixed(2)},
          { dificultad: "intermedio", nacierto: nIntermedioAcierto, npreguntas: nIntermedioFrencuencia, porcentaje: (nIntermedioAcierto*100/nIntermedioFrencuencia).toFixed(2)},
          { dificultad: "avanzado", nacierto: nAvanzadoAcierto, npreguntas: nAvanzadoFrencuencia, porcentaje: (nAvanzadoAcierto*100/nAvanzadoFrencuencia).toFixed(2) },
        ];

        setAciertosDificultad(array);



        //Fetch frecuencia y acierto por tema
        let arrayNAporTema = {};
        let subjetsArray = Object.keys(subjectNames);
        await Promise.all(
          subjetsArray.map(async (sub) => {
            let temasArray = language[sub].map((lang) => lang.label);
            await Promise.all(
              temasArray.map(async (tema) => {
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reportgg?tema=${tema}&&count=true`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reportgg?tema=${tema}&&count=true&&acierto=true`));
                const nTemaAcierto = (await responseTemaAcierto.json()).count;

                let porcentaje = (nTemaAcierto * 100) / nTemaFrencuencia;
                if (nTemaFrencuencia === 0) {
                  porcentaje = 0;
                }

                if (!arrayNAporTema[sub]) {
                  arrayNAporTema[sub] = [];
                }

                arrayNAporTema[sub].push({tema: tema, npreg: nTemaFrencuencia, acierto: nTemaAcierto, porcentaje: porcentaje.toFixed(2)});
              })
            );
          })
        );
        setfrecuenciaAciertoTemaporAsignatura(arrayNAporTema);
        console.log(arrayNAporTema)

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center ">Reportes</h1>

      {/* Preguntas reportadas */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">1. Preguntas Reportadas</h2>
        <p className="text-sm mb-2">
          Número de preguntas reportadas: {reportadas.length}
        </p>
        <p className="text-sm mb-2">Preguntas reportadas:</p>
        <div className="max-h-40 overflow-y-auto border p-2 rounded bg-100">
          {reportadas.map((pregunta, index) => (
            <p key={index} className="text-sm p-1 border-b last:border-b-0">
              {index + 1}. {pregunta.query}: {pregunta.choices}
            </p>
          ))}
        </div>
      </section>




      {/* Porcentaje acierto segun dificultad */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          2. Frecuencia y Porcentaje de acierto según dificultad
        </h2>
        <table className="w-full border-collapse border border-gray-300 mb-12">
          <thead>
            <tr className="bg-200">
              <th className="border p-2">#</th>
              <th className="border p-2">Dificultad</th>
              <th className="border p-2">N° Preguntas</th>
              <th className="border p-2">N° Aciertos</th>
              <th className="border p-2">Porcentaje Acierto</th>
            </tr>
          </thead>
          <tbody>
            {aciertosDificultad.map((obj, index) => {
              const porcentaje =
                obj.npreguntas > 0
                  ? ((obj.nacierto / obj.npreguntas) * 100).toFixed(2)
                  : "N/A";
              return (
                <tr key={index} className="text-center border-t">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{obj.dificultad}</td>
                  <td className="border p-2">{obj.npreguntas}</td>
                  <td className="border p-2">{obj.nacierto}</td>
                  <td className="border p-2">{porcentaje}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>



        {/* Contenedor flex para las gráficas */}
        <div className="flex justify-between mb-4">
          {/* Gráfico de porcentaje de aciertos por dificultad */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              Porcentaje aciertos por Dificultad
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aciertosDificultad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis dataKey="dificultad" stroke="#FFFFFF" />
                <YAxis  stroke="#FFFFFF" domain={[0, 100]} />
                <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar
                  dataKey="porcentaje"
                  fill="#86cb98"
                  name="Porcentaje de Acierto"
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de frecuencia preguntas por dificultad */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              Frecuencia de preguntas por Dificultad
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aciertosDificultad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis dataKey="dificultad" stroke="#FFFFFF" tick={{ fontSize: 8 }} angle={-30} textAnchor="end" />
                <YAxis  stroke="#FFFFFF" />
                <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar
                  dataKey="npreguntas"
                  fill="#c1daf6 "
                  name="Frecuencia de Preguntas"
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>


      


      <section className="mb-6 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">3. Frecuencia y Acierto por Tema de cada Asignatura</h2>

      {Object.keys(frecuenciaAciertoTemaporAsignatura).map((as) =>  ( 
        <section key={as} className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{as}</h2>

          {/* Contenedor flex para las gráficas */}
        <div className="flex justify-between mb-4">
          {/* Gráfico de porcentaje de aciertos por tema */}
          <div className="w-1/2 p-2">
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={frecuenciaAciertoTemaporAsignatura[as]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis type="number" stroke="#FFFFFF" />
                <YAxis
                  dataKey="tema"
                  type="category"
                  stroke="#FFFFFF"
                  tick={{ fontSize: 8 }}
                  width={120}
                />
                <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar
                  dataKey="porcentaje"
                  fill="#86cb98"
                  name="Frecuencia de Preguntas"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de frecuencia preguntas por dificultad */}
          <div className="w-1/2 p-2">
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={frecuenciaAciertoTemaporAsignatura[as]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis type="number" stroke="#FFFFFF" />
                <YAxis
                  dataKey="tema"
                  type="category"
                  stroke="#FFFFFF"
                  tick={{ fontSize: 8 }}
                  width={120}
                />
                <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar
                  dataKey="npreg"
                  fill="#c1daf6"
                  name="Frecuencia de Preguntas"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        </section>
      ))}
      </section>


    </div>
  );
}
