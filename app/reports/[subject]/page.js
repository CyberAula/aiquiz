"use client";

import { useState, useEffect } from "react";
import urljoin from "url-join";

import { language } from '../../constants/language';
import { topics } from '../../constants/topics';

import Footer from "../../components/ui/Footer";
import Header from "../../components/ui/Header";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2'
import { useRouter } from 'next/navigation'

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
  Line,
} from "recharts";

import nextConfig from "../../../next.config.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reportadas, setReportadas] = useState(null);
  const [aciertosDificultad, setAciertosDificultad] = useState(null);
  const [frecuenciaAciertoTemaporAsignatura, setfrecuenciaAciertoTemaporAsignatura] = useState(null);
  const [frecuenciaAciertoSubtemaporTema, setfrecuenciaAciertoSubtemaporTema] = useState(null);
  const [Temporal, setTemporal] = useState(null);



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

  const router = useRouter()
  const handlePlayAgain = () => {
    router.push(`/reports`);
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = await responseReportadas.json();
        setReportadas(resultReportadas.preguntas);

      


        //Fetch frecuencia y acierto por DIFICULTAD 2.0
        let arrayNAporDificultad = [];
        let dificultades = ["facil", "intermedio", "avanzado"];
        
            await Promise.all(
              dificultades.map(async (dificultad) => {
                const responseDificultadFrecuencia = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&asignatura=${subject}&&count=true`));
                const nDificultadFrencuencia = (await responseDificultadFrecuencia.json()).count;

                const responseDificultadAcierto = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&count=true&&asignatura=${subject}&&acierto=true`));
                const nDificultadAcierto = (await responseDificultadAcierto.json()).count;
                
                if (!responseDificultadFrecuencia.ok || !responseDificultadAcierto.ok)
                throw new Error("Error cargando datos frecuencia y acierto por dificultad");

                let porcentaje = (nDificultadAcierto * 100) / nDificultadFrencuencia;
                if (nDificultadFrencuencia === 0) {
                  porcentaje = 0;
                } 
                
                arrayNAporDificultad.push({dif: dificultad, npreg: nDificultadFrencuencia, acierto: nDificultadAcierto, porcentaje: porcentaje.toFixed(2)});
              })
            );
            setAciertosDificultad(arrayNAporDificultad);
            console.log(arrayNAporDificultad)



        //Fetch frecuencia y acierto por tema
        let arrayNAporTema = {};
        let subjectTemas = language[subject].map((lang) => lang.label);
        
            await Promise.all(
              subjectTemas.map(async (tema) => {
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&acierto=true`));
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
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema}&&count=true&&tema=${tema}&&asignatura=${subject}`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema}&&count=true&&acierto=true&&tema=${tema}&&asignatura=${subject}`));
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
       

        // //Fetch uso por meses
        //   let arrayNporMes = [];
        //   const fechaActual = new Date();
        //   const mesActual = fechaActual.getMonth() + 1;
        //   const anioActual = fechaActual.getFullYear();
        //   const anioInicio = anioActual - 1; 
        
        //   for (let anio = anioInicio; anio <= anioActual; anio++) {
        //     for (let mes = anio === anioInicio ? mesActual : 1; mes <= 12; mes++) {
        //       if (anio === anioActual && mes > mesActual) break;
        
        //       const dias = new Date(anio, mes, 0).getDate();
        //       const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(new Date(anio, mes - 1, 1));
        
        //       // Recorremos solo los días 1, 6, 11, 16, 21, 25 de cada mes
        //       const diasSeleccionados = [1, 5, 9, 13, 17, 21, 25, 28]; 
              
        //       for (let dia of diasSeleccionados) {
        //         if (dia > dias) continue; // Si el día es mayor al número de días del mes, lo saltamos
        
        //         const responsePregDia = await fetch(`${basePath}/api/reports?temporal=true&&count=true&&dia=${dia}&&mes=${mes}&&anio=${anio}&&asignatura=${subject}`);
        
        //         if (!responsePregDia.ok) {
        //           throw new Error("Error cargando datos de uso por días");
        //         }
        
        //         const nUsoPorDia = (await responsePregDia.json()).count;
        //         const etiquetaFecha = `${dia} ${nombreMes} ${anio}`;
        
        //         arrayNporMes.push({ fecha: etiquetaFecha, count: nUsoPorDia });
        //       }
            
        //   }
        //   }
        //   console.log(arrayNporMes)
        //   setTemporal(arrayNporMes)
        
        let arrayNporMes = [];
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const anioActual = fechaActual.getFullYear();
        const anioInicio = anioActual - 1;

        for (let anio = anioInicio; anio <= anioActual; anio++) {
          for (
            let mes = anio === anioInicio ? mesActual : 1;
            mes <= 12;
            mes++
          ) {
            if (anio === anioActual && mes > mesActual) break;

            const nombreMes = new Intl.DateTimeFormat("es-ES", {
              month: "long",
            }).format(new Date(anio, mes - 1, 1));

            try {
              const response = await fetch(
                `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}`
              );

              if (!response.ok)
                throw new Error("Error cargando datos de uso por mes");

              const nUsoPorMes = (await response.json()).count;
              const etiquetaFecha = `${nombreMes} ${anio}`;

              arrayNporMes.push({ fecha: etiquetaFecha, count: nUsoPorMes });
            } catch (error) {
              console.error(
                `Error obteniendo datos para ${nombreMes} ${anio}:`,
                error
              );
            }
          }
        }

        console.log(arrayNporMes);
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

 
      

  return (
    <main className="container-layout">
      <Header />
      <div className=" container-content">
        <h1 className="text-3xl font-bold mb-4 text-center ">{subject}</h1>

        <button className='btn-sm-icon btn-ghost flex mb-4' onClick={handlePlayAgain}>
          <HiArrowLeft sx={{fontSize: 18}} className='mt-1'/>
           {t('quizpage.back')}
        </button>

        {/* 1. Preguntas reportadas */}
        <section className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-left text-2xl mb-4 font-semibold">
            1. {t("reports.subtitle1")}
          </h2>
          <p className="text-sm mb-2">
           {t("reports.pregreport")}: {reportadas.length}
          </p>
          <p className="text-sm mb-2">{t("reports.subtitle1")}:</p>
          <div className="max-h-40 overflow-y-auto border p-2 rounded bg-100">
            {reportadas.map((pregunta, index) => (
              <p key={index} className="text-sm p-1 border-b last:border-b-0">
                {index + 1}. {pregunta.query}: {pregunta.choices}
              </p>
            ))}
          </div>
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
            {aciertosDificultad.map((obj, index) => {
             
              return (
                <tr key={index} className="text-center border-t">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{obj.dif}</td>
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
          {/* Gráfico de porcentaje de aciertos por dificultad */}
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

          {/* Gráfico de frecuencia preguntas por dificultad */}
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






      
      {/* 3. Frecuencia y Acierto por cada Tema  */}
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

              {/* Gráfico de frecuencia preguntas por tema */}
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

              {/* Gráfico de frecuencia preguntas por subtema */}
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
             <Line type="monotone" dataKey="count" stroke="#007bff" strokeWidth={2} dot={false} name={t("reports.pormeses")}/>
             </LineChart>
            </ResponsiveContainer>
      </section>
    


        
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;