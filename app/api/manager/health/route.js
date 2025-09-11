// app/api/manager/health/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbconnect";

/**
 * @swagger
 * /api/manager/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Verificar estado del sistema
 *     description: Endpoint para verificar el estado de la API y la base de datos
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-01-01T00:00:00.000Z
 *                 database:
 *                   type: string
 *                   example: connected
 *                 environment:
 *                   type: string
 *                   example: development
 *       503:
 *         description: Problemas de conexión con la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */
export async function GET() {
	const timestamp = new Date().toISOString();
	let dbStatus = "disconnected";
	let dbError = null;

	try {
		await dbConnect();
		dbStatus = "connected";
		
		return NextResponse.json(
			{
				status: "healthy",
				timestamp,
				database: dbStatus,
				environment: process.env.NODE_ENV || "development",
				mongodb_uri: process.env.MONGODB_URI ? "configured" : "missing",
				jwt_secret: process.env.JWT_SECRET ? "configured" : "missing",
			},
			{ status: 200 }
		);
	} catch (error) {
		dbError = error.message;
		
		return NextResponse.json(
			{
				status: "unhealthy",
				timestamp,
				database: dbStatus,
				environment: process.env.NODE_ENV || "development",
				mongodb_uri: process.env.MONGODB_URI ? "configured" : "missing",
				jwt_secret: process.env.JWT_SECRET ? "configured" : "missing",
				error: dbError,
				troubleshooting: {
					steps: [
						"1. Instalar MongoDB: sudo apt-get install mongodb",
						"2. Iniciar MongoDB: sudo systemctl start mongodb",
						"3. Verificar estado: sudo systemctl status mongodb",
						"4. Verificar conexión: mongo --eval 'db.runCommand({ connectionStatus: 1 })'",
					]
				}
			},
			{ status: 503 }
		);
	}
}