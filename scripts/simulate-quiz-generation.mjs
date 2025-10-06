// Script para simular la generación de preguntas del quiz
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

// Simular la función saveQuestionsToManager del API de questions
async function saveQuestionsToManager(formattedResponse, assignedModel, prompt, subtopicId, topicName, difficulty) {
    try {
        console.log("🔄 Guardando preguntas generadas en modelo unificado");
        
        // Parsear la respuesta JSON
        const questionsData = JSON.parse(formattedResponse);
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
            throw new Error("Formato de respuesta inválido");
        }

        // Buscar el subtopic para obtener el topic
        const subtopic = await Subtopic.findById(subtopicId).populate('topic');
        if (!subtopic) {
            throw new Error(`Subtopic no encontrado: ${subtopicId}`);
        }

        const topicId = subtopic.topic._id;

        // Convertir y guardar cada pregunta usando el modelo unificado
        const unifiedQuestions = questionsData.questions.map(q => {
            return {
                // Generar ID numérico para compatibilidad con quiz
                id: Math.floor(Math.random() * 1000000000),
                text: q.query,
                type: "Opción múltiple",
                difficulty: difficulty, // Se normalizará automáticamente en el middleware
                choices: q.choices, // Array simple, se convertirá automáticamente
                answer: q.answer,
                explanation: q.explanation || '',
                
                // Referencias del manager
                topicRef: topicId,
                subtopic: subtopicId,
                topic: topicName, // String para compatibilidad
                
                // Metadatos de generación
                generated: true,
                llmModel: assignedModel,
                generationPrompt: prompt.substring(0, 500) + '...',
                verified: false,
                tags: [topicName, 'auto-generated'],
                source: "generated"
            };
        });

        // Guardar en la base de datos usando el modelo unificado
        const savedQuestions = await Question.insertMany(unifiedQuestions);
        
        console.log(`✅ ${savedQuestions.length} preguntas guardadas en modelo unificado para topic ${topicId}`);
        
        return savedQuestions;
        
    } catch (error) {
        console.error("❌ Error en saveQuestionsToManager:", error.message);
        throw error;
    }
}

async function simulateQuizGeneration() {
    console.log('🎯 Simulando generación de quiz...\n');
    
    try {
        await dbConnect();

        // Buscar topic y subtopic existentes
        const topic = await Topic.findOne().lean();
        const subtopic = await Subtopic.findOne().lean();
        
        if (!topic || !subtopic) {
            console.log('❌ No se encontraron topic/subtopic en la BD');
            return;
        }
        
        console.log(`🎯 Topic: ${topic.title} (${topic._id})`);
        console.log(`📂 Subtopic: ${subtopic.title} (${subtopic._id})\n`);

        // Simular respuesta del LLM (como viene del API /questions)
        const mockLLMResponse = JSON.stringify({
            questions: [
                {
                    query: "¿Qué es JavaScript?",
                    choices: [
                        "Un lenguaje de programación",
                        "Un framework",
                        "Un editor de texto",
                        "Un sistema operativo"
                    ],
                    answer: 0,
                    explanation: "JavaScript es un lenguaje de programación interpretado, usado principalmente para desarrollo web."
                },
                {
                    query: "¿Cuál es la diferencia entre let y var?",
                    choices: [
                        "No hay diferencia",
                        "let tiene scope de bloque",
                        "var es más rápido",
                        "let es obsoleto"
                    ],
                    answer: 1,
                    explanation: "let introduce scope de bloque, mientras que var tiene scope de función."
                }
            ]
        });

        // Simular parámetros del quiz
        const assignedModel = "gpt-3.5-turbo";
        const finalPrompt = "Genera preguntas sobre JavaScript para nivel intermedio";
        const difficulty = "intermedio";
        const topicName = topic.title;

        console.log(`🤖 Simulando generación con modelo: ${assignedModel}`);
        console.log(`📚 Dificultad: ${difficulty}`);
        console.log(`🎲 Preguntas simuladas: 2\n`);

        // Llamar a la función de guardado (como lo hace el API)
        const savedQuestions = await saveQuestionsToManager(
            mockLLMResponse,
            assignedModel,
            finalPrompt,
            subtopic._id,
            topicName,
            difficulty
        );

        console.log(`\n🎉 Simulación exitosa! Se guardaron ${savedQuestions.length} preguntas\n`);

        // Verificar que las preguntas se pueden encontrar
        console.log('🔍 Verificando que las preguntas aparecen en consultas del manager...\n');

        // Simular la consulta del API del manager
        const subtopics = await Subtopic.find({ topic: topic._id }).lean();
        const subtopicIds = subtopics.map(st => st._id);
        
        const filters = { 
            $or: [
                { topicRef: topic._id },              
                { topic: topic._id },                 
                { topic: topic._id.toString() },      
                { subtopic: { $in: subtopicIds } }    
            ]
        };

        const foundQuestions = await Question.find(filters);
        console.log(`📊 Total preguntas encontradas para el topic: ${foundQuestions.length}`);
        
        const generatedQuestions = foundQuestions.filter(q => q.generated);
        console.log(`🤖 Preguntas generadas: ${generatedQuestions.length}`);
        
        const verifiedQuestions = foundQuestions.filter(q => q.verified);
        console.log(`✅ Preguntas verificadas: ${verifiedQuestions.length}`);
        
        console.log('\n📝 Últimas preguntas generadas:');
        generatedQuestions.slice(-2).forEach((q, i) => {
            console.log(`   ${i+1}. ${q.text.substring(0, 50)}...`);
            console.log(`      Dificultad: ${q.difficulty}, Verificada: ${q.verified}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar
simulateQuizGeneration()
    .then(() => {
        console.log('\n🎉 Simulación completada exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });