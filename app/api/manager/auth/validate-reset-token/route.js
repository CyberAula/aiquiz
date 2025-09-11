// app/api/manager/auth/validate-reset-token/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";
import crypto from "crypto";

/**
 * @swagger
 * /api/manager/auth/validate-reset-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Validar token de recuperación de contraseña
 *     description: Valida si un token de recuperación de contraseña es válido y no ha expirado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de recuperación de contraseña
 *                 example: abc123def456
 *     responses:
 *       200:
 *         description: Token válido
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
 *                   example: Token válido
 *       400:
 *         description: Token no proporcionado
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
 *                   example: Token no proporcionado
 *       404:
 *         description: Token no encontrado o expirado
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
 *                   example: Token de recuperación inválido o expirado
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

		const { token } = await request.json();

		// Validar token
		if (!token) {
			return NextResponse.json(
				{
					success: false,
					message: "Token no proporcionado",
				},
				{ status: 400 }
			);
		}

		// Hash del token para comparar con la base de datos
		const hashedToken = crypto
			.createHash("sha256")
			.update(token)
			.digest("hex");

		// Buscar usuario con el token
		const user = await User.findOne({
			resetPasswordToken: hashedToken,
			resetPasswordExpires: { $gt: Date.now() }, // Token no expirado
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "Token de recuperación inválido o expirado",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "Token válido",
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error("Error validando token de recuperación:", error);
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