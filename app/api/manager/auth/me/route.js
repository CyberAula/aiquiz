// /app/api/manager/auth/me/route.js - Endpoint para obtener información del usuario actual
import dbConnect from "../../../../utils/dbconnect";
import User from "../../../../manager/models/User";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/manager/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     description: Retorna la información del perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Carlos González"
 *                     email:
 *                       type: string
 *                       example: "admin@upm.es"
 *                     faculty:
 *                       type: string
 *                       example: "ETSIT"
 *                     department:
 *                       type: string
 *                       example: "Ingeniería Telemática"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T10:30:00Z"
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-15T14:30:00Z"
 *       401:
 *         description: No autorizado - Token inválido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Token no proporcionado"
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
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */

/**
 * @swagger
 * /api/manager/auth/me:
 *   put:
 *     summary: Actualizar información del usuario actual
 *     description: Actualiza la información del perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Carlos González"
 *               email:
 *                 type: string
 *                 example: "admin@upm.es"
 *               faculty:
 *                 type: string
 *                 example: "ETSIT"
 *               department:
 *                 type: string
 *                 example: "Ingeniería Telemática"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                   example: "Perfil actualizado correctamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Carlos González"
 *                     email:
 *                       type: string
 *                       example: "admin@upm.es"
 *                     faculty:
 *                       type: string
 *                       example: "ETSIT"
 *                     department:
 *                       type: string
 *                       example: "Ingeniería Telemática"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

export async function GET(request) {
	try {
		await dbConnect();

		// Obtener el token del header Authorization
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Token no proporcionado"
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const token = authHeader.split(' ')[1];

		// Verificar y decodificar el token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Token inválido"
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Buscar el usuario en la base de datos
		const user = await User.findById(decoded.userId).select('-password');
		
		if (!user) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Usuario no encontrado"
				}),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Actualizar lastLogin
		user.lastLogin = new Date();
		await user.save();

		return new Response(
			JSON.stringify({
				success: true,
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					faculty: user.faculty,
					department: user.department,
					role: user.role,
					createdAt: user.createdAt,
					lastLogin: user.lastLogin
				}
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);

	} catch (error) {
		console.error("❌ Error en GET /api/manager/auth/me:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: "Error interno del servidor"
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}

export async function PUT(request) {
	try {
		await dbConnect();

		// Obtener el token del header Authorization
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Token no proporcionado"
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		const token = authHeader.split(' ')[1];

		// Verificar y decodificar el token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Token inválido"
				}),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Obtener los datos del cuerpo de la petición
		const body = await request.json();
		const { name, email, faculty, department } = body;

		// Validar datos requeridos
		if (!name || !email) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Nombre y email son obligatorios"
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Validar formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Formato de email inválido"
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Buscar el usuario en la base de datos
		const user = await User.findById(decoded.userId);
		
		if (!user) {
			return new Response(
				JSON.stringify({
					success: false,
					error: "Usuario no encontrado"
				}),
				{
					status: 404,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Verificar si el email ya está en uso por otro usuario
		if (email !== user.email) {
			const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
			if (existingUser) {
				return new Response(
					JSON.stringify({
						success: false,
						error: "El email ya está en uso por otro usuario"
					}),
					{
						status: 400,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}
		}

		// Actualizar datos del usuario
		user.name = name;
		user.email = email;
		user.faculty = faculty || user.faculty;
		user.department = department || user.department;

		await user.save();

		return new Response(
			JSON.stringify({
				success: true,
				message: "Perfil actualizado correctamente",
				user: {
					_id: user._id,
					name: user.name,
					email: user.email,
					faculty: user.faculty,
					department: user.department,
					role: user.role,
					createdAt: user.createdAt,
					lastLogin: user.lastLogin
				}
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);

	} catch (error) {
		console.error("❌ Error en PUT /api/manager/auth/me:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: "Error interno del servidor"
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}