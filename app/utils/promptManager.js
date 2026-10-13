import dbConnect from '../utils/dbconnect.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import { subjects } from '../constants/subjects.js';
import { createHash } from 'crypto';
import { difficultyLabel } from './studyDesign.js';
import chalk from 'chalk';
import { fillVariables, getPreviousQuestionPrompt, buildStudyPrompt, findSubtopic, classMaterialVariables, buildClassMaterialSection, JSON_FORMAT_BLOCK } from './promptText.js';

// console.log("--------------------------------------------------");
// console.log('[promptManager.js] Connecting to database...');
await dbConnect();
// console.log('[promptManager.js] Database connected successfully');
// console.log("--------------------------------------------------");

// options.promptTemplate: plantilla del modo de estudio "per_pull" ya elegida por el servidor para este pull.
// En ese modo no se consultan las preguntas anteriores del estudiante ni se toca su md5Prompt/prompt.
export async function fillPrompt(abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject, options = {}) {

    //console.log("FILLPROMPT with variables received: ", abcTestingConfig, has_abctesting, topic, difficulty, subTopic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject);

    // Obtenemos el material de clase (comment) y las indicaciones (focus) del subtema corrigiendo el valor de subTopic de la URL
    // http://localhost:3000/aiquiz/quiz?topic=Java&difficulty=intermedio&subTopic=declaraci%C3%B3n+de+variables&numQuestions=5&subject=PRG

    let subjectName = subjects[subject]?.name;
    const subtopicData = findSubtopic(subjects, subject, topic, subTopic);
    const topicComment = subtopicData?.comment || '';
    const topicFocus = subtopicData?.focus || '';

    // MODO DE ESTUDIO "per_pull": plantilla fija para este pull, sin historial de respuestas anteriores
    if (options.promptTemplate) {
        const studyPrompt = buildStudyPrompt(options.promptTemplate, {
            subjectName, topic, difficulty, subTopic, numQuestions, studentEmail, comment: topicComment, focus: topicFocus
        });

        existingStudent.subjects[subjectIndex].ABC_Testing = has_abctesting;
        await existingStudent.save();

        // options.studyCondition: { condition, blockIndex, positionInBlock } asignados a este pull (solo para el log)
        const { condition, blockIndex, positionInBlock } = options.studyCondition || {};
        console.log("--------------------------------------------------");
        console.log(chalk.bgMagenta.black(`[Condición per_pull] ${studentEmail} - ${subject} -> ${condition?.id} (prompt: ${condition?.promptId}, barajado: ${condition?.shuffled ? 'sí' : 'no'}) - bloque ${blockIndex}, posición ${positionInBlock} - dificultad: ${difficulty}`));
        console.log("[Prompt final per_pull] -> ", studyPrompt);
        console.log("--------------------------------------------------");

        return studyPrompt;
    }

    // DEFINIMOS LAS VARIABLES NECESARIAS PARA RELLENAR EL PROMPT
    const num_prev_questions = await Question.countDocuments({ studentEmail: studentEmail, topic: topic, subTopic: subTopic, studentReport: false });
    const neededQuestions = 10;
    const previousQuestions = await getPreviousQuestions(studentEmail, topic, subTopic, neededQuestions);   

    const variables = {
        subjectName,
        topic,
        difficulty: difficultyLabel(difficulty),
        subTopic,
        numQuestions,
        studentEmail,
        num_prev_questions,
        previousQuestions,
        // comment (material + indicaciones en un bloque), classMaterial y classMaterialInstructions
        ...classMaterialVariables(subTopic, topicComment, topicFocus)
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
    }

    // Comprobamos si hay algún prompt en la configuración
    let abcPromptTesting = arrayPrompts.length > 0;


    // Si esta activado el ABC_Testing en la asignatura y hay prompts en la configuración
    if (has_abctesting && abcPromptTesting) {

        // Caso 1: ABC_Testing de la asignatura es true
        if (studentSubjectData.ABC_Testing) {

            // Función para generar el hash MD5 de un string
            const hashMD5 = (str) => createHash('md5').update(str).digest('hex');
            // Crear un mapa hash -> prompt para encontrar el original fácilmente [clave, prompt]
            const promptMap = new Map(arrayPrompts.map(prompt => [hashMD5(prompt), prompt]));
            // Imprimir por consola los hashes generados
            // Imprimir por consola los hashes generados con mejor formato
            console.log(chalk.bgGreen.black(" ".repeat(50) + "Hashes de los prompts del ABCTesting" + " ".repeat(50)));
            console.log(chalk.bgGreen.black("-".repeat(136)));
            promptMap.forEach((hash, index) => {
                console.log(chalk.green.bold(` ${index}: `) + chalk.yellow(hash));
            });
            console.log(chalk.bgGreen.black("-".repeat(136)));

            // Caso 1.1: El estudiante ya tiene un prompt asignado
            if (studentSubjectData.md5Prompt) {
                // Caso 1.1.1: El prompt asignado está entre los prompts de la configuración
                if (promptMap.has(studentSubjectData.md5Prompt)) {
                    finalPrompt = promptMap.get(studentSubjectData.md5Prompt);
                } else {
                    // Caso 1.1.2: El prompt asignado no está entre los prompts de la configuración
                    // Asignar un prompt de forma equitativa
                    finalPrompt = await getEquitablePrompt(arrayPrompts, studentSubjectData.subjectName);
                }
            } else {
                // Caso 1.2: El estudiante no tiene un prompt asignado
                // Asignar un prompt de forma equitativa
                finalPrompt = await getEquitablePrompt(arrayPrompts, studentSubjectData.subjectName);
            }
        } else {
            // Caso 2: ABC_Testing de la asignatura es false
            // Asignar un prompt de forma equitativa y cambiar ABC_Testing a true
            finalPrompt = await getEquitablePrompt(arrayPrompts, studentSubjectData.subjectName);
        }

        // En caso de haber asignado un prompt de ABC_Testing:
        // Guardamos en el alumno el prompt asignado
        // Convertir el prompt a hash y asignarlo a la asignatura del estudiante
        const hashPrompt = createHash('md5').update(finalPrompt).digest('hex');
        existingStudent.subjects[subjectIndex].md5Prompt = hashPrompt;
        
        // Reemplazar las variables en el prompt para enviar al llm con el prompt final
        finalPrompt = fillVariables(finalPrompt, variables);

    } else {
        // En caso de no haber un ABC_Testing en la asignatura o no tener definidos unos prompts, 
        // asignamos el FINALPROMPT POR DEFECTO con las respuestas anteriores del estudiante.
        console.log("--------------------------------------------------");
        finalPrompt += `Soy un estudiante de una asignatura de universidad llamada "${subjectName}". Estoy repasando para el examen de la asignatura. Eres un profesor de la asignatura que hace muy buenas preguntas tipo test, con buenos distractores. `;

        if (num_prev_questions > 3) {
            console.log("Student already answered " + num_prev_questions + " questions about " + subTopic + " in " + topic);
            finalPrompt += `Anteriormente ya he respondido ${num_prev_questions} preguntas sobre "${subTopic}" enmarcadas en el tema "${topic}". 
            Usa esta información para generar preguntas adaptativas que me ayuden a reforzar mis puntos débiles y profundizar en los temas que ya domino. Ajusta dinámicamente el nivel de dificultad en función de mis respuestas anteriores, haciéndolo más difícil si estoy acertando y más fácil si estoy fallando.
            Estas son algunas de mis respuestas:
            `;

            for (let i = 0; i < previousQuestions.length; i++) {
                finalPrompt += getPreviousQuestionPrompt(previousQuestions[i], i+1);
            }
        } else {
            console.log("Student has not answered enough questions yet, we cannot inform the IA about the track record");
        }

        // Generación de preguntas
        finalPrompt += `
        Dame ${numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
        Las preguntas deben estar en un nivel ${difficulty} de dificultad. 
        Las preguntas deben ser sobre "${subTopic}" enmarcadas en el tema "${topic}". `;
        
        //Si hay material de clase o indicaciones del profesor sobre este subtema, los añadimos al prompt.
        const classMaterialSection = buildClassMaterialSection(subTopic, topicComment, topicFocus);
        if(classMaterialSection) {
            finalPrompt += '\n        ' + classMaterialSection;
        }

        console.log("--------------------------------------------------");
    }

    finalPrompt += JSON_FORMAT_BLOCK;

    // Guardamos el prompt final en la base de datos  

    existingStudent.subjects[subjectIndex].prompt = finalPrompt;
    existingStudent.subjects[subjectIndex].ABC_Testing = has_abctesting;

    await existingStudent.save();

    console.log("--------------------------------------------------");
    console.log("[Prompt final] -> ", finalPrompt);
    console.log("--------------------------------------------------");

    return finalPrompt;
};


