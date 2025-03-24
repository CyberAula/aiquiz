import dbConnect from '../utils/dbconnect.js';
import Question from '../models/Question.js';
import Student from '../models/Student.js';
import { subjects } from '../constants/subjects.js';
import { createHash } from 'crypto';
import chalk from 'chalk';

// console.log("--------------------------------------------------");
// console.log('[promptManager.js] Connecting to database...');
await dbConnect();
// console.log('[promptManager.js] Database connected successfully');
// console.log("--------------------------------------------------");

export async function fillPrompt(abcTestingConfig, has_abctesting, language, difficulty, topic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject) {

    //console.log("FILLPROMPT with variables received: ", abcTestingConfig, has_abctesting, language, difficulty, topic, numQuestions, studentEmail, existingStudent, studentSubjectData, subjectIndex, subject);

    // DEFINIMOS LAS VARIABLES NECESARIAS PARA RELLENAR EL PROMPT
    const num_prev_questions = await Question.countDocuments({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false });
    const neededQuestions = 10;
    const previousQuestions = await getPreviousQuestions(studentEmail, language, topic, neededQuestions);   

    // Obtenemos el comentario del tema corrigiendo el valor de topic de la URL
    // http://localhost:3000/aiquiz/quiz?language=Java&difficulty=intermedio&topic=declaraci%C3%B3n+de+variables&numQuestions=5&subject=PRG

    let subjectName = subjects[subject]?.name;
    let topicComment = subjects[subject]?.topics.find(t => t.label.toLowerCase() === language.toLowerCase())?.subtopics.find(sub => sub.title.toLowerCase() === topic.toLowerCase())?.comment || '';

    const variables = {
        subjectName,
        language,
        difficulty,
        topic,
        numQuestions,
        studentEmail,
        num_prev_questions,
        previousQuestions,
        comment: topicComment
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
            console.log("Student already answered " + num_prev_questions + " questions about " + topic + " in " + language);
            finalPrompt += `Anteriormente ya he respondido ${num_prev_questions} preguntas sobre "${topic}" enmarcadas en el tema "${language}". 
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
        Las preguntas deben ser sobre "${topic}" enmarcadas en el tema "${language}". `;
        
        //Si hay comentario extra sobre este tema tipo "ten en cuenta que esto lo he contado en clase así..." lo añadimos al prompt.
        if(topicComment) {
            finalPrompt += '"' + topicComment + '".';
        }

        console.log("--------------------------------------------------");
    }

    finalPrompt += `
    Devuelve tu respuesta completamente en forma de objeto JSON. 
    El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. 
    Cada pregunta del cuestionario debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta y por qué las otras opciones son incorrectas. 
    No incluya nada más que el JSON. 
    Las propiedades JSON de cada pregunta deben ser "query" (que es el enunciado de la pregunta), "choices", "answer" y "explanation". 
    Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. 
    La respuesta debe ser el número indexado a 0 de la opción correcta. 
    Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente. 
    Intenta no colocar siempre la respuesta correcta en la misma posición, vete intercalando entre las 4 opciones.`;

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
async function getPreviousQuestions(studentEmail, language, topic, numNeededQuestions) {
    const num_prev_questions_incorrect = await Question.countDocuments({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false, correct: false });
    //topic diferente al anterior (porque si no repite las preguntas)
    const num_prev_questions_only_lang_incorrect = await Question.countDocuments({ studentEmail: studentEmail, language: language, studentReport: false, correct: false, topic: { $ne: topic } });

    let previousQuestions = [];
    let numQuestionsStillToAdd = numNeededQuestions;

    //si tenemos suficientes incorrectas esas serán las que usemos
    if(num_prev_questions_incorrect >= numQuestionsStillToAdd) {
        //caso 1, no hace falta más, ya tenemos suficientes incorrectas
        previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false, correct: false }).limit(numNeededQuestions);
    } else {
        //añadimos las que tengamos incorrectas del tema y seguimos buscando incorrectas
        if(num_prev_questions_incorrect > 0) {
            previousQuestions = await Question.find({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false, correct: false });
            numQuestionsStillToAdd -= num_prev_questions_incorrect;
        }
        //añadimos las que tengamos incorrectas de otros temas
        if(num_prev_questions_only_lang_incorrect > 0) {
            previousQuestions = previousQuestions.concat(await Question.find({ studentEmail: studentEmail, language: language, studentReport: false, correct: false, topic: { $ne: topic } }).limit(numQuestionsStillToAdd));
            numQuestionsStillToAdd -= num_prev_questions_only_lang_incorrect;
        }
        //añadimos las que tengamos correctas del tema, si no hemos llegado al número deseado
        if(numQuestionsStillToAdd > 0) {
            previousQuestions = previousQuestions.concat(await Question.find({ studentEmail: studentEmail, language: language, topic: topic, studentReport: false }).limit(numQuestionsStillToAdd));            
        }        
    }

    //console.log("previousQuestions: ", previousQuestions);
    return previousQuestions;
}


function getPreviousQuestionPrompt(previousQuestion, order) {
    let prompt = '';
    if (previousQuestion.correct === true) {
        prompt = `Pregunta ${order}. El enunciado era "${previousQuestion.query}", las opciones "${getChoicesWithNumbers(previousQuestion.choices)}", la correcta era la opción ${previousQuestion.answer}, respondí correctamente con la opción ${previousQuestion.studentAnswer}. `;
    } else {
        prompt = `Pregunta ${order}. El enunciado era "${previousQuestion.query}", las opciones "${getChoicesWithNumbers(previousQuestion.choices)}", la correcta era la opción ${previousQuestion.answer}, respondí incorrectamente con la opción ${previousQuestion.studentAnswer}. `;
    }
    return prompt;
};

function getChoicesWithNumbers(choices) {
    let choicesWithNumbers = '';
    for (let i = 0; i < choices.length; i++) {
        choicesWithNumbers += `Opción ${i}: ${choices[i]}. `;
    }
    //we remove the last comma
    return choicesWithNumbers.slice(0, -2);
};



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

// Función que reemplaza las variables en un prompt dado un objeto de variables
function fillVariables(prompt, variables) {

    const result = prompt.replace(/{(\w+)}/g, (match, key) => {
        if (key === "previousQuestions") {
            let replacePreviousQuestions = "";
            if (variables.num_prev_questions > 3) {
                for (let i = 0; i < variables.previousQuestions.length; i++) {
                    replacePreviousQuestions += getPreviousQuestionPrompt(variables.previousQuestions[i], i+1);
                }            
            } else {
                console.log("Student has not answered enough questions yet, we cannot inform the IA about the track record");
            }
            return replacePreviousQuestions;
        } else if (variables[key] !== undefined) {
            //resto de variables se sustituyen por su valor
            return variables[key];
        } else {
            console.log(chalk.bgRedBright.black("--------------------------------------------------"));
            console.log(chalk.bgRedBright.black(`Variable "{key}" no reconocida en el prompt.`));
            console.log(chalk.bgRedBright.black("--------------------------------------------------"));
            return match; // Devuelve la variable sin reemplazar si no se encuentra en variables
        }
    });

    return result;
}

