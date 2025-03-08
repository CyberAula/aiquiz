export const ABC_Testing_List = {
    PRG: {
        from_date: "2024-01-01",
        to_date: "2026-12-31",
        models: ["OpenAI_GPT_4o_Mini"],
        prompt1: {
            content: "I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {topic} in the knowledge domain {language}. I have previously answered {num_prev_questions} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {comment}."
        },
        prompt2: {
            content: "You are a teacher and expert in the field on the topic {topic} in the knowledge domain {language}, you can generate very good multiple choice questions on the topic. I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {topic} in the knowledge domain {language}. I have previously answered {num_prev_questions_only_lang} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {coletilla}."
        },
        // prompt3: {
        //     content: "You are a teacher and expert in the field on the topic {topic} in the knowledge domain {domain}, you can generate very good multiple choice questions on the topic.I am a higher education student enrolled in the subject {subject}. Generate {number} multiple-choice questions on the topic {topic} in the knowledge domain {domain}. I have previously answered {number2} questions, which are provided here with their corresponding answers: {questions}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {rest}.",
        // }
    },

/*
 * Estructura de configuración para ABCTesting:
 *
 * Cada clave dentro de ABC_Testing_List representa una asignatura (por ejemplo, "PRG" o "CORE").
 * Para cada asignatura, se define un objeto con las siguientes propiedades:
 *
 * 1. from_date: (string) Fecha de inicio del ABCTesting en formato "YYYY-MM-DD".
 *    Indica desde cuándo estará activo el ABCTesting para esta asignatura.
 *
 * 2. to_date: (string) Fecha de finalización del ABCTesting en formato "YYYY-MM-DD".
 *    Indica hasta cuándo estará activo el ABCTesting para esta asignatura.
 *
 * 3. models: (array) Lista de nombres de modelos a utilizar en el ABCTesting.
 *    Estos nombres deben coincidir con los modelos definidos en el archivo `models.json`.
 *    Los modelos especificados aquí serán los únicos considerados al asignar un modelo
 *    a los alumnos de esta asignatura mientras el ABCTesting esté activo.
 *    ¡¡¡ IMPORTANTE !!! Si hay varios prompts definidos, es decir, se va a realizar un estudio
 *    entre estos, deberá definir un único modelo en el Array. En caso de haber varios definidos,
 *    el sistema asignará el primero de la lista.
 *
 * 4. prompt1, prompt2, ...: (objeto) Prompts personalizados para la generación de preguntas.
 *    - content: (string) Contenido del prompt con variables dinámicas entre `{}`.
 *    - id (opcional): Identificador único del prompt.
 *
 * Ejemplo:
 * {
 *   PRG: {
 *       from_date: "2024-01-01",
 *       to_date: "2026-12-31",
 *       models: ["OpenAI_GPT_4o_Mini", "Google_Generative_Flash"],
 *       prompt1: {
 *           content: "I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {topic} in the knowledge domain {language}. I have previously answered {num_prev_questions} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {coletilla}."
 *       },
 *       prompt2: {
 *           content: "You are a teacher and expert in the field on the topic {topic} in the knowledge domain {language}, you can generate very good multiple choice questions on the topic. I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {topic} in the knowledge domain {language}. I have previously answered {num_prev_questions_only_lang} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {coletilla}."
 *       }
 *   }
 * }
 *
 * Variables disponibles para los prompts:
 * - subject: (string) Nombre de la asignatura del estudiante.
 * - language: (string) Idioma en el que se deben generar las preguntas.
 * - difficulty: (string) Nivel de dificultad de las preguntas.
 * - topic: (string) Tema específico sobre el que se generan las preguntas.
 * - numQuestions: (number) Número total de preguntas a generar.
 * - studentEmail: (string) Correo electrónico del estudiante.
 * - num_prev_questions: (number) Número de preguntas previas respondidas por el estudiante.
 * - num_prev_questions_only_lang: (number) Número de preguntas previas filtradas por language.
 * - previousQuestionsTopic: (array) Preguntas previas respondidas sobre el mismo tema.
 * - previousQuestionsNotReported: (array) Preguntas previas no reportadas anteriormente.
 *
 * Notas:
 * - Las fechas deben ser válidas y estar en formato "YYYY-MM-DD".
 * - Los modelos deben estar previamente definidos en el archivo `models.json`.
 * - Los prompts pueden incluir variables dinámicas para personalizar la generación de preguntas.
 * - Asegúrate de mantener un formato consistente para evitar errores.
 */

};