// app/api/account/password/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbconnect";
import User from "../../../manager/models/User";
import { withAuth, handleError } from "../../../utils/authMiddleware";

/**
 * @swagger
 * /api/account/password:
 *   put:
 *     tags:
 *       - Account
 *     summary: Cambiar contraseña del usuario autenticado
 *     description: Permite a un usuario autenticado cambiar su contraseña
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: password123
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 8 caracteres)
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
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
 *                   example: Contraseña actualizada correctamente
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
 *                   example: Todos los campos son obligatorios
 *       401:
 *         description: Contraseña actual incorrecta o no autorizado
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
 *                   example: La contraseña actual es incorrecta
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: Usuario no encontrado
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
async function changePassword(request, context) {
	try {
		await dbConnect();

		const { currentPassword, newPassword } = await request.json();

		// Validar datos obligatorios
		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{
					success: false,
					message: "Todos los campos son obligatorios",
				},
				{ status: 400 }
			);
		}

		// Validar longitud de la nueva contraseña
		if (newPassword.length < 8) {
			return NextResponse.json(
				{
					success: false,
					message: "La nueva contraseña debe tener al menos 8 caracteres",
				},
				{ status: 400 }
			);
		}

		// Buscar usuario autenticado
		const user = await User.findById(context.user.id);

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "Usuario no encontrado",
				},
				{ status: 404 }
			);
		}

		// Verificar contraseña actual
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);

		if (!isCurrentPasswordValid) {
			return NextResponse.json(
				{
					success: false,
					message: "La contraseña actual es incorrecta",
				},
				{ status: 401 }
			);
		}

		// Verificar que la nueva contraseña sea diferente
		const isSamePassword = await user.comparePassword(newPassword);

		if (isSamePassword) {
			return NextResponse.json(
				{
					success: false,
					message: "La nueva contraseña debe ser diferente a la actual",
				},
				{ status: 400 }
			);
		}

		// Actualizar contraseña
		user.password = newPassword; // Se hasheará automáticamente por el middleware del modelo
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Contraseña actualizada correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error cambiando contraseña");
	}
}

// Exportar handler con autenticación (tanto profesores como admins pueden cambiar su contraseña)
export const PUT = withAuth(changePassword, { requireProfessor: true });