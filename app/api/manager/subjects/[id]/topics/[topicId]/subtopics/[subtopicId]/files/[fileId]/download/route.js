// app/api/manager/subjects/[id]/topics/[topicId]/subtopics/[subtopicId]/files/[fileId]/download/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@utils/dbconnect";
import File from "@models/File";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}/files/{fileId}/download:
 *   get:
 *     tags:
 *       - Files
 *     summary: Descargar archivo con token temporal
 *     description: Descarga un archivo usando un token temporal (no requiere Bearer auth)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtema
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo a descargar
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token temporal de descarga
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Token inválido o expirado
 *       404:
 *         description: Archivo no encontrado
 *       500:
 *         description: Error del servidor
 */

export async function GET(request) {
	console.log('[Download File Public API] Descargando archivo con token temporal');
	
	try {
		const url = new URL(request.url);
		const pathSegments = url.pathname.split('/');
		
		// Extraer parámetros de la URL
		const id = pathSegments[4]; // subjects/{id}
		const topicId = pathSegments[6]; // topics/{topicId}
		const subtopicId = pathSegments[8]; // subtopics/{subtopicId}
		const fileId = pathSegments[10]; // files/{fileId}
		const token = url.searchParams.get('token');

		console.log('[Download File Public API] Parámetros:', {
			subjectId: id,
			topicId,
			subtopicId,
			fileId,
			hasToken: !!token
		});

		if (!token) {
			return NextResponse.json(
				{
					success: false,
					message: "Token de descarga requerido",
				},
				{ status: 403 }
			);
		}

		// Verificar token temporal
		let tokenPayload;
		try {
			tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			console.log('[Download File Public API] Token inválido:', error.message);
			return NextResponse.json(
				{
					success: false,
					message: "Token de descarga inválido o expirado",
				},
				{ status: 403 }
			);
		}

		// Verificar que el token es para este archivo específico
		if (tokenPayload.fileId !== fileId || tokenPayload.type !== 'download') {
			return NextResponse.json(
				{
					success: false,
					message: "Token no válido para este archivo",
				},
				{ status: 403 }
			);
		}

		await dbConnect();
		console.log('[Download File Public API] Conexión a BD establecida');

		// Buscar el archivo
		const file = await File.findOne({ _id: fileId, subtopic: subtopicId });
		if (!file) {
			return NextResponse.json(
				{
					success: false,
					message: "Archivo no encontrado",
				},
				{ status: 404 }
			);
		}

		console.log(`[Download File Public API] Archivo encontrado: ${file.originalName}`);

		// Verificar si es un video con transcripción o un archivo con contenido
		let fileContent, fileName, mimeType, fileSize;

		if (file.fileType === 'video' && file.transcription && file.transcription.content) {
			// Es un video con transcripción - generar archivo TXT
			console.log(`[Download File Public API] Generando transcripción TXT para: ${file.originalName}`);
			
			const transcriptionText = `# Transcripción de: ${file.originalName}\n\n` +
				`Título: ${file.transcription.metadata?.title || 'Sin título'}\n` +
				`Autor: ${file.transcription.metadata?.author || 'Desconocido'}\n` +
				`Duración: ${file.transcription.metadata?.duration || 'Desconocida'}\n` +
				`URL: ${file.transcription.metadata?.url || 'No disponible'}\n` +
				`Fecha de transcripción: ${file.transcription.metadata?.transcribedAt ? new Date(file.transcription.metadata.transcribedAt).toLocaleString('es-ES') : 'Desconocida'}\n` +
				`Servicio: ${file.transcription.metadata?.service || 'Desconocido'}\n` +
				`Idioma: ${file.transcription.metadata?.language || 'Desconocido'}\n` +
				`Caracteres: ${file.transcription.metadata?.characterCount || 'Desconocido'}\n\n` +
				`--- CONTENIDO DE LA TRANSCRIPCIÓN ---\n\n` +
				`${file.transcription.content}`;

			fileContent = Buffer.from(transcriptionText, 'utf-8');
			fileName = `${file.originalName.replace(/\.[^/.]+$/, '')}_transcripcion.txt`;
			mimeType = 'text/plain; charset=utf-8';
			fileSize = fileContent.length;
		} else if (file.fileContent) {
			// Es un archivo regular (PDF, etc.)
			console.log(`[Download File Public API] Descargando archivo regular: ${file.originalName} (${file.size} bytes)`);
			fileContent = file.fileContent;
			fileName = file.originalName;
			mimeType = file.mimeType || 'application/octet-stream';
			fileSize = file.size;
		} else {
			return NextResponse.json(
				{
					success: false,
					message: "El archivo no tiene contenido almacenado ni transcripción disponible",
				},
				{ status: 404 }
			);
		}

		console.log(`[Download File Public API] Preparando descarga: ${fileName} (${fileSize} bytes)`);

		// Configurar headers para descarga
		const headers = new Headers();
		headers.set('Content-Type', mimeType);
		headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
		headers.set('Content-Length', fileSize.toString());

		// Retornar el archivo como respuesta binaria
		return new Response(fileContent, {
			status: 200,
			headers
		});

	} catch (error) {
		console.error('[Download File Public API] Error descargando archivo:', error);
		return NextResponse.json(
			{
				success: false,
				message: "Error descargando archivo",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}