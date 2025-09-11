// Script de migración para unificar Question y ManagerQuestion
import mongoose from 'mongoose';
import { createRequire } from 'module';

// Para usar require() en ES modules
const require = createRequire(import.meta.url);

// Configurar mongoose para ES modules
mongoose.set('strictQuery', false);

// Función para conectar a la base de datos (copiada de dbconnect.js)
async function dbConnect() {
    if (mongoose.connections[0].readyState) {
        console.log('Ya conectado a MongoDB');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aiquiz';
        await mongoose.connect(mongoUri);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

// Definir el esquema unificado directamente aquí
const ChoiceSchema = new mongoose.Schema({
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

const questionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: false,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["Opción múltiple", "Verdadero/Falso", "Respuesta corta", "Ensayo"],
        default: "Opción múltiple",
    },
    subject: {
        type: String,
        required: false,
    },
    language: {
        type: String,
        required: false,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["facil", "intermedio", "avanzado", "Fácil", "Medio", "Avanzado"],
    },
    topic: {
        type: String,
        required: false,
    },
    topicRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: false,
    },
    subtopic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subtopic",
        required: false,
    },
    choices: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    answer: {
        type: Number,
        required: false,
    },
    explanation: {
        type: String,
        required: false,
        trim: true,
    },
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
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

// Virtual para compatibilidad con formato quiz (query -> text)
questionSchema.virtual("query").get(function() {
    return this.text;
});

questionSchema.virtual("query").set(function(value) {
    this.text = value;
});

// Middleware para normalizar datos antes de guardar
questionSchema.pre('save', function(next) {
    const difficultyMap = {
        'facil': 'Fácil',
        'intermedio': 'Medio',
        'avanzado': 'Avanzado'
    };
    
    if (difficultyMap[this.difficulty]) {
        this.difficulty = difficultyMap[this.difficulty];
    }
    
    if (Array.isArray(this.choices) && this.choices.length > 0 && typeof this.choices[0] === 'string') {
        const answer = this.answer;
        this.choices = this.choices.map((choice, index) => ({
            text: choice,
            isCorrect: index === answer
        }));
    }
    
    if (!this.text && this.query) {
        this.text = this.query;
    }
    
    next();
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

async function migrateQuestions() {
    console.log('🔄 Iniciando migración de preguntas...');
    
    try {
        await dbConnect();
        console.log('✅ Conectado a la base de datos');

        // 1. Primero agregar campo source a todas las preguntas que no lo tengan
        console.log('🔄 Agregando campo source...');
        const sourceResult = await Question.updateMany(
            { source: { $exists: false } },
            { $set: { source: "quiz" } }
        );
        
        if (sourceResult.modifiedCount > 0) {
            console.log(`✅ Agregado campo source a ${sourceResult.modifiedCount} preguntas`);
        }

        // 2. Migrar campo query a text usando operación simple
        console.log('🔄 Migrando campo query a text...');
        const questionsToMigrate = await Question.find({ 
            query: { $exists: true },
            $or: [
                { text: { $exists: false } },
                { text: "" },
                { text: null }
            ]
        }).lean();

        let migratedCount = 0;
        for (const question of questionsToMigrate) {
            if (question.query) {
                await Question.updateOne(
                    { _id: question._id },
                    { $set: { text: question.query } }
                );
                migratedCount++;
            }
        }

        if (migratedCount > 0) {
            console.log(`✅ Migradas ${migratedCount} preguntas de 'query' a 'text'`);
        }

        // 3. Normalizar dificultades
        console.log('🔄 Normalizando dificultades...');
        const difficultyUpdates = [
            { from: 'facil', to: 'Fácil' },
            { from: 'intermedio', to: 'Medio' },
            { from: 'avanzado', to: 'Avanzado' }
        ];

        for (const update of difficultyUpdates) {
            const result = await Question.updateMany(
                { difficulty: update.from },
                { $set: { difficulty: update.to } }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ Normalizadas ${result.modifiedCount} preguntas de '${update.from}' a '${update.to}'`);
            }
        }

        // 4. Convertir choices de array simple a formato con isCorrect
        console.log('🔄 Convirtiendo formato de choices...');
        const questionsWithSimpleChoices = await Question.find({
            choices: { $exists: true, $type: 'array' },
            answer: { $exists: true }
        }).lean();

        let convertedChoices = 0;
        for (const question of questionsWithSimpleChoices) {
            if (question.choices.length > 0 && 
                typeof question.choices[0] === 'string') {
                
                const newChoices = question.choices.map((choice, index) => ({
                    text: choice,
                    isCorrect: index === question.answer
                }));
                
                await Question.updateOne(
                    { _id: question._id },
                    { $set: { choices: newChoices } }
                );
                convertedChoices++;
            }
        }

        if (convertedChoices > 0) {
            console.log(`✅ Convertidas ${convertedChoices} preguntas al nuevo formato de choices`);
        }


        // 5. Estadísticas finales
        console.log('\n📊 Estadísticas de migración:');
        const totalQuestions = await Question.countDocuments();
        const quizQuestions = await Question.countDocuments({ source: 'quiz' });
        const managerQuestions = await Question.countDocuments({ source: 'manager' });
        const generatedQuestions = await Question.countDocuments({ source: 'generated' });
        const verifiedQuestions = await Question.countDocuments({ verified: true });

        console.log(`   Total de preguntas: ${totalQuestions}`);
        console.log(`   Preguntas de quiz: ${quizQuestions}`);
        console.log(`   Preguntas de manager: ${managerQuestions}`);
        console.log(`   Preguntas generadas: ${generatedQuestions}`);
        console.log(`   Preguntas verificadas: ${verifiedQuestions}`);

        console.log('\n✅ Migración completada exitosamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar migración
migrateQuestions()
    .then(() => {
        console.log('🎉 Migración finalizada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en migración:', error);
        process.exit(1);
    });