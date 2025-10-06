// app/api/manager/subjects/[id]/topics/[topicId]/questions/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Question from "@app/models/Question";
import Subtopic from "@app/manager/models/Subtopic";
import { withAuth, handleError } from "@utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Obtener preguntas de un tema
 *     description: Obtiene todas las preguntas asociadas a un tema específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filtrar por estado de verificación
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Fácil, Medio, Avanzado]
 *         description: Filtrar por dificultad
 *       - in: query
 *         name: generated
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filtrar preguntas generadas automáticamente
 *     responses:
 *       200:
 *         description: Lista de preguntas del tema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       type:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                       choices:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             text:
 *                               type: string
 *                             isCorrect:
 *                               type: boolean
 *                       explanation:
 *                         type: string
 *                       verified:
 *                         type: boolean
 *                       generated:
 *                         type: boolean
 *                       llmModel:
 *                         type: string
 *                       usageCount:
 *                         type: number
 *                       successRate:
 *                         type: number
 *                 total:
 *                   type: number
 *                   description: Total de preguntas
 *                 stats:
 *                   type: object
 *                   properties:
 *                     verified:
 *                       type: number
 *                     unverified:
 *                       type: number
 *                     generated:
 *                       type: number
 *                     manual:
 *                       type: number
 *       404:
 *         description: Tema no encontrado
 *       500:
 *         description: Error del servidor
 */

