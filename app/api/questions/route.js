import chalk from 'chalk';

import { getModelResponse } from '../../utils/llmManager.js';
import { fillPrompt } from '../../utils/promptManager.js';
import { ABC_Testing_List } from '../../constants/abctesting.js';
import { assignAIModel } from '../../utils/modelManager.js';

import dbConnect from "../../utils/dbconnect.js";
import Student from '../../models/Student.js';



// console.log("--------------------------------------------------");
// console.log('[questions/route.js] Connecting to database...');
await dbConnect();
// console.log('[questions/route.js] Database connected successfully');
// console.log("--------------------------------------------------");


// Manejar las solicitudes HTTP POST
export async function POST(request) {
    try {
        const { topic, difficulty, subTopic, numQuestions, studentEmail, subject } = await request.json();

        // Cargamos variables y objetos de configuración

        // Comprobamos si el ABCTesting está activo para la asignatura
        let abcTestingConfig = ABC_Testing_List[subject];
        let has_abctesting = (abcTestingConfig && isABCTestingActive(abcTestingConfig)) ?? false;

        // Comprobaos si existe el alumno en la base de datos,
        // si existe pero no tiene la asignatura, la añadimos,
        // si no existe, lo creamos y se devuelve el objeto del alumno
        // En los 3 casos controlamos el pull_id del cuestionario
        let existingStudent = await getAndEnsureStudentAndSubject(studentEmail, subject, has_abctesting);

        let studentSubjectData = await existingStudent?.subjects?.find(s => s.subjectName === subject);
        let subjectIndex = await existingStudent?.subjects?.findIndex(s => s.subjectName === subject);


        // SOLICITUD A LA API de promptManager para obtener el prompt final
        let finalPrompt = await fillPrompt(abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject);

        // SOLICITUD A LA API de modelManager para asignar un modelo de LLM al alumno
        const assignedModel = await assignAIModel(abcTestingConfig, has_abctesting, existingStudent, studentSubjectData, subjectIndex);

        // Imprimimos por pantalla todos los parametros necesarios para la asignacion de modelo para controlar que todo ha ido bien
        console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));
        console.log(chalk.bgGreen.black(`Assigned Model to ${studentEmail}: ${assignedModel} - Subject: ${subject} - ABCTesting: ${has_abctesting}    `));
        console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));

        // SOLICITUD A LA API del LLM seleccionado para el alumno
        const responseLlmManager = await getModelResponse(assignedModel, finalPrompt);
        // Formatear la respuesta de la API
        const formattedResponse = responseLlmManager.replace(/^\[|\]$/g, '').replace(/```json/g, '').replace(/```/g, '').trim();


        return new Response(formattedResponse);

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}



// Verificamos si el ABCTesting está activo según las fechas
const isABCTestingActive = (config) => {
    const currentDate = new Date();
    const fromDate = new Date(config.from_date);
    const toDate = new Date(config.to_date);
    const isactive = currentDate >= fromDate && currentDate <= toDate;
    if (!isactive) {
        console.log("--------------------------------------------------------");
        console.log(`ABCTesting fuera de fecha. Modificar o eliminar del archivo de configuración abctesting.js`);
        console.log("--------------------------------------------------------");
    }
    return isactive;
};

// Comprobamos si el alumno existe, si no tiene la asignatura la añade, si no existe lo crea
const getAndEnsureStudentAndSubject = async (studentEmail, subject, has_abctesting) => {
    try {
        let student = await Student.findOne({ studentEmail });
        let newPull_id = hashToNumber(studentEmail, subject); // Asignamos un pull_id inicial basado en el hash del email

        if (!student || student === null) {
            // Si el estudiante no existe, lo creamos con la asignatura
            student = new Student({
                studentEmail,
                subjects: [{
                    subjectName: subject,
                    subjectModel: "Nuevo estudiante",
                    ABC_Testing: has_abctesting,
                    survey: false,
                    md5Prompt: null,
                    prompt: null,
                    pull_id: newPull_id
                }]
            });
            await student.save();
            console.log("--------------------------------------------------------");
            console.log(`Nuevo estudiante creado: ${studentEmail} con la asignatura ${subject}`);
            console.log("--------------------------------------------------------");
            return student;
        }

        // Si el estudiante ya tiene la asignatura
        if (student.subjects.some(s => s.subjectName === subject)) {
            // Obtenemos el índice de la asignatura para actualizar su pull_id
            let idx = student.subjects.findIndex(s => s.subjectName === subject);

            // Comprobamos si el pull_id está definido
            let isDefinePull_id = student.subjects[idx].pull_id;
            const isMissing = isDefinePull_id === null || isDefinePull_id === undefined || Number.isNaN(isDefinePull_id);

            if (isMissing) {
                // Si no está definido, lo inicializamos con el hash del email
                student.subjects[idx].pull_id = newPull_id;
            } else {
                // Si está definido, comprobamos el valor de pull_id
                let pull_id = student.subjects.find(s => s.subjectName === subject).pull_id;
                
                if (pull_id === null) {
                    // Si el pull_id es null, lo inicializamos con el hash del email
                    student.subjects.find(s => s.subjectName === subject).pull_id = newPull_id;
                    await student.save();
                } else {
                    // Si ya tiene pull_id aumentamos en 1 su valor
                    student.subjects.find(s => s.subjectName === subject).pull_id = pull_id + 1;
                    await student.save();
                }
            }

            return student;
        }

        // Si el estudiante existe pero no tiene la asignatura, la añadimos
        student.subjects.push({
            subjectName: subject,
            subjectModel: "Nuevo estudiante",
            ABC_Testing: has_abctesting,
            survey: false,
            md5Prompt: null,
            prompt: null,
            pull_id: newPull_id
        });
        await student.save();
        console.log("--------------------------------------------------------");
        console.log(`Asignatura ${subject} añadida a ${studentEmail}`);
        console.log("--------------------------------------------------------");
        return student;

    } catch (error) {
        console.error('Error asegurando la existencia del estudiante y su asignatura:', error.message);
        console.error(error);
    }
};

// Función para generar un número único basado en hash y componentes aleatorios
const hashToNumber = (studentEmail, subject) => {
    // Mezcla los datos base
    const baseString = `${studentEmail}-${subject}-${Date.now()}-${Math.random()}`;

    // Crea un hash SHA-256 del string base
    const hashBuffer = new TextEncoder().encode(baseString);
    let hash = 0;
    for (let i = 0; i < hashBuffer.length; i++) {
        hash = (hash * 31 + hashBuffer[i]) % 1_000_000_000_000; // 12 dígitos
    }

    // Añadimos un aleatorio adicional para evitar coincidencias simultáneas
    const randomComponent = Math.floor(Math.random() * 1_000_000);
    const uniqueId = Number(`${hash}${randomComponent}`.slice(0, 15)); // máx. 15 dígitos seguros

    return uniqueId;
};

