import { fetchResponse } from '../../utils/llmManager.js';
import { ABC_Testing } from '../../constants/abctesting.js';
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
        previousQuestionsPrompt += `Las preguntas deben estar en un nivel ${difficulty} de dificultad. Devuelve tu respuesta completamente en forma de objeto JSON. El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. Cada pregunta del quiz debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta. No incluya nada más que el JSON. Las propiedades JSON de cada pregunta deben ser "query" (que es la pregunta), "choices", "answer" y "explanation". Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. La respuesta debe ser el número indexado a 0 de la opción correcta. Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente. Intenta no colocar siempre la respuesta correcta en la misma posición, vete intercalando entre las 4 o 5 opciones.`;

        console.log("previousQuestionsPrompt: ", previousQuestionsPrompt);

        // Configurar parámetros de la solicitud a la API del LLM seleccionado para el alumno
        const payload = {
            message: previousQuestionsPrompt,
        };




        // Asignar modelo LLM al Alumno
        const assignedModel = await assignAIModel(studentEmail, subject);

        // Imprimimos por pantalla todos los parametros necesarios para la asignacion de modelo para controlar que todo va bien
        const studentRecord = await Student.findOne({ studentEmail });
        const subjectData = studentRecord?.subjects.find(s => s.subjectName === subject);
        const abTestingStatus = subjectData?.ABC_Testing ? "true" : "false";
        console.log(`Assigned Model to ${studentEmail}: ${assignedModel} - Subject: ${subject} - ABCTesting: ${abTestingStatus}`);


        // Solicitud a la API del LLM seleccionado para el alumno
        const responseLlmManager = await fetchResponse(assignedModel, payload);


        // Log de la respuesta final de la API
        const formattedResponse = responseLlmManager.replace(/^\[|\]$/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
        console.log("Response (questions) from LLM Manager: ", formattedResponse);



        // Respuesta generada por la API.
        return new Response(formattedResponse);

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}

// Asignar modelo LLM al Alumno
const assignAIModel = async (studentEmail, subject) => {
    try {
        // Obtenemos la configuración ABC_Testing de la asignatura
        const abcTestingConfig = ABC_Testing[subject];

        // Leemos los modelos disponibles desde el archivo models.json
        const allModels = await getAvailableModels();
        const modelNames = allModels.map(m => m.name);

        // Verificamos si el alumno existe y si tiene esa asignatura definida en su subjects
        const existingStudent = await Student.findOne({ studentEmail });
        const existingSubjectInStudent = await existingStudent?.subjects?.find(s => s.subjectName === subject);

        // VALIDAR LOS MODELOS DEFINIDOS EN ABC_Testing
        // Comprobamos si existe un ABC_Testing y este está dentro de fecha
        if (abcTestingConfig && isABCTestingActive(abcTestingConfig)) {
            // Comprobamos si hay algun modelo en el ABC_Testing que no esté en models.json
            const invalidModels = abcTestingConfig.models.filter(model => !modelNames.includes(model));
            if (invalidModels.length > 0) {
                console.log("--------------------------------------------------------");
                console.log(`Modelos inválidos en ABCTesting para ${subject}: ${invalidModels.join(", ")}. Asegurese de tener este modelo configurado y con el mismo nombre en el archivo models.json.`)
                console.log("--------------------------------------------------------");
                return;
            }
        }

        if (existingStudent && existingSubjectInStudent) {
            /**
            * Buscamos el índice de la asignatura en la lista de asignaturas del alumno y el modelo asignado en
            * caso de existir 
            */
            const subjectIndex = existingStudent.subjects.findIndex(s => s.subjectName === subject);
            const assignedModel = existingStudent.subjects[subjectIndex].subjectModel;

            // COMPROBAR SI EL MODELO ASIGNADO EXISTE EN models.js
            // Comprobamos si el modelo no está en models.json
            if (!modelNames.includes(assignedModel)) {
                console.log("-------------------------------------------");
                console.log(`Modelo asignado ${assignedModel} no se encuentra en models.json. Reasignando modelo...`);
                console.log("-------------------------------------------");
                /* Comprobamos si existe un ABC_Testing y este está dentro de fecha
                True -> Obtenemos un modelo del array del ABC_Testing
                False -> Obtenemos un modelo del models.json
                */
                const ABCTesting = abcTestingConfig && isABCTestingActive(abcTestingConfig);
                const newModel = ABCTesting
                    ? await getEquitableModel(abcTestingConfig.models, subject)
                    : await getEquitableModel(modelNames, subject);

                existingStudent.subjects[subjectIndex].subjectModel = newModel;
                existingStudent.subjects[subjectIndex].ABC_Testing = ABCTesting;
                await existingStudent.save();
                return newModel;
            }

            // ASIGNAMOS UN MODELO DE LOS DEFINIDOS EN ABC_Testing SI ESTA ACTIVO O EN FECHA
            // Comprobamos si existe un ABC_Testing y este está dentro de fecha
            if (abcTestingConfig && isABCTestingActive(abcTestingConfig)) {
                // Cambiamos el modelo si el actual no pertenece al ABCTesting
                if (!abcTestingConfig.models.includes(assignedModel)) {
                    const newModel = await getEquitableModel(abcTestingConfig.models, subject);
                    await updateStudentModel(existingStudent, subject, newModel, true); // ABC_Testing = true
                    return newModel;
                }

                // Activar ABC_Testing si el modelo asignado es válido
                existingStudent.subjects[subjectIndex].ABC_Testing = true;
                await existingStudent.save();

            } else {
                // Si ABCTesting ha terminado o no es válido
                /**
                 * Comprobamos si ABC_Testing = true, lo que significa que el modelo asignado pertenecia a un 
                 * ABCTesting anterior que ya no está activo. En este caso, desactivamos el ABC_Testing y 
                 * reasignamos un modelo equitativo.
                 */
                if (existingStudent.subjects[subjectIndex].ABC_Testing) {
                    existingStudent.subjects[subjectIndex].ABC_Testing = false;

                    // Reasignamos un modelo de forma equitativa
                    const newModel = await getEquitableModel(modelNames, subject);
                    existingStudent.subjects[subjectIndex].subjectModel = newModel;
                    await existingStudent.save();

                    return newModel;
                }
            }

            // Devolver el modelo asignado si es válido
            return assignedModel;

        } else if (existingStudent && !existingSubjectInStudent) {
            // Existe el alumno pero no tiene esta asignatura definida
            let assignedModel;
            const ABCTesting = abcTestingConfig && isABCTestingActive(abcTestingConfig);
            if (ABCTesting) {
                // ABCTesting activo: asignar modelo equitativo
                assignedModel = await getEquitableModel(abcTestingConfig.models, subject);
            } else {
                // ABCTesting no activo: asignar modelo equitativo de todos los disponibles
                assignedModel = await getEquitableModel(modelNames, subject);
            }

            const newSubject = {
                subjectName: subject,
                subjectModel: assignedModel,
                ABC_Testing: ABCTesting,
            };
            await addSubjectToStudent(studentEmail, newSubject);
            return assignedModel;
        }

        // Si el alumno no existe, asignamos un modelo
        let assignedModel;
        const ABCTesting = abcTestingConfig && isABCTestingActive(abcTestingConfig);
        if (ABCTesting) {
            // ABCTesting activo: asignar modelo equitativo
            assignedModel = await getEquitableModel(abcTestingConfig.models, subject);
        } else {
            // ABCTesting no activo: asignar modelo equitativo de todos los disponibles
            assignedModel = await getEquitableModel(modelNames, subject);
        }

        // Crear el nuevo alumno con el modelo asignado
        const newStudent = new Student({
            studentEmail,
            subjects: [
                {
                    subjectName: subject,
                    subjectModel: assignedModel,
                    ABC_Testing: ABCTesting,
                },
            ],
        });

        await newStudent.save();
        return assignedModel;
    } catch (error) {
        console.error("Error assigning the model:", error);
        throw new Error('Could not assign the model');
    }
};

// Añade una nueva asignatura a un alumno
const addSubjectToStudent = async (studentEmail, newSubject) => {
    try {
        await Student.updateOne(
            { studentEmail }, // Filtro para encontrar el estudiante
            {
                $push: {
                    subjects: newSubject, // Agrega la nueva asignatura al array de subjects
                },
            }
        );
        console.log(`Subject ${newSubject.subjectName} added successfully to ${studentEmail}`);
    } catch (error) {
        console.error("Error adding subject to student:", error);
    }
};

// Verificamos si el ABCTesting está activo según las fechas
const isABCTestingActive = (config) => {
    const currentDate = new Date();
    const fromDate = new Date(config.from_date);
    const toDate = new Date(config.to_date);
    return currentDate >= fromDate && currentDate <= toDate;
};

// Obtenemos el modelo más equitativo de una lista de modelos que se pasan como parametro
const getEquitableModel = async (modelNames, subject) => {
    const studentCount = await getStudentCountByModel(subject);
    let selectedModel = modelNames[0];

    for (const model of modelNames) {
        const modelStudentCount = studentCount[model] || 0;
        if (modelStudentCount < (studentCount[selectedModel] || 0)) {
            selectedModel = model;
        }
    }

    return selectedModel;
};

// Actualizamos el modelo asignado a una asignatura de un alumno
const updateStudentModel = async (student, subject, newModel, isABCTesting) => {
    const subjectIndex = student.subjects.findIndex(s => s.subjectName === subject);
    if (subjectIndex !== -1) {
        student.subjects[subjectIndex].subjectModel = newModel;
        student.subjects[subjectIndex].ABC_Testing = isABCTesting;
    } else {
        student.subjects.push({
            subjectName: subject,
            subjectModel: newModel,
            ABC_Testing: isABCTesting,
        });
    }
    await student.save();
};

// Contar estudiantes por cada modelo distinto asignado a una misma asignatura
const getStudentCountByModel = async (subject) => {
    const counts = {};
    const students = await Student.find({ "subjects.subjectName": subject });

    students.forEach(student => {
        student.subjects.forEach(s => {
            if (s.subjectName === subject) {
                counts[s.subjectModel] = (counts[s.subjectModel] || 0) + 1;
            }
        });
    });

    return counts;
};

// Obtener los modelos disponibles desde models.json
const getAvailableModels = async () => {
    try {
        const modelsPath = path.resolve('models.json');
        const modelsData = fs.readFileSync(modelsPath, 'utf-8');
        const parsedModels = JSON.parse(modelsData);

        return parsedModels.models;
    } catch (error) {
        console.error("Error reading or parsing models.json:", error);
        return [];
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
