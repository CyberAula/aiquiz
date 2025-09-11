// utils/authMiddleware.js - Middleware para autenticación JWT
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import dbConnect from "./dbconnect";
import User from "../manager/models/User";

/**
 * Middleware para verificar token JWT
 * @param {Request} request - La petición HTTP
 * @returns {Object} - Objeto con usuario y función para continuar
 */
export async function verifyToken(request) {
	try {
		// Obtener token del header Authorization
		const authHeader = request.headers.get("authorization");
		
		if (!authHeader) {
			return {
				error: NextResponse.json(
					{
						success: false,
						message: "Token de autorización no proporcionado",
					},
					{ status: 401 }
				),
			};
		}

		// Extraer token (formato: "Bearer <token>")
		const token = authHeader.split(" ")[1];
		
		if (!token) {
			return {
				error: NextResponse.json(
					{
						success: false,
						message: "Formato de token inválido",
					},
					{ status: 401 }
				),
			};
		}

		// Verificar token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		// Conectar a la base de datos
		await dbConnect();
		
		// Buscar usuario
		const user = await User.findById(decoded.userId);
		
		if (!user) {
			return {
				error: NextResponse.json(
					{
						success: false,
						message: "Usuario no encontrado",
					},
					{ status: 401 }
				),
			};
		}

		// Retornar usuario autenticado
		return {
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				faculty: user.faculty,
				department: user.department,
			},
		};

	} catch (error) {
		console.error("Error en verificación de token:", error);
		
		if (error.name === "JsonWebTokenError") {
			return {
				error: NextResponse.json(
					{
						success: false,
						message: "Token inválido",
					},
					{ status: 401 }
				),
			};
		}
		
		if (error.name === "TokenExpiredError") {
			return {
				error: NextResponse.json(
					{
						success: false,
						message: "Token expirado",
					},
					{ status: 401 }
				),
			};
		}

		return {
			error: NextResponse.json(
				{
					success: false,
					message: "Error de autenticación",
				},
				{ status: 401 }
			),
		};
	}
}

/**
 * Middleware para verificar rol de administrador
 * @param {Object} user - Usuario autenticado
 * @returns {Object} - Error si no es admin, null si es válido
 */
export function requireAdmin(user) {
	if (user.role !== "admin") {
		return {
			error: NextResponse.json(
				{
					success: false,
					message: "Acceso denegado. Se requieren permisos de administrador",
				},
				{ status: 403 }
			),
		};
	}
	return {};
}

/**
 * Middleware para verificar rol de profesor o superior
 * @param {Object} user - Usuario autenticado
 * @returns {Object} - Error si no es profesor o admin, null si es válido
 */
export function requireProfessor(user) {
	if (user.role !== "admin" && user.role !== "professor") {
		return {
			error: NextResponse.json(
				{
					success: false,
					message: "Acceso denegado. Se requieren permisos de profesor",
				},
				{ status: 403 }
			),
		};
	}
	return {};
}

/**
 * Wrapper para rutas protegidas
 * @param {Function} handler - Función que maneja la ruta
 * @param {Object} options - Opciones de autenticación
 * @returns {Function} - Función envuelta con autenticación
 */
export function withAuth(handler, options = {}) {
	return async function(request, context) {
		const { user, error } = await verifyToken(request);
		
		if (error) {
			return error;
		}
		
		// Verificar rol si es necesario
		if (options.requireAdmin) {
			const adminCheck = requireAdmin(user);
			if (adminCheck.error) {
				return adminCheck.error;
			}
		}
		
		if (options.requireProfessor) {
			const professorCheck = requireProfessor(user);
			if (professorCheck.error) {
				return professorCheck.error;
			}
		}
		
		// Añadir usuario al contexto
		const newContext = {
			...context,
			user,
		};
		
		return handler(request, newContext);
	};
}

/**
 * Utility para manejar errores de forma consistente
 * @param {Error} error - Error a manejar
 * @param {string} message - Mensaje personalizado
 * @returns {NextResponse} - Respuesta de error
 */
export function handleError(error, message = "Error interno del servidor") {
	console.error("Error en API:", error);
	
	return NextResponse.json(
		{
			success: false,
			message,
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		},
		{ status: 500 }
	);
}