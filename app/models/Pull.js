import mongoose from "mongoose";

// Registro de cada petición de generación de preguntas (pull) en las asignaturas con
// ABCTesting en modo "per_pull" (ver app/constants/abctesting.js).
// Se crea en estado "pending" ANTES de llamar al LLM y se actualiza al terminar.
const pullSchema = new mongoose.Schema({
    pull_id: { type: Number, required: true, index: true },
    studentEmail: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: false },
    subTopic: { type: String, required: false },
    difficulty: { type: String, required: false },          // valor original: facil / intermedio / avanzado
    numQuestionsRequested: { type: Number, required: false },

    // Condición asignada
    conditionId: { type: String, required: true },
    promptId: { type: String, required: true },
    md5Prompt: { type: String, required: true },             // MD5 de la plantilla (sin rellenar)
    prompt: { type: String, required: true },                // prompt final rellenado enviado al modelo
    shuffled: { type: Boolean, required: true },
    blockIndex: { type: Number, required: true },
    positionInBlock: { type: Number, required: true },
    // true mientras el pull ocupa su hueco en el bloque (pending u ok); false si falla, para reasignarlo
    slotActive: { type: Boolean, required: true, default: true },

    // Modelo
    llmModel: { type: String, required: true },             // nombre en models.json
    modelId: { type: String, required: false },             // id del modelo en el proveedor

    // Resultado
    status: { type: String, enum: ['pending', 'ok', 'error'], required: true, default: 'pending' },
    errorMessage: { type: String, required: false },
    finishReason: { type: String, required: false },
    truncated: { type: Boolean, required: false },
    numQuestionsReceived: { type: Number, required: false },
    numMalformed: { type: Number, required: false },
    usageData: {
        prompt_tokens: { type: Number, required: false, default: 0 },
        completion_tokens: { type: Number, required: false, default: 0 },
        total_tokens: { type: Number, required: false, default: 0 },
        reasoning_tokens: { type: Number, required: false, default: 0 },
    },
    responseTime: { type: Number, required: false },
    rawResponse: { type: String, required: false },         // solo si el JSON del modelo no se pudo parsear
    completedAt: { type: Date, required: false },
}, { timestamps: true }); // createdAt / updatedAt

// Un hueco (bloque, posición) solo puede estar ocupado por un pull activo por estudiante y asignatura.
// Evita que dos peticiones simultáneas (dos pestañas) reciban el mismo hueco.
pullSchema.index(
    { studentEmail: 1, subject: 1, blockIndex: 1, positionInBlock: 1 },
    { unique: true, partialFilterExpression: { slotActive: true } }
);

export default mongoose.models.Pull || mongoose.model('Pull', pullSchema);
