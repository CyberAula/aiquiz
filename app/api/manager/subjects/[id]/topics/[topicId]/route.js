// app/api/manager/subjects/[id]/topics/[topicId]/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../../utils/dbconnect";
import Topic from "../../../../../../manager/models/Topic";
import Subtopic from "../../../../../../manager/models/Subtopic";
import { withAuth, handleError } from "../../../../../../utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}:
 *   get:
 *     tags:
 *       - Topics
 *     summary: Obtener tema por ID
 *     description: Recupera los detalles de un tema específico con sus subtemas
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
 *         description: Tema obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 title:
 *                   type: string
 *                   example: Fundamentos de JavaScript
 *                 description:
 *                   type: string
 *                   example: Conceptos básicos de JavaScript
 *                 order:
 *                   type: number
 *                   example: 1
 *                 subject:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     title:
 *                       type: string
 *                       example: Desarrollo de Aplicaciones Web
 *                     acronym:
 *                       type: string
 *                       example: DAW
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
 *                       order:
 *                         type: number
 *                         example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *       404:
 *         description: Tema no encontrado
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
 *                   example: Tema no encontrado
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
async function getTopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId } = context.params;

		const topic = await Topic.findOne({ _id: topicId, subject: id })
			.populate("subject", "name title acronym")
			.populate({
				path: "subtopics",
				select: "name title description order",
				options: { sort: { order: 1 } },
			});

		if (!topic) {
			return NextResponse.json(
				{
					success: false,
					message: "Tema no encontrado",
				},
				{ status: 404 }
			);
		}

		// Transformar datos para que coincidan con lo que esperan los componentes
		const topicObj = topic.toObject();
		const transformedTopic = {
			id: topic._id.toString(),
			_id: topic._id.toString(),
			title: topic.title || topicObj.name || "Sin título",
			description: topic.description || "",
			order: topic.order || 0,
			subject: topic.subject,
			subtopics: topic.subtopics ? topic.subtopics.map(subtopic => {
				const subtopicObj = subtopic.toObject();
				return {
					id: subtopic._id.toString(),
					_id: subtopic._id.toString(),
					title: subtopic.title || subtopicObj.name || "Sin título",
					description: subtopic.description || "",
					order: subtopic.order || 0
				};
			}) : [],
			createdAt: topic.createdAt,
			updatedAt: topic.updatedAt
		};

		return NextResponse.json(transformedTopic, { status: 200 });

	} catch (error) {
		return handleError(error, "Error obteniendo tema");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}:
 *   put:
 *     tags:
 *       - Topics
 *     summary: Actualizar tema
 *     description: Actualiza los datos de un tema existente
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del tema
 *                 example: Fundamentos de JavaScript Avanzado
 *               description:
 *                 type: string
 *                 description: Descripción del tema
 *                 example: Conceptos avanzados de JavaScript
 *               order:
 *                 type: number
 *                 description: Orden del tema
 *                 example: 2
 *     responses:
 *       200:
 *         description: Tema actualizado exitosamente
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
 *                   example: Tema actualizado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439012
 *                     title:
 *                       type: string
 *                       example: Fundamentos de JavaScript Avanzado
 *                     description:
 *                       type: string
 *                       example: Conceptos avanzados de JavaScript
 *                     order:
 *                       type: number
 *                       example: 2
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
 *         description: Tema no encontrado
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
 *                   example: Tema no encontrado
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
async function updateTopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId } = context.params;
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

		// Construir objeto de actualización
		const updateData = {
			title: title.trim(),
			description: description?.trim() || "",
		};

		if (order !== undefined) {
			updateData.order = order;
		}

		// Actualizar tema
		const topic = await Topic.findOneAndUpdate(
			{ _id: topicId, subject: id },
			updateData,
			{ new: true, runValidators: true }
		).populate("subject", "title acronym");

		if (!topic) {
			return NextResponse.json(
				{
					success: false,
					message: "Tema no encontrado",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Tema actualizado correctamente",
				data: topic,
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error actualizando tema");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}:
 *   delete:
 *     tags:
 *       - Topics
 *     summary: Eliminar tema
 *     description: Elimina un tema y todos sus subtemas asociados
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
 *         description: Tema eliminado exitosamente
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
 *                   example: Tema eliminado correctamente
 *       404:
 *         description: Tema no encontrado
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
 *                   example: Tema no encontrado
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
async function deleteTopic(request, context) {
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

		// Eliminar subtemas asociados
		await Subtopic.deleteMany({ topic: topicId });

		// Eliminar el tema
		await Topic.findByIdAndDelete(topicId);

		// TODO: En una implementación completa, también eliminar
		// preguntas y cuestionarios relacionados

		return NextResponse.json(
			{
				success: true,
				message: "Tema eliminado correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error eliminando tema");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getTopic, { requireProfessor: true });
export const PUT = withAuth(updateTopic, { requireProfessor: true });
export const DELETE = withAuth(deleteTopic, { requireProfessor: true });