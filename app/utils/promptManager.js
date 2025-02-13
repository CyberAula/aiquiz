import dbConnect from '../utils/dbconnect.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';

import { createHash } from 'crypto';

// console.log("--------------------------------------------------");
// console.log('[promptManager.js] Connecting to database...');
await dbConnect();
// console.log('[promptManager.js] Database connected successfully');
// console.log("--------------------------------------------------");

export async function fillPrompt(abcTestingConfig, has_abctesting, language, difficulty, topic, numQuestions, studentEmail, subject) {

    const variables = {
        subject,
        language,
        difficulty,
        topic,
        numQuestions,
        studentEmail,
    };

    let finalPrompt = "";
    let arrayPrompts = [];

    // Comprobamos si hay ABC_Testing en la asignatura
    // Añadimos al arrayPrompts los prompts definidos en abcTestingConfig cambiando las variables por los valores correspondientes previamente definidos
    if (has_abctesting) {
        arrayPrompts = abcTestingConfig
            ? Object.keys(abcTestingConfig)
                .filter(key => key.startsWith("prompt"))
                .map(key => abcTestingConfig[key].content) // Mantener el contenido sin sustituir variables
            : [];
        console.log("--------------------------------------------------");
        console.log("arrayPrompts: ", arrayPrompts);
        console.log("--------------------------------------------------");
    }

    // Comprobamos si hay algún prompt en la configuración
    let abcPromptTesting = arrayPrompts.length > 0;

    // Buscamos el estudiante en la base de datos y la asignatura en caso de que exista
    let existingStudent = await Student.findOne({ studentEmail });
    const existingSubjectInStudent = await existingStudent?.subjects?.find(s => s.subjectName === subject);
    let subjectIndex = existingStudent?.subjects?.findIndex(s => s.subjectName === subject);


    // Si esta activado el ABC_Testing en la asignatura y hay prompts en la configuración
    if (has_abctesting && abcPromptTesting) {

        // Caso 1: ABC_Testing de la asignatura es true
        if (existingSubjectInStudent.ABC_Testing) {

            // Función para generar el hash MD5 de un string
            const hashMD5 = (str) => createHash('md5').update(str).digest('hex');
            // Crear un mapa hash -> prompt para encontrar el original fácilmente [clave, prompt]
            const promptMap = new Map(arrayPrompts.map(prompt => [hashMD5(prompt), prompt]));
            // Imprimir por consola los hashes generados
            console.log("--------------------------------------------------");
            console.log("Hashes de los prompts del ABCTesting:");
            promptMap.forEach((hash, index) => {
                console.log(`Prompt ${index + 1}: ${hash}`);
            });
            console.log("--------------------------------------------------");

            // Caso 1.1: El estudiante ya tiene un prompt asignado
            if (existingSubjectInStudent.prompt) {

                // Caso 1.1.1: El prompt asignado está entre los prompts de la configuración
                if (promptMap.has(existingSubjectInStudent.prompt)) {
                    finalPrompt = promptMap.get(existingSubjectInStudent.prompt);
                } else {
                    // Caso 1.1.2: El prompt asignado no está entre los prompts de la configuración
                    // Asignar un prompt de forma equitativa
                    finalPrompt = await getEquitablePrompt(arrayPrompts, subject);
                }

            } else {
                // Caso 1.2: El estudiante no tiene un prompt asignado
                // Asignar un prompt de forma equitativa
                finalPrompt = await getEquitablePrompt(arrayPrompts, subject);
            }

        } else {
            // Caso 2: ABC_Testing de la asignatura es false
            // Asignar un prompt de forma equitativa y cambiar ABC_Testing a true
            finalPrompt = await getEquitablePrompt(arrayPrompts, subject);
        }

    } else {
        // En caso de no haber un ABC_Testing en la asignatura o no tener definidos unos prompts, 
        // asignamos el finalPrompt por defecto con las respuestas anteriores del estudiante.

        if (subject === 'BBDD') {
            finalPrompt = `Soy un estudiante de una asignatura de nombre "bases de datos no relacionales" en la universidad. En esta asignatura vemos temas de bases de datos no relacionales, big data, nosql, json, json schema, modelos de datos nosql, mongodb shell y mongodb aggregation framework.`;
        } else {
            finalPrompt = `Soy un estudiante de una asignatura de universidad. `;
        }
        //count questions from this same student and language and topic
        console.log("studentEmail: ", studentEmail, "language: ", language, "topic: ", topic);
        const num_prev_questions = await Question.countDocuments({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false });
        const num_prev_questions_only_lang = await Question.countDocuments({ studentEmail: studentEmail, language: language, studentReport: false });
        console.log("num_prev_questions: ", num_prev_questions);
        console.log("num_prev_questions_only_lang: ", num_prev_questions_only_lang);
        if (num_prev_questions > 3) {
            console.log("Student already answered " + num_prev_questions + " questions about " + topic + " in " + language);
            //compose a finalPrompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, topic: topic }).limit(20);
            finalPrompt += `Anteriormente ya he respondido ${num_prev_questions} preguntas sobre ${topic} en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                finalPrompt += getPreviousQuestionfinalPrompt(previousQuestions[i]);
            }
        } else if (num_prev_questions_only_lang > 3) {
            console.log("Student already answered " + num_prev_questions_only_lang + " questions in " + language);
            //compose a finalPrompt with the previous questions to inform the IA about the track record (max 20 questions)
            let previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, studentReport: false }).limit(20);
            finalPrompt += `Anteriormente ya he respondido ${num_prev_questions_only_lang} preguntas en el lenguaje ${language}.`;

            for (let i = 0; i < previousQuestions.length; i++) {
                finalPrompt += getPreviousQuestionPrompt(previousQuestions[i]);
            }
        } else {
            console.log("Student has not answered enough questions yet, we cannot inform the IA about the track record");
        }

        console.log("params: lang, difficulty, topic, numquestions: ", language, difficulty, topic, numQuestions);
        // Generación de preguntas
        //añado este if para no tocar lo antiguo que especifica que se habla de un lenguaje de programacion
        //cambio solo para que en BBDD no se hable de lenguaje de programacion como tal sino de tema, esto hay que mejorarlo
        if (subject === 'BBDD') {
            finalPrompt += `Dame ${numQuestions} preguntas que tengan 4 o 5 opciones, siendo solo una de ellas la respuesta correcta, sobre "${topic}" enmarcadas en el tema "${language}".`;
        } else {
            finalPrompt += `Dame ${numQuestions} preguntas que tengan 4 o 5 opciones, siendo solo una de ellas la respuesta correcta, sobre "${topic}" en el lenguaje de programación ${language}.`;
        }
        finalPrompt += `Usa mis respuestas anteriores para conseguir hacer nuevas preguntas que me ayuden a aprender y profundizar sobre este tema.`;
        finalPrompt += `Las preguntas deben estar en un nivel ${difficulty} de dificultad. Devuelve tu respuesta completamente en forma de objeto JSON. El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. Cada pregunta del quiz debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta. No incluya nada más que el JSON. Las propiedades JSON de cada pregunta deben ser "query" (que es la pregunta), "choices", "answer" y "explanation". Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. La respuesta debe ser el número indexado a 0 de la opción correcta. Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente. Intenta no colocar siempre la respuesta correcta en la misma posición, vete intercalando entre las 4 o 5 opciones.`;
    }

    // En caso de haber asignado un prompt de ABC_Testing:
    // Guardamos en el alumno el prompt asignado
    // Sustituimos las variables en el prompt para enviar al LLM con el prompt final
    if (has_abctesting && abcPromptTesting) {
        // Convertir el prompt a hash y asignarlo a la asignatura del estudiante
        const hashPrompt = createHash('md5').update(finalPrompt).digest('hex');
        existingStudent.subjects[subjectIndex].prompt = hashPrompt;
        // Reemplazar las variables en el prompt para enviar al llm con el prompt final
        finalPrompt = fillVariables(finalPrompt, variables);
    } else {
        existingStudent.subjects[subjectIndex].prompt = finalPrompt;
    }

    existingStudent.subjects[subjectIndex].ABC_Testing = has_abctesting;

    await existingStudent.save();

    console.log("--------------------------------------------------");
    console.log("[Prompt final] -> ", finalPrompt);
    console.log("--------------------------------------------------");

    return finalPrompt;
};




function getPreviousQuestionPrompt(previousQuestion) {
    let prompt = '';
    if (previousQuestion.studentAnswer === previousQuestion.answer) {
        prompt = `A la pregunta "${previousQuestion.query}" con opciones "${getChoicesWithNumbers(previousQuestion.choices)}", donde la correcta era la respuesta ${previousQuestion.answer}, respondí correctamente con la opción ${previousQuestion.studentAnswer}. `;
    } else {
        prompt = `A la pregunta "${previousQuestion.query}" con opciones "${getChoicesWithNumbers(previousQuestion.choices)}", donde la correcta era la respuesta ${previousQuestion.answer}, respondí incorrectamente con la opción ${previousQuestion.studentAnswer}. `;
    }

    return prompt;
};

function getChoicesWithNumbers(choices) {
    let choicesWithNumbers = '';
    for (let i = 0; i < choices.length; i++) {
        choicesWithNumbers += `${i}. ${choices[i]}, `;
    }
    //we remove the last comma
    return choicesWithNumbers.slice(0, -2);
};



// Función que selecciona el prompt con menor cantidad de asignaciones
const getEquitablePrompt = async (arrayPrompts, subject) => {

    // Función para generar el hash MD5 de un string
    const hashMD5 = (str) => createHash('md5').update(str).digest('hex');

    // Generamos los hashes para cada prompt del array
    const promptHashes = arrayPrompts.map(prompt => hashMD5(prompt));

    // Inicializamos un objeto para contar las asignaciones de cada hash
    const counts = {};
    promptHashes.forEach(hash => {
        counts[hash] = 0;
    });

    // Obtenemos todos los estudiantes que tienen asignada la asignatura.
    const students = await Student.find({ "subjects.subjectName": subject });

    // Contamos cuántos estudiantes tienen cada hash asignado.
    students.forEach(student => {
        student.subjects.forEach(s => {
            if (s.subjectName === subject && s.prompt) {
                if (counts.hasOwnProperty(s.prompt)) {
                    counts[s.prompt]++;
                }
            }
        });
    });

    // Seleccionamos el hash con menor cantidad de asignaciones
    let selectedHash = promptHashes[0];
    promptHashes.forEach(hash => {
        if (counts[hash] < counts[selectedHash]) {
            selectedHash = hash;
        }
    });

    // Devolvemos el prompt original correspondiente al hash seleccionado
    const selectedPrompt = arrayPrompts[promptHashes.indexOf(selectedHash)];

    return selectedPrompt;
};

// Función que reemplaza las variables en un prompt dado un objeto de variables
function fillVariables(prompt, variables) {
    console.log("--------------------------------------------------");
    
    const result = prompt.replace(/{(\w+)}/g, (match, key) => {
        if (variables[key] !== undefined) {
            return variables[key];
        } else {
            console.warn(`Variable "${key}" no reconocida en el prompt.`);
            return match; // Devuelve la variable sin reemplazar si no se encuentra en variables
        }
    });

    console.log("--------------------------------------------------");
    return result;
}

