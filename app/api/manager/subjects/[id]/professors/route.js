// app/api/manager/subjects/[id]/professors/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../../utils/dbconnect";
import Subject from "../../../../../manager/models/Subject";
import User from "../../../../../manager/models/User";
import { withAuth, handleError } from "../../../../../utils/authMiddleware";
import { sendProfessorInvitation } from "../../../../../utils/emailService";
import crypto from "crypto";

/**
 * @swagger
 * /api/manager/subjects/{id}/professors:
 *   post:
 *     tags:
 *       - Subjects
 *     summary: Añadir profesor a asignatura
 *     description: Añade un profesor a una asignatura específica
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
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del profesor a añadir
 *                 example: profesor@upm.es
 *               name:
 *                 type: string
 *                 description: Nombre del profesor (opcional, si no existe se creará)
 *                 example: María García
 *     responses:
 *       200:
 *         description: Profesor añadido exitosamente
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
 *                   example: Profesor añadido correctamente
 *                 data:
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
 *                       example: profesor@upm.es
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
 *                   example: El email es obligatorio
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
async function addProfessor(request, context) {
	try {
		await dbConnect();

		const { id } = context.params;
		const { email, name } = await request.json();

		// Validar datos obligatorios
		if (!email) {
			return NextResponse.json(
				{
					success: false,
					message: "El email es obligatorio",
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

		// Obtener información del usuario que invita (desde el contexto de auth)
		const inviterUser = await User.findById(context.user.id);
		const inviterName = inviterUser ? inviterUser.name : "Administrador";

		// Buscar o crear usuario
		let user = await User.findOne({ email: email.toLowerCase() });
		let isNewUser = false;
		
		if (!user) {
			// Generar token de invitación
			const invitationToken = crypto.randomBytes(32).toString('hex');
			const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');
			const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

			// Si no existe el usuario, crear uno nuevo
			user = new User({
				name: name || email.split('@')[0],
				email: email.toLowerCase(),
				password: crypto.randomBytes(20).toString('hex'), // Contraseña aleatoria temporal
				role: "professor",
				invitationToken: hashedToken, // Guardar token hasheado
				invitationExpires,
				isActive: false, // Inactivo hasta que acepte la invitación
			});
			await user.save();
			isNewUser = true;
			
			// Mantener el token sin hashear para el email
			user.invitationToken = invitationToken;
		} else {
			// Si el usuario ya existe, verificar si es profesor
			if (user.role !== 'professor') {
				return NextResponse.json(
					{
						success: false,
						message: "El usuario existe pero no es profesor",
					},
					{ status: 400 }
				);
			}

			// Si no está activo, regenerar token de invitación
			if (!user.isActive) {
				const invitationToken = crypto.randomBytes(32).toString('hex');
				const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');
				const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
				
				user.invitationToken = hashedToken; // Guardar token hasheado
				user.invitationExpires = invitationExpires;
				await user.save();
				
				// Mantener el token sin hashear para el email
				user.invitationToken = invitationToken;
			}
		}

		// Verificar si ya está asignado
		if (subject.professors.includes(user._id)) {
			return NextResponse.json(
				{
					success: false,
					message: "El profesor ya está asignado a esta asignatura",
				},
				{ status: 400 }
			);
		}

		// Añadir profesor
		subject.professors.push(user._id);
		await subject.save();

		// Enviar email de invitación si es necesario
		let emailResult = null;
		if (isNewUser || !user.isActive) {
			try {
				emailResult = await sendProfessorInvitation({
					email: user.email,
					professorName: user.name,
					subjectTitle: subject.title,
					invitationToken: user.invitationToken,
					inviterName: inviterName
				});
			} catch (emailError) {
				console.error('Error enviando email de invitación:', emailError);
				// No fallar la invitación por un error de email
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: isNewUser 
					? "Profesor invitado correctamente. Se ha enviado un email de invitación." 
					: user.isActive 
						? "Profesor añadido correctamente"
						: "Profesor añadido. Se ha reenviado el email de invitación.",
				data: {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					isActive: user.isActive,
					isNewInvitation: isNewUser || !user.isActive,
				},
				emailSent: emailResult?.success || false,
			},
			{ status: 200 }
		);

	} catch (error) {
		return handleError(error, "Error añadiendo profesor");
	}
}

// Exportar handler con autenticación
export const POST = withAuth(addProfessor, { requireAdmin: true });