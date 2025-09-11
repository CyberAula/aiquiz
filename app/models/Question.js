import mongoose from "mongoose";

const { Schema } = mongoose;

// Subdocumento para opciones de respuesta (formato manager)
const ChoiceSchema = new Schema({
    text: {
        type: String,
        required: [true, "El texto de la opción es obligatorio"],
        trim: true,
    },
    isCorrect: {
        type: Boolean,
        default: false,
    },
});

// Esquema unificado que combina Question y ManagerQuestion
const questionSchema = new Schema({
    // Campo ID numérico para compatibilidad con sistema quiz
    id: {
        type: Number,
        required: false, // Opcional para preguntas creadas en manager
    },
    
    // Texto de la pregunta (unificado: query/text)
    text: {
        type: String,
        required: true,
        trim: true,
    },
    
    // Tipo de pregunta (nuevo campo del manager)
    type: {
        type: String,
        enum: ["Opción múltiple", "Verdadero/Falso", "Respuesta corta", "Ensayo"],
        default: "Opción múltiple",
    },
    
    // Información del quiz original
    subject: {
        type: String,
        required: false, // Opcional para preguntas del manager
    },
    language: {
        type: String,
        required: false, // Opcional para preguntas del manager
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["facil", "intermedio", "avanzado", "Fácil", "Medio", "Avanzado"], // Ambos formatos
    },
    topic: {
        type: String,
        required: false, // String para quiz, ObjectId para manager
    },
    
    // Referencias del manager (nuevos campos)
    topicRef: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
        required: false,
    },
    subtopic: {
        type: Schema.Types.ObjectId,
        ref: "Subtopic",
        required: false,
    },
    
    // Opciones de respuesta - formato flexible
    choices: {
        type: Schema.Types.Mixed, // Puede ser Array (quiz) o [ChoiceSchema] (manager)
        required: true,
    },
    
    // Respuesta correcta
    answer: {
        type: Number, // Índice para formato quiz
        required: false,
    },
    
    // Explicación
    explanation: {
        type: String,
        required: false,
        trim: true,
    },
    
    // Datos del estudiante (formato quiz)
    studentEmail: {
        type: String,
        required: false,
    },
    studentAnswer: {
        type: Number,
        required: false,
    },
    studentReport: {
        type: Boolean,
        default: false,
    },
    
    // Información del modelo LLM
    llmModel: {
        type: String,
        required: false,
        trim: true,
    },
    ABC_Testing: {
        type: Boolean,
        default: false,
    },
    md5Prompt: {
        type: String,
        required: false,
    },
    prompt: {
        type: String,
        required: false,
    },
    generationPrompt: {
        type: String,
        required: false,
        trim: true,
    },
    
    // Gestión del manager (nuevos campos)
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    rejected: {
        type: Boolean,
        default: false,
    },
    generated: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: String,
        trim: true,
    }],
    
    // Estadísticas de uso (del manager)
    usageCount: {
        type: Number,
        default: 0,
    },
    correctAnswersCount: {
        type: Number,
        default: 0,
    },
    totalAnswersCount: {
        type: Number,
        default: 0,
    },
    
    // Campo para distinguir el origen
    source: {
        type: String,
        enum: ["quiz", "manager", "generated"],
        default: "quiz",
    },
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual para calcular la tasa de acierto
questionSchema.virtual("successRate").get(function() {
    if (this.totalAnswersCount === 0) return 0;
    return (this.correctAnswersCount / this.totalAnswersCount) * 100;
});

// Virtual para compatibilidad con formato quiz (query -> text)
questionSchema.virtual("query").get(function() {
    return this.text;
});

questionSchema.virtual("query").set(function(value) {
    this.text = value;
});

// Método para verificar la pregunta
questionSchema.methods.verify = async function(isValid) {
    this.verified = isValid;
    this.rejected = !isValid;
    await this.save();
    return this;
};

// Método para incrementar estadísticas de uso
questionSchema.methods.recordAnswer = async function(isCorrect) {
    this.usageCount += 1;
    this.totalAnswersCount += 1;
    if (isCorrect) {
        this.correctAnswersCount += 1;
    }
    await this.save();
    return this;
};

// Middleware para normalizar datos antes de guardar
questionSchema.pre('save', function(next) {
    // Normalizar dificultad
    const difficultyMap = {
        'facil': 'Fácil',
        'intermedio': 'Medio',
        'avanzado': 'Avanzado'
    };
    
    if (difficultyMap[this.difficulty]) {
        this.difficulty = difficultyMap[this.difficulty];
    }
    
    // Si es formato quiz con choices como array simple, convertir a formato manager
    if (Array.isArray(this.choices) && this.choices.length > 0 && typeof this.choices[0] === 'string') {
        const answer = this.answer;
        this.choices = this.choices.map((choice, index) => ({
            text: choice,
            isCorrect: index === answer
        }));
    }
    
    // Asegurar que el campo text esté poblado
    if (!this.text && this.query) {
        this.text = this.query;
    }
    
    next();
});

// Índices para optimizar búsquedas
questionSchema.index({ subject: 1 });
questionSchema.index({ topicRef: 1 });
questionSchema.index({ subtopic: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ type: 1 });
questionSchema.index({ verified: 1 });
questionSchema.index({ rejected: 1 });
questionSchema.index({ generated: 1 });
questionSchema.index({ source: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ studentEmail: 1 });
questionSchema.index({ text: "text", explanation: "text" });

// Método estático para migrar datos del formato antiguo
questionSchema.statics.migrateFromOldFormat = async function(oldQuestion) {
    // Convertir pregunta del formato quiz al unificado
    const newQuestion = {
        id: oldQuestion.id,
        text: oldQuestion.query,
        type: "Opción múltiple",
        subject: oldQuestion.subject,
        language: oldQuestion.language,
        difficulty: oldQuestion.difficulty,
        topic: oldQuestion.topic,
        choices: oldQuestion.choices,
        answer: oldQuestion.answer,
        explanation: oldQuestion.explanation,
        studentEmail: oldQuestion.studentEmail,
        studentAnswer: oldQuestion.studentAnswer,
        studentReport: oldQuestion.studentReport,
        llmModel: oldQuestion.llmModel,
        ABC_Testing: oldQuestion.ABC_Testing,
        md5Prompt: oldQuestion.md5Prompt,
        prompt: oldQuestion.prompt,
        source: "quiz",
        generated: true,
        verified: false,
        createdAt: oldQuestion.createdAt,
        updatedAt: oldQuestion.updatedAt
    };
    
    return new this(newQuestion);
};

export default mongoose.models.Question || mongoose.model('Question', questionSchema);

/* Ejemplos de uso:

// Formato quiz (compatibilidad hacia atrás):
{
    "id": 394823782738,
    "text": "¿Qué método se utiliza para ejecutar una función después de cierto tiempo en JavaScript?",
    "subject": "PRG",
    "language": "JavaScript", 
    "difficulty": "intermedio",
    "topic": "asincronía",
    "choices": ["setTimeout()", "wait()", "delay()", "executeAfter()"],
    "answer": 0,
    "explanation": "El método setTimeout()...",
    "studentEmail": "pepe@alumnos.upm.es",
    "studentAnswer": 0,
    "studentReport": false,
    "source": "quiz"
}

// Formato manager:
{
    "text": "¿Cuál es la diferencia entre let y var?",
    "type": "Opción múltiple",
    "difficulty": "Medio",
    "choices": [
        {"text": "let tiene scope de bloque", "isCorrect": true},
        {"text": "No hay diferencia", "isCorrect": false}
    ],
    "explanation": "let introduce scope de bloque...",
    "topicRef": ObjectId("..."),
    "subtopic": ObjectId("..."),
    "createdBy": ObjectId("..."),
    "verified": true,
    "generated": false,
    "source": "manager"
}

*/