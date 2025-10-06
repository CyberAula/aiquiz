// app/api/manager/subjects/[id]/topics/[topicId]/questionnaires/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Question from "@app/models/Question";
import Topic from "@app/manager/models/Topic";
import { withAuth, handleError } from "@utils/authMiddleware";

// Import dinámico para el modelo Questionnaire (CommonJS)
async function getQuestionnaireModel() {
    const Questionnaire = await import("@app/manager/models/Questionnaire");
    return Questionnaire.default || Questionnaire;
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questionnaires:
 *   get:
 *     tags:
 *       - Questionnaires
 *     summary: Obtener cuestionarios de un tema
 *     description: Obtiene todos los cuestionarios asociados a un tema específico
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
 *     responses:
 *       200:
 *         description: Lista de cuestionarios del tema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questionnaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       questions:
 *                         type: number
 *                         description: Número de preguntas en el cuestionario
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       downloadCount:
 *                         type: number
 *                 total:
 *                   type: number
 *                   description: Total de cuestionarios
 *       404:
 *         description: Tema no encontrado
 *       500:
 *         description: Error del servidor
 */

async function getTopicQuestionnaires(request, context) {
    console.log('[Topic Questionnaires API] Obteniendo cuestionarios del tema');
    
    try {
        await dbConnect();
        
        const { id, topicId } = context.params;
        
        console.log('[Topic Questionnaires API] Parámetros:', {
            subjectId: id,
            topicId
        });

        // Verificar que el tema existe
        const topic = await Topic.findById(topicId).lean();
        if (!topic) {
            return NextResponse.json({
                success: false,
                message: "Tema no encontrado"
            }, { status: 404 });
        }

        // Obtener modelo Questionnaire
        const Questionnaire = await getQuestionnaireModel();
        
        // Obtener cuestionarios del tema
        const questionnaires = await Questionnaire.find({ topic: topicId })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        console.log(`[Topic Questionnaires API] Encontrados ${questionnaires.length} cuestionarios`);

        // Formatear cuestionarios para respuesta
        const formattedQuestionnaires = questionnaires.map(questionnaire => ({
            _id: questionnaire._id,
            id: questionnaire._id.toString(), // Para compatibilidad con frontend
            title: questionnaire.title,
            description: questionnaire.description || '',
            questions: questionnaire.questions.length,
            createdAt: questionnaire.createdAt,
            downloadCount: questionnaire.downloadCount || 0,
            isPublic: questionnaire.isPublic,
            createdBy: questionnaire.createdBy
        }));

        const response = {
            success: true,
            questionnaires: formattedQuestionnaires,
            total: questionnaires.length
        };
        
        console.log('[Topic Questionnaires API] Respuesta enviada:', {
            success: response.success,
            questionnairesCount: response.questionnaires.length
        });
        
        return NextResponse.json(response);

    } catch (error) {
        console.error('[Topic Questionnaires API] Error obteniendo cuestionarios:', error);
        return handleError(error, "Error obteniendo cuestionarios del tema");
    }
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questionnaires:
 *   post:
 *     tags:
 *       - Questionnaires
 *     summary: Crear nuevo cuestionario
 *     description: Crea un nuevo cuestionario a partir de preguntas seleccionadas
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
 *               - title
 *               - questionIds
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del cuestionario
 *               description:
 *                 type: string
 *                 description: Descripción del cuestionario
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de las preguntas a incluir
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: Si el cuestionario es público
 *     responses:
 *       201:
 *         description: Cuestionario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 questionnaire:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     questions:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tema o preguntas no encontradas
 *       500:
 *         description: Error del servidor
 */

async function createQuestionnaire(request, context) {
    console.log('[Topic Questionnaires API] Creando nuevo cuestionario');
    
    try {
        await dbConnect();
        
        const { id, topicId } = context.params;
        const data = await request.json();
        
        const {
            title,
            description,
            questionIds,
            isPublic = false
        } = data;

        console.log('[Topic Questionnaires API] Datos del cuestionario:', {
            title: title?.substring(0, 50) + '...',
            description: description?.substring(0, 50) + '...',
            questionsCount: questionIds?.length,
            isPublic
        });

        // Validaciones básicas
        if (!title || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Título y preguntas son requeridos"
            }, { status: 400 });
        }

        // Verificar que el tema existe
        const topic = await Topic.findById(topicId).lean();
        if (!topic) {
            return NextResponse.json({
                success: false,
                message: "Tema no encontrado"
            }, { status: 404 });
        }

        // Verificar que las preguntas existen
        const existingQuestions = await Question.find({
            _id: { $in: questionIds }
        }).lean();

        if (existingQuestions.length !== questionIds.length) {
            return NextResponse.json({
                success: false,
                message: `Solo se encontraron ${existingQuestions.length} de ${questionIds.length} preguntas`
            }, { status: 404 });
        }

        // Obtener modelo Questionnaire
        const Questionnaire = await getQuestionnaireModel();
        
        // Crear el cuestionario
        const questionnaire = new Questionnaire({
            title,
            description: description || '',
            topic: topicId,
            questions: questionIds,
            createdBy: context.user.id,
            isPublic,
            downloadCount: 0
        });

        await questionnaire.save();
        
        console.log(`[Topic Questionnaires API] Cuestionario creado: ${questionnaire._id}`);

        return NextResponse.json({
            success: true,
            message: "Cuestionario creado exitosamente",
            questionnaire: {
                _id: questionnaire._id,
                id: questionnaire._id.toString(),
                title: questionnaire.title,
                description: questionnaire.description,
                questions: questionnaire.questions.length,
                createdAt: questionnaire.createdAt,
                downloadCount: questionnaire.downloadCount,
                isPublic: questionnaire.isPublic
            }
        }, { status: 201 });

    } catch (error) {
        console.error('[Topic Questionnaires API] Error creando cuestionario:', error);
        return handleError(error, "Error creando cuestionario");
    }
}

// Exportar handlers con autenticación
export const GET = withAuth(getTopicQuestionnaires, { requireProfessor: true });
export const POST = withAuth(createQuestionnaire, { requireProfessor: true });