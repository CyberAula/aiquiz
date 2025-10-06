// app/api/manager/subjects/[id]/topics/[topicId]/subtopics/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../../../utils/dbconnect";
import Subtopic from "../../../../../../../manager/models/Subtopic";
import Topic from "../../../../../../../manager/models/Topic";
import { withAuth, handleError } from "../../../../../../../utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics:
 *   get:
 *     tags:
 *       - Subtopics
 *     summary: Obtener subtemas de un tema
 *     description: Recupera todos los subtemas de un tema específico
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
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Lista de subtemas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 subtopics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439013
 *                       title:
 *                         type: string
 *                         example: Variables y Tipos de Datos
 *                       description:
 *                         type: string
 *                         example: Declaración de variables y tipos primitivos
 *                       content:
 *                         type: string
 *                         example: En JavaScript, las variables se pueden declarar...
 *                       order:
 *                         type: number
 *                         example: 1
 *                       topic:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439012
 */
async function getSubtopics(request, context) {
	try {
		await dbConnect();

		const { id, topicId } = context.params;

		// Verificar que el tema existe
		const topic = await Topic.findOne({ _id: topicId, subject: id });
		if (!topic) {
			return NextResponse.json(
				{
					success: false,
					message: "Tema no encontrado",
				},
				{ status: 404 }
			);
		}

		// Obtener subtemas ordenados
		const subtopics = await Subtopic.find({ topic: topicId })
			.sort({ order: 1 })
			.populate("topic", "title");

		return NextResponse.json(
			{
				success: true,
				subtopics,
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error obteniendo subtemas");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics:
 *   post:
 *     tags:
 *       - Subtopics
 *     summary: Crear nuevo subtema
 *     description: Crea un nuevo subtema en un tema específico
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
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *         example: 507f1f77bcf86cd799439012
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
 *                 description: Título del subtema
 *                 example: Variables y Tipos de Datos
 *               description:
 *                 type: string
 *                 description: Descripción del subtema
 *                 example: Declaración de variables y tipos primitivos
 *               content:
 *                 type: string
 *                 description: Contenido del subtema
 *                 example: En JavaScript, las variables se pueden declarar...
 *               order:
 *                 type: number
 *                 description: Orden del subtema (opcional)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Subtema creado exitosamente
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
 *                   example: Subtema creado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439013
 *                     title:
 *                       type: string
 *                       example: Variables y Tipos de Datos
 *                     description:
 *                       type: string
 *                       example: Declaración de variables y tipos primitivos
 *                     content:
 *                       type: string
 *                       example: En JavaScript, las variables...
 *                     order:
 *                       type: number
 *                       example: 1
 *                     topic:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439012
 */
async function createSubtopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId } = context.params;
		const { title, description, content, order } = await request.json();

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

		// Verificar que el tema existe
		const topic = await Topic.findOne({ _id: topicId, subject: id });
		if (!topic) {
			return NextResponse.json(
				{
					success: false,
					message: "Tema no encontrado",
				},
				{ status: 404 }
			);
		}

		// Determinar orden si no se proporciona
		let subtopicOrder = order;
		if (!subtopicOrder) {
			const lastSubtopic = await Subtopic.findOne({ topic: topicId }).sort({ order: -1 });
			subtopicOrder = lastSubtopic ? lastSubtopic.order + 1 : 1;
		}

		// Crear nuevo subtema
		const subtopic = new Subtopic({
			title: title.trim(),
			description: description?.trim() || "",
			content: content?.trim() || "",
			topic: topicId,
			order: subtopicOrder,
		});

		const savedSubtopic = await subtopic.save();

		return NextResponse.json(
			{
				success: true,
				message: "Subtema creado correctamente",
				data: savedSubtopic,
			},
			{ status: 201 }
		);

	} catch (error) {
		return handleError(error, "Error creando subtema");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getSubtopics, { requireProfessor: true });
export const POST = withAuth(createSubtopic, { requireProfessor: true });