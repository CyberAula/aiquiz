/**
 * API ENDPOINT - UPLOAD DE PDFs RAG
 * 
 * Endpoint especializado para subir y procesar documentos PDF en el sistema RAG semántico.
 * Optimizado exclusivamente para archivos PDF con almacenamiento en Chroma DB.
 * 
 * POST /api/manager/documents/upload
 * 
 * Funcionalidades:
 * - Recepción exclusiva de archivos PDF
 * - Validación especializada para PDFs
 * - Procesamiento optimizado del pipeline RAG
 * - Almacenamiento en Chroma DB
 * 
 * Dependencias:
 * - multer: Manejo de uploads
 * - RAGManager: Orquestador especializado en PDF
 * - authMiddleware: Validación de autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../app/utils/authMiddleware';
import multer from 'multer';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// Importar RAG Manager especializado en PDF
const RAGManager = require('../../core/ragManager');

// Configurar multer específicamente para PDFs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'temp_uploads', 'pdfs');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para PDFs
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `pdf-${uniqueSuffix}.pdf`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB máximo para PDFs
        files: 1 // Solo un archivo por request
    },
    fileFilter: function (req, file, cb) {
        // Solo permitir PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error(`Solo se permiten archivos PDF. Recibido: ${file.mimetype}`), false);
        }
    }
});

// Promisificar multer para uso con async/await
const uploadMiddleware = promisify(upload.single('pdf'));

// Instancia global del RAG Manager para PDFs
let ragManager = null;

/**
 * Inicializa el RAG Manager especializado en PDF
 */
async function ensureRAGManager() {
    if (!ragManager) {
        ragManager = new RAGManager({
            enableLogging: true,
            enableCache: true,
            storage: {
                host: process.env.CHROMA_HOST || 'localhost',
                port: process.env.CHROMA_PORT || 8000
            },
            embeddings: {
                modelName: 'sentence-transformers/all-MiniLM-L6-v2',
                dimensions: 384
            }
        });
        await ragManager.initialize();
    }
    return ragManager;
}

/**
 * POST - Subir y procesar PDF
 */
async function handlePDFUpload(req, res) {
    try {
        console.log('[API-PDF] Iniciando upload de PDF');
        
        // 1. Procesar PDF con multer
        await uploadMiddleware(req, res);
        
        if (!req.file) {
            return NextResponse.json({
                success: false,
                message: 'No se recibió ningún archivo PDF'
            }, { status: 400 });
        }

        console.log(`[API-PDF] PDF recibido: ${req.file.originalname} (${Math.round(req.file.size / 1024)}KB)`);

        // 2. Obtener parámetros del contexto educativo
        const { subjectId, topicId, subtopicId } = req.body;
        
        if (!subjectId) {
            return NextResponse.json({
                success: false,
                message: 'Se requiere el ID de la asignatura'
            }, { status: 400 });
        }

        // 3. Validar permisos del usuario
        const currentUser = req.user;
        
        if (!currentUser || !currentUser.userId) {
            return NextResponse.json({
                success: false,
                message: 'Usuario no autorizado'
            }, { status: 403 });
        }

        // 4. Preparar contexto para el procesamiento RAG
        const context = {
            subjectId: subjectId,
            topicId: topicId || null,
            subtopicId: subtopicId || null
        };

        // 5. Inicializar RAG Manager especializado
        const rag = await ensureRAGManager();

        // 6. Procesar PDF con pipeline especializado
        console.log(`[API-PDF] Procesando PDF: ${req.file.originalname}`);
        
        const result = await rag.processPDF(
            req.file,
            context,
            currentUser.userId
        );

        // 7. Limpiar archivo temporal
        try {
            fs.unlinkSync(req.file.path);
        } catch (error) {
            console.warn('[API-PDF] No se pudo eliminar archivo temporal:', error.message);
        }

        // 8. Responder con éxito incluyendo métricas específicas de PDF
        console.log(`[API-PDF] PDF procesado exitosamente: ${result.documentId}`);
        
        return NextResponse.json({
            success: true,
            message: 'PDF procesado y almacenado exitosamente',
            data: {
                documentId: result.documentId,
                fileName: req.file.originalname,
                fileType: 'pdf',
                
                // Estadísticas del procesamiento
                stats: result.stats,
                
                // Información específica del PDF
                pdfInfo: result.pdfInfo,
                
                // Contexto educativo
                context: context,
                
                // Metadatos del procesamiento
                processing: {
                    processedAt: new Date().toISOString(),
                    storage: 'Chroma DB',
                    embeddingModel: 'sentence-transformers/all-MiniLM-L6-v2',
                    optimizedForPDF: true
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('[API-PDF] Error en upload de PDF:', error.message);
        
        // Limpiar archivo temporal si existe
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.warn('[API-PDF] Error limpiando archivo temporal:', cleanupError.message);
            }
        }

        // Determinar tipo de error específico para PDFs
        let statusCode = 500;
        let message = 'Error interno del servidor';

        if (error.message.includes('PDF inválido')) {
            statusCode = 400;
            message = error.message;
        } else if (error.message.includes('Solo se permiten archivos PDF')) {
            statusCode = 400;
            message = 'Solo se permiten archivos PDF';
        } else if (error.message.includes('demasiado grande')) {
            statusCode = 413;
            message = 'PDF demasiado grande (máximo 50MB)';
        } else if (error.message.includes('Chroma DB')) {
            statusCode = 503;
            message = 'Error en base de datos vectorial';
        }

        return NextResponse.json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: statusCode });
    }
}

/**
 * Middleware de autenticación y manejo de la request
 */
async function authenticatedHandler(req) {
    return withAuth(async (req) => {
        if (req.method !== 'POST') {
            return NextResponse.json({
                success: false,
                message: 'Método no permitido'
            }, { status: 405 });
        }

        return await handlePDFUpload(req);
    }, { requireProfessor: true })(req);
}

export { authenticatedHandler as POST };

// App Router doesn't use config exports - bodyParser is handled differently