import { promises as fs } from 'fs';
import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';

await dbConnect();

export async function POST(req) {
    try {
        const { studentReport } = await req.json();
        let questionsReported = await Question.find({ studentReport},{query: 1, choices:1});
        return Response.json({questionsReported});
                
      
  
        
    } catch (error) {
        return Response.json({ error: "Error al obtener datos" }, { status: 500 });
    }
}









