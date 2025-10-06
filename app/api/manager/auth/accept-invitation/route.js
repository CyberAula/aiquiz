// app/api/manager/auth/accept-invitation/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";
import crypto from "crypto";

/**
 * @swagger
 * /api/manager/auth/accept-invitation:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Aceptar invitación y configurar contraseña
 *     description: Activa la cuenta del usuario y establece su contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de invitación
 *                 example: abc123def456
 *               password:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *                 example: nuevaPassword123
 *     responses:
 *       200:
 *         description: Invitación aceptada correctamente
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
 *                   example: Invitación aceptada correctamente
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: María García
 *                     email:
 *                       type: string
 *                       example: maria@upm.es
 *                     role:
 *                       type: string
 *                       example: professor
 *                     isActive:
 *                       type: boolean
 *                       example: true
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
 *                   example: Token y contraseña son obligatorios
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
 *                   example: Token de invitación inválido o expirado
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

		const { token, password } = await request.json();

		// Validar datos obligatorios
		if (!token || !password) {
			return NextResponse.json(
				{
					success: false,
					message: "Token y contraseña son obligatorios",
				},
				{ status: 400 }
			);
		}

		// Validar contraseña
		if (password.length < 8) {
			return NextResponse.json(
				{
					success: false,
					message: "La contraseña debe tener al menos 8 caracteres",
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
			invitationToken: hashedToken,
			invitationExpires: { $gt: Date.now() }, // Token no expirado
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "Token de invitación inválido o expirado",
				},
				{ status: 404 }
			);
		}

		// Actualizar usuario: activar cuenta, establecer contraseña y limpiar token
		user.password = password; // Se hasheará automáticamente por el middleware
		user.isActive = true;
		user.invitationToken = undefined;
		user.invitationExpires = undefined;
		
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Invitación aceptada correctamente",
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					isActive: user.isActive,
				},
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error("Error aceptando invitación:", error);
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