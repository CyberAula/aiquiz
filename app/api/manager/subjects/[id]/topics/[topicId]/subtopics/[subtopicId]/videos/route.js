// app/api/manager/subjects/[id]/topics/[topicId]/subtopics/[subtopicId]/videos/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Subtopic from "@models/Subtopic";
import File from "@models/File.js";
import { withAuth, handleError } from "@utils/authMiddleware";
import logger from "@utils/logger.js";
import videoProcessor from "@utils/videoProcessor.js";

// Logger específico para API de videos
const videosLogger = logger.create('VideosAPI');

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}/videos:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Añadir URL de video a subtema
 *     description: |
 *       🚨 ENDPOINT PENDIENTE DE IMPLEMENTACIÓN 🚨
 *       
 *       Este endpoint debe implementar la adición de URLs de video para subtemas.
 *       
 *       Funcionalidad requerida:
 *       - Validar URL de video
 *       - Detectar plataforma (YouTube, Vimeo, etc.)
 *       - Extraer metadata del video (título, duración, thumbnail)
 *       - Crear registro en base de datos
 *       - Asociar video al subtema
 *       
 *       Ubicación: /mnt/c/Users/drmor/Documents/04 Otros/02 TFM/temp/app/api/manager/subjects/[id]/topics/[topicId]/subtopics/[subtopicId]/videos/route.js
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
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *         example: 507f1f77bcf86cd799439012
 *       - in: path
 *         name: subtopicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del subtema
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL del video
 *                 example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *               platform:
 *                 type: string
 *                 enum: [youtube, vimeo, custom]
 *                 description: Plataforma del video (se detecta automáticamente)
 *                 example: youtube
 *               title:
 *                 type: string
 *                 description: Título personalizado del video (opcional)
 *                 example: Introducción a Variables JavaScript
 *               description:
 *                 type: string
 *                 description: Descripción del video (opcional)
 *                 example: Video explicativo sobre variables en JavaScript
 *     responses:
 *       200:
 *         description: URL de video añadida exitosamente
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
 *                   example: URL de video añadida correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439014
 *                     originalName:
 *                       type: string
 *                       example: "Video - Variables JavaScript"
 *                     externalUrl:
 *                       type: string
 *                       example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *                     platform:
 *                       type: string
 *                       example: youtube
 *                     fileType:
 *                       type: string
 *                       example: video
 *                     isExternal:
 *                       type: boolean
 *                       example: true
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                           example: Rick Astley - Never Gonna Give You Up
 *                         duration:
 *                           type: string
 *                           example: 00:03:33
 *                         thumbnail:
 *                           type: string
 *                           example: https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg
 *       400:
 *         description: Error de validación
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
 *                   example: URL de video inválida
 *       404:
 *         description: Subtema no encontrado
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
 *                   example: Subtema no encontrado
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
 *                   example: Error añadiendo video
 */
async function addVideo(request, context) {
	try {
		await dbConnect();

		const { id, topicId, subtopicId } = context.params;
		const { url, platform, title, description } = await request.json();

		videosLogger.info("Processing new video", { 
			subtopicId, 
			url: url?.substring(0, 50) + '...' 
		});

		// Validar URL obligatoria
		if (!url) {
			return NextResponse.json(
				{
					success: false,
					message: "La URL del video es obligatoria",
				},
				{ status: 400 }
			);
		}

		// Validación básica de URL
		const urlRegex = /^https?:\/\/.+/;
		if (!urlRegex.test(url)) {
			return NextResponse.json(
				{
					success: false,
					message: "URL de video inválida",
				},
				{ status: 400 }
			);
		}

		// Verificar que el subtema existe
		const subtopic = await Subtopic.findOne({ _id: subtopicId, topic: topicId });
		if (!subtopic) {
			return NextResponse.json(
				{
					success: false,
					message: "Subtema no encontrado",
				},
				{ status: 404 }
			);
		}

		// Procesar video completo: metadata, transcripción y RAG
		try {
			const processingResult = await videoProcessor.processVideo(
				url,
				subtopicId,
				context.user.id,
				{
					title: title?.trim(),
					description: description?.trim(),
					platform: platform
				}
			);

			if (!processingResult.success) {
				throw new Error('Error en el procesamiento del video');
			}

			// Actualizar subtema para incluir el nuevo video
			await Subtopic.findByIdAndUpdate(
				subtopicId,
				{ $push: { files: processingResult.fileRecord._id } }
			);

			videosLogger.info("Video processed and added successfully", {
				fileId: processingResult.fileRecord._id,
				transcriptionLength: processingResult.transcription.length,
				ragProcessed: processingResult.rag.success
			});

			// Respuesta exitosa
			return NextResponse.json(
				{
					success: true,
					message: "Video añadido y procesado correctamente",
					data: {
						_id: processingResult.fileRecord._id,
						originalName: processingResult.fileRecord.originalName,
						externalUrl: url,
						platform: processingResult.fileRecord.platform,
						fileType: "video",
						isExternal: true,
						metadata: processingResult.metadata,
						transcription: {
							length: processingResult.transcription.length,
							processed: true
						},
						rag: {
							processed: processingResult.rag.success,
							chunks: processingResult.rag.chunks || 0
						}
					},
				},
				{ status: 200 }
			);

		} catch (processingError) {
			videosLogger.error("Error procesando video", processingError);

			// Intentar crear registro básico sin transcripción
			try {
				const basicFile = new File({
					fileName: `video_${Date.now()}_fallback.txt`,
					originalName: title?.trim() || 'Video sin título',
					mimeType: 'video/external',
					size: 0,
					path: '', // Cadena vacía para archivos externos
					fileType: 'video',
					subtopic: subtopicId,
					uploadedBy: context.user.id,
					isExternal: true,
					externalUrl: url,
					platform: platform || 'other',
					description: description?.trim() || '',
					ragProcessed: false
				});

				const savedFile = await basicFile.save();

				await Subtopic.findByIdAndUpdate(
					subtopicId,
					{ $push: { files: savedFile._id } }
				);

				videosLogger.warn("Video added without transcription", {
					fileId: savedFile._id,
					error: processingError.message
				});

				return NextResponse.json(
					{
						success: true,
						message: "Video añadido (transcripción pendiente)",
						warning: "No se pudo procesar la transcripción automáticamente",
						data: {
							_id: savedFile._id,
							originalName: savedFile.originalName,
							externalUrl: url,
							platform: savedFile.platform,
							fileType: "video",
							isExternal: true,
							transcription: {
								processed: false,
								error: processingError.message
							},
							rag: {
								processed: false
							}
						},
					},
					{ status: 200 }
				);

			} catch (fallbackError) {
				videosLogger.error("Error en fallback de video", fallbackError);
				throw fallbackError;
			}
		}

	} catch (error) {
		videosLogger.error("Error general añadiendo video", error);
		return handleError(error, "Error añadiendo video");
	}
}

// Exportar handler con autenticación
export const POST = withAuth(addVideo, { requireProfessor: true });