import { promises as fs } from "fs";
import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";
import { getSpanishComments } from "../../constants/evaluationComments.js";

await dbConnect();


export async function GET(req) {
  try {
    let filtros = { studentReport: false };
    let sacarValor = {};
    
  

    let searchParams = req.nextUrl.searchParams;
    
 
    
    if (searchParams.get('studentReport')) {
      filtros.studentReport = searchParams.get('studentReport');
      sacarValor = { query: 1, choices: 1, explanation:1, answer:1, id:1, teacherComments:1, teacherReport:1};
    }

    if (searchParams.get('evaluadas')) {
        filtros.teacherReport = { $ne: null };
    }
    
    if (searchParams.get('motivo')) {
      let motivo = searchParams.get('motivo');
      const spanishComments = getSpanishComments();
      if(motivo == spanishComments[spanishComments.length - 1]){ // Last item is "Otro"
        filtros.teacherComments = {
          $exists: true,
          $ne: null,
          $elemMatch: {
            $nin: spanishComments.slice(0, -1) // Exclude "Otro" from the list
          }
        };
        
      }
      else{
      filtros.teacherComments = {$in: motivo};
      }
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
      filtros.topic = searchParams.get('tema');
    }

    if (searchParams.get('subtema')) {
      filtros.subTopic = searchParams.get('subtema').toLowerCase();
    }


    if (searchParams.get('temporal') === "true") {
      let mes = parseInt(searchParams.get('mes'), 10);
      let anio = parseInt(searchParams.get('anio'), 10);
      let dia = parseInt(searchParams.get('dia'), 10);
      console.log(dia)

      if(!isNaN(dia)){
          filtros.$expr = {
            $or: [
              {
                $and: [
                  { $eq: [{ $year: { $toDate: "$createdAt" } }, anio] },
                  { $eq: [{ $month: { $toDate: "$createdAt" } }, mes] },
                  { $eq: [{ $dayOfMonth: { $toDate: "$createdAt" } }, dia] }
                ]
              },
              {
                $and: [
                  { $eq: [{ $year: { $toDate: "$created_at" } }, anio] },
                  { $eq: [{ $month: { $toDate: "$created_at" } }, mes] },
                  { $eq: [{ $dayOfMonth: { $toDate: "$created_at" } }, dia] }
                ]
              }
            ]
          };
      }else{
         filtros.$expr = {
            $or: [
              {
                $and: [
                  { $eq: [{ $year: { $toDate: "$createdAt" } }, anio] },
                  { $eq: [{ $month: { $toDate: "$createdAt" } }, mes] },
                ]
              },
              {
                $and: [
                  { $eq: [{ $year: { $toDate: "$created_at" } }, anio] },
                  { $eq: [{ $month: { $toDate: "$created_at" } }, mes] },
                ]
              }
            ]
          };
      }
    };

    

      if (searchParams.get('fechaInicio') || searchParams.get('fechaFin')) {


        let fechaInicio = searchParams.get('fechaInicio');
        let fechaFin = searchParams.get('fechaFin');

        if (fechaInicio === "null" ) fechaInicio = null;
        if (fechaFin === "null") fechaFin = null;
        
          let dateFilter = {};
          if (fechaInicio) dateFilter.$gte = new Date(fechaInicio);
          if (fechaFin) {
            let fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            dateFilter.$lte = fin;
          }
          filtros.$or = [
            { createdAt: dateFilter },
            { created_at: dateFilter },
            // { updated_at: dateFilter },
            // { updatedAt: dateFilter }
          ];
      }

    

    if (searchParams.get('count') === "true") {
      const count = await Question.countDocuments(filtros);
      return Response.json({ count });
    }
   
    // Paginación
    let page = parseInt(searchParams.get('page'), 0);
    let pageSize = parseInt(searchParams.get('pageSize'), 10);
    let skip = 0;
    let limit = 0;
    let total = undefined;
    if (!isNaN(page) && !isNaN(pageSize) && page > 0 && pageSize > 0) {
      skip = (page - 1) * pageSize;
      limit = pageSize;
      total = await Question.countDocuments(filtros);
    }

    let query = Question.find(filtros, sacarValor);
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    const preguntas = await query;
    if (typeof total === 'number') {
      return Response.json({ preguntas, total });
    } else {
      return Response.json({ preguntas });
    }

  } catch (error) {
    return Response.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}
