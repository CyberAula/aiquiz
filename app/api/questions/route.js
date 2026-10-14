import chalk from 'chalk';

import { getModelResponse } from '../../utils/llmManager.js';
import { fillPrompt } from '../../utils/promptManager.js';
import { ABC_Testing_List } from '../../constants/abctesting.js';
import { assignAIModel } from '../../utils/modelManager.js';
import { isPerPullMode, pickNextSlot, getPromptById, shuffleQuestion } from '../../utils/studyDesign.js';

import { createHash } from 'crypto';
import dbConnect from "../../utils/dbconnect.js";
import Student from '../../models/Student.js';
import Pull from '../../models/Pull.js';



// console.log("--------------------------------------------------");
// console.log('[questions/route.js] Connecting to database...');
await dbConnect();
// Aseguramos los índices de Pull (el índice único de huecos de bloque evita asignaciones duplicadas)
try {
    await Pull.createIndexes();
} catch (error) {
    console.error('[questions/route.js] No se pudieron crear los índices de Pull:', error.message);
}
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

        // MODO DE ESTUDIO "per_pull": la condición (prompt y barajado) se asigna en cada test
        if (has_abctesting && isPerPullMode(abcTestingConfig)) {
            return await generatePerPull({ abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, subject, existingStudent, studentSubjectData, subjectIndex });
        }


        // SOLICITUD A LA API de promptManager para obtener el prompt final
        let finalPrompt = await fillPrompt(abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject);

        // SOLICITUD A LA API de modelManager para asignar un modelo de LLM al alumno
        const assignedModel = await assignAIModel(abcTestingConfig, has_abctesting, existingStudent, studentSubjectData, subjectIndex);

        // Imprimimos por pantalla todos los parametros necesarios para la asignacion de modelo para controlar que todo ha ido bien
        console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));
        console.log(chalk.bgGreen.black(`Assigned Model to ${studentEmail}: ${assignedModel} - Subject: ${subject} - ABCTesting: ${has_abctesting}    `));
        console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));

        // SOLICITUD A LA API del LLM seleccionado para el alumno
        const responseLlmManager = await getModelResponse(assignedModel, finalPrompt, numQuestions);
        // Formatear la respuesta de la API
        const formattedResponse = responseLlmManager.text.replace(/^\[|\]$/g, '').replace(/```json/g, '').replace(/```/g, '').trim();

        // Contar preguntas recibidas del LLM
        let numQuestionsReceived = numQuestions;
        try {
            const parsed = JSON.parse(formattedResponse);
            if (parsed.questions && Array.isArray(parsed.questions)) {
                numQuestionsReceived = parsed.questions.length;
            }
        } catch (e) { /* si falla el parse, usamos numQuestions como fallback */ }

        logGeneration(responseLlmManager, assignedModel, numQuestions, numQuestionsReceived);

        return new Response(formattedResponse, {
            headers: buildGenerationHeaders(responseLlmManager, assignedModel, numQuestions, numQuestionsReceived)
        });

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}



// Coste estimado de la generación a partir de los tokens usados
const getEstimatedCost = (responseLlmManager) => {
    const usageData = responseLlmManager.usage || {};
    const tokenPrice = responseLlmManager.tokenPrice || 0;
    return (usageData.total_tokens || 0) * tokenPrice;
};

const logGeneration = (responseLlmManager, assignedModel, numQuestions, numQuestionsReceived) => {
    const usageData = responseLlmManager.usage || {};
    const estimatedCost = getEstimatedCost(responseLlmManager);
    console.log(chalk.bgCyan.black(`Token usage for ${assignedModel}: prompt=${usageData.prompt_tokens}, completion=${usageData.completion_tokens}, total=${usageData.total_tokens}, reasoning=${usageData.reasoning_tokens}`));
    console.log(chalk.bgCyan.black(`Response time: ${responseLlmManager.responseTime}ms | Model ID: ${responseLlmManager.modelId} | Estimated cost: ${estimatedCost} | Questions requested: ${numQuestions}, received: ${numQuestionsReceived}`));
};

// Cabeceras con los datos de la generación que el front añade a cada pregunta
const buildGenerationHeaders = (responseLlmManager, assignedModel, numQuestions, numQuestionsReceived) => {
    const usageData = responseLlmManager.usage || {};
    return {
        'X-Usage-Prompt-Tokens': String(usageData.prompt_tokens || 0),
        'X-Usage-Completion-Tokens': String(usageData.completion_tokens || 0),
        'X-Usage-Total-Tokens': String(usageData.total_tokens || 0),
        'X-Usage-Reasoning-Tokens': String(usageData.reasoning_tokens || 0),
        'X-Response-Time': String(responseLlmManager.responseTime || 0),
        'X-Model-Id': String(responseLlmManager.modelId || ''),
        'X-Assigned-Model': String(assignedModel || ''),
        'X-Model-Config': JSON.stringify(responseLlmManager.modelConfig || {}),
        'X-Num-Questions-Requested': String(numQuestions),
        'X-Num-Questions-Received': String(numQuestionsReceived),
        'X-Estimated-Cost': String(getEstimatedCost(responseLlmManager)),
    };
};


// Número máximo de intentos para ocupar un hueco del bloque si otra petición simultánea lo coge antes
const MAX_SLOT_ATTEMPTS = 5;

