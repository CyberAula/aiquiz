"use client";

import { useState, useEffect } from "react";
import urljoin from 'url-join';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { preguntasreportadas, porcentajeaciertopordificultad} from './reports.js';




import nextConfig from '../../next.config';
const basePath = nextConfig.basePath || '';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportadas, setReportadas] = useState([]);
  const [aciertosDificultad, setAciertosDificultad] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
        try {
          const url = urljoin(basePath,'/api/reports');
            const response = await fetch(url);
            console.log(response)

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }

          const result = await response.json();
          console.log(result);
          setData(result);

          setReportadas(preguntasreportadas(result.data));
          setAciertosDificultad(porcentajeaciertopordificultad(result.data));
          

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);


  


  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;


  

  const chartData = aciertosDificultad.map(item => ({
    dificultad: item.dificultad,
    porcentaje: item.npreguntas > 0 ? ((item.nacierto / item.npreguntas) * 100).toFixed(2) : 0
  }));

  const frecuenciaData = aciertosDificultad.map(item => ({
    dificultad: item.dificultad,
    frecuencia: item.npreguntas
  }));



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
              {index + 1}. {pregunta}
            </p>
          ))}
        </div>
      </section>

      {/* Porcentaje acierto segun dificultad */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          2. Frecuencia y Porcentaje de acierto según dificultad
        </h2>
        <table  className="w-full border-collapse border border-gray-300 mb-12">
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
          <h2 className="text-sl font-semibold mb-2 text-center">Porcentaje aciertos por Dificultad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
              <XAxis dataKey="dificultad" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" />
              <Legend wrapperStyle={{ color: "#FFFFFF" }} />
              <Bar dataKey="porcentaje" fill="#FFFFFF" name="Porcentaje de Acierto" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de frecuencia preguntas por dificultad */}
        <div className="w-1/2 p-2">
          <h2 className="text-sl font-semibold mb-2 text-center">Frecuencia de preguntas por Dificultad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frecuenciaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
              <XAxis dataKey="dificultad" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" />
              <Legend wrapperStyle={{ color: "#FFFFFF" }} />
              <Bar dataKey="frecuencia" fill="#FFFFFF" name="Frecuencia de Preguntas" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </section>




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
              {index + 1}. {pregunta}
            </p>
          ))}
        </div>
      </section>

    </div>
  );
}
