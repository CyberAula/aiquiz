// app/api/manager/auth/recovery/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";
import { sendPasswordRecovery } from "../../../../utils/emailService";

/**
 * @swagger
 * /api/manager/auth/recovery:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Recuperar contraseña
 *     description: Envía un email para recuperar la contraseña (simulado)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: admin@upm.es
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
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
 *                   example: Si el email existe en nuestro sistema, recibirás un enlace de recuperación
 *                 token:
 *                   type: string
 *                   description: Token de recuperación (solo en desarrollo)
 *                   example: abc123def456
 *       400:
 *         description: Email no proporcionado
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
 *                   example: Email no proporcionado
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

		const { email } = await request.json();

		// Validar email
		if (!email) {
			return NextResponse.json(
				{
					success: false,
					message: "Email no proporcionado",
				},
				{ status: 400 }
			);
		}

		// Validar formato del email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					success: false,
					message: "Formato de email inválido",
				},
				{ status: 400 }
			);
		}

		// Buscar usuario
		const user = await User.findOne({ email: email.toLowerCase() });

		// SEGURIDAD: Siempre devolver el mismo mensaje, exista o no el usuario
		// Esto previene la enumeración de usuarios registrados
		let emailResult = null;
		let resetToken = null;

		if (user) {
			// Solo generar token y enviar email si el usuario existe
			resetToken = user.createPasswordResetToken();
			await user.save({ validateBeforeSave: false });

			// Enviar email de recuperación
			try {
				emailResult = await sendPasswordRecovery({
					email: user.email,
					userName: user.name,
					resetToken: resetToken
				});
			} catch (emailError) {
				console.error('Error enviando email de recuperación:', emailError);
			}
		} else {
			// Usuario no existe - simular el tiempo de procesamiento pero no hacer nada
			console.log(`Intento de recuperación para email no registrado: ${email}`);
		}

		// Siempre devolver el mismo mensaje de éxito
		const response = {
			success: true,
			message: "Si el email existe en nuestro sistema, recibirás un enlace de recuperación",
			emailSent: emailResult?.success || false,
		};

		// En desarrollo, incluir el token para pruebas (solo si el usuario existe)
		if (process.env.NODE_ENV === "development" && resetToken) {
			response.token = resetToken;
			response.userExists = !!user; // Para debugging
		}

		return NextResponse.json(response, { status: 200 });

	} catch (error) {
		console.error("Error en recuperación de contraseña:", error);
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