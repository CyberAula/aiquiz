// app/api/manager/subjects/[id]/topics/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../utils/dbconnect";
import Topic from "../../../../../manager/models/Topic";
import Subject from "../../../../../manager/models/Subject";
import { withAuth, handleError } from "../../../../../utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Obtener todos los temas de una asignatura
 *     description: Recupera la lista de temas de una asignatura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Lista de temas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       title:
 *                         type: string
 *                         example: Fundamentos de JavaScript
 *                       description:
 *                         type: string
 *                         example: Conceptos básicos de JavaScript
 *                       order:
 *                         type: number
 *                         example: 1
 *                       subject:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-01-01T00:00:00.000Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-01-01T00:00:00.000Z
 *       404:
 *         description: Asignatura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Asignatura no encontrada
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token de autorización no proporcionado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 */
async function getTopics(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;

		// Verificar que la asignatura existe
		const subject = await Subject.findById(id);
		if (!subject) {
			return NextResponse.json(
				{
					success: false,
					message: "Asignatura no encontrada",
				},
				{ status: 404 }
			);
		}

		// Obtener temas ordenados
		const topics = await Topic.find({ subject: id })
			.sort({ order: 1 })
			.populate("subject", "title acronym");

		return NextResponse.json(
			{
				success: true,
				topics,
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error obteniendo temas");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics:
 *   post:
 *     tags:
 *       - Topics
 *     summary: Crear nuevo tema
 *     description: Crea un nuevo tema en una asignatura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del tema
 *                 example: Fundamentos de JavaScript
 *               description:
 *                 type: string
 *                 description: Descripción del tema
 *                 example: Conceptos básicos de JavaScript, variables, funciones
 *               order:
 *                 type: number
 *                 description: Orden del tema (opcional)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Tema creado exitosamente
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
 *                   example: Tema creado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     title:
 *                       type: string
 *                       example: Fundamentos de JavaScript
 *                     description:
 *                       type: string
 *                       example: Conceptos básicos de JavaScript
 *                     order:
 *                       type: number
 *                       example: 1
 *                     subject:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     subtopics:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: []
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: El título es obligatorio
 *       404:
 *         description: Asignatura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Asignatura no encontrada
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token de autorización no proporcionado
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor
 */
async function createTopic(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;
		const { title, description, order } = await request.json();

		// Validar datos obligatorios
		if (!title) {
			return NextResponse.json(
				{
					success: false,
					message: "El título es obligatorio",
				},
				{ status: 400 }
			);
		}

		// Verificar que la asignatura existe
		const subject = await Subject.findById(id);
		if (!subject) {
			return NextResponse.json(
				{
					success: false,
					message: "Asignatura no encontrada",
				},
				{ status: 404 }
			);
		}

		// Determinar orden si no se proporciona
		let topicOrder = order;
		if (!topicOrder) {
			const lastTopic = await Topic.findOne({ subject: id }).sort({ order: -1 });
			topicOrder = lastTopic ? lastTopic.order + 1 : 1;
		}

		// Crear nuevo tema
		const topic = new Topic({
			title: title.trim(),
			description: description?.trim() || "",
			subject: id,
			order: topicOrder,
		});

		const savedTopic = await topic.save();

		return NextResponse.json(
			{
				success: true,
				message: "Tema creado correctamente",
				data: {
					...savedTopic.toObject(),
					subtopics: [],
				},
			},
			{ status: 201 }
		);

	} catch (error) {
		return handleError(error, "Error creando tema");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getTopics, { requireProfessor: true });
export const POST = withAuth(createTopic, { requireProfessor: true });