//método un poco más "listo" que prima poner en previousQuestions las preguntas del mismo tema y si puede ser que haya respondido mal
//ya que eso informará a la IA de errores anteriores
//numNeededQuestions indica cuantas preguntas quiero que me devuelva este método
async function getPreviousQuestions(studentEmail, topic, subTopic, numNeededQuestions) {
    const num_prev_questions_incorrect = await Question.countDocuments({ studentEmail: studentEmail, topic: topic, subTopic: subTopic, studentReport: false, correct: false });
    //subTopic diferente al anterior (porque si no repite las preguntas)
    const num_prev_questions_only_lang_incorrect = await Question.countDocuments({ studentEmail: studentEmail, topic: topic, studentReport: false, correct: false, subTopic: { $ne: subTopic } });

    let previousQuestions = [];
    let numQuestionsStillToAdd = numNeededQuestions;

    //si tenemos suficientes incorrectas esas serán las que usemos
    if(num_prev_questions_incorrect >= numQuestionsStillToAdd) {
        //caso 1, no hace falta más, ya tenemos suficientes incorrectas
        previousQuestions = await Question.find({ studentEmail: studentEmail, topic: topic, subTopic: subTopic, studentReport: false, correct: false }).limit(numNeededQuestions);
    } else {
        //añadimos las que tengamos incorrectas del tema y seguimos buscando incorrectas
        if(num_prev_questions_incorrect > 0) {
            previousQuestions = await Question.find({ studentEmail: studentEmail, topic: topic, subTopic: subTopic, studentReport: false, correct: false });
            numQuestionsStillToAdd -= num_prev_questions_incorrect;
        }
        //añadimos las que tengamos incorrectas de otros temas
        if(num_prev_questions_only_lang_incorrect > 0) {
            previousQuestions = previousQuestions.concat(await Question.find({ studentEmail: studentEmail, topic: topic, studentReport: false, correct: false, subTopic: { $ne: subTopic } }).limit(numQuestionsStillToAdd));
            numQuestionsStillToAdd -= num_prev_questions_only_lang_incorrect;
        }
        //añadimos las que tengamos correctas del tema, si no hemos llegado al número deseado
        if(numQuestionsStillToAdd > 0) {
            previousQuestions = previousQuestions.concat(await Question.find({ studentEmail: studentEmail, topic: topic, subTopic: subTopic, studentReport: false }).limit(numQuestionsStillToAdd));            
        }        
    }

    //console.log("previousQuestions: ", previousQuestions);
    return previousQuestions;
}


// Función que selecciona el prompt con menor cantidad de asignaciones
const getEquitablePrompt = async (arrayPrompts, subjectName) => {
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
    const students = await Student.find({ "subjects.subjectName": subjectName });

    // Contamos cuántos estudiantes tienen cada hash asignado.
    students.forEach(student => {
        student.subjects.forEach(s => {
            if (s.subjectName === subjectName && s.md5Prompt) {
                if (counts.hasOwnProperty(s.md5Prompt)) {
                    counts[s.md5Prompt]++;
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
