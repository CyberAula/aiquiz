import { fetchResponse } from '../../utils/llmManager.js';
import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';
import Student from '../../models/Student.js';
import path from 'path';
import fs from 'fs';


console.log("--------------------------------------------------");
console.log('Connecting to database...');
await dbConnect();
console.log('Database connected successfully');
console.log("--------------------------------------------------");


// Manejar las solicitudes HTTP POST
export async function POST(request) {
    try {
        const { language, difficulty, topic, numQuestions, studentEmail, subject } = await request.json();

        let previousQuestionsPrompt = "";
        if (subject === 'BBDD') {
            previousQuestionsPrompt = `Soy un estudiante de una asignatura de nombre "bases de datos no relacionales" en la universidad. En esta asignatura vemos temas de bases de datos no relacionales, big data, nosql, json, json schema, modelos de datos nosql, mongodb shell y mongodb aggregation framework.`;
        } else {
            previousQuestionsPrompt = `Soy un estudiante de una asignatura de universidad. `;
        }
        //count questions from this same student and language and topic
        console.log("studentEmail: ", studentEmail, "language: ", language, "topic: ", topic);
        const num_prev_questions = await Question.countDocuments({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false });
        const num_prev_questions_only_lang = await Question.countDocuments({ studentEmail: studentEmail, language: language, studentReport: false });
        console.log("num_prev_questions: ", num_prev_questions);
        console.log("num_prev_questions_only_lang: ", num_prev_questions_only_lang);
        if (num_prev_questions > 3) {
            console.log("Student already answered " + num_prev_questions + " questions about " + topic + " in " + language);
            //compose a prompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, topic: topic }).limit(20);
            previousQuestionsPrompt += `Anteriormente ya he respondido ${num_prev_questions} preguntas sobre ${topic} en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                previousQuestionsPrompt += getPreviousQuestionPrompt(previousQuestions[i]);
            }
        } else if (num_prev_questions_only_lang > 3) {
            console.log("Student already answered " + num_prev_questions_only_lang + " questions in " + language);
            //compose a prompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, studentReport: false }).limit(20);
            previousQuestionsPrompt += `Anteriormente ya he respondido ${num_prev_questions_only_lang} preguntas en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                previousQuestionsPrompt += getPreviousQuestionPrompt(previousQuestions[i]);
            }
        } else {
            console.log("Student has not answered enough questions yet, we cannot inform the IA about the track record");
        }

        console.log("params: lang, difficulty, topic, numquestions: ", language, difficulty, topic, numQuestions);
        // Generación de preguntas
        //añado este if para no tocar lo antiguo que especifica que se habla de un lenguaje de programacion
        //cambio solo para que en BBDD no se hable de lenguaje de programacion como tal sino de tema, esto hay que mejorarlo
        if (subject === 'BBDD') {
            previousQuestionsPrompt += `Dame ${numQuestions} preguntas que tengan 4 o 5 opciones, siendo solo una de ellas la respuesta correcta, sobre "${topic}" enmarcadas en el tema "${language}".`;
        } else {
            previousQuestionsPrompt += `Dame ${numQuestions} preguntas que tengan 4 o 5 opciones, siendo solo una de ellas la respuesta correcta, sobre "${topic}" en el lenguaje de programación ${language}.`;
        }
        previousQuestionsPrompt += `Usa mis respuestas anteriores para conseguir hacer nuevas preguntas que me ayuden a aprender y profundizar sobre este tema.`;
        previousQuestionsPrompt += `Las preguntas deben estar en un nivel ${difficulty} de dificultad. Devuelve tu respuesta completamente en forma de objeto JSON. El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. Cada pregunta del quiz debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta. No incluya nada más que el JSON. Las propiedades JSON de cada pregunta deben ser "query" (que es la pregunta), "choices", "answer" y "explanation". Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. La respuesta debe ser el número indexado a 0 de la opción correcta. Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente.`;

        console.log("previousQuestionsPrompt: ", previousQuestionsPrompt);

        // Configurar parámetros de la solicitud a la API del LLM seleccionado para el alumno
        const payload = {
            message: previousQuestionsPrompt,
        };

        const assignedModel = await assignAIModel(studentEmail);
        console.log("assignedModel: ", assignedModel);

        // Solicitud a la API del LLM seleccionado para el alumno
        const responseLlmManager = await fetchResponse(assignedModel, payload);

        // const responseLlmManager = await fetchResponse("OpenAI_GPT", payload);
        // const responseLlmManager = await fetchResponse("Anthropic_Claude", payload);
        // const responseLlmManager = await fetchResponse("Google_Generative", payload);
        // const responseLlmManager = await fetchResponse("Facebook_Llama", payload);


        // Log de la respuesta final de la API
        const formattedResponse = responseLlmManager.replace(/^\[|\]$/g, '').trim();
        console.log("Response (questions) from LLM Manager: ", JSON.stringify(formattedResponse, null, 2));



        // Respuesta generada por la API.
        return new Response(formattedResponse);

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}

