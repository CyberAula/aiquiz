import { fetchResponse } from '../../utils/llmManager.js';
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
        const { language, difficulty, topic, numQuestions, studentEmail, subject } = await request.json();


        // Comprobamos si el ABCTesting está activo para la asignatura
        let abcTestingConfig = ABC_Testing_List[subject];
        let has_abctesting = (abcTestingConfig && isABCTestingActive(abcTestingConfig)) ?? false;
        console.log("--------------------------------------------------------");
        console.log("ABCTesting for", subject, ":", has_abctesting);
        console.log("--------------------------------------------------------");

        // Comprobaos si existe el alumno en la base de datos,
        // si existe pero no tiene la asignatura, la añadimos,
        // si no existe, lo creamos.
        await ensureStudentAndSubject(studentEmail, subject);


        // SOLICITUD A LA API de promptManager para obtener el prompt final
        let finalPrompt = await fillPrompt(abcTestingConfig, has_abctesting, language, difficulty, topic, numQuestions, studentEmail, subject);


        // SOLICITUD A LA API de modelManager para asignar un modelo de LLM al alumno
        const assignedModel = await assignAIModel(abcTestingConfig, has_abctesting, studentEmail, subject);
            // Imprimimos por pantalla todos los parametros necesarios para la asignacion de modelo para controlar que todo ha ido bien
        const studentRecord = await Student.findOne({ studentEmail });
        const subjectData = studentRecord?.subjects.find(s => s.subjectName === subject);
        const abTestingStatus = subjectData?.ABC_Testing ? "true" : "false";
        console.log("--------------------------------------------------------");
        console.log(`Assigned Model to ${studentEmail}: ${assignedModel} - Subject: ${subject} - ABCTesting: ${abTestingStatus}`);
        console.log("--------------------------------------------------------");


        // SOLICITUD A LA API del LLM seleccionado para el alumno
        const responseLlmManager = await fetchResponse(assignedModel, finalPrompt);
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
const ensureStudentAndSubject = async (studentEmail, subject) => {
    try {
        let student = await Student.findOne({ studentEmail });

        if (!student) {
            // Si el estudiante no existe, lo creamos con la asignatura
            student = new Student({
                studentEmail,
                subjects: [{
                    subjectName: subject,
                    subjectModel: null, 
                    ABC_Testing: false, 
                    prompt: null 
                }]
            });
            await student.save();
            console.log("--------------------------------------------------------");
            console.log(`Nuevo estudiante creado: ${studentEmail} con la asignatura ${subject}`);
            console.log("--------------------------------------------------------");
            return;
        }

        // Si el estudiante ya tiene la asignatura, salimos sin hacer nada ni mostrar logs
        if (student.subjects.some(s => s.subjectName === subject)) {
            return;
        }

        // Si el estudiante existe pero no tiene la asignatura, la añadimos
        student.subjects.push({
            subjectName: subject,
            subjectModel: null, 
            ABC_Testing: false, 
            prompt: null 
        });
        await student.save();
        console.log("--------------------------------------------------------");
        console.log(`Asignatura ${subject} añadida a ${studentEmail}`);
        console.log("--------------------------------------------------------");

    } catch (error) {
        console.error('Error asegurando la existencia del estudiante y su asignatura:', error.message);
    }
};