async function getTopicQuestions(request, context) {
    console.log('🎯 [Topic Questions API] =================');
    console.log('[Topic Questions API] Obteniendo preguntas del tema');
    console.log('[Topic Questions API] Context:', context);
    console.log('[Topic Questions API] Request URL:', request.url);
    
    try {
        await dbConnect();
        console.log('[Topic Questions API] Conexión a BD establecida');

        const { id, topicId } = context.params;
        const { searchParams } = new URL(request.url);
        
        const verified = searchParams.get('verified');
        const difficulty = searchParams.get('difficulty');
        const generated = searchParams.get('generated');
        
        console.log('[Topic Questions API] Parámetros:', {
            subjectId: id,
            topicId,
            verified,
            difficulty,
            generated
        });

        // Obtener todos los subtopics de este topic
        const subtopics = await Subtopic.find({ topic: topicId }).lean();
        const subtopicIds = subtopics.map(st => st._id);
        
        console.log(`[Topic Questions API] Encontrados ${subtopics.length} subtopics para topic ${topicId}`);
        console.log(`[Topic Questions API] Subtopic IDs: ${subtopicIds.join(', ')}`);
        
        // Construir filtros para el modelo unificado - incluir preguntas de subtemas
        const filters = { 
            $or: [
                { topicRef: topicId },              // Preguntas directamente del topic (manager)
                { topic: topicId },                 // Preguntas del quiz con topic como string
                { topic: topicId.toString() },      // Preguntas del quiz con topic como ObjectId convertido
                { subtopic: { $in: subtopicIds } }  // Preguntas en cualquier subtema de este topic
            ]
        };
        
        if (verified === 'true') {
            filters.verified = true;
        } else if (verified === 'false') {
            filters.verified = false;
        }
        
        if (difficulty && ['Fácil', 'Medio', 'Avanzado'].includes(difficulty)) {
            filters.difficulty = difficulty;
        }
        
        if (generated === 'true') {
            filters.generated = true;
        } else if (generated === 'false') {
            filters.generated = false;
        }

        // Obtener preguntas con población de datos relacionados
        const questions = await Question.find(filters)
            .populate('subtopic', 'title')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`[Topic Questions API] Encontradas ${questions.length} preguntas`);
        console.log('[Topic Questions API] Primeras 2 preguntas:', questions.slice(0, 2));

        // Calcular estadísticas para el modelo unificado - incluir preguntas de subtemas
        const allQuestions = await Question.find({ 
            $or: [
                { topicRef: topicId },              // Preguntas directamente del topic (manager)
                { topic: topicId },                 // Preguntas del quiz con topic como string
                { topic: topicId.toString() },      // Preguntas del quiz con topic como ObjectId convertido
                { subtopic: { $in: subtopicIds } }  // Preguntas en cualquier subtema de este topic
            ]
        }).lean();
        const stats = {
            verified: allQuestions.filter(q => q.verified).length,
            unverified: allQuestions.filter(q => !q.verified && !q.rejected).length,
            generated: allQuestions.filter(q => q.generated).length,
            manual: allQuestions.filter(q => !q.generated).length,
            total: allQuestions.length
        };

        // Formatear preguntas para respuesta
        const formattedQuestions = questions.map(question => ({
            _id: question._id,
            text: question.text,
            type: question.type,
            difficulty: question.difficulty,
            choices: question.choices,
            explanation: question.explanation,
            verified: question.verified,
            rejected: question.rejected,
            generated: question.generated,
            llmModel: question.llmModel,
            tags: question.tags,
            usageCount: question.usageCount,
            successRate: question.totalAnswersCount > 0 
                ? Math.round((question.correctAnswersCount / question.totalAnswersCount) * 100)
                : 0,
            subtopic: question.subtopic,
            createdBy: question.createdBy,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt
        }));

        const response = {
            success: true,
            questions: formattedQuestions,
            total: questions.length,
            stats
        };
        
        console.log('[Topic Questions API] Respuesta enviada:', {
            success: response.success,
            questionsCount: response.questions.length,
            stats: response.stats
        });
        
        return NextResponse.json(response);

    } catch (error) {
        console.error('[Topic Questions API] Error obteniendo preguntas:', error);
        return handleError(error, "Error obteniendo preguntas del tema");
    }
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questions:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Crear nueva pregunta
 *     description: Crea una nueva pregunta para el tema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - type
 *               - difficulty
 *               - choices
 *             properties:
 *               text:
 *                 type: string
 *                 description: Texto de la pregunta
 *               type:
 *                 type: string
 *                 enum: [Opción múltiple, Verdadero/Falso, Respuesta corta, Ensayo]
 *                 description: Tipo de pregunta
 *               difficulty:
 *                 type: string
 *                 enum: [Fácil, Medio, Avanzado]
 *                 description: Dificultad de la pregunta
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *                 description: Opciones de respuesta
 *               explanation:
 *                 type: string
 *                 description: Explicación de la respuesta correcta
 *               subtopicId:
 *                 type: string
 *                 description: ID del subtema (opcional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas de la pregunta
 *     responses:
 *       201:
 *         description: Pregunta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */

async function createQuestion(request, context) {
    console.log('[Topic Questions API] Creando nueva pregunta');
    
    try {
        await dbConnect();
        
        const { id, topicId } = context.params;
        const data = await request.json();
        
        const {
            text,
            type,
            difficulty,
            choices,
            explanation,
            subtopicId,
            tags
        } = data;

        console.log('[Topic Questions API] Datos de la pregunta:', {
            text: text?.substring(0, 50) + '...',
            type,
            difficulty,
            choicesCount: choices?.length
        });

        // Validaciones básicas
        if (!text || !type || !difficulty || !choices || choices.length < 2) {
            return NextResponse.json({
                success: false,
                message: "Datos incompletos: se requiere texto, tipo, dificultad y al menos 2 opciones"
            }, { status: 400 });
        }

        // Verificar que hay exactamente una respuesta correcta
        const correctChoices = choices.filter(choice => choice.isCorrect);
        if (correctChoices.length !== 1) {
            return NextResponse.json({
                success: false,
                message: "Debe haber exactamente una respuesta correcta"
            }, { status: 400 });
        }

        // Crear la pregunta usando el modelo unificado
        const question = new Question({
            text,
            type,
            difficulty,
            choices,
            explanation: explanation || '',
            topicRef: topicId, // Usar topicRef para el manager
            subtopic: subtopicId || null,
            createdBy: context.user.id,
            tags: tags || [],
            generated: false,
            verified: false,
            source: "manager"
        });

        await question.save();
        
        console.log(`[Topic Questions API] Pregunta creada: ${question._id}`);

        return NextResponse.json({
            success: true,
            message: "Pregunta creada exitosamente",
            question: {
                _id: question._id,
                text: question.text,
                type: question.type,
                difficulty: question.difficulty,
                choices: question.choices,
                explanation: question.explanation,
                verified: question.verified,
                generated: question.generated,
                createdAt: question.createdAt
            }
        }, { status: 201 });

    } catch (error) {
        console.error('[Topic Questions API] Error creando pregunta:', error);
        return handleError(error, "Error creando pregunta");
    }
}

/**
 * PATCH /api/manager/subjects/{id}/topics/{topicId}/questions
 * Actualizar estado de verificación de preguntas
 */
async function updateQuestionStatus(request, context) {
    console.log('[Topic Questions API] Actualizando estado de pregunta');
    
    try {
        await dbConnect();
        
        const data = await request.json();
        const { questionId, action } = data; // action: 'verify', 'reject', 'reset'
        
        console.log('[Topic Questions API] Datos recibidos:', { questionId, action });
        
        if (!questionId || !action) {
            return NextResponse.json({
                success: false,
                message: "questionId y action son requeridos"
            }, { status: 400 });
        }
        
        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json({
                success: false,
                message: "Pregunta no encontrada"
            }, { status: 404 });
        }
        
        // Actualizar según la acción
        switch (action) {
            case 'verify':
                question.verified = true;
                question.rejected = false;
                break;
            case 'reject':
                question.verified = false;
                question.rejected = true;
                break;
            case 'reset':
                question.verified = false;
                question.rejected = false;
                break;
            default:
                return NextResponse.json({
                    success: false,
                    message: "Acción no válida. Use 'verify', 'reject', o 'reset'"
                }, { status: 400 });
        }
        
        await question.save();
        
        console.log(`[Topic Questions API] Pregunta ${questionId} actualizada: ${action}`);
        
        return NextResponse.json({
            success: true,
            message: `Pregunta ${action === 'verify' ? 'verificada' : action === 'reject' ? 'rechazada' : 'resetada'} exitosamente`,
            question: {
                _id: question._id,
                verified: question.verified,
                rejected: question.rejected
            }
        });
        
    } catch (error) {
        console.error('[Topic Questions API] Error actualizando pregunta:', error);
        return handleError(error, "Error actualizando estado de pregunta");
    }
}

// Exportar handlers con autenticación
export const GET = withAuth(getTopicQuestions, { requireProfessor: true });
export const POST = withAuth(createQuestion, { requireProfessor: true });
export const PATCH = withAuth(updateQuestionStatus, { requireProfessor: true });