import { promises as fs } from 'fs';
import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';



export async function GET(req) {
    try {
        await dbConnect();
        let data = await Question.find();
        return Response.json({data} );
      
  
        
    } catch (error) {
        return Response.json({ error: "Error al obtener datos" }, { status: 500 });
    }
}









