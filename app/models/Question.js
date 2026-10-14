import mongoose from "mongoose";


//I add an id field to save a question id randomly generated to check if the question exists in the database (and not check it by the query)
const questionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    subTopic: {
        type: String,
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    choices: {
        type: Array,
        required: true,
    },
    answer: {
        type: Number,
        required: true,
    },
    explanation: {
        type: String,
        required: true,
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentAnswer: {
        type: Number,
        required: true,
    },
    correct: {
        type: Boolean,
        required: true,
    },
    studentReport: {
        type: Boolean,
        required: true,
    },
    llmModel: {
        type: String,
        required: true,
    },
    ABC_Testing: {
        type: Boolean,
        required: true,
    },
    md5Prompt: {
        type: String,
        required: false,
    },
    prompt: {
        type: String,
        required: true,
    },
    pull_id: {
        type: Number,
        required: false,
    },
    usageData: {
        prompt_tokens: { type: Number, required: false, default: 0 },
        completion_tokens: { type: Number, required: false, default: 0 },
        total_tokens: { type: Number, required: false, default: 0 },
        reasoning_tokens: { type: Number, required: false, default: 0 },
    },
    responseTime: {
        type: Number,
        required: false,
        default: 0,
    },
    studentResponseTime: {
        type: Number,
        required: false,
        default: 0,
    },
    modelId: {
        type: String,
        required: false,
    },
    modelConfig: {
        type: Object,
        required: false,
    },
    numQuestionsRequested: {
        type: Number,
        required: false,
    },
    numQuestionsReceived: {
        type: Number,
        required: false,
    },
    estimatedCost: {
        type: Number,
        required: false,
        default: 0,
    },
    // posición (desde 0) en que se mostró la pregunta dentro de su test (pull). Las preguntas no se
    // barajan, así que coincide con su índice en el array que devolvió el modelo
    order: {
        type: Number,
        required: false,
    },
    // Campos del modo de estudio per_pull (ver app/constants/abctesting.js). Opcionales:
    // las preguntas del modo antiguo no los tienen.
    // En este modo `prompt` guarda el promptId; el prompt final está en la colección pulls (por pull_id).
    promptId: {
        type: String,
        required: false,
    },
    // true si las opciones de ESTA pregunta se barajaron (false en pulls sin barajado o si malformed)
    shuffled: {
        type: Boolean,
        required: false,
    },
    // opciones e índice correcto en el orden devuelto por el modelo
    originalChoices: {
        type: Array,
        required: false,
        default: undefined,
    },
    originalAnswer: {
        type: Number,
        required: false,
    },
    // choices[i] === originalChoices[permutation[i]]
    permutation: {
        type: [Number],
        required: false,
        default: undefined,
    },
    // respuesta del estudiante en el orden del modelo: permutation[studentAnswer] (-1 si no respondió)
    studentAnswerOriginal: {
        type: Number,
        required: false,
    },
    // true si la pregunta no tenía 4 opciones o answer fuera de rango (no se barajó)
    malformed: {
        type: Boolean,
        required: false,
    },
    teacherReport: {
        type: String,
        required: false,
    },
    teacherComments:{
        type: Array,
        required: false,
    }

}, { timestamps: true }); // Habilitamos `createdAt` y `updatedAt`

export default mongoose.models.Question || mongoose.model('Question', questionSchema);