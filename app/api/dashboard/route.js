import { OpenAIStream } from '../../utils/OpenAIStream';
import dbConnect from "../../utils/dbconnect.js";
import { NextResponse } from 'next/server';

import { language } from '../../constants/language';
import Question from '../../models/Question.js';

//to get student track record
await dbConnect();

// Verificar si existe la clave API OpenAi
if (!process.env.OPENAI_API_KEY) {
     throw new Error('Falta la OpenAI API Key');
}


// Manejar las solicitudes HTTP POST
export async function POST(request) {
    console.log("POST request to /api/dashboard");
    try {
        const { subject } = await request.json();
        //first get data from database MongoDB

        //get all languages for subject
        const languages = language[subject];
        //transform languages into array of string of languages
        const languagesArray = languages.map(lang => lang.value);
        //get all questions for the subject
        const numQuestionsTotal = await Question.countDocuments({ language: { $in: languagesArray }});
        console.log("numQuestionsTotal: ", numQuestionsTotal);

        const numQuestionsReported = await Question.countDocuments({ language: { $in: languagesArray }, studentReport: true});
        console.log("numQuestionsReported: ", numQuestionsReported);

        //count questions right, this is answer is the same as the student answer

        const numQuestionsRight = await Question.countDocuments({ language: { $in: languagesArray }, studentReport: false, $expr: { $eq: ["$answer", "$studentAnswer"] }});
        console.log("numQuestionsRight: ", numQuestionsRight);

        //count questions wrong, this is answer is different from the student answer
        const numQuestionsWrong = await Question.countDocuments({ language: { $in: languagesArray }, studentReport: false, $expr: { $ne: ["$answer", "$studentAnswer"] }});
        console.log("numQuestionsWrong: ", numQuestionsWrong);

        //XXX falta el prompt a la IA para pedirle gaps e insights
        let newPrompt = "";
        
        //send info to user as response in json
        return NextResponse.json({ numQuestionsTotal, numQuestionsReported, numQuestionsRight, numQuestionsWrong });
        
    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}
