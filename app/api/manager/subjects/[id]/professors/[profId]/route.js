// app/api/manager/subjects/[id]/professors/[profId]/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../../utils/dbconnect";
import Subject from "../../../../../../manager/models/Subject";
import { withAuth, handleError } from "../../../../../../utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/professors/{profId}:
 *   delete:
 *     tags:
 *       - Subjects
 *     summary: Eliminar profesor de asignatura
 *     description: Elimina un profesor de una asignatura específica
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
 *         name: profId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del profesor
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Profesor eliminado exitosamente
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
 *                   example: Profesor eliminado correctamente
 *       404:
 *         description: Asignatura o profesor no encontrado
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
async function removeProfessor(request, context) {
	try {
		await dbConnect();

		const { id, profId } = context.params;

		// Buscar asignatura
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

		// Verificar si el profesor está asignado
		if (!subject.professors.includes(profId)) {
			return NextResponse.json(
				{
					success: false,
					message: "El profesor no está asignado a esta asignatura",
				},
				{ status: 404 }
			);
		}

		// Eliminar profesor
		subject.professors = subject.professors.filter(
			(professorId) => professorId.toString() !== profId.toString()
		);
		await subject.save();

		return NextResponse.json(
			{
				success: true,
				message: "Profesor eliminado correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error eliminando profesor");
	}
}

// Exportar handler con autenticación
export const DELETE = withAuth(removeProfessor, { requireAdmin: true });