const assignAIModel = async (email) => {
    try {
        // Check if the student already has an assigned model
        const existingStudent = await Student.findOne({ studentEmail: email });

        if (existingStudent) {
            console.log("ExistingStudent --> ", existingStudent);
            return existingStudent.assignedModel;
        }

        // If the student does not have an assigned model, assign one based on the number of students
        const models = await getAvailableModels();
        // console.log(models);
        const studentCount = await getStudentCountByModel();
        console.log(studentCount);


        // Assign the model with the least number of students
        let selectedModel = models[0]; // Default to the first model
        console.log(selectedModel);


        for (let model of models) {
            const modelStudentCount = studentCount[model.name] || 0;
            if (!selectedModel || modelStudentCount < studentCount[selectedModel.name]) {
                selectedModel = model;
            }
        }
        console.log(selectedModel);

        // Create a record for the model assignment for this student
        const newStudent = new Student({
            studentEmail: email,
            assignedModel: selectedModel.name
        });
        console.log(newStudent);

        await newStudent.save();

        return selectedModel.name;
    } catch (error) {
        console.error("Error assigning the model:", error);
        throw new Error('Could not assign the model');
    }
};

const getStudentCountByModel = async () => {
    const counts = {};
    const students = await Student.find({});

    students.forEach(student => {
        counts[student.assignedModel] = (counts[student.assignedModel] || 0) + 1;
    });

    return counts;
};

const getAvailableModels = async () => {
    try {
        const modelsPath = path.resolve('models.json'); // Resuelve la ruta al archivo models.json
        const modelsData = fs.readFileSync(modelsPath, 'utf-8'); // Lee el archivo sincrónicamente
        const parsedModels = JSON.parse(modelsData); // Analiza los datos JSON

        return parsedModels.models; // Devuelve el array de modelos
    } catch (error) {
        console.error("Error reading or parsing models.json:", error);
        return []; // Retorna un array vacío si ocurre un error
    }
};

function getPreviousQuestionPrompt(previousQuestion) {
    let prompt = '';
    if (previousQuestion.studentAnswer === previousQuestion.answer) {
        prompt = `A la pregunta "${previousQuestion.query}" con opciones "${getChoicesWithNumbers(previousQuestion.choices)}", donde la correcta era la respuesta ${previousQuestion.answer}, respondí correctamente con la opción ${previousQuestion.studentAnswer}. `;
    } else {
        prompt = `A la pregunta "${previousQuestion.query}" con opciones "${getChoicesWithNumbers(previousQuestion.choices)}", donde la correcta era la respuesta ${previousQuestion.answer}, respondí incorrectamente con la opción ${previousQuestion.studentAnswer}. `;
    }

    return prompt;
}

function getChoicesWithNumbers(choices) {
    let choicesWithNumbers = '';
    for (let i = 0; i < choices.length; i++) {
        choicesWithNumbers += `${i}. ${choices[i]}, `;
    }
    //we remove the last comma
    return choicesWithNumbers.slice(0, -2);
}
