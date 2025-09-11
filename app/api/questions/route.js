import logger from "@utils/logger.js";
import { getModelResponse } from "@utils/llmManager.js";
import { fillPrompt } from "@utils/promptManager.js";
import { ABC_Testing_List } from "@app/constants/abctesting.js";
import { assignAIModel } from "@utils/modelManager.js";
// Importaciones para RAG unificado (mismo sistema que profesores)
let RAGManagerV2, MockRAGManager;

import dbConnect from "@utils/dbconnect.js";
import Student from "@app/models/Student.js";
import Question from "@app/models/Question.js";
import Topic from "@app/manager/models/Topic.js";
import Subtopic from "@app/manager/models/Subtopic.js";

// Logger específico para questions
const questionsLogger = logger.create('Questions');

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Generate quiz questions
 *     description: Generates quiz questions based on the provided parameters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - language
 *               - difficulty
 *               - topic
 *               - numQuestions
 *               - studentEmail
 *               - subject
 *             properties:
 *               language:
 *                 type: string
 *                 description: Language for the questions
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level (facil, intermedio, avanzado)
 *               topic:
 *                 type: string
 *                 description: Topic for the questions
 *               numQuestions:
 *                 type: number
 *                 description: Number of questions to generate
 *               studentEmail:
 *                 type: string
 *                 description: Email of the student
 *               subject:
 *                 type: string
 *                 description: Subject code (PRG, CORE, etc.)
 *               subtopicId:
 *                 type: string
 *                 description: Optional ID of the subtopic for RAG context
 *     responses:
 *       200:
 *         description: Successfully generated questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       query:
 *                         type: string
 *                         description: The question text
 *                       choices:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of possible answers
 *                       answer:
 *                         type: number
 *                         description: Index of the correct answer
 *                       explanation:
 *                         type: string
 *                         description: Explanation of the correct answer
 *       500:
 *         description: Server error
 */

// console.log("--------------------------------------------------");
// console.log('[questions/route.js] Connecting to database...');
await dbConnect();
// console.log('[questions/route.js] Database connected successfully');
// console.log("--------------------------------------------------");

