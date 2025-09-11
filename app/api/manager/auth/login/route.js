// app/api/manager/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";

/**
 * @swagger
 * /api/manager/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: admin@upm.es
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: Token JWT
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: Carlos González
 *                     email:
 *                       type: string
 *                       example: admin@upm.es
 *                     role:
 *                       type: string
 *                       example: admin
 *                     faculty:
 *                       type: string
 *                       example: ETSIT
 *       400:
 *         description: Datos de entrada inválidos
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
 *                   example: Email y contraseña son obligatorios
 *       401:
 *         description: Credenciales inválidas
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
 *                   example: Credenciales inválidas
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
		// Conectar a la base de datos
		await dbConnect();

		// Obtener datos del cuerpo de la petición
		const { email, password } = await request.json();

		// Validar datos de entrada
		if (!email || !password) {
			return NextResponse.json(
				{
					success: false,
					message: "Email y contraseña son obligatorios",
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

		// Buscar usuario en la base de datos
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "Credenciales inválidas",
				},
				{ status: 401 }
			);
		}

		// Verificar contraseña
		const isValidPassword = await user.comparePassword(password);

		if (!isValidPassword) {
			return NextResponse.json(
				{
					success: false,
					message: "Credenciales inválidas",
				},
				{ status: 401 }
			);
		}

		// Actualizar último login
		user.lastLogin = new Date();
		await user.save();

		// Generar token JWT
		const token = jwt.sign(
			{
				userId: user._id,
				email: user.email,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: process.env.JWT_EXPIRES_IN || "7d",
			}
		);

		// Respuesta exitosa
		return NextResponse.json(
			{
				success: true,
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					faculty: user.faculty,
					department: user.department,
					lastLogin: user.lastLogin,
				},
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error("Error en login:", error);
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