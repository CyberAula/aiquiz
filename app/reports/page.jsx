"use client";

import { useState, useEffect } from "react";
import urljoin from 'url-join';

import preguntasreportadas from './reports.js'



import nextConfig from '../../next.config';
const basePath = nextConfig.basePath || '';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);

  let numreportadas = preguntasreportadas(data.data)


  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Reportes</h1>

      {/* Preguntas reportadas */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Preguntas Reportadas</h2>
        <p className="text-lg">
          Número de preguntas reportadas: {numreportadas}
        </p>  
        <p className="text-lg">
          Preguntas reportadas: {data.reportadastexto}
          <span className="font-bold"></span>
        </p>
      </section>

      {/* Porcentaje de aciertos por dificultad */}
      {/* <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          Porcentaje de Acierto por Dificultad
        </h2>
        {data.porcentajeAciertoPorDificultad.map((item, index) => (
          <div key={index} className="mb-2">
            <p className="text-lg">
              <span className="font-bold">{item.dificultad}:</span>{" "}
              {item.npreguntas} preguntas,{" "}
              <span className="text-green-600 font-bold">
                {item.nacierto / item.npreguntas * 100}%
              </span>{" "}
              de aciertos
            </p>
          </div>
        ))}
      </section> */}
    </div>
  );
}
