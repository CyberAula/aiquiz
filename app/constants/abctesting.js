// --------------------------------------------------------------------------------------------
// Estudio 2 (BBDD): pistas superficiales en preguntas generadas por LLM.
// Ambas condiciones de prompt son idénticas salvo BLOQUE_LONGITUD.
// --------------------------------------------------------------------------------------------

// Bloque común a ambas condiciones
export const PROMPT_BASE = `Eres un profesor experto en '{topic}'. Tu objetivo es generar preguntas tipo test que ayuden al estudiante a repasar la materia. 
            La asignatura de universidad se llama '{subjectName}'.
            
            {classMaterial}
            
            Dame {numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
            Varía el formato de las preguntas: aproximadamente la mitad deben tener opciones cortas (de 1 a 6 palabras: un término, un comando, un valor o una expresión breve) y el resto opciones de una sola frase de como máximo 15 palabras.
            Las preguntas deben ser sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            Las preguntas deben tener un nivel de dificultad {difficulty}. 
            La dificultad debe venir del razonamiento que exige la pregunta (comprender, aplicar, distinguir conceptos próximos), no de la longitud ni de la complejidad de la redacción del enunciado o de las opciones.
            Cada opción debe ser autónoma y comprensible por sí sola: no incluyas opciones que hagan referencia a otras opciones (como "todas las anteriores", "ninguna de las anteriores", "ambas son correctas" o "la segunda y la tercera"), porque las opciones se mostrarán en orden aleatorio.
            `;

// Bloque exclusivo de la condición experimental
export const BLOQUE_LONGITUD = `
            Requisitos obligatorios para las 4 opciones de cada pregunta:
            - Las 4 opciones deben tener una longitud similar: el número de palabras de cada opción no debe diferir en más de 3 palabras del de las demás.
            - La respuesta correcta no debe ser la opción más larga, ni la más detallada, ni la única con matices o salvedades.
            - Para igualar longitudes, reformula de forma más concisa las opciones más largas, incluida la correcta si es necesario, sin que pierda precisión. Si alargas una opción, no superes la longitud máxima indicada.
            - Las 4 opciones deben tener la misma estructura gramatical, el mismo nivel de precisión técnica y usar la terminología propia del tema.
            Antes de devolver el resultado, revisa cada pregunta: si la respuesta correcta es la opción más larga, reescribe las opciones hasta que no lo sea.
            `;

// Cierre común: indicaciones sobre el material de clase y el focus del subtema (ver promptText.js)
export const PROMPT_TAIL = `{classMaterialInstructions}
            `;

