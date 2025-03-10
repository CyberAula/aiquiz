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
      sacarValor = { query: 1, choices: 1 };
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
