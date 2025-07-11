"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import urljoin from "url-join";


import { subjects } from '../../constants/subjects';

import Footer from "../../components/ui/Footer";
import Header from "../../components/ui/Header";
import { useTranslation } from "react-i18next";
import { HiArrowLeft } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';


import PanelGraficas from "../../components/PanelGraficas";

import nextConfig from "../../../next.config.js";
const basePath = nextConfig.basePath || "";



const SubjectPage = ({ params: { subject } }) => {
  const { t, i18n } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [comparadorActivo, setComparadorActivo] = useState(false);
 

  const [fechaInicio1, setFechaInicio1] = useState(null);
  const [fechaFin1, setFechaFin1] = useState((new Date()).toISOString().split('T')[0]);

  const [fechaInicio2, setFechaInicio2] = useState(null);
  const [fechaFin2, setFechaFin2] = useState((new Date()).toISOString().split('T')[0]);

  const [reportadas, setReportadas] = useState([]);
  const [motivosReportadas, setMotivosReportadas] = useState([]);
  const [reportadasCorregidas, setReportadasCorregidas] = useState([]);
  const [aciertosDificultad, setAciertosDificultad] = useState([]);
  const [frecuenciaAciertoTemaporAsignatura, setfrecuenciaAciertoTemaporAsignatura] = useState([]);
  const [frecuenciaAciertoSubtemaporTema, setfrecuenciaAciertoSubtemaporTema] = useState([]);
  const [Temporal, setTemporal] = useState([]);

  const [reportadasComparador, setReportadasComparador] = useState([]);
  const [motivosReportadasComparador, setMotivosReportadasComparador] = useState([]);
  const [reportadasCorregidasComparador, setReportadasCorregidasComparador] = useState([]);
  const [aciertosDificultadComparador, setAciertosDificultadComparador] = useState([]);
  const [frecuenciaAciertoTemaporAsignaturaComparador, setFrecuenciaAciertoTemaporAsignaturaComparador] = useState([]);
  const [frecuenciaAciertoSubtemaporTemaComparador, setFrecuenciaAciertoSubtemaporTemaComparador] = useState([]);
  const [TemporalComparador, setTemporalComparador] = useState([]);



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
  const handleBack = () => {
    router.push(`/reports`);
  }





  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
      

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = (await responseReportadas.json()).count;
        setReportadas(resultReportadas);

  

        // Fetch preguntas reportadas EVALUADAS
        const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
        if (!responseReportadasEVAL.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadasEVAL = (await responseReportadasEVAL.json()).count;
        setReportadasCorregidas(resultReportadasEVAL);

        //Fetch motivos reportes
        let arrayMotivos = [];
        let comentarios = ["Redacción confusa", "Opciones mal formuladas", "Opciones repetidas", "Varias opciones correctas", "Ninguna opción correcta", "Respuesta marcada incorrecta", "Explicación errónea", "Fuera de temario", "Otro"]
        
            await Promise.all(
              comentarios.map(async (motivo) => {
                const responseMotivo = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&motivo=${motivo}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                const nMotivo = (await responseMotivo.json()).count;

                const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
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
                const responseDificultadFrecuencia = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                const nDificultadFrencuencia = (await responseDificultadFrecuencia.json()).count;

                const responseDificultadAcierto = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&count=true&&asignatura=${subject}&&acierto=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
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
        let subjectTemas = [];
        if (subjects[subject] && subjects[subject].topics) {
          subjectTemas = subjects[subject].topics.map(topic => topic.label);
        }
        
            await Promise.all(
              subjectTemas.map(async (tema) => {
                
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&acierto=true&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
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
        let arrayNAporSubtema={};
            if (subjects[subject] && subjects[subject].topics) {
              await Promise.all(
                subjects[subject].topics.map(async (topic) => {
                  const tema = topic.label;
                  if (!arrayNAporSubtema[tema]) {
                    arrayNAporSubtema[tema] = [];
                  }
                  if (topic.subtopics) {
                    await Promise.all(
                      topic.subtopics.map(async (sub) => {
                        const subtema = sub.title;
                        const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                        const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                        const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&acierto=true&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                        const nTemaAcierto = (await responseTemaAcierto.json()).count;

                        if (!responseTemaFrecuencia.ok || !responseTemaAcierto.ok)
                          throw new Error("Error cargando datos frecuencia y acierto por subtema");

                        let porcentaje = (nTemaAcierto * 100) / nTemaFrencuencia;
                        if (nTemaFrencuencia === 0) {
                          porcentaje = 0;
                        }


                        arrayNAporSubtema[tema].push({
                          subtema: subtema,
                          npreg: nTemaFrencuencia,
                          acierto: nTemaAcierto,
                          porcentaje: porcentaje.toFixed(2)
                        });
                      })
                    );
                  }
                })
              );
            }
            
            setfrecuenciaAciertoSubtemaporTema(ordenarPorcentajeAcierto(arrayNAporSubtema));
       



        // //Fetch uso por meses
        
        let arrayNporMes = [];
        
        if (fechaInicio1!=null) {
          
            const start = new Date(fechaInicio1);
            const end = new Date(fechaFin1);
          
            const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

            if (diffMonths <= 3) { // Si el rango es de 3 meses o menos, mostrar y consultar por días
              let current = new Date(start);
              while (current <= end) {
                const dia = current.getDate();
                const mes = current.getMonth() + 1;
                const anio = current.getFullYear();
                const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(current);
                const etiquetaFecha = `${dia} ${nombreMes} ${anio}`;

                try {
                  const response = await fetch(urljoin(basePath, `/api/reports?temporal=true&&count=true&&dia=${dia}&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
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
                    `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`
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
                      `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`
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
    
   
  }, [fechaInicio1, fechaFin1]);

   useEffect(() => {
    if (!comparadorActivo) return;
    const fetchComparador = async () => {
      
       try {
        setLoading(true);
      

        // Fetch preguntas reportadas
        const responseReportadas = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
        if (!responseReportadas.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadas = (await responseReportadas.json()).count;
        setReportadasComparador(resultReportadas);

  

        // Fetch preguntas reportadas EVALUADAS
        const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
        if (!responseReportadasEVAL.ok)
          throw new Error("Error cargando preguntas reportadas");
        const resultReportadasEVAL = (await responseReportadasEVAL.json()).count;
        setReportadasCorregidasComparador(resultReportadasEVAL);

        //Fetch motivos reportes
        let arrayMotivos = [];
        let comentarios = ["Redacción confusa", "Opciones mal formuladas", "Opciones repetidas", "Varias opciones correctas", "Ninguna opción correcta", "Respuesta marcada incorrecta", "Explicación errónea", "Fuera de temario", "Otro"]
        
            await Promise.all(
              comentarios.map(async (motivo) => {
                const responseMotivo = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&motivo=${motivo}&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
                const nMotivo = (await responseMotivo.json()).count;

                const responseReportadasEVAL = await fetch(urljoin(basePath,`/api/reports?studentReport=true&&asignatura=${subject}&&count=true&&evaluadas=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
                const resultReportadasEVAL = (await responseReportadasEVAL.json()).count;

                if (!responseMotivo.ok || !responseReportadasEVAL.ok)
                throw new Error("Error cargando datos de motivos de preguntas reportadas");
                
                arrayMotivos.push({motivo: motivo, n: nMotivo, porcentaje: (nMotivo/resultReportadasEVAL*100).toFixed(2)});
              })
            );
            setMotivosReportadasComparador(arrayMotivos);
            console.log(arrayMotivos)


      


        //Fetch frecuencia y acierto por DIFICULTAD 2.0
        let arrayNAporDificultad = [];
        let dificultades = ["facil", "intermedio", "avanzado"];
        
            await Promise.all(
              dificultades.map(async (dificultad) => {
                const responseDificultadFrecuencia = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
                const nDificultadFrencuencia = (await responseDificultadFrecuencia.json()).count;

                const responseDificultadAcierto = await fetch(urljoin(basePath, `/api/reports?dificultad=${dificultad}&&count=true&&asignatura=${subject}&&acierto=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
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
            setAciertosDificultadComparador(arrayNAporDificultad);
            console.log(arrayNAporDificultad)



        //Fetch frecuencia y acierto por tema
        let arrayNAporTema = {};
        let subjectTemas = [];
        if (subjects[subject] && subjects[subject].topics) {
          subjectTemas = subjects[subject].topics.map(topic => topic.label);
        }
        
            await Promise.all(
              subjectTemas.map(async (tema) => {
                
                const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
                const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?tema=${tema}&&asignatura=${subject}&&count=true&&acierto=true&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
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
          
        setFrecuenciaAciertoTemaporAsignaturaComparador(ordenarPorcentajeAcierto(arrayNAporTema));


        ////Fetch frecuencia y acierto por subtema
        let arrayNAporSubtema={};
        if (subjects[subject] && subjects[subject].topics) {
          await Promise.all(
            subjects[subject].topics.map(async (topic) => {
              const tema = topic.label;
              if (!arrayNAporSubtema[tema]) {
                arrayNAporSubtema[tema] = [];
              }
              if (topic.subtopics) {
                await Promise.all(
                  topic.subtopics.map(async (sub) => {
                    const subtema = sub.title;
                    const responseTemaFrecuencia = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                    const nTemaFrencuencia = (await responseTemaFrecuencia.json()).count;

                    const responseTemaAcierto = await fetch(urljoin(basePath, `/api/reports?subtema=${subtema.toLowerCase()}&&count=true&&acierto=true&&asignatura=${subject}&&fechaInicio=${fechaInicio1}&&fechaFin=${fechaFin1}`));
                    const nTemaAcierto = (await responseTemaAcierto.json()).count;

                    if (!responseTemaFrecuencia.ok || !responseTemaAcierto.ok)
                      throw new Error("Error cargando datos frecuencia y acierto por subtema");

                    let porcentaje = (nTemaAcierto * 100) / nTemaFrencuencia;
                    if (nTemaFrencuencia === 0) {
                      porcentaje = 0;
                    }

                    arrayNAporSubtema[tema].push({
                      subtema: subtema,
                      npreg: nTemaFrencuencia,
                      acierto: nTemaAcierto,
                      porcentaje: porcentaje.toFixed(2)
                    });
                  })
                );
              }
            })
          );
        }
        setFrecuenciaAciertoSubtemaporTemaComparador(ordenarPorcentajeAcierto(arrayNAporSubtema));

        // //Fetch uso por meses
        
        let arrayNporMes = [];
        
        if (fechaInicio2!=null) {
          
            const start = new Date(fechaInicio2);
            const end = new Date(fechaFin2);
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
                  const response = await fetch(urljoin(basePath, `/api/reports?temporal=true&&count=true&&dia=${dia}&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`));
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
                    `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`
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
                      `${basePath}/api/reports?temporal=true&&count=true&&mes=${mes}&&anio=${anio}&&asignatura=${subject}&&fechaInicio=${fechaInicio2}&&fechaFin=${fechaFin2}`
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
          setTemporalComparador(arrayNporMes);

        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

 
    fetchComparador();
  }, [comparadorActivo, fechaInicio2, fechaFin2]);


  if (loading) return <p className="text-center text-lg">Cargando datos...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <main className="container-layout-reports">
      <Header />
      <div className="container-content" >

          <button className='btn-sm-icon btn-ghost flex mb-4' onClick={handleBack}>
          <HiArrowLeft sx={{fontSize: 18}} className='mt-1'/>
          {t('quizpage.back')}
          </button>

          <h1 className="flex-1 text-3xl font-bold text-center">{subject}</h1>


        <div className="flex items-center justify-between mb-8"> 

        

          <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setComparadorActivo(!comparadorActivo)}
          >
          {comparadorActivo ? t("reports.scomparator") : t("reports.comparator")}
          </button>

          <Link
          className="px-4 py-2 bg-teal-400 text-white rounded"
          href={{ pathname: '/reports/' + subject + '/pregreport' }}
          id={subject}
          >{t("reports.subtitle1")}</Link>
           
          </div>
        

        {!comparadorActivo ? (
          <PanelGraficas
            subject={subject}
            fechaInicio={fechaInicio1}
            setFechaInicio={setFechaInicio1}
            fechaFin={fechaFin1}
            setFechaFin={setFechaFin1}
            reportadas={reportadas}
            motivosReportadas={motivosReportadas}
            reportadasCorregidas={reportadasCorregidas}
            aciertosDificultad={aciertosDificultad}
            frecuenciaAciertoTemaporAsignatura={frecuenciaAciertoTemaporAsignatura}
            frecuenciaAciertoSubtemaporTema={frecuenciaAciertoSubtemaporTema}
            Temporal={Temporal}
            t={t}
            handlePlayAgain={handleBack}
          />
        ) : (
          <div className="flex gap-8">
            <div className="w-1/2">
              <PanelGraficas
                subject={subject}
                fechaInicio={fechaInicio1}
                setFechaInicio={setFechaInicio1}
                fechaFin={fechaFin1}
                setFechaFin={setFechaFin1}
                reportadas={reportadas}
                motivosReportadas={motivosReportadas}
                reportadasCorregidas={reportadasCorregidas}
                aciertosDificultad={aciertosDificultad}
                frecuenciaAciertoTemaporAsignatura={frecuenciaAciertoTemaporAsignatura}
                frecuenciaAciertoSubtemaporTema={frecuenciaAciertoSubtemaporTema}
                Temporal={Temporal}
                t={t}
                handlePlayAgain={handleBack}
              />
            </div>
            <div className="w-1/2 border-l ">
              <PanelGraficas
                subject={subject}
                fechaInicio={fechaInicio2}
                setFechaInicio={setFechaInicio2}
                fechaFin={fechaFin2}
                setFechaFin={setFechaFin2}
                reportadas={reportadasComparador}
                motivosReportadas={motivosReportadasComparador}
                reportadasCorregidas={reportadasCorregidasComparador}
                aciertosDificultad={aciertosDificultadComparador}
                frecuenciaAciertoTemaporAsignatura={frecuenciaAciertoTemaporAsignaturaComparador}
                frecuenciaAciertoSubtemaporTema={frecuenciaAciertoSubtemaporTemaComparador}
                Temporal={TemporalComparador}
                t={t}
                handlePlayAgain={handleBack}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default SubjectPage;