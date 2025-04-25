import { promises as fs } from "fs";
import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";

await dbConnect();

function getMonthAndDayFromSerial(serial) {
  const excelEpoch = new Date(1900, 0, 1); // Excel empieza a contar desde el 1 de enero de 1900
  const days = serial - 2; // Ajustar desfase de Excel
  const fecha = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  return {
      month: fecha.getMonth() + 1, // Mes (1-12)
      day: fecha.getDate() // Día del mes (1-31)
  };
}

export async function GET(req) {
  try {
    let filtros = { studentReport: false };
    let sacarValor = {};
    
  

    let searchParams = req.nextUrl.searchParams;
    
 
    
    if (searchParams.get('studentReport')) {
      filtros.studentReport = searchParams.get('studentReport');
      sacarValor = { query: 1, choices: 1, explanation:1, answer:1, id:1};
    }

    if (searchParams.get('evaluadas')) {
        filtros.teacherReport = { $ne: null };
    }

    if (searchParams.get('NOevaluadas')) {
      filtros.teacherReport = {$in: [null, undefined]};
    }

    if (searchParams.get('asignatura')) {
      filtros.subject = searchParams.get('asignatura')
    }
    
    if (searchParams.get('dificultad')) {
      filtros.difficulty = searchParams.get('dificultad');
    }

    if(searchParams.get('acierto')==="true"){
      filtros.$expr =  { $eq: ["$studentAnswer", "$answer"] };
    }
    
    if (searchParams.get('tema')) {
      filtros.language = searchParams.get('tema');
    }

    if (searchParams.get('subtema')) {
      filtros.topic = searchParams.get('subtema').toLowerCase();
    }


    if (searchParams.get('temporal') === "true") {
      let mes = parseInt(searchParams.get('mes'), 10);
      let dia = parseInt(searchParams.get('dia'), 10);
      let anio = parseInt(searchParams.get('anio'), 10);
      
      filtros.$expr = {
        $or: [
          {
            $and: [
              { $gt: ["$created_at", 50000] }, // Timestamp normal
              { $eq: [{ $year: { $toDate: "$created_at" } }, anio] },
              { $eq: [{ $month: { $toDate: "$created_at" } }, mes] },
            ]
          },
          {
            $and: [
              { $lte: ["$created_at", 50000] }, // Serial de Excel
              { $eq: [{ $literal: getMonthAndDayFromSerial("$created_at").year }, anio] },
              { $eq: [{ $literal: getMonthAndDayFromSerial("$created_at").month }, mes] },
              { $eq: [{ $literal: getMonthAndDayFromSerial("$created_at").day }, dia] }
            ]
          }
        ]
      };
    };
    

    if (searchParams.get('count') === "true") {
      const count = await Question.countDocuments(filtros);
      return Response.json({ count });
    }
   

    const preguntas = await Question.find(filtros, sacarValor);
    return Response.json({ preguntas });

  } catch (error) {
    return Response.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}
