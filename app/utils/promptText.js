import chalk from 'chalk';
import { difficultyLabel } from './studyDesign.js';

// Funciones puras de construcción de prompts (sin acceso a base de datos),
// para poder usarlas desde promptManager.js, los tests y los scripts.

// Bloque de formato JSON que se añade al final de todos los prompts
export const JSON_FORMAT_BLOCK = `
    Devuelve tu respuesta completamente en forma de objeto JSON. 
    El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. 
    Cada pregunta del cuestionario debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta y por qué las otras opciones son incorrectas. 
    No incluya nada más que el JSON. 
    Las propiedades JSON de cada pregunta deben ser "query" (que es el enunciado de la pregunta), "choices", "answer" y "explanation". 
    Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. 
    La respuesta debe ser el número indexado a 0 de la opción correcta. 
    Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente. 
    Intenta no colocar siempre la respuesta correcta en la misma posición, vete intercalando entre las 4 opciones.`;


export function getPreviousQuestionPrompt(previousQuestion, order) {
    let prompt = '';
    if (previousQuestion.correct === true) {
        prompt = `Pregunta ${order}. El enunciado era "${previousQuestion.query}", las opciones "${getChoicesWithNumbers(previousQuestion.choices)}", la correcta era la opción ${previousQuestion.answer}, respondí correctamente con la opción ${previousQuestion.studentAnswer}. `;
    } else {
        prompt = `Pregunta ${order}. El enunciado era "${previousQuestion.query}", las opciones "${getChoicesWithNumbers(previousQuestion.choices)}", la correcta era la opción ${previousQuestion.answer}, respondí incorrectamente con la opción ${previousQuestion.studentAnswer}. `;
    }
    return prompt;
};

export function getChoicesWithNumbers(choices) {
    let choicesWithNumbers = '';
    for (let i = 0; i < choices.length; i++) {
        choicesWithNumbers += `Opción ${i}: ${choices[i]}. `;
    }
    //we remove the last comma
    return choicesWithNumbers.slice(0, -2);
};

// Prompt final del modo de estudio "per_pull": plantilla con las variables sustituidas + bloque JSON.
// No usa {previousQuestions} ni {num_prev_questions}; la dificultad se envía en texto legible.
export function buildStudyPrompt(template, { subjectName, topic, difficulty, subTopic, numQuestions, studentEmail, comment }) {
    const variables = {
        subjectName,
        topic,
        difficulty: difficultyLabel(difficulty),
        subTopic,
        numQuestions,
        studentEmail,
        comment: comment || '',
    };
    return fillVariables(template, variables) + JSON_FORMAT_BLOCK;
}

// Función que reemplaza las variables en un prompt dado un objeto de variables
export function fillVariables(prompt, variables) {

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
            console.log(chalk.bgRedBright.black(`Variable "${key}" no reconocida en el prompt.`));
            console.log(chalk.bgRedBright.black("--------------------------------------------------"));
            return match; // Devuelve la variable sin reemplazar si no se encuentra en variables
        }
    });

    return result;
}