// Generación en el modo de estudio "per_pull" (ver abctesting.js):
// 1. asigna la condición con bloques permutados por (estudiante, asignatura)
// 2. registra el pull en la colección pulls ANTES de llamar al LLM
// 3. llama al LLM, baraja las opciones si la condición lo indica y actualiza el pull
const generatePerPull = async ({ abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, subject, existingStudent, studentSubjectData, subjectIndex }) => {
    const pull_id = existingStudent.subjects[subjectIndex].pull_id;

    // Modelo: en el modo per_pull se usa siempre el primer (y único) modelo de la configuración
    let assignedModel = await assignAIModel(abcTestingConfig, has_abctesting, existingStudent, studentSubjectData, subjectIndex);
    const studyModel = abcTestingConfig.models[0];
    if (assignedModel !== studyModel) {
        console.log(chalk.bgRedBright.black(`[per_pull] Modelo asignado ${assignedModel} distinto del modelo del estudio, se usa ${studyModel}`));
        assignedModel = studyModel;
    }

    // Asignación de condición y registro del pull (con reintento si dos peticiones compiten por el mismo hueco)
    let pull = null;
    for (let attempt = 0; attempt < MAX_SLOT_ATTEMPTS && !pull; attempt++) {
        const activePulls = await Pull.find(
            { studentEmail, subject, slotActive: true },
            { blockIndex: 1, positionInBlock: 1, conditionId: 1 }
        ).lean();
        const { blockIndex, positionInBlock, condition } = pickNextSlot(activePulls, abcTestingConfig.conditions);
        const promptTemplate = getPromptById(abcTestingConfig, condition.promptId).content;

        const finalPrompt = await fillPrompt(abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject, { promptTemplate, studyCondition: { condition, blockIndex, positionInBlock } });

        try {
            pull = await Pull.create({
                pull_id,
                studentEmail,
                subject,
                topic,
                subTopic,
                difficulty,
                numQuestionsRequested: numQuestions,
                conditionId: condition.id,
                promptId: condition.promptId,
                md5Prompt: createHash('md5').update(promptTemplate).digest('hex'),
                prompt: finalPrompt,
                shuffled: condition.shuffled,
                blockIndex,
                positionInBlock,
                slotActive: true,
                llmModel: assignedModel,
                status: 'pending',
            });
        } catch (error) {
            if (error.code !== 11000) throw error;
            console.log(chalk.bgYellow.black(`[per_pull] Hueco (${blockIndex}, ${positionInBlock}) ocupado por otra petición de ${studentEmail}, reintentando...`));
        }
    }
    if (!pull) {
        throw new Error('No se pudo asignar una condición del estudio al pull');
    }

    console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));
    console.log(chalk.bgGreen.black(`[per_pull] ${studentEmail} - ${subject} - pull ${pull_id} - bloque ${pull.blockIndex} pos ${pull.positionInBlock} - condición ${pull.conditionId} - modelo ${assignedModel}`));
    console.log(chalk.bgGreen.black("--------------------------------------------------------------------------------------------------------------"));

    // SOLICITUD A LA API del LLM
    let responseLlmManager;
    try {
        responseLlmManager = await getModelResponse(assignedModel, pull.prompt, numQuestions);
    } catch (error) {
        await markPullError(pull, `Error del LLM: ${error.message}`);
        throw error;
    }

    const resultFields = {
        modelId: responseLlmManager.modelId || '',
        finishReason: responseLlmManager.finishReason ?? null,
        truncated: responseLlmManager.truncated ?? false,
        maxOutputTokensUsed: responseLlmManager.maxOutputTokensUsed,
        usageData: responseLlmManager.usage || {},
        responseTime: responseLlmManager.responseTime || 0,
    };

    // Parseo del JSON del modelo
    const formattedResponse = (responseLlmManager.text || '').replace(/^\[|\]$/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedQuestions;
    try {
        const parsed = JSON.parse(formattedResponse);
        if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
            throw new Error('la respuesta no contiene un array "questions" con preguntas');
        }
        parsedQuestions = parsed.questions;
    } catch (error) {
        await markPullError(pull, `JSON inválido: ${error.message}`, { ...resultFields, rawResponse: formattedResponse });
        console.error(`[per_pull] JSON del modelo no válido (pull ${pull_id}):`, error.message);
        return new Response('Error during request', { status: 500 });
    }

    // Barajado en el servidor (si la condición lo indica) y metadatos por pregunta
    const questions = parsedQuestions.map(q => shuffleQuestion(q, pull.shuffled));
    const numQuestionsReceived = questions.length;
    const numMalformed = questions.filter(q => q.malformed).length;

    await Pull.updateOne({ _id: pull._id }, {
        $set: {
            ...resultFields,
            status: 'ok',
            numQuestionsReceived,
            numMalformed,
            completedAt: new Date(),
        }
    });

    logGeneration(responseLlmManager, assignedModel, numQuestions, numQuestionsReceived);

    return new Response(JSON.stringify({ questions }), {
        headers: {
            ...buildGenerationHeaders(responseLlmManager, assignedModel, numQuestions, numQuestionsReceived),
            'X-Pull-Id': String(pull_id),
            'X-Prompt-Id': String(pull.promptId),
            'X-Md5-Prompt': String(pull.md5Prompt),
            'X-Shuffled': String(pull.shuffled),
            'X-Block-Index': String(pull.blockIndex),
            'X-Position-In-Block': String(pull.positionInBlock),
            'X-Condition-Id': String(pull.conditionId),
        }
    });
};

// Marca un pull como fallido y libera su hueco del bloque para que la condición se vuelva a asignar
const markPullError = async (pull, errorMessage, extraFields = {}) => {
    try {
        await Pull.updateOne({ _id: pull._id }, {
            $set: {
                ...extraFields,
                status: 'error',
                slotActive: false,
                errorMessage,
                completedAt: new Date(),
            }
        });
    } catch (error) {
        console.error('[per_pull] No se pudo marcar el pull como fallido:', error.message);
    }
};

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

