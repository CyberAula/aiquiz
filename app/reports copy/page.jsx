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

import {
  preguntasreportadas,
  porcentajeaciertopordificultad,
  pregMasFrecuentesYPorcentajeAcierto,
  temporal,
  temasFrecuenciaYPorcentajedeAcierto,
  temasGIB,
  temasGITST,
} from "./reports.js";

import nextConfig from "../../next.config.js";
const basePath = nextConfig.basePath || "";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportadas, setReportadas] = useState([]);
  const [aciertosDificultad, setAciertosDificultad] = useState([]);
  const [pregFrecuentesyAcierto, setpregFrecuentesyAcierto] = useState({});
  const [pregMeses, setpregMeses] = useState({});
  const [frecyaciertosTemas, setfrecyaciertosTemas] = useState([]);
  const [GIBtemas, setGIBtemas] = useState([]);
  const [GITSTtemas, setGITSTtemas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = urljoin(basePath, "/api/reports");
        const response = await fetch(url);
        console.log(response);

        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }

        const result = await response.json();
        console.log(result);
        setData(result);

        setReportadas(preguntasreportadas(result.data));
        setAciertosDificultad(porcentajeaciertopordificultad(result.data));
        setpregFrecuentesyAcierto(pregMasFrecuentesYPorcentajeAcierto(result.data));
        setpregMeses(temporal(result.data));
        setfrecyaciertosTemas(temasFrecuenciaYPorcentajedeAcierto(result.data));
        setGIBtemas(temasGIB(result.data));
        setGITSTtemas(temasGITST(result.data));

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

  const aciertos_dificultad_data = aciertosDificultad.map((item) => ({
    dificultad: item.dificultad,
    porcentaje:
      item.npreguntas > 0
        ? ((item.nacierto / item.npreguntas) * 100).toFixed(2)
        : 0,
  }));

  const frecuencia_dificultad_Data = aciertosDificultad.map((item) => ({
    dificultad: item.dificultad,
    frecuencia: item.npreguntas,
  }));

  const acierto_preguntasFrecuentes_Data = Object.entries(
    pregFrecuentesyAcierto
  ).map(([pregunta, porcentaje]) => ({
    pregunta,
    porcentaje: porcentaje.toFixed(2),
  }));

  const pregMeses_Data = Object.entries(pregMeses).map(([mes, npreg]) => ({
    mes: mes,
    npreg: npreg,
  }));

  const frecTema_Data = frecyaciertosTemas.map((item) => ({
    tema: item.tema,
    npreg: item.npreguntas,
  }));

  const aciertoTema_Data = frecyaciertosTemas.map((item) => ({
    tema: item.tema,
    porcentaje: item.porcentajeacierto,
  }));

  const GIBacierto_Data = GIBtemas.map((item) => ({
    tema: item.tema,
    porcentaje: item.porcentajeacierto,
  }));

  const GIBfrec_Data = GIBtemas.map((item) => ({
    tema: item.tema,
    npreg: item.npreguntas,
  }));

  const GITSTacierto_Data = GITSTtemas.map((item) => ({
    tema: item.tema,
    porcentaje: item.porcentajeacierto,
  }));

  const GITSTfrec_Data = GITSTtemas.map((item) => ({
    tema: item.tema,
    npreg: item.npreguntas,
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
              <BarChart data={aciertos_dificultad_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis dataKey="dificultad" stroke="#FFFFFF" />
                <YAxis stroke="#FFFFFF" domain={[0, 100]} />
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
              <BarChart data={frecuencia_dificultad_Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis dataKey="dificultad" stroke="#FFFFFF" />
                <YAxis stroke="#FFFFFF" />
                <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
                <Legend wrapperStyle={{ color: "#FFFFFF" }} />
                <Bar
                  dataKey="frecuencia"
                  fill="#c1daf6 "
                  name="Frecuencia de Preguntas"
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>





      {/* Preguntas más frecuentes y su porcentaje de acierto */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          3. Preguntas más frecuentes y su porcentaje de acierto
        </h2>
        <p className="text-sm mb-2">
          Para la selección de preguntas más frecuentes se han considerado
          aquellas que han sido respondidas 15 o más veces
        </p>
        <div className="max-h-40 overflow-y-auto border p-2 rounded mb-8">
          {Object.entries(pregFrecuentesyAcierto).map(
            ([pregunta, porcentaje], index) => (
              <p key={index} className="text-sm p-1 border-b last:border-b-0">
                {index + 1}. {pregunta} - {porcentaje.toFixed(2)}%
              </p>
            )
          )}
        </div>

        {/* Gráfico de acierto preguntas más frecuentes*/}
        <div>
          <h2 className="text-sl font-semibold mb-2 text-center">
            Porcentaje acierto preguntas más frecuentes
          </h2>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart data={acierto_preguntasFrecuentes_Data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} stroke="#FFFFFF" />
              <YAxis
                dataKey="pregunta"
                type="category"
                width={320}
                stroke="#FFFFFF"
                tick={{ fontSize: 10 }}
              />
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
              <Legend wrapperStyle={{ color: "#FFFFFF" }} />
              <Bar
                dataKey="porcentaje"
                fill="#86cb98"
                name="Porcentaje de Acierto"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>






      {/* Preguntas por meses */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          4. ¿Cuándo se ha utilizado más la aplicación?
        </h2>
        {/*Error el created at generado por la app es Date.now() y el generado por excel es distinto*/}
        <div className="max-h-40 overflow-y-auto border p-2 rounded mb-8">
          {Object.entries(pregMeses).map(([mes, npreg], index) => (
            <p key={index} className="text-sm p-1 border-b last:border-b-0">
              {index + 1}. {mes} - {npreg}
            </p>
          ))}
        </div>

        {/* Gráfico de numero de preguntas por meses */}
        <div>
          <h2 className="text-sl font-semibold mb-2 text-center">
            Frecuencia de preguntas por Meses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pregMeses_Data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
              <XAxis dataKey="mes" stroke="#FFFFFF" />
              <YAxis stroke="#FFFFFF" />
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" }} />
              <Legend wrapperStyle={{ color: "#FFFFFF" }} />
              <Bar
                dataKey="npreg"
                fill="#eae89c "
                name="Número de Preguntas"
                barSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>







      {/* Frecuencia y porcentaje de acierto de temas genericos(language) */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            5. Frecuencia y porcentaje de acierto de temas genéricos
          </h2>

          <table className="w-full border-collapse border border-gray-300 mb-12">
            <thead>
              <tr className="bg-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Tema</th>
                <th className="border p-2">N° Preguntas</th>
                <th className="border p-2">N° Aciertos</th>
                <th className="border p-2">Porcentaje Acierto</th>
              </tr>
            </thead>
            <tbody>
              {frecyaciertosTemas.map((obj, index) => {
                return (
                  <tr key={index} className="text-center border-t">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{obj.tema}</td>
                    <td className="border p-2">{obj.npreguntas}</td>
                    <td className="border p-2">{obj.naciertos}</td>
                    <td className="border p-2">
                      {obj.porcentajeacierto.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Gráfico de porcentaje de aciertos por tema */}
          <div>
            <h2 className="text-sl font-semibold mb-2 text-center">
              Porcentaje aciertos por Dificultad
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart layout="vertical" data={aciertoTema_Data}>
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
                  name="Porcentaje de Acierto"
                  barSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de frecuencia preguntas por tema */}
          <div>
            <h2 className="text-sl font-semibold mb-2 text-center">
              Frecuencia de preguntas por Dificultad
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart layout="vertical" data={frecTema_Data}>
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
                  barSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>






      {/* GIB: Frecuencia y porcentaje de acierto de temas genericos(language) */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            6. GIB: Frecuencia y porcentaje de acierto de temas genéricos
          </h2>

          <table className="w-full border-collapse border border-gray-300 mb-12">
            <thead>
              <tr className="bg-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Tema</th>
                <th className="border p-2">N° Preguntas</th>
                <th className="border p-2">N° Aciertos</th>
                <th className="border p-2">Porcentaje Acierto</th>
              </tr>
            </thead>
            <tbody>
              {GIBtemas.map((obj, index) => {
                return (
                  <tr key={index} className="text-center border-t">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{obj.tema}</td>
                    <td className="border p-2">{obj.npreguntas}</td>
                    <td className="border p-2">{obj.naciertos}</td>
                    <td className="border p-2">
                      {obj.porcentajeacierto}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>


          
        {/* Contenedor flex para las gráficas */}
        <div className="flex justify-between mb-4">
          {/* Gráfico de porcentaje de aciertos por tema */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              GIB: Porcentaje aciertos por tema
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={GIBacierto_Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis type="number" stroke="#FFFFFF" domain={[0, 100]}/>
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
                  name="Porcentaje de Acierto"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de frecuencia preguntas por dificultad */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              GIB: Frecuencia de preguntas por tema
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={GIBfrec_Data}>
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
                  barSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        </div>
      </section>





      
      {/* GITST: Frecuencia y porcentaje de acierto de temas genericos(language) */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            7. GITST: Frecuencia y porcentaje de acierto de temas genéricos
          </h2>

          <table className="w-full border-collapse border border-gray-300 mb-12">
            <thead>
              <tr className="bg-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Tema</th>
                <th className="border p-2">N° Preguntas</th>
                <th className="border p-2">N° Aciertos</th>
                <th className="border p-2">Porcentaje Acierto</th>
              </tr>
            </thead>
            <tbody>
              {GITSTtemas.map((obj, index) => {
                return (
                  <tr key={index} className="text-center border-t">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{obj.tema}</td>
                    <td className="border p-2">{obj.npreguntas}</td>
                    <td className="border p-2">{obj.naciertos}</td>
                    <td className="border p-2">
                      {obj.porcentajeacierto}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>


          
        {/* Contenedor flex para las gráficas */}
        <div className="flex justify-between mb-4">
          {/* Gráfico de porcentaje de aciertos por tema */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              GITST: Porcentaje aciertos por tema
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={GITSTacierto_Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis type="number" stroke="#FFFFFF" domain={[0, 100]}/>
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
                  name="Porcentaje de Acierto"
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de frecuencia preguntas por dificultad */}
          <div className="w-1/2 p-2">
            <h2 className="text-sl font-semibold mb-2 text-center">
              GITST: Frecuencia de preguntas por tema
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={GITSTfrec_Data}>
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
                  barSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        </div>
      </section>
    </div>
  );
}
