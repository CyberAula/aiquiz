import { promises as fs } from "fs";
import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";

await dbConnect();


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
    
    if (searchParams.get('motivo')) {
      let motivo = searchParams.get('motivo');
      if(motivo == "Otro"){
        filtros.teacherComments = {
          $exists: true,
          $ne: null,
          $elemMatch: {
            $nin: [
              'Redacción confusa',
              'Opcionesrepetidas',
              'Opciones mal formuladas',
              'Varias opciones correctas',
              'Ninguna opción correcta',
              'Respuesta marcada incorrecta',
              'Fuera de temario',
              'Explicación errónea'
            ]
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
      filtros.language = searchParams.get('tema');
    }

    if (searchParams.get('subtema')) {
      filtros.topic = searchParams.get('subtema').toLowerCase();
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
            // Para incluir todo el día de fechaFin, ajusta a las 23:59:59
            let fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            dateFilter.$lte = fin;
          }
          filtros.$or = [
            { createdAt: dateFilter },
            { created_at: dateFilter },
            { updated_at: dateFilter },
            { updatedAt: dateFilter }
          ];
      }

    

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
