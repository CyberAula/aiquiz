// app/api/manager/subjects/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbconnect";
import Subject from "../../../../manager/models/Subject";
import Topic from "../../../../manager/models/Topic";
import Subtopic from "../../../../manager/models/Subtopic";
import { withAuth, handleError } from "../../../../utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}:
 *   get:
 *     tags:
 *       - Subjects
 *     summary: Obtener asignatura por ID
 *     description: Recupera los detalles de una asignatura específica
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
 *         description: Asignatura obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 title:
 *                   type: string
 *                   example: Desarrollo de Aplicaciones Web
 *                 acronym:
 *                   type: string
 *                   example: DAW
 *                 description:
 *                   type: string
 *                   example: Curso sobre desarrollo web moderno
 *                 administrators:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       name:
 *                         type: string
 *                         example: Carlos González
 *                       email:
 *                         type: string
 *                         example: carlos@upm.es
 *                 professors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       name:
 *                         type: string
 *                         example: Carlos González
 *                       email:
 *                         type: string
 *                         example: carlos@upm.es
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
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
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
async function getSubject(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;

		const subject = await Subject.findById(id)
			.populate("administrators", "name email")
			.populate("professors", "name email")
			.populate({
				path: "topics",
				select: "name title description order",
				options: { sort: { order: 1 } },
				populate: {
					path: "subtopics",
					select: "name title description order",
					options: { sort: { order: 1 } }
				}
			});

		if (!subject) {
			return NextResponse.json(
				{
					success: false,
					message: "Asignatura no encontrada",
				},
				{ status: 404 }
			);
		}

		// Transformar datos para que coincidan con lo que esperan los componentes
		const subjectObj = subject.toObject();
		const transformedSubject = {
			id: subject._id.toString(),
			_id: subject._id.toString(),
			title: subject.title || subjectObj.name || "Sin título",
			acronym: subject.acronym,
			description: subject.description || "Sin descripción",
			administrators: subject.administrators || [],
			professors: subject.professors || [],
			topics: subject.topics ? subject.topics.map(topic => {
				const topicObj = topic.toObject();
				return {
					id: topic._id.toString(),
					_id: topic._id.toString(),
					title: topic.title || topicObj.name || "Sin título",
					description: topic.description || "",
					order: topic.order || 0,
					subtopics: topic.subtopics ? topic.subtopics.map(subtopic => {
						const subtopicObj = subtopic.toObject();
						return {
							id: subtopic._id.toString(),
							_id: subtopic._id.toString(),
							title: subtopic.title || subtopicObj.name || "Sin título",
							description: subtopic.description || "",
							order: subtopic.order || 0
						};
					}) : []
				};
			}) : []
		};

		return NextResponse.json(transformedSubject, { status: 200 });

	} catch (error) {
		return handleError(error, "Error obteniendo asignatura");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}:
 *   put:
 *     tags:
 *       - Subjects
 *     summary: Actualizar asignatura
 *     description: Actualiza los datos de una asignatura existente
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
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la asignatura
 *                 example: Desarrollo de Aplicaciones Web Avanzado
 *               acronym:
 *                 type: string
 *                 description: Acrónimo de la asignatura
 *                 example: DAWA
 *               description:
 *                 type: string
 *                 description: Descripción de la asignatura
 *                 example: Curso avanzado sobre desarrollo web moderno
 *               professors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de profesores asignados
 *                 example: [507f1f77bcf86cd799439011]
 *     responses:
 *       200:
 *         description: Asignatura actualizada exitosamente
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
 *                   example: Asignatura actualizada correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     title:
 *                       type: string
 *                       example: Desarrollo de Aplicaciones Web Avanzado
 *                     acronym:
 *                       type: string
 *                       example: DAWA
 *                     description:
 *                       type: string
 *                       example: Curso avanzado sobre desarrollo web moderno
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
async function updateSubject(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;
		const { title, acronym, description, professors } = await request.json();

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

		if (acronym) {
			updateData.acronym = acronym.trim().toUpperCase();
		}

		if (professors) {
			updateData.professors = professors;
		}

		// Actualizar asignatura
		const subject = await Subject.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		)
			.populate("administrators", "name email")
			.populate("professors", "name email");

		if (!subject) {
			return NextResponse.json(
				{
					success: false,
					message: "Asignatura no encontrada",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Asignatura actualizada correctamente",
				data: subject,
			},
			{ status: 200 }
		);

	} catch (error) {
		if (error.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					message: "Ya existe una asignatura con ese acrónimo",
				},
				{ status: 400 }
			);
		}
		return handleError(error, "Error actualizando asignatura");
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Eliminar asignatura
 *     description: Elimina una asignatura del sistema
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
 *         description: Asignatura eliminada exitosamente
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
 *                   example: Asignatura eliminada correctamente
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
async function deleteSubject(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;

		const subject = await Subject.findByIdAndDelete(id);

		if (!subject) {
			return NextResponse.json(
				{
					success: false,
					message: "Asignatura no encontrada",
				},
				{ status: 404 }
			);
		}

		// TODO: En una implementación completa, también deberías eliminar
		// los temas, subtemas, preguntas y cuestionarios relacionados

		return NextResponse.json(
			{
				success: true,
				message: "Asignatura eliminada correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error eliminando asignatura");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getSubject, { requireProfessor: true });
export const PUT = withAuth(updateSubject, { requireProfessor: true });
export const DELETE = withAuth(deleteSubject, { requireAdmin: true });