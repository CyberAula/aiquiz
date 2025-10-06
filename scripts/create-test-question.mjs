// Script para crear una pregunta de prueba en el sistema
import mongoose from 'mongoose';

// Configurar mongoose para ES modules
mongoose.set('strictQuery', false);

// Función para conectar a la base de datos
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

// Definir el esquema unificado
const questionSchema = new mongoose.Schema({
    id: Number,
    text: String,
    type: String,
    subject: String,
    language: String,
    difficulty: String,
    topic: String,
    topicRef: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
    subtopic: { type: mongoose.Schema.Types.ObjectId, ref: "Subtopic" },
    choices: mongoose.Schema.Types.Mixed,
    answer: Number,
    explanation: String,
    studentEmail: String,
    generated: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    source: String,
    tags: [String],
    llmModel: String,
    generationPrompt: String,
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// Esquemas para Topic y Subtopic
const topicSchema = new mongoose.Schema({
    title: String,
    description: String,
}, { timestamps: true });

const subtopicSchema = new mongoose.Schema({
    title: String,
    description: String,
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
}, { timestamps: true });

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);
const Subtopic = mongoose.models.Subtopic || mongoose.model('Subtopic', subtopicSchema);

async function createTestQuestion() {
    console.log('🧪 Creando pregunta de prueba...\n');
    
    try {
        await dbConnect();

        // Buscar topic y subtopic existentes
        const topic = await Topic.findOne().lean();
        const subtopic = await Subtopic.findOne().lean();
        
        if (!topic || !subtopic) {
            console.log('❌ No se encontraron topic/subtopic en la BD');
            return;
        }
        
        console.log(`🎯 Topic encontrado: ${topic.title} (${topic._id})`);
        console.log(`📂 Subtopic encontrado: ${subtopic.title} (${subtopic._id})\n`);

        // Crear pregunta de prueba (simulando el formato de las preguntas generadas)
        const testQuestion = new Question({
            id: Math.floor(Math.random() * 1000000000),
            text: "¿Cuál es la capital de España?",
            type: "Opción múltiple",
            difficulty: "Fácil",
            choices: [
                { text: "Madrid", isCorrect: true },
                { text: "Barcelona", isCorrect: false },
                { text: "Valencia", isCorrect: false },
                { text: "Sevilla", isCorrect: false }
            ],
            answer: 0,
            explanation: "Madrid es la capital y ciudad más poblada de España.",
            
            // Referencias del manager
            topicRef: topic._id,
            subtopic: subtopic._id,
            topic: topic.title, // String para compatibilidad
            
            // Metadatos de generación
            generated: true,
            llmModel: "test-model",
            generationPrompt: "Genera una pregunta sobre geografía española",
            verified: false,
            tags: [topic.title, 'auto-generated', 'test'],
            source: "generated"
        });

        await testQuestion.save();
        console.log(`✅ Pregunta de prueba creada: ${testQuestion._id}\n`);

        // Verificar que se puede encontrar con las nuevas consultas
        console.log('🔍 Verificando consultas del API...\n');

        // 1. Consulta directa por subtopic
        const bySubtopic = await Question.find({ subtopic: subtopic._id });
        console.log(`📝 Preguntas por subtopic: ${bySubtopic.length}`);

        // 2. Consulta por topicRef
        const byTopicRef = await Question.find({ topicRef: topic._id });
        console.log(`📝 Preguntas por topicRef: ${byTopicRef.length}`);

        // 3. Consulta combinada (como el API)
        const combined = await Question.find({
            $or: [
                { topicRef: topic._id },
                { topic: topic._id },
                { topic: topic._id.toString() },
                { subtopic: subtopic._id }
            ]
        });
        console.log(`📝 Preguntas consulta combinada: ${combined.length}`);

        // 4. Preguntas generadas
        const generated = await Question.find({ generated: true });
        console.log(`🤖 Preguntas generadas: ${generated.length}`);

        console.log('\n🎉 Pregunta de prueba creada y verificada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar
createTestQuestion()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });