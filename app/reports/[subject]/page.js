"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import urljoin from "url-join";

import { language } from '../../constants/language';
import { topics } from '../../constants/topics';

import Footer from "../../components/ui/Footer";
import Header from "../../components/ui/Header";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';


import PanelGraficas from "../../components/PanelGraficas";

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

import nextConfig from "../../../next.config.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState((new Date()).toISOString().split('T')[0]);

  const [reportadas, setReportadas] = useState([]);
  const [motivosReportadas, setMotivosReportadas] = useState([]);
  const [reportadasCorregidas, setReportadasCorregidas] = useState([]);
  const [aciertosDificultad, setAciertosDificultad] = useState([]);
  const [frecuenciaAciertoTemaporAsignatura, setfrecuenciaAciertoTemaporAsignatura] = useState([]);
  const [frecuenciaAciertoSubtemaporTema, setfrecuenciaAciertoSubtemaporTema] = useState([]);
  const [Temporal, setTemporal] = useState([]);



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
        const responseReportadas = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = (await responseReportadas.json()).count;
        setReportadas(resultReportadas);

  

        // Fetch preguntas reportadas EVALUADAS
        const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
        if (!responseReportadasEVAL.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadasEVAL = (await responseReportadasEVAL.json()).count;
        setReportadasCorregidas(resultReportadasEVAL);

        //Fetch motivos reportes
        let arrayMotivos = [];
        let comentarios = ["Redacción confusa", "Opciones mal formuladas", "Opciones repetidas", "Varias opciones correctas", "Ninguna opción correcta", "Respuesta marcada incorrecta", "Explicación errónea", "Fuera de temario", "Otro"]
        
            await Promise.all(
              comentarios.map(async (motivo) => {
                const responseMotivo = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&motivo=${motivo}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                const nMotivo = (await responseMotivo.json()).count;

                const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                const resultReportadasEVAL = (await responseReportadasEVAL.json()).count;

                if (!responseMotivo.ok || !responseReportadasEVAL.ok)
                throw new Error("Error cargando datos de motivos de preguntas reportadas");
                
                arrayMotivos.push({motivo: motivo, n: nMotivo, porcentaje: (nMotivo/resultReportadasEVAL*100).toFixed(2)});
              })
            );
            setMotivosReportadas(arrayMotivos);
            console.log(arrayMotivos)


      


        //Fetch frecuencia y acierto por DIFICULTAD 2.0
        let arrayNAporDificultad = [];
        let dificultades = ["facil", "intermedio", "avanzado"];
        
            await Promise.all(
              dificultades.map(async (dificultad) => {
                const responseDificultadFrecuencia = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                const nDificultadFrencuencia = (await responseDificultadFrecuencia.json()).count;

                const responseDificultadAcierto = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&count=true&&asignatura=${subject}&&acierto=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
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
                
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&acierto=true&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
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
                
                
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&asignatura=${subject}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&acierto=true&&asignatura=${subject}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
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
        
        let arrayNporMes = [];
        
        if (fechaInicio!=null) {
          
            const start = new Date(fechaInicio);
            const end = new Date(fechaFin);
            // Calcular la diferencia en meses
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

            if (diffMonths <= 3) {
              // Si el rango es de 3 meses o menos, mostrar y consultar por días
              let current = new Date(start);
              while (current <= end) {
                const dia = current.getDate();
                const mes = current.getMonth() + 1;
                const anio = current.getFullYear();
                const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(current);
                const etiquetaFecha = `${dia} ${nombreMes} ${anio}`;

                try {
                  // Consulta por día
                  const response = await fetch(urljoin(basePath, `/api/reports?temporal=true&&count=true&&dia=${dia}&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`));
                    if (!response.ok)
                    throw new Error("Error cargando datos de uso por día");

                  const nUsoPorDia = (await response.json()).count;
                  arrayNporMes.push({ fecha: etiquetaFecha, count: nUsoPorDia });
                } catch (error) {
                  console.error(
                    `Error obteniendo datos para ${etiquetaFecha}:`,
                    error
                  );
                }
                // Avanzar al siguiente día
                current.setDate(current.getDate() + 1);
              }
            } else {
              // Si el rango es mayor de 3 meses, mostrar y consultar por meses
              start.setDate(1);
              end.setDate(1);
              let current = new Date(start);
              while (current <= end) {
                const mes = current.getMonth() + 1;
                const anio = current.getFullYear();
                const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(current);
                const etiquetaFecha = `${nombreMes} ${anio}`;

                try {
                  // Consulta por mes
                  const response = await fetch(
                    `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`
                  );
                  if (!response.ok)
                    throw new Error("Error cargando datos de uso por mes");

                  const nUsoPorMes = (await response.json()).count;
                  arrayNporMes.push({ fecha: etiquetaFecha, count: nUsoPorMes });
                } catch (error) {
                  console.error(
                    `Error obteniendo datos para ${etiquetaFecha}:`,
                    error
                  );
                }
                current.setMonth(current.getMonth() + 1);
              }
            }

        }else{
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
                    console.log("aqui"+ subject)
                    const response = await fetch(
                      `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio}&&fechaFin=${fechaFin}`
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

          }
          setTemporal(arrayNporMes);

        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

 
    
    fetchReports();
    
   
  }, [fechaInicio, fechaFin]);


  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

 
      

  return (
    <main className="container-layout">
      <Header />
      <div className=" container-content">

          {/* Selector de rango de fechas */}
        <div className="flex gap-4 mb-6 justify-center">
          <div>
            <label className="block mb-1 font-semibold">Fecha inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Fecha fin:</label>
            <input
              type="date"
              value={fechaFin}
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
          <Link  className="text-sm p-3 bg-yellow-200    rounded transition-all duration-300 hover:bg-yellow-300 hover:shadow-lg hover:-translate-y-1" href={{ pathname: '/reports/'+ subject + '/pregreport' }} id={subject}> {t("reports.subtitle1")}</Link>
          </div>



                <h2 className="text-sl font-semibold mt-4 mb-4 text-center">
                {t("reports.graph0_title")}
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    layout="vertical"
                    data={motivosReportadas}
                  >
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
             <Line type="monotone" dataKey="count" stroke="#B57EDC" strokeWidth={2} dot={false} name={t("reports.pormeses")}/>
             </LineChart>
            </ResponsiveContainer>
      </section>
    


        
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;