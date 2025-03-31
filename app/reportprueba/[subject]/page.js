"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";

import { language } from '../../constants/language';
import { subjectNames } from '../../constants/language';
import { topics } from '../../constants/topics';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  PieChart,
  LineChart,
  Line,
  Cell
} from "recharts";

import nextConfig from "../../../next.config.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportadas, setReportadas] = useState(null);
  const [aciertosDificultad, setAciertosDificultad] = useState(null);
  const [UsoporAsignatura, setUsoporAsignatura] = useState(null);
  const [frecuenciaAciertoTemaporAsignatura, setfrecuenciaAciertoTemaporAsignatura] = useState(null);
  const [frecuenciaAciertoSubtemaporTema, setfrecuenciaAciertoSubtemaporTema] = useState(null);
  const [Temporal, setTemporal] = useState(null);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff6b6b", "#4fc3f7", "#ffb74d", "#9575cd"];

  const ordenarPorcentajeAcierto = (objeto) => {
    const ordenado = {};
    Object.keys(objeto).forEach((asignatura) => {
      // Ordenar los temas de cada asignatura según el porcentaje de acierto
      const temasOrdenados = [...objeto[asignatura]].sort((a, b) => {
        return parseFloat(b.porcentaje) - parseFloat(a.porcentaje);
      });
      // Asignar los temas ordenados al objeto final
      ordenado[asignatura] = temasOrdenados;
    });
    return ordenado;
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,`/api/reportprueba?studentReport=true&&asignatura=${subject}`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = await responseReportadas.json();
        setReportadas(resultReportadas.preguntas);

        //Fetch frecuencia y acierto por dificultad
        const responseFacilFrecuencia = await fetch(urljoin(basePath, `/api/reportgg?dificultad=facil&&count=true&&asignatura=${subject}`));
        const nFacilFrencuencia = (await responseFacilFrecuencia.json()).count;
        const responseFacilAcierto = await fetch(urljoin(basePath,`/api/reportgg?dificultad=facil&&acierto=true&&count=true&&asignatura=${subject}`));
        const nFacilAcierto = (await responseFacilAcierto.json()).count;

        const responseIntermedioFrecuencia = await fetch(urljoin(basePath, `/api/reportgg?dificultad=intermedio&&count=true&&asignatura=${subject}`));
        const nIntermedioFrencuencia =(await responseIntermedioFrecuencia.json()).count;
        const responseIntermedioAcierto = await fetch(urljoin(basePath,`/api/reportgg?dificultad=intermedio&&acierto=true&&count=true&&asignatura=${subject}`));
        const nIntermedioAcierto = (await responseIntermedioAcierto.json()).count;

        const responseAvanzadoFrecuencia = await fetch(urljoin(basePath, `/api/reportgg?dificultad=avanzado&&count=true&&asignatura=${subject}`));
        const nAvanzadoFrencuencia =( await responseAvanzadoFrecuencia.json()).count;
        const responseAvanzadoAcierto = await fetch(urljoin(basePath,`/api/reportgg?dificultad=avanzado&&acierto=true&&count=true&&asignatura=${subject}`));
        const nAvanzadoAcierto = (await responseAvanzadoAcierto.json()).count;

        if (!responseFacilFrecuencia.ok || !responseFacilAcierto.ok || !responseIntermedioAcierto.ok|| !responseIntermedioFrecuencia.ok|| !responseAvanzadoAcierto.ok|| !responseAvanzadoFrecuencia.ok)
          throw new Error("Error cargando preguntas dificultad");

        let array = [
          { dificultad: "facil", nacierto: nFacilAcierto, npreguntas: nFacilFrencuencia, porcentaje: (nFacilAcierto*100/nFacilFrencuencia).toFixed(2)},
          { dificultad: "intermedio", nacierto: nIntermedioAcierto, npreguntas: nIntermedioFrencuencia, porcentaje: (nIntermedioAcierto*100/nIntermedioFrencuencia).toFixed(2)},
          { dificultad: "avanzado", nacierto: nAvanzadoAcierto, npreguntas: nAvanzadoFrencuencia, porcentaje: (nAvanzadoAcierto*100/nAvanzadoFrencuencia).toFixed(2) },
        ];

        setAciertosDificultad(array);


        //Fetch uso por asignatura 
        let arrayNporAsignatura = []
        let AsignaturasArray = Object.keys(subjectNames);
        await Promise.all(
          AsignaturasArray.map(async (sub) => {
            const responseUsoAsignatura = await fetch(urljoin(basePath, `/api/reportgg?asignatura=${sub}&&count=true`));
            const nUsoAsignatura = (await responseUsoAsignatura.json()).count;
            if (!responseUsoAsignatura.ok)
              throw new Error("Error cargando datos uso por asignatura");

            arrayNporAsignatura.push({asignatura: sub, npreg: nUsoAsignatura});
          })
        );
        setUsoporAsignatura(arrayNporAsignatura)


        //Fetch frecuencia y acierto por tema
        let arrayNAporTema = {};
        let subjectTemas = language[subject].map((lang) => lang.label);
        
            await Promise.all(
              subjectTemas.map(async (tema) => {
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reportgg?tema=${tema}&&count=true`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reportgg?tema=${tema}&&count=true&&acierto=true`));
                const nTemaAcierto = (await responseTemaAcierto.json()).count;
                
                if (!responseTemaFrecuencia.ok || !responseTemaAcierto.ok)
                throw new Error("Error cargando datos frecuencia y acierto por tema");

                let porcentaje = (nTemaAcierto * 100) / nTemaFrencuencia;
                if (nTemaFrencuencia === 0) {
                  porcentaje = 0;
                }

                if (!arrayNAporTema[subject]) {
                  arrayNAporTema[subject] = [];
                }

                arrayNAporTema[subject].push({tema: tema, npreg: nTemaFrencuencia, acierto: nTemaAcierto, porcentaje: porcentaje.toFixed(2)});
              })
            );
          

        setfrecuenciaAciertoTemaporAsignatura(ordenarPorcentajeAcierto(arrayNAporTema));


        ////Fetch frecuencia y acierto por subtema
        let arrayNAporSubtema = {};
        let subjectTemas2 = language[subject].map((lang) => lang.value);
      
        await Promise.all(
          subjectTemas2.map(async (tema) => {
            
            let SubtemasArray = topics[tema].map((t) => t);
            
            await Promise.all(
              SubtemasArray.map(async (subtema) => {
                console.log(tema)
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reportprueba?subtema=${subtema}&&count=true`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reportprueba?subtema=${subtema}&&count=true&&acierto=true`));
                const nTemaAcierto = (await responseTemaAcierto.json()).count;
                
                if (!responseTemaFrecuencia.ok || !responseTemaAcierto.ok)
                throw new Error("Error cargando datos frecuencia y acierto por tema");

                let porcentaje = (nTemaAcierto * 100) / nTemaFrencuencia;
                if (nTemaFrencuencia === 0) {
                  porcentaje = 0;
                }

                if (!arrayNAporSubtema[tema]) {
                  arrayNAporSubtema[tema] = [];
                }

                arrayNAporSubtema[tema].push({subtema: subtema, npreg: nTemaFrencuencia, acierto: nTemaAcierto, porcentaje: porcentaje.toFixed(2)});
              })
            );
           
          })
        );
        console.log(arrayNAporSubtema)
        setfrecuenciaAciertoSubtemaporTema(ordenarPorcentajeAcierto(arrayNAporSubtema));
       

        //Fetch uso por meses
        let arrayNporMes = {}
        await Promise.all(
        // Bucle for con switch case para los meses y días
        Array.from({ length: 13 }, async (_, i) => {
          let mes = "";
          let dias = 0;
          
          switch (i) {
              case 1: mes = "Enero"; dias = 31; break;
              case 2: mes = "Febrero"; dias = 28; break;
              case 3: mes = "Marzo"; dias = 31; break;
              case 4: mes = "Abril"; dias = 30; break;
              case 5: mes = "Mayo"; dias = 31; break;
              case 6: mes = "Junio"; dias = 30; break;
              case 7: mes = "Julio"; dias = 31; break;
              case 8: mes = "Agosto"; dias = 31; break;
              case 9: mes = "Septiembre"; dias = 30; break;
              case 10: mes = "Octubre"; dias = 31; break;
              case 11: mes = "Noviembre"; dias = 30; break;
              case 12: mes = "Diciembre"; dias = 31; break;
          }


          await Promise.all(
            Array.from({ length: dias }, async (_, j) => {

              const responsePregDia = await fetch(urljoin(basePath, `/api/reportgg?temporal=true&&count=true&&dia=${j + 1}&&mes=${i}&&asignatura=${subject}`));
            
              if (!responsePregDia.ok) {
                throw new Error("Error cargando datos uso por dias");
              }
            
              const nUsoporDia = (await responsePregDia.json()).count;
             
        
            
              if (!arrayNporMes[mes]) {
                arrayNporMes[mes] = [];
              }
            
              arrayNporMes[mes].push( nUsoporDia );
            })
            
          );

        }
      ))
        console.log(arrayNporMes)
        setTemporal(arrayNporMes);
        

        
        
        

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

  const formattedData = Object.keys(Temporal).map((month, index) => ({
    name: month,
    Preguntas_contestadas: Temporal[month].reduce((sum, val) => sum + val, 0),
  }));    

  return (
    
    <div className="p-3  mx-auto ">
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
                  : "0";
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
              <BarChart data={aciertosDificultad}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                <XAxis dataKey="dificultad" stroke="#FFFFFF" />
                <YAxis stroke="#FFFFFF" />
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

      {/*  Uso por asignatura */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          3. Uso aplicación por asignatura
        </h2>

        {UsoporAsignatura.map((asig, index) => (
          <p key={index} className="text-sm mb-2 p-1">
            - {asig.asignatura}: {asig.npreg} preguntas contestadas
          </p>
        ))}

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={UsoporAsignatura}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="npreg"
              label={({ asignatura, percent }) =>
                `${asignatura}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {UsoporAsignatura.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          4. Frecuencia y Acierto por cada Tema de {subject}
        </h2>

        {Object.keys(frecuenciaAciertoTemaporAsignatura).map((as) => (
          <section key={as} >
            
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
                {frecuenciaAciertoTemaporAsignatura[as].map((obj, index) => {
                  return (
                    <tr key={index} className="text-center border-t">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{obj.tema}</td>
                      <td className="border p-2">{obj.npreg}</td>
                      <td className="border p-2">{obj.acierto}</td>
                      <td className="border p-2">{obj.porcentaje}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Contenedor flex para las gráficas */}
            <div className="flex justify-between mb-4">
              {/* Gráfico de porcentaje de aciertos por tema */}
              <div className="w-1/2 p-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={frecuenciaAciertoTemaporAsignatura[as]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                    <XAxis type="number" stroke="#FFFFFF" domain={[0, 100]} />
                    <YAxis
                      dataKey="tema"
                      type="category"
                      stroke="#FFFFFF"
                      tick={{ fontSize: 9 }}
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
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    layout="vertical"
                    data={frecuenciaAciertoTemaporAsignatura[as]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                    <XAxis type="number" stroke="#FFFFFF" />
                    <YAxis
                      dataKey="tema"
                      type="category"
                      stroke="#FFFFFF"
                      tick={{ fontSize: 9 }}
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


      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          6. Frecuencia y Acierto de cada Subtema por Tema
        </h2>

        {Object.keys(frecuenciaAciertoSubtemaporTema).map((tema) => (
          <section key={tema} className="mb-6 p-4 border rounded-lg shadow" >
              <h2 className="text-xl font-semibold mb-4"> - Tema: {tema}</h2>
            
            <table className="w-full border-collapse border border-gray-300 mb-12">
              <thead>
                <tr className="bg-200">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Subtema</th>
                  <th className="border p-2">N° Preguntas</th>
                  <th className="border p-2">N° Aciertos</th>
                  <th className="border p-2">Porcentaje Acierto</th>
                </tr>
              </thead>
              <tbody>
                {frecuenciaAciertoSubtemaporTema[tema].map((obj, index) => {
                  return (
                    <tr key={index} className="text-center border-t">
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{obj.subtema}</td>
                      <td className="border p-2">{obj.npreg}</td>
                      <td className="border p-2">{obj.acierto}</td>
                      <td className="border p-2">{obj.porcentaje}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Contenedor flex para las gráficas */}
            <div className="flex justify-between mb-4">
              {/* Gráfico de porcentaje de aciertos por tema */}
              <div className="w-1/2 p-2">
                <ResponsiveContainer width="100%" minHeight={200}>
                  <BarChart
                    layout="vertical"
                    data={frecuenciaAciertoSubtemaporTema[tema]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                    <XAxis type="number" stroke="#FFFFFF" domain={[0, 100]} />
                    <YAxis
                      dataKey="subtema"
                      type="category"
                      stroke="#FFFFFF"
                      tick={{ fontSize: 8, textAnchor: "end" }}
                      width={200}
                    />
                    <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.2)" } } />
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

              {/* Gráfico de frecuencia preguntas por subtema */}
              <div className="w-1/2 p-2">
                <ResponsiveContainer width="100%" height={440}>
                  <BarChart
                    layout="vertical"
                    data={frecuenciaAciertoSubtemaporTema[tema]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF" />
                    <XAxis type="number" stroke="#FFFFFF" />
                    <YAxis
                      dataKey="subtema"
                      type="category"
                      stroke="#FFFFFF"
                      tick={{ fontSize: 8 }}
                      width={200}
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



      {/*  ¿Cuándo se ha utilizado más la aplicación? */}
      <section className="mb-6 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">
          5. ¿Cuándo se ha utilizado más la aplicación?
        </h2>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formattedData}>
            <XAxis dataKey="name" stroke="#FFFFFF"/>
            <YAxis stroke="#FFFFFF" />
            <Tooltip contentStyle={{ backgroundColor: "black", color: "white" }} itemStyle={{ color: "yellow", fontWeight: "bold" }}  />
            <Legend />
            <Line type="monotone" dataKey="Preguntas_contestadas" stroke="#FFFFFF" />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  
  );
};

export default SubjectPage;