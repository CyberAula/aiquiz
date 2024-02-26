import { OpenAIStream } from '../../utils/OpenAIStream';
import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';

//to get student track record
await dbConnect();

// Verificar si existe la clave API OpenAi
if (!process.env.OPENAI_API_KEY) {
     throw new Error('Falta la OpenAI API Key');
}


// Manejar las solicitudes HTTP POST
export async function POST(request) {
    try {
        const { language, difficulty, topic, numQuestions, studentEmail } = await request.json();

        let previousQuestionsPrompt = `Soy un estudiante de una asignatura de universidad. `;
        //count questions from this same student and language and topic
        console.log("studentEmail: ", studentEmail, "language: ", language, "topic: ", topic);
        const num_prev_questions = await Question.countDocuments({studentEmail: studentEmail, language: language, topic: topic, studentReport: false});
        const num_prev_questions_only_lang = await Question.countDocuments({studentEmail: studentEmail, language: language, studentReport: false});
        console.log("num_prev_questions: ", num_prev_questions);
        console.log("num_prev_questions_only_lang: ", num_prev_questions_only_lang);
        if(num_prev_questions>3){
            console.log("Student already answered " + num_prev_questions + " questions about " + topic + " in " + language);
            //compose a prompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({studentEmail: studentEmail, language: language, topic: topic}).limit(20);
            previousQuestionsPrompt += `Anteriormente ya he respondido ${num_prev_questions} preguntas sobre ${topic} en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                previousQuestionsPrompt += getPreviousQuestionPrompt(previousQuestions[i]);
            }
        } else if (num_prev_questions_only_lang>3){
            console.log("Student already answered " + num_questions_only_lang + " questions in " + language);
            //compose a prompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({studentEmail: studentEmail, language: language, studentReport: false}).limit(20);
            previousQuestionsPrompt += `Anteriormente ya he respondido ${num_questions_only_lang} preguntas en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                previousQuestionsPrompt += getPreviousQuestionPrompt(previousQuestions[i]);
            }
        } else {
            console.log("Student has not answered enough questions yet, we cannot inform the IA about the track record");
        }        
       
        console.log("params: lang, difficulty, topic, numquestions: ", language, difficulty, topic, numQuestions);
        // Generación de preguntas
        previousQuestionsPrompt += `Dame ${numQuestions} preguntas de opción múltiple sobre ${topic} en el lenguaje de programación ${language}.`;
        previousQuestionsPrompt += `Las preguntas deben estar en un nivel ${difficulty} de dificultad. Devuelve tu respuesta completamente en forma de objeto JSON. El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. Cada pregunta del quiz debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta. No incluya nada más que el JSON. Las propiedades JSON de cada pregunta deben ser "query" (que es la pregunta), "choices", "answer" y "explanation". Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. La respuesta debe ser el número indexado a 0 de la opción correcta. Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente.`;
        
        console.log("previousQuestionsPrompt: ", previousQuestionsPrompt);

        // Configurar parámetros de la solicitud a la API de OpenAI.
        const payload = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: previousQuestionsPrompt }],
            temperature: 1.0,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2048,
            stream: true,
            n: 1,
        };

        const apiKey = process.env.OPENAI_API_KEY;

        // Solicitud a la API de OpenAI
        const stream = await OpenAIStream(payload, apiKey);

        // Respuesta generada por la API de OpenAI.
        return new Response(stream);

    } catch (error) {        
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}


function getPreviousQuestionPrompt(previousQuestion){
    let prompt = `A la pregunta "${previousQuestion.query}" con opciones "${getChoicesWithNumbers(previousQuestion.choices)}", donde la correcta era la respuesta ${previousQuestion.answer}, respondí con la opción ${previousQuestion.studentAnswer}.`;  

    return prompt;
}

function getChoicesWithNumbers(choices){
    let choicesWithNumbers = '';
    for (let i = 0; i < choices.length; i++) {
        choicesWithNumbers += `${i}. ${choices[i]}, `;
    }
    //we remove the last comma
    return choicesWithNumbers.slice(0, -1);
}
