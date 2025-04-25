import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';
import { NextResponse } from 'next/server';

await dbConnect();

//POST /API/ANSWER
//api path to create a new answer or report "/api/answer" passing neccesary data (see POST in page.js)
export async function POST(request) { 
    try {
        const { id, teacherComments, teacherReport} = await request.json();
        console.log(id, teacherComments, teacherReport)
        //console.log("received params: ",id, subject, language, difficulty, topic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, prompt);
        
        let questions = await Question.find({id: id});
        if (questions.length > 0) {
            console.log("Question already exists, we update it (maybe it was answered or reported)");
           
            // Accedemos al primer resultado
            let question = questions[0];
            console.log("question before update: ",question);
            // Añadimos los nuevos campos
            question.teacherReport = teacherReport;
            question.teacherComments = teacherComments;
            console.log("prueba ",question);
            // Guardamos el documento actualizado
            await question.save();

            const questionUpdat = await Question.find({id: id});
            const questionUpdate = questionUpdat[0];

            console.log("question updated: ",questionUpdate);
          }
        
        return NextResponse.json({"msg":"question evaluated"});

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}