import { OpenAIResponse } from '../../utils/OpenAIApi.js';
import dbConnect from "../../utils/dbconnect.js";
import { NextResponse } from 'next/server';

import { language } from '../../constants/language';
import { subjectNames } from '../../constants/language';
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
        //get subject name
        const subjectName = subjectNames[subject];

        //first get data from database MongoDB

        //get all languages for subject
        const languages = language[subject];
        //transform languages into array of string of languages
        const languagesArray = languages.map(lang => lang.value);
        //get all questions for the subject
        const numQuestionsTotal = await Question.countDocuments({ language: { $in: languagesArray } });
        console.log("numQuestionsTotal: ", numQuestionsTotal);

        let questionsReported = await Question.find({ language: { $in: languagesArray }, studentReport: true });

        console.log("numQuestionsReported: ", questionsReported.length);

        //count questions right, this is answer is the same as the student answer
        let questionsRight = await Question.find({ language: { $in: languagesArray }, studentReport: false, $expr: { $eq: ["$answer", "$studentAnswer"] } });
        console.log("numQuestionsRight: ", questionsRight.length);

        //count questions wrong, this is answer is different from the student answer
        let questionsWrong = await Question.find({ language: { $in: languagesArray }, studentReport: false, $expr: { $ne: ["$answer", "$studentAnswer"] } });

        console.log("numQuestionsWrong: ", questionsWrong.length);


        //now ask AI to generate insights:
        let newPrompt = `De un banco de preguntas para la asignatura "${subjectName}" de un grado de ingeniería de la Universidad Politécnica de Madrid, se han respondido ${numQuestionsTotal} preguntas. `;
        //transform languages into array of string of languages
        const languagesNamesArray = languages.map(lang => lang.label);
        newPrompt += `Las preguntas son sobre ${languagesNamesArray.join(", ")}. `;

        newPrompt += `Se han respondido ${questionsRight.length} preguntas correctamente, que son las siguientes: `;
        for (let i = 0; i < questionsRight.length; i++) {
            newPrompt += ` Pregunta ${i + 1}: "${questionsRight[i].query}". `;
        }
        newPrompt += `Se han respondido ${questionsWrong.length} preguntas incorrectamente, que son las siguientes: `;
        for (let i = 0; i < questionsWrong.length; i++) {
            newPrompt += ` Pregunta ${i + 1}: "${questionsWrong[i].query}". `;
        }
        newPrompt += ` Haz un pequeño reporte con un párrafo indicando los conocimientos de los estudiantes y otro las lagunas de conocimiento (donde más fallan). `;
        newPrompt += ` Añade un tercer párrafo con las recomendaciones para el profesor de la asignatura. `;

        console.log("newPrompt: ", newPrompt);
        // Configurar parámetros de la solicitud a la API de OpenAI.
        const payload = {
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: newPrompt }],
            temperature: 1.0,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2048,
            n: 1,
        };
        // Log del payload que estamos por enviar
        console.log("Payload (dashboard) to send to OpenAI: ", payload);

        const response1 = await OpenAIResponse(payload);

        // Log de la respuesta final
        console.log("Response (dashboard) from OpenAI: ", response1);




        let response2 = '';
        if (questionsReported.length > 0) {
            let newPrompt2 = `De un banco de preguntas para la asignatura "${subjectName}" de un grado de ingeniería de la Universidad Politécnica de Madrid, se han respondido ${numQuestionsTotal} preguntas. `;
            newPrompt2 += `Las preguntas son sobre ${languagesNamesArray.join(", ")}. `;
            newPrompt2 += `Los estudiantes además de responder las preguntas pueden reportar las incorrectas. `;
            newPrompt2 += `Se han reportado como incorrectas ${questionsReported.length} preguntas, que son las siguientes: `;
            for (let i = 0; i < questionsReported.length; i++) {
                newPrompt2 += ` Pregunta ${i + 1}: "${questionsReported[i].query}". `;
            }
            newPrompt2 += `Haz un pequeño análisis de las preguntas reportadas. `;
            console.log("newPrompt2: ", newPrompt2);
            // Configurar parámetros de la solicitud a la API de OpenAI.
            const payload2 = {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: newPrompt2 }],
                temperature: 1.0,
                frequency_penalty: 0,
                presence_penalty: 0,
                max_tokens: 2048,
                n: 1,
            };
            // Log del payload que estamos por enviar
            console.log("Payload (dashboard) to send to OpenAI: ", payload2);

            response2 = await OpenAIResponse(payload2);

            // Log de la respuesta final
            console.log("Response (dashboard) from OpenAI: ", response2);
        }

        //send info to user as response in json
        return NextResponse.json({ numQuestionsTotal, numQuestionsReported: questionsReported.length, numQuestionsRight: questionsRight.length, numQuestionsWrong: questionsWrong.length, response1, response2 });

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}



