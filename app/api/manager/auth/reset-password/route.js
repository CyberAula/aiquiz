// app/api/manager/auth/reset-password/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";

/**
 * @swagger
 * /api/manager/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Restablecer contraseña
 *     description: Restablece la contraseña del usuario usando un token de recuperación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación
 *                 example: abc123def456
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Nueva contraseña
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
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
 *                   example: Contraseña restablecida correctamente
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
 *                   example: Token y nueva contraseña son obligatorios
 *       404:
 *         description: Token inválido o expirado
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
 *                   example: Token inválido o expirado
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
export async function POST(request) {
	try {
		await dbConnect();

		const { token, newPassword } = await request.json();

		// Validar datos de entrada
		if (!token || !newPassword) {
			return NextResponse.json(
				{
					success: false,
					message: "Token y nueva contraseña son obligatorios",
				},
				{ status: 400 }
			);
		}

		// Validar longitud de contraseña
		if (newPassword.length < 8) {
			return NextResponse.json(
				{
					success: false,
					message: "La contraseña debe tener al menos 8 caracteres",
				},
				{ status: 400 }
			);
		}

		// Hashear el token para comparar con el almacenado
		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// Buscar usuario con el token válido y no expirado
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "Token inválido o expirado",
				},
				{ status: 404 }
			);
		}

		// Actualizar contraseña
		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Contraseña restablecida correctamente",
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error("Error restableciendo contraseña:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error interno del servidor",
				error: process.env.NODE_ENV === "development" ? error.message : undefined,
			},
			{ status: 500 }
		);
	}
}