export const ABC_Testing_List = {
    OFI: {
        from_date: "2024-01-01",
        to_date: "2027-12-31",
        models: ["OpenAI_GPT_5_Mini"],
        prompt1: {
            content: `Eres un Sistema de Evaluación Adaptativa experto en '{topic}'. Tu objetivo es generar preguntas personalizadas que aborden específicamente las dificultades de aprendizaje del estudiante, basándote en un análisis detallado de sus respuestas previas. 
            Soy un estudiante de una asignatura de universidad llamada '{subjectName}'. Estoy repasando para el examen de la asignatura. 
            
            Anteriormente ya he respondido {num_prev_questions} preguntas sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            Usa esta información para generar preguntas adaptativas que me ayuden a reforzar mis puntos débiles y profundizar en los temas que ya domino. 
            Ajusta dinámicamente el nivel de dificultad en función de mis respuestas anteriores, haciéndolo más difícil si estoy acertando y más fácil si estoy fallando. 
            Estas son algunas de mis respuestas anteriores: {previousQuestions}. 
            
            Dame {numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
            Las preguntas deben ser sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            {comment} 
            `        
        }
    },
    BBDD: {
        from_date: "2024-01-01",
        to_date: "2026-12-31",
        models: ["Google_Generative_Flash"],
        randomization: "per_pull",
        prompt1: {
            id: "control",
            content: PROMPT_BASE + PROMPT_TAIL
        },
        prompt2: {
            id: "longitud_equilibrada",
            content: PROMPT_BASE + BLOQUE_LONGITUD + PROMPT_TAIL
        },
        conditions: [
            { id: "control_orden_modelo", promptId: "control", shuffled: false },
            { id: "control_barajadas", promptId: "control", shuffled: true },
            { id: "longitud_equilibrada_orden_modelo", promptId: "longitud_equilibrada", shuffled: false },
            { id: "longitud_equilibrada_barajadas", promptId: "longitud_equilibrada", shuffled: true }
        ]
    },
    CORE: {
        from_date: "2024-01-01",
        to_date: "2026-12-31",
        models: ["OpenAI_GPT_5_Mini", "Google_Generative_Flash"],
        prompt1: {
            content: `Eres un Sistema de Evaluación Adaptativa experto en '{topic}'. Tu objetivo es generar preguntas personalizadas que aborden específicamente las dificultades de aprendizaje del estudiante, basándote en un análisis detallado de sus respuestas previas. 
            Soy un estudiante de una asignatura de universidad llamada '{subjectName}'. Estoy repasando para el examen de la asignatura. 
            
            Anteriormente ya he respondido {num_prev_questions} preguntas sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            Usa esta información para generar preguntas adaptativas que me ayuden a reforzar mis puntos débiles y profundizar en los temas que ya domino. 
            Ajusta dinámicamente el nivel de dificultad en función de mis respuestas anteriores, haciéndolo más difícil si estoy acertando y más fácil si estoy fallando. 
            Estas son algunas de mis respuestas anteriores: {previousQuestions}. 
            
            Dame {numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
            Las preguntas deben ser sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            {comment} 
            `        
        }
    },
    IWEB: {
        from_date: "2024-01-01",
        to_date: "2026-12-31",
        models: ["OpenAI_GPT_5_Mini", "Google_Generative_Flash"],
        prompt1: {
            content: `Eres un Sistema de Evaluación Adaptativa experto en '{topic}'. Tu objetivo es generar preguntas personalizadas que aborden específicamente las dificultades de aprendizaje del estudiante, basándote en un análisis detallado de sus respuestas previas. 
            Soy un estudiante de una asignatura de universidad llamada '{subjectName}'. Estoy repasando para el examen de la asignatura. 
            
            Anteriormente ya he respondido {num_prev_questions} preguntas sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            Usa esta información para generar preguntas adaptativas que me ayuden a reforzar mis puntos débiles y profundizar en los temas que ya domino. 
            Ajusta dinámicamente el nivel de dificultad en función de mis respuestas anteriores, haciéndolo más difícil si estoy acertando y más fácil si estoy fallando. 
            Estas son algunas de mis respuestas anteriores: {previousQuestions}. 
            
            Dame {numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
            Las preguntas deben ser sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            {comment} 
            `        
        }
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
     *    - id (opcional): Identificador único del prompt. Obligatorio en el modo "per_pull".
     *
     * 5. randomization (opcional): modo de asignación de condiciones.
     *    - Si no se define (modo por defecto), el prompt y el modelo se asignan una vez por
     *      estudiante y se mantienen en todos sus tests (se guardan en el documento Student).
     *    - "per_pull": la condición se asigna en CADA test (pull) en el servidor, con bloques
     *      permutados por (estudiante, asignatura): en cada bloque aparecen todas las condiciones
     *      una vez en orden aleatorio. Cada pull se registra en la colección `pulls` (modelo Pull)
     *      con su condición, bloque y posición. Un pull fallido (status "error") libera su hueco
     *      del bloque y la condición se vuelve a asignar. En este modo:
     *        · Se usa un único modelo: models[0] (definir solo uno).
     *        · No se calculan ni se pueden usar {previousQuestions} ni {num_prev_questions}.
     *        · No se usa el md5Prompt fijo del estudiante; el md5Prompt (MD5 de la plantilla),
     *          el pull_id y la condición viajan con cada pregunta.
     *        · En la colección questions, el campo `prompt` guarda el promptId; el prompt final
     *          rellenado se guarda en el documento Pull.
     *    Para desactivar el modo de estudio basta con quitar `randomization` (o la asignatura,
     *    o dejarla fuera de fechas).
     *
     * 6. conditions (obligatorio con randomization "per_pull"): lista de condiciones del diseño.
     *    - id: identificador único de la condición.
     *    - promptId: id del prompt (prompt1, prompt2...) que se envía al modelo.
     *    - shuffled: true si las opciones se barajan en el servidor antes de enviarlas al alumno.
     *    El tamaño del bloque es el número de condiciones.
     *
     * Ejemplo:
     * {
     *   PRG: {
     *       from_date: "2024-01-01",
     *       to_date: "2026-12-31",
     *       models: ["OpenAI_GPT_5_Mini", "Google_Generative_Flash"],
     *       prompt1: {
     *           content: "I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {subTopic} in the knowledge domain {topic}. I have previously answered {num_prev_questions} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {comment}."
     *       },
     *       prompt2: {
     *           content: "You are a teacher and expert in the field on the topic {subTopic} in the knowledge domain {topic}, you can generate very good multiple choice questions on the topic. I am a higher education student enrolled in the subject {subject}. Generate {numQuestions} multiple-choice questions on the topic {subTopic} in the knowledge domain {topic}. I have previously answered {num_prev_questions_only_lang} questions, which are provided here with their corresponding answers: {previousQuestionsTopic}. Use my previous answers to create new questions to help me dig deeper into the topic. Questions should have a difficulty level of {difficulty}. Make sure that each correct answer corresponds exactly to its respective question. {comment}."
     *       }
     *   }
     * }
     *
     * Variables disponibles para los prompts:
     * - subjectName: Nombre de la asignatura del estudiante.
     * - topic: tema en el que se deben generar las preguntas.
     * - difficulty: Nivel de dificultad elegido por el estudiante, en texto legible (fácil, intermedio, avanzado).
     * - subTopic: Tema específico sobre el que se generan las preguntas.
     * - numQuestions: Número total de preguntas a generar.
     * - studentEmail: Correo electrónico del estudiante.
     * - num_prev_questions: Número de preguntas previas respondidas por el estudiante.
     * - previousQuestions: Preguntas previas respondidas sobre el mismo tema con la opción que respondió el estudiante (sirve para hacerlo adaptado a su nivel).
     * - classMaterial: material explicado en clase sobre el subtema (campo `comment` del subtema en
     *   subjects.js), delimitado por <material_de_clase>...</material_de_clase> y con una frase que lo
     *   presenta. Va como contexto ANTES de la tarea. Vacío si el subtema no tiene material.
     * - classMaterialInstructions: indicaciones sobre cómo usar <material_de_clase> y, si existe, el
     *   `focus` del subtema (qué deben evaluar las preguntas). Va con las instrucciones de la tarea.
     *   Vacío si el subtema no tiene ni material ni focus.
     * - comment: classMaterial + classMaterialInstructions en un único bloque (para prompts con un solo
     *   hueco, como los de las asignaturas en modo antiguo).
     *   Ver buildClassMaterial / buildClassMaterialInstructions en app/utils/promptText.js.
     *
     * Notas:
     * - Las fechas deben ser válidas y estar en formato "YYYY-MM-DD".
     * - Los modelos deben estar previamente definidos en el archivo `models.json`.
     * - Los prompts pueden incluir variables dinámicas para personalizar la generación de preguntas.
     * - Asegúrate de mantener un formato consistente para evitar errores.
     */

};