// Manejar las solicitudes HTTP POST
export async function POST(request) {
	let language, difficulty, topic, numQuestions, studentEmail, subject, subtopicId;
	
	try {
		const requestData = await request.json();
		language = requestData.language;
		difficulty = requestData.difficulty;
		topic = requestData.topic;
		numQuestions = requestData.numQuestions;
		studentEmail = requestData.studentEmail;
		subject = requestData.subject;
		subtopicId = requestData.subtopicId;

		// DEBUG: Log para verificar el número de preguntas recibido
		console.log("[DEBUG] Parámetros recibidos en /api/questions:");
		console.log("  numQuestions:", numQuestions, "tipo:", typeof numQuestions);
		console.log("  topic:", topic);
		console.log("  difficulty:", difficulty);
		console.log("  studentEmail:", studentEmail);
		console.log("  subject:", subject);

		// Cargamos variables y objetos de configuración

		// Comprobamos si el ABCTesting está activo para la asignatura
		let abcTestingConfig = ABC_Testing_List[subject];
		let has_abctesting =
			(abcTestingConfig && isABCTestingActive(abcTestingConfig)) ?? false;

		// Comprobaos si existe el alumno en la base de datos,
		// si existe pero no tiene la asignatura, la añadimos,
		// si no existe, lo creamos y se devuelve el objeto del alumno
		let existingStudent = await getAndEnsureStudentAndSubject(
			studentEmail,
			subject,
			has_abctesting
		);

		let studentSubjectData = await existingStudent?.subjects?.find(
			(s) => s.subjectName === subject
		);
		let subjectIndex = await existingStudent?.subjects?.findIndex(
			(s) => s.subjectName === subject
		);

		// SOLICITUD A LA API de promptManager para obtener el prompt final
		let finalPrompt = await fillPrompt(
			abcTestingConfig,
			has_abctesting,
			language,
			difficulty,
			topic,
			numQuestions,
			studentEmail,
			existingStudent,
			studentSubjectData,
			subjectIndex
		);

		// 🔍 INTEGRACIÓN RAG UNIFICADA: Usar el mismo sistema que los profesores
		questionsLogger.progress("Iniciando búsqueda RAG unificada", { subtopicId, topic });
		const ragManager = await initializeUnifiedRAG();
		let ragContent = { hasContent: false, content: '', stats: {} };
		
		if (ragManager && subtopicId) {
			ragContent = await searchUnifiedRAGContent(
				ragManager,
				topic,
				null, // No tenemos subtopic title desde estudiantes
				null, // No tenemos topicId desde estudiantes  
				subtopicId
			);
			
			questionsLogger.info('Búsqueda RAG unificada completada:', {
				hasContent: ragContent.hasContent,
				contentLength: ragContent.stats.contentLength,
				chunksFound: ragContent.stats.totalFound
			});
		}

		if (ragContent.hasContent) {
			questionsLogger.success(`Contexto RAG unificado obtenido: ${ragContent.stats.contentLength} caracteres`);
			finalPrompt = enhancePromptWithUnifiedRAG(finalPrompt, ragContent.content);
			questionsLogger.info("Prompt enriquecido con RAG unificado");
		} else {
			questionsLogger.warn("No se encontró contexto en RAG unificado, usando generación estándar");
		}

		// SOLICITUD A LA API de modelManager para asignar un modelo de LLM al alumno
		const assignedModel = await assignAIModel(
			abcTestingConfig,
			has_abctesting,
			existingStudent,
			studentSubjectData,
			subjectIndex
		);

		// Log de asignación de modelo
		questionsLogger.separator("ASIGNACIÓN DE MODELO");
		questionsLogger.info(`Modelo asignado: ${assignedModel}`, {
			student: studentEmail,
			subject: subject,
			abcTesting: has_abctesting
		});

		// SOLICITUD A LA API del LLM seleccionado para el alumno
		questionsLogger.debug(`Enviando prompt al modelo ${assignedModel}`);
		let responseLlmManager;
		try {
			responseLlmManager = await getModelResponse(
				assignedModel,
				finalPrompt
			);
			questionsLogger.success(`Respuesta recibida del modelo ${assignedModel}`);
		} catch (llmError) {
			questionsLogger.error(`Error en getModelResponse para ${assignedModel}:`, {
				message: llmError.message,
				status: llmError.status,
				code: llmError.code
			});
			console.error("[LLM Manager Error]:", llmError);
			
			// Determinar el tipo de error y devolver respuesta apropiada al usuario
			let errorMessage = "Error generando preguntas";
			let errorDetails = "Error desconocido del sistema";
			
			if (llmError.status === 401) {
				errorMessage = "Error de autenticación";
				errorDetails = "Hay un problema con la configuración de las claves de API. Por favor, contacta al administrador del sistema.";
			} else if (llmError.status === 429) {
				errorMessage = "Límite de uso excedido";
				errorDetails = "Se ha alcanzado el límite de uso de la API. Por favor, inténtalo más tarde.";
			} else if (llmError.status === 500) {
				errorMessage = "Error del servidor de IA";
				errorDetails = "El servicio de inteligencia artificial está temporalmente no disponible. Por favor, inténtalo más tarde.";
			} else if (llmError.code === 'invalid_api_key') {
				errorMessage = "Configuración de API incorrecta";
				errorDetails = "Las claves de API están mal configuradas. Por favor, contacta al administrador del sistema.";
			} else if (llmError.message?.includes('timeout')) {
				errorMessage = "Tiempo de espera agotado";
				errorDetails = "La generación de preguntas está tardando más de lo esperado. Por favor, inténtalo nuevamente.";
			} else {
				errorDetails = llmError.message || "Error interno del sistema";
			}
			
			return new Response(JSON.stringify({
				error: errorMessage,
				message: errorDetails,
				code: llmError.code || 'unknown_error',
				status: llmError.status || 500,
				timestamp: new Date().toISOString(),
				// Información adicional para debugging (solo en desarrollo)
				...(process.env.NODE_ENV === 'development' && {
					debug: {
						model: assignedModel,
						originalError: llmError.message,
						student: studentEmail,
						subject: subject
					}
				})
			}), { 
				status: llmError.status || 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		// Si llegamos aquí, el LLM respondió pero puede ser una respuesta corrupta
		questionsLogger.debug("Validando respuesta del LLM", {
			hasResponse: !!responseLlmManager,
			responseType: typeof responseLlmManager,
			responseLength: responseLlmManager?.length || 0,
			responsePreview: responseLlmManager?.substring?.(0, 100) + '...' || 'No preview available'
		});
		
		// Validar que recibimos una respuesta válida del LLM
		if (!responseLlmManager || typeof responseLlmManager !== 'string') {
			questionsLogger.error("Respuesta del LLM es inválida o vacía");
			return new Response(JSON.stringify({
				error: "Error en la respuesta del modelo de IA",
				message: "El modelo de inteligencia artificial no devolvió una respuesta válida. Por favor, inténtalo nuevamente.",
				code: 'invalid_llm_response',
				status: 500,
				timestamp: new Date().toISOString()
			}), { 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		// Formatear la respuesta de la API
		const formattedResponse = responseLlmManager
			.replace(/^\[|\]$/g, "")
			.replace(/```json/g, "")
			.replace(/```/g, "")
			.trim();
		
		// Validar que la respuesta formateada no esté vacía
		if (!formattedResponse) {
			questionsLogger.error("Respuesta formateada del LLM está vacía");
			return new Response(JSON.stringify({
				error: "Respuesta vacía del modelo de IA",
				message: "El modelo de inteligencia artificial devolvió una respuesta vacía. Por favor, inténtalo nuevamente.",
				code: 'empty_llm_response',
				status: 500,
				timestamp: new Date().toISOString()
			}), { 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		// Intentar parsear como JSON para validar la estructura
		try {
			const parsedResponse = JSON.parse(formattedResponse);
			if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions) || parsedResponse.questions.length === 0) {
				throw new Error("Formato de preguntas inválido");
			}
			questionsLogger.success(`Respuesta del LLM válida: ${parsedResponse.questions.length} preguntas generadas`);
		} catch (parseError) {
			questionsLogger.error("Error parseando respuesta del LLM:", {
				error: parseError.message,
				response: formattedResponse.substring(0, 200) + '...'
			});
			return new Response(JSON.stringify({
				error: "Formato de respuesta inválido",
				message: "El modelo de IA devolvió una respuesta en formato incorrecto. Por favor, inténtalo nuevamente.",
				code: 'invalid_json_format',
				status: 500,
				timestamp: new Date().toISOString(),
				...(process.env.NODE_ENV === 'development' && {
					debug: {
						parseError: parseError.message,
						responsePreview: formattedResponse.substring(0, 200)
					}
				})
			}), { 
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Guardar preguntas generadas en el manager si tenemos subtopicId
		if (subtopicId) {
			try {
				await saveQuestionsToManager(formattedResponse, assignedModel, finalPrompt, subtopicId, topic, difficulty);
			} catch (saveError) {
				questionsLogger.warn("Error guardando preguntas en manager:", saveError.message);
				// No fallar la respuesta principal por un error de guardado
			}
		}

		questionsLogger.success("Devolviendo respuesta exitosa al cliente", {
			responseLength: formattedResponse.length,
			responsePreview: formattedResponse.substring(0, 100) + '...'
		});
		
		return new Response(formattedResponse);
	} catch (error) {
		questionsLogger.error("Error general en POST /api/questions:", {
			message: error.message,
			stack: error.stack,
			status: error.status,
			code: error.code
		});
		console.error("[Questions API Error]:", {
			error: error.message,
			stack: error.stack,
			params: { language, difficulty, topic, numQuestions, subject, studentEmail }
		});
		return new Response(JSON.stringify({
			error: "Error generating questions",
			message: error.message,
			details: error.status ? `Status: ${error.status}` : "Unknown error"
		}), { 
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

// Verificamos si el ABCTesting está activo según las fechas
const isABCTestingActive = (config) => {
	const currentDate = new Date();
	const fromDate = new Date(config.from_date);
	const toDate = new Date(config.to_date);
	const isactive = currentDate >= fromDate && currentDate <= toDate;
	if (!isactive) {
		console.log("--------------------------------------------------------");
		console.log(
			`ABCTesting fuera de fecha. Modificar o eliminar del archivo de configuración abctesting.js`
		);
		console.log("--------------------------------------------------------");
	}
	return isactive;
};

// Comprobamos si el alumno existe, si no tiene la asignatura la añade, si no existe lo crea
const getAndEnsureStudentAndSubject = async (
	studentEmail,
	subject,
	has_abctesting
) => {
	try {
		let student = await Student.findOne({ studentEmail });

		if (!student || student === null) {
			// Si el estudiante no existe, lo creamos con la asignatura
			student = new Student({
				studentEmail,
				subjects: [
					{
						subjectName: subject,
						subjectModel: "Nuevo estudiante",
						ABC_Testing: has_abctesting,
						survey: false,
						md5Prompt: null,
						prompt: null,
					},
				],
			});
			await student.save();
			console.log(
				"--------------------------------------------------------"
			);
			console.log(
				`Nuevo estudiante creado: ${studentEmail} con la asignatura ${subject}`
			);
			console.log(
				"--------------------------------------------------------"
			);
			return student;
		}

		// Si el estudiante ya tiene la asignatura, salimos sin hacer nada ni mostrar logs
		if (student.subjects.some((s) => s.subjectName === subject)) {
			return student;
		}

		// Si el estudiante existe pero no tiene la asignatura, la añadimos
		student.subjects.push({
			subjectName: subject,
			subjectModel: "Nuevo estudiante",
			ABC_Testing: has_abctesting,
			survey: false,
			md5Prompt: null,
			prompt: null,
		});
		await student.save();
		console.log("--------------------------------------------------------");
		console.log(`Asignatura ${subject} añadida a ${studentEmail}`);
		console.log("--------------------------------------------------------");
		return student;
	} catch (error) {
		console.error(
			"Error asegurando la existencia del estudiante y su asignatura:",
			error.message
		);
		console.error(error);
	}
};

// Función para guardar preguntas generadas en el modelo unificado
async function saveQuestionsToManager(formattedResponse, assignedModel, prompt, subtopicId, topicName, difficulty) {
	try {
		questionsLogger.info("Guardando preguntas generadas en modelo unificado");
		
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
		
		questionsLogger.success(`${savedQuestions.length} preguntas guardadas en modelo unificado para topic ${topicId}`);
		
		return savedQuestions;
		
	} catch (error) {
		questionsLogger.error("Error en saveQuestionsToManager:", error.message);
		throw error;
	}
}

/**
 * Inicializa el sistema RAG unificado (mismo que profesores)
 * @returns {Object|null} RAG Manager instance o null si no está disponible
 */
async function initializeUnifiedRAG() {
    try {
        // Verificar si Qdrant está disponible
        const qdrantResponse = await fetch('http://localhost:6333/').catch(() => null);
        
        if (qdrantResponse && qdrantResponse.ok) {
            questionsLogger.debug('Inicializando RAG Manager V2 unificado para estudiantes');
            
            if (!RAGManagerV2) {
                const ragModule = await import("@rag/core/ragManagerV2");
                RAGManagerV2 = ragModule.default || ragModule;
            }
            
            const ragManager = new RAGManagerV2({ enableLogging: true });
            await ragManager.initialize();
            
            questionsLogger.info('RAG Manager V2 unificado inicializado para estudiantes');
            return ragManager;
        } else {
            questionsLogger.debug('Qdrant no disponible, usando Mock RAG unificado para estudiantes');
            
            if (!MockRAGManager) {
                const mockModule = await import("@rag/core/mockRAGManager");
                MockRAGManager = mockModule.default || mockModule;
            }
            
            const mockManager = new MockRAGManager();
            await mockManager.initialize();
            return mockManager;
        }
    } catch (error) {
        questionsLogger.warn('Error inicializando RAG unificado, continuando sin RAG:', error.message);
        return null;
    }
}

/**
 * Busca contenido relevante en el RAG unificado para un tema/subtema
 * @param {Object} ragManager - Instancia del RAG Manager
 * @param {string} topicTitle - Título del tema
 * @param {string} subtopicTitle - Título del subtema (opcional)
 * @param {string} topicId - ID del tema (opcional)
 * @param {string} subtopicId - ID del subtema (opcional)
 * @returns {Object} Contenido encontrado y estadísticas
 */
async function searchUnifiedRAGContent(ragManager, topicTitle, subtopicTitle, topicId, subtopicId) {
    try {
        // Preparar términos de búsqueda
        let searchQuery = topicTitle;
        if (subtopicTitle) {
            searchQuery += ` ${subtopicTitle}`;
        }
        
        // Preparar filtros
        const filters = {};
        
        if (topicId) {
            filters.topic_id = topicId;
        }
        
        if (subtopicId) {
            filters.subtopic_id = subtopicId;
        }
        
        // Configurar opciones de búsqueda
        const searchOptions = {
            limit: 10, // Máximo 10 chunks más relevantes
            threshold: 0.3, // Umbral de relevancia más permisivo
            includeMetadata: true,
            rerankResults: true
        };
        
        questionsLogger.debug(`Buscando contenido RAG unificado para: "${searchQuery}"`);
        
        const searchResult = await ragManager.semanticSearch(
            searchQuery,
            filters,
            searchOptions
        );
        
        if (searchResult.success && searchResult.results.length > 0) {
            questionsLogger.info(`Encontrados ${searchResult.results.length} chunks relevantes en RAG unificado`);
            
            // Combinar el contenido de los chunks más relevantes
            const relevantContent = searchResult.results
                .slice(0, 5) // Top 5 chunks más relevantes
                .map(result => result.text || result.content)
                .join('\n\n');
            
            return {
                hasContent: true,
                content: relevantContent,
                stats: {
                    totalFound: searchResult.results.length,
                    contentLength: relevantContent.length,
                    avgSimilarity: searchResult.results.reduce((sum, r) => sum + (r.similarity || 0), 0) / searchResult.results.length
                }
            };
        } else {
            questionsLogger.debug('No se encontró contenido relevante en RAG unificado');
            return {
                hasContent: false,
                content: '',
                stats: { totalFound: 0, contentLength: 0, avgSimilarity: 0 }
            };
        }
        
    } catch (error) {
        questionsLogger.error('Error buscando contenido en RAG unificado:', error);
        return {
            hasContent: false,
            content: '',
            stats: { totalFound: 0, contentLength: 0, avgSimilarity: 0 }
        };
    }
}

/**
 * Genera un prompt enriquecido con contexto RAG unificado
 * @param {string} basePrompt - Prompt base del sistema
 * @param {string} ragContent - Contenido obtenido del RAG
 * @returns {string} Prompt combinado
 */
function enhancePromptWithUnifiedRAG(basePrompt, ragContent) {
    if (!ragContent || ragContent.trim() === "") {
        return basePrompt;
    }

    const ragEnhancement = `
IMPORTANTE: Utiliza el siguiente contenido específico del tema para generar las preguntas:

--- CONTENIDO DEL TEMA ---
${ragContent}
--- FIN DEL CONTENIDO ---

Instrucciones adicionales:
- Las preguntas DEBEN basarse principalmente en el contenido proporcionado arriba
- Utiliza datos, conceptos y ejemplos específicos del material de clase
- Si necesitas complementar con conocimiento general, hazlo de manera coherente con el contenido
- Las preguntas deben demostrar comprensión del material específico del curso

PROMPT ORIGINAL:
${basePrompt}`;

    return ragEnhancement;
}
