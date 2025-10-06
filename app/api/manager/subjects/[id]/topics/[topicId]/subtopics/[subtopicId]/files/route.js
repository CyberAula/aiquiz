// app/api/manager/subjects/[id]/topics/[topicId]/subtopics/[subtopicId]/files/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Subtopic from "@models/Subtopic";
import File from "@models/File";
import User from "@models/User";
import { withAuth, handleError } from "@utils/authMiddleware";

// Importaciones estáticas de RAG Managers
let RAGManagerV2, RAGManager, MockRAGManager;

// Función para cargar RAG Manager dinámicamente (con fallback a Mock)
async function loadRAGManager() {
	console.log('[Files API] 🚀 Intentando cargar RAG Manager real...');
	
	// Verificar si Qdrant está corriendo
	try {
		const qdrantResponse = await fetch('http://localhost:6333/').catch(() => null);
		if (qdrantResponse && qdrantResponse.ok) {
			console.log('[Files API] ✅ Qdrant disponible, cargando RAG Manager V2...');
			
			try {
				if (!RAGManagerV2) {
					console.log('[Files API] 📦 Importando RAG Manager V2...');
					const ragModule = await import("@rag/core/ragManagerV2");
					RAGManagerV2 = ragModule.default || ragModule;
				}
				
				console.log('[Files API] 🔧 Creando instancia de RAG Manager V2...');
				const ragManager = new RAGManagerV2({
					enableLogging: true,
					chunkSize: 512,
					overlap: 50,
					embeddingModel: 'Xenova/all-MiniLM-L6-v2'
				});
				
				console.log('[Files API] ✅ RAG Manager V2 creado exitosamente');
				return { ragManager, isMock: false };
				
			} catch (realError) {
				console.warn('[Files API] ⚠️ Error con RAG Manager V2:', realError.message);
				console.warn('[Files API] Stack trace:', realError.stack);
				
				// Fallback al RAG Manager original
				try {
					console.log('[Files API] 🔄 Intentando RAG Manager original...');
					if (!RAGManager) {
						const ragModule = await import("@rag/core/ragManager");
						RAGManager = ragModule.default || ragModule;
					}
					const ragManager = new RAGManager();
					console.log('[Files API] ✅ RAG Manager original cargado');
					return { ragManager, isMock: false };
				} catch (fallbackError) {
					console.warn('[Files API] ⚠️ Error con RAG Manager original:', fallbackError.message);
				}
			}
		} else {
			console.log('[Files API] ❌ Qdrant no disponible, usando Mock');
		}
	} catch (healthError) {
		console.log('[Files API] ❌ Error verificando Qdrant:', healthError.message);
	}
	
	// Fallback a Mock si todo falla
	console.log('[Files API] 🛠️ Usando Mock RAG Manager como fallback');
	try {
		if (!MockRAGManager) {
			const mockModule = await import("@rag/core/mockRAGManager");
			MockRAGManager = mockModule.default || mockModule;
		}
		const ragManager = new MockRAGManager();
		console.log('[Files API] ✅ Mock RAG Manager cargado');
		return { ragManager, isMock: true };
	} catch (mockError) {
		console.error('[Files API] ❌ Error crítico cargando Mock RAG Manager:', mockError.message);
		throw new Error(`Sistema RAG completamente no disponible: ${mockError.message}`);
	}
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}/files:
 *   post:
 *     tags:
 *       - Files
 *     summary: Subir archivo PDF con procesamiento RAG
 *     description: |
 *       Sube archivos PDF y los procesa automáticamente con el sistema RAG para búsqueda semántica.
 *       
 *       Funcionalidades implementadas:
 *       - Validación de archivos PDF únicamente
 *       - Validación de tamaño máximo (50MB)
 *       - Procesamiento RAG automático para PDFs
 *       - Almacenamiento en Chroma DB para búsqueda semántica
 *       - Creación de registro en base de datos MongoDB
 *       - Asociación del archivo al subtema correspondiente
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF a subir y procesar con RAG
 *               description:
 *                 type: string
 *                 description: Descripción del archivo (opcional)
 *                 example: Documento con conceptos de JavaScript
 *     responses:
 *       200:
 *         description: Archivo subido exitosamente
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
 *                   example: Archivo subido correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439014
 *                     fileName:
 *                       type: string
 *                       example: documento_1234567890.pdf
 *                     originalName:
 *                       type: string
 *                       example: Variables JavaScript.pdf
 *                     fileType:
 *                       type: string
 *                       example: document
 *                     size:
 *                       type: number
 *                       example: 1024576
 *                     mimeType:
 *                       type: string
 *                       example: application/pdf
 *                     url:
 *                       type: string
 *                       example: /uploads/documento_1234567890.pdf
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
 *                   example: Tipo de archivo no permitido
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
 *                   example: Error subiendo archivo
 */

async function uploadFile(request, context) {
	console.log('[Files API] Starting file upload processing');
	console.log('[Files API] Parameters:', context.params);
	console.log('[Files API] Headers:', Object.fromEntries(request.headers.entries()));
	console.log('[Files API] Method:', request.method);
	console.log('[Files API] Content-Type:', request.headers.get('content-type'));
	
	try {
		await dbConnect();
		console.log('[Files API] Database connection established');

		const { id, topicId, subtopicId } = context.params;
		
		// 1. Verificar que el subtema existe
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

		// 2. Procesar el archivo multipart
		console.log('📦 [Files API] Procesando FormData...');
		const formData = await request.formData();
		console.log('📦 [Files API] FormData procesado, buscando archivo...');
		
		const file = formData.get('file');
		const description = formData.get('description') || '';
		
		console.log('[Files API] Data received:', {
			hasFile: !!file,
			fileName: file?.name,
			fileSize: file?.size,
			fileType: file?.type,
			description: description
		});

		if (!file) {
			return NextResponse.json(
				{
					success: false,
					message: "No se encontró archivo en la solicitud",
				},
				{ status: 400 }
			);
		}

		// 3. Validar que es un PDF
		if (file.type !== 'application/pdf') {
			return NextResponse.json(
				{
					success: false,
					message: "Solo se permiten archivos PDF",
				},
				{ status: 400 }
			);
		}

		// 4. Validar tamaño (50MB máximo)
		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			return NextResponse.json(
				{
					success: false,
					message: `Archivo demasiado grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
				},
				{ status: 400 }
			);
		}

		// 5. Preparar contexto para RAG
		const context_rag = {
			subjectId: id,
			topicId: topicId,
			subtopicId: subtopicId,
		};

		// 6. Convertir File a formato compatible con RAG Manager
		const buffer = await file.arrayBuffer();
		const fileForRAG = {
			originalname: file.name,
			buffer: Buffer.from(buffer),
			size: file.size,
			mimetype: file.type,
		};

		console.log(`[Files API] Procesando PDF: ${file.name} (${Math.round(file.size / 1024)}KB)`);

		// 7. Cargar y procesar con sistema RAG
		let ragResult;
		let isMock = false;
		
		try {
			const { ragManager, isMock: isManagerMock } = await loadRAGManager();
			isMock = isManagerMock;
			
			if (isMock) {
				console.log('[Files API] ⚠️ Usando RAG Manager en modo desarrollo (Mock)');
			}
			
			await ragManager.initialize();
			ragResult = await ragManager.processPDF(fileForRAG, context_rag, context.user.id);
			
			console.log(`[Files API] RAG procesamiento ${isMock ? '(Mock)' : ''} completado:`, {
				success: ragResult.success,
				documentId: ragResult.documentId,
				stats: ragResult.stats
			});
			
		} catch (ragError) {
			console.error('[Files API] Error en procesamiento RAG, usando fallback Mock:', ragError.message);
			
			// Fallback final a Mock si todo falla
			try {
				if (!MockRAGManager) {
					const mockModule = await import("@rag/core/mockRAGManager");
					MockRAGManager = mockModule.default || mockModule;
				}
				const mockRagManager = new MockRAGManager();
				await mockRagManager.initialize();
				ragResult = await mockRagManager.processPDF(fileForRAG, context_rag, context.user.id);
				isMock = true;
				
				console.log('[Files API] Mock RAG fallback successful');
			} catch (mockError) {
				console.error('[Files API] Error crítico - ni RAG real ni Mock funcionan:', mockError.message);
				throw new Error(`Sistema RAG completamente no disponible: ${mockError.message}`);
			}
		}

		if (!ragResult.success) {
			return NextResponse.json(
				{
					success: false,
					message: "Error procesando PDF con sistema RAG",
					error: ragResult.error,
				},
				{ status: 500 }
			);
		}

		// 8. Generar nombre único y crear registro en MongoDB con contenido
		const uniqueName = `${Date.now()}_${ragResult.documentId}_${file.name}`;

		// 9. Crear registro en base de datos con contenido del archivo y información RAG
		const fileDocument = new File({
			fileName: uniqueName,
			originalName: file.name,
			mimeType: file.type,
			size: file.size,
			path: '', // No se usa ruta física, el contenido está en MongoDB
			fileType: "document",
			subtopic: subtopicId,
			uploadedBy: context.user.id,
			isExternal: false,
			platform: "local",
			description: description,
			// Contenido del archivo almacenado en MongoDB
			fileContent: Buffer.from(buffer),
			// Campos RAG
			ragProcessed: true,
			ragDocumentId: ragResult.documentId,
			ragStats: {
				chunks: ragResult.stats.chunks,
				pages: ragResult.stats.pages,
				processingTime: ragResult.stats.processingTime,
				textLength: ragResult.stats.textLength,
				quality: ragResult.stats.quality,
			},
		});

		await fileDocument.save();

		console.log(`[Files API] PDF procesado exitosamente: ${ragResult.stats.chunks} chunks, ${ragResult.stats.pages} páginas`);

		// 11. Retornar respuesta completa
		return NextResponse.json(
			{
				success: true,
				message: `PDF subido y procesado exitosamente${isMock ? ' (modo desarrollo)' : ''}`,
				data: {
					// Información del archivo
					_id: fileDocument._id,
					fileName: uniqueName,
					originalName: file.name,
					fileType: "document",
					size: file.size,
					mimeType: file.type,
					url: `/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}/files/${fileDocument._id}`,
					description: description,
					
					// Estado RAG
					ragProcessed: true,
					ragDocumentId: ragResult.documentId,
					ragMode: isMock ? 'development' : 'production',
					
					// Información del procesamiento RAG
					ragProcessing: {
						documentId: ragResult.documentId,
						stats: ragResult.stats,
						pdfInfo: ragResult.pdfInfo,
						mode: isMock ? 'mock' : 'real',
					},
					
					// Contexto educativo
					context: {
						subjectId: id,
						topicId: topicId,
						subtopicId: subtopicId,
					},
					
					// Timestamps
					uploadedAt: fileDocument.createdAt,
					updatedAt: fileDocument.updatedAt,
				},
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('[Files API] Error procesando archivo:', error);
		
		// Errores específicos del sistema RAG
		if (error.message.includes('RAG')) {
			return NextResponse.json(
				{
					success: false,
					message: "Error en el sistema de procesamiento semántico",
					error: error.message,
					suggestion: "Verificar que el servicio Chroma DB esté ejecutándose",
				},
				{ status: 503 }
			);
		}
		
		return handleError(error, "Error subiendo archivo");
	}
}

// Función para obtener archivos del subtema
async function getFiles(request, context) {
	console.log('[Files API] Getting subtopic files');
	
	try {
		await dbConnect();
		console.log('[Files API] Database connection established');

		const { id, topicId, subtopicId } = context.params;
		
		// 1. Verificar que el subtema existe
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

		console.log('[Files API] Searching files for subtopic:', subtopicId);

		// 2. Obtener archivos del subtema
		const files = await File.find({ subtopic: subtopicId })
			.populate('uploadedBy', 'name email')
			.sort({ createdAt: -1 });

		console.log(`[Files API] Found ${files.length} files`);

		// 3. Formatear respuesta
		const formattedFiles = files.map(file => ({
			_id: file._id,
			fileName: file.fileName,
			originalName: file.originalName,
			fileType: file.fileType,
			size: file.size,
			mimeType: file.mimeType,
			url: `/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}/files/${file._id}`,
			description: file.description,
			ragProcessed: file.ragProcessed,
			ragDocumentId: file.ragDocumentId,
			ragStats: file.ragStats,
			uploadedBy: file.uploadedBy,
			createdAt: file.createdAt,
			updatedAt: file.updatedAt,
			transcription: file.transcription,
		}));

		return NextResponse.json(
			{
				success: true,
				message: `${files.length} archivos encontrados`,
				data: {
					files: formattedFiles,
					total: files.length,
					subtopicId: subtopicId,
				},
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('[Files API] Error obteniendo archivos:', error);
		return handleError(error, "Error obteniendo archivos");
	}
}

// Exportar handlers con autenticación
export const GET = withAuth(getFiles, { requireProfessor: true });
export const POST = withAuth(uploadFile, { requireProfessor: true });