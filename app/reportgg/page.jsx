"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";

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
  const [aciertosDificultad, setAciertosDificultad] = useState([]);

 



  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch preguntas reportadas
        const urlReportadas = urljoin(basePath, "/api/reportgg");
        const responseReportadas = await fetch(urlReportadas, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentReport: true }),
        });
        console.log("aqui")
        console.log(responseReportadas)
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");

        const resultReportadas = await responseReportadas.json();
        console.log(resultReportadas.questionsReported)
        setReportadas(resultReportadas.questionsReported);

        // Fetch aciertos por dificultad
        const urlAciertos = urljoin(basePath, "/api/reportgg");
        const responseAciertos = await fetch(urlAciertos, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "aciertosDificultad" }),
        });

        if (!responseAciertos.ok)
          throw new Error("Error cargando datos de aciertos por dificultad");

        const resultAciertos = await responseAciertos.json();
        setAciertosDificultad(resultAciertos);

        
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








      
    </div>
  );
}
