// app/api/manager/subjects/[id]/topics/[topicId]/subtopics/[subtopicId]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Subtopic from "@models/Subtopic";
import Topic from "@models/Topic";
import Subject from "@models/Subject";
import { withAuth, handleError } from "@utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}:
 *   get:
 *     tags:
 *       - Subtopics
 *     summary: Obtener subtema por ID
 *     description: Recupera los detalles de un subtema específico
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
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtema
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Subtema obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439013
 *                 title:
 *                   type: string
 *                   example: Variables y Tipos de Datos
 *                 description:
 *                   type: string
 *                   example: Declaración de variables y tipos primitivos
 *                 content:
 *                   type: string
 *                   example: En JavaScript, las variables se pueden declarar...
 *                 order:
 *                   type: number
 *                   example: 1
 *                 topic:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439012
 *                     title:
 *                       type: string
 *                       example: Fundamentos de JavaScript
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439014
 *                       fileName:
 *                         type: string
 *                         example: documento.pdf
 *                       originalName:
 *                         type: string
 *                         example: Variables JavaScript.pdf
 *                       fileType:
 *                         type: string
 *                         example: document
 *                       size:
 *                         type: number
 *                         example: 1024576
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 */
async function getSubtopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId, subtopicId } = context.params;

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

		// Obtener subtema
		const subtopic = await Subtopic.findOne({ _id: subtopicId, topic: topicId })
			.populate({
				path: "topic",
				select: "name title description subject",
				populate: {
					path: "subject",
					select: "name title acronym"
				}
			});

		if (!subtopic) {
			return NextResponse.json(
				{
					success: false,
					message: "Subtema no encontrado",
				},
				{ status: 404 }
			);
		}

		// Transformar datos para que coincidan con lo que esperan los componentes
		const subtopicObj = subtopic.toObject();
		const topicObj = subtopic.topic?.toObject ? subtopic.topic.toObject() : subtopic.topic;
		const subjectObj = subtopic.topic?.subject?.toObject ? subtopic.topic.subject.toObject() : subtopic.topic?.subject;
		
		const transformedSubtopic = {
			id: subtopic._id.toString(),
			_id: subtopic._id.toString(),
			title: subtopic.title || subtopicObj.name || "Sin título",
			description: subtopic.description || "",
			content: subtopic.content || "",
			order: subtopic.order || 0,
			topic: subtopic.topic,
			topicTitle: subtopic.topic?.title || topicObj?.name,
			topicId: subtopic.topic?._id?.toString(),
			subjectTitle: subtopic.topic?.subject?.title || subjectObj?.name,
			subjectId: subtopic.topic?.subject?._id?.toString(),
			createdAt: subtopic.createdAt,
			updatedAt: subtopic.updatedAt
		};

		return NextResponse.json(transformedSubtopic, { status: 200 });

	} catch (error) {
		return handleError(error, "Error obteniendo subtema");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}:
 *   put:
 *     tags:
 *       - Subtopics
 *     summary: Actualizar subtema
 *     description: Actualiza los datos de un subtema existente
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
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtema
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título del subtema
 *                 example: Variables y Tipos de Datos Avanzados
 *               description:
 *                 type: string
 *                 description: Descripción del subtema
 *                 example: Declaración avanzada de variables y tipos
 *               content:
 *                 type: string
 *                 description: Contenido del subtema
 *                 example: En JavaScript ES6, las variables se pueden declarar...
 *               order:
 *                 type: number
 *                 description: Orden del subtema
 *                 example: 2
 *     responses:
 *       200:
 *         description: Subtema actualizado exitosamente
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
 *                   example: Subtema actualizado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439013
 *                     title:
 *                       type: string
 *                       example: Variables y Tipos de Datos Avanzados
 *                     description:
 *                       type: string
 *                       example: Declaración avanzada de variables y tipos
 *                     content:
 *                       type: string
 *                       example: En JavaScript ES6, las variables...
 *                     order:
 *                       type: number
 *                       example: 2
 */
async function updateSubtopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId, subtopicId } = context.params;
		const { title, description, content, order } = await request.json();

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

		// Construir objeto de actualización
		const updateData = {};
		if (title !== undefined) updateData.title = title.trim();
		if (description !== undefined) updateData.description = description.trim();
		if (content !== undefined) updateData.content = content.trim();
		if (order !== undefined) updateData.order = order;

		// Actualizar subtema
		const subtopic = await Subtopic.findOneAndUpdate(
			{ _id: subtopicId, topic: topicId },
			updateData,
			{ new: true, runValidators: true }
		).populate("topic", "title");

		if (!subtopic) {
			return NextResponse.json(
				{
					success: false,
					message: "Subtema no encontrado",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Subtema actualizado correctamente",
				data: subtopic,
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error actualizando subtema");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}:
 *   delete:
 *     tags:
 *       - Subtopics
 *     summary: Eliminar subtema
 *     description: Elimina un subtema y todos sus archivos asociados
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
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtema
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Subtema eliminado exitosamente
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
 *                   example: Subtema eliminado correctamente
 */
async function deleteSubtopic(request, context) {
	try {
		await dbConnect();

		const { id, topicId, subtopicId } = context.params;

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

		// Verificar que el subtema existe
		const subtopic = await Subtopic.findOne({ _id: subtopicId, topic: topicId });
		if (!subtopic) {
			return NextResponse.json(
				{
					success: false,
					message: "Subtema no encontrado",
				},
				{ status: 404 }
			);
		}

		// TODO: Eliminar archivos físicos del sistema
		// TODO: Eliminar registros de archivos de la base de datos

		// Eliminar el subtema
		await Subtopic.findByIdAndDelete(subtopicId);

		return NextResponse.json(
			{
				success: true,
				message: "Subtema eliminado correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error eliminando subtema");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getSubtopic, { requireProfessor: true });
export const PUT = withAuth(updateSubtopic, { requireProfessor: true });
export const DELETE = withAuth(deleteSubtopic, { requireProfessor: true });