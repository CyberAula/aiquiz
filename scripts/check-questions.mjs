// Script para revisar las preguntas en la base de datos
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

// Definir el esquema unificado directamente
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
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// Esquemas para Topic y Subtopic para hacer consultas
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

async function checkQuestions() {
    console.log('🔍 Revisando preguntas en la base de datos...\n');
    
    try {
        await dbConnect();

        // 1. Contar todas las preguntas
        const totalQuestions = await Question.countDocuments();
        console.log(`📊 Total de preguntas en BD: ${totalQuestions}\n`);

        // 2. Mostrar distribución por fuente
        const bySource = await Question.aggregate([
            { $group: { _id: "$source", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        console.log('📈 Distribución por fuente:');
        bySource.forEach(item => {
            console.log(`   ${item._id || 'undefined'}: ${item.count}`);
        });
        console.log();

        // 3. Mostrar preguntas generadas
        const generatedQuestions = await Question.find({ 
            generated: true 
        }).populate('topicRef').populate('subtopic').lean();

        console.log(`🤖 Preguntas generadas (${generatedQuestions.length}):`);
        for (const q of generatedQuestions) {
            console.log(`   ID: ${q.id || q._id}`);
            console.log(`   Texto: ${q.text?.substring(0, 50)}...`);
            console.log(`   Topic (string): ${q.topic}`);
            console.log(`   TopicRef (ObjectId): ${q.topicRef?._id} - ${q.topicRef?.title}`);
            console.log(`   Subtopic: ${q.subtopic?._id} - ${q.subtopic?.title}`);
            console.log(`   Source: ${q.source}`);
            console.log(`   Generated: ${q.generated}`);
            console.log(`   ---`);
        }
        console.log();

        // 4. Verificar topics y subtopics
        const topics = await Topic.find().lean();
        console.log(`🏷️  Topics disponibles (${topics.length}):`);
        for (const topic of topics) {
            console.log(`   ${topic._id}: ${topic.title}`);
            
            // Buscar subtopics de este topic
            const subtopics = await Subtopic.find({ topic: topic._id }).lean();
            console.log(`   └── Subtopics (${subtopics.length}):`);
            for (const subtopic of subtopics) {
                console.log(`       ${subtopic._id}: ${subtopic.title}`);
                
                // Buscar preguntas de este subtopic
                const questionsInSubtopic = await Question.countDocuments({ 
                    subtopic: subtopic._id 
                });
                if (questionsInSubtopic > 0) {
                    console.log(`           🎯 ${questionsInSubtopic} preguntas`);
                }
            }
        }
        console.log();

        // 5. Preguntas que deberían aparecer para un topic específico
        if (topics.length > 0) {
            const exampleTopic = topics[0];
            console.log(`🎯 Ejemplo: Preguntas que deberían aparecer para topic "${exampleTopic.title}" (${exampleTopic._id}):\n`);
            
            // Buscar subtopics de este topic
            const subtopicsIds = await Subtopic.find({ topic: exampleTopic._id }).distinct('_id');
            console.log(`   Subtopics encontrados: ${subtopicsIds.length}`);
            console.log(`   IDs: ${subtopicsIds.join(', ')}\n`);
            
            // Buscar preguntas directamente por topicRef
            const directQuestions = await Question.find({ topicRef: exampleTopic._id }).lean();
            console.log(`   Preguntas con topicRef: ${directQuestions.length}`);
            
            // Buscar preguntas por subtopic
            const subtopicQuestions = await Question.find({ 
                subtopic: { $in: subtopicsIds } 
            }).lean();
            console.log(`   Preguntas en subtopics: ${subtopicQuestions.length}`);
            
            // Buscar preguntas por topic string (quiz format)
            const topicStringQuestions = await Question.find({ 
                topic: exampleTopic._id.toString() 
            }).lean();
            console.log(`   Preguntas con topic string: ${topicStringQuestions.length}`);
            
            console.log(`   TOTAL que debería mostrar: ${directQuestions.length + subtopicQuestions.length + topicStringQuestions.length}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar
checkQuestions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });