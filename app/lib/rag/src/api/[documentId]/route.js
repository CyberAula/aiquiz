/**
 * API ENDPOINT - GESTIÓN DE DOCUMENTOS INDIVIDUALES
 * 
 * Endpoints para gestionar documentos específicos en el sistema RAG.
 * Permite obtener información, eliminar documentos y buscar documentos similares.
 * 
 * GET /api/manager/documents/[documentId] - Obtener información del documento
 * DELETE /api/manager/documents/[documentId] - Eliminar documento
 * 
 * Funcionalidades:
 * - Obtener metadatos y chunks de un documento
 * - Eliminar documento y todos sus vectores asociados
 * - Buscar documentos similares
 * - Validación de permisos por contexto educativo
 * 
 * Dependencias:
 * - RAGManager: Gestión de documentos RAG
 * - authMiddleware: Validación de autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../authMiddleware';

// Importar RAG Manager
const RAGManager = require('../../../../../utils/ragSystem/ragManager');

// Instancia global del RAG Manager
let ragManager = null;

/**
 * Inicializa el RAG Manager si no está inicializado
 */
async function ensureRAGManager() {
    if (!ragManager) {
        ragManager = new RAGManager({
            enableLogging: true,
            enableCache: true
        });
        await ragManager.initialize();
    }
    return ragManager;
}

/**
 * GET - Obtener información del documento
 */
async function handleGet(req, { params }) {
    try {
        const { documentId } = params;
        
        if (!documentId) {
            return NextResponse.json({
                success: false,
                message: 'ID de documento requerido'
            }, { status: 400 });
        }

        console.log(`[API] Obteniendo información del documento: ${documentId}`);

        // Inicializar RAG Manager
        const rag = await ensureRAGManager();

        // Obtener información del documento
        const document = await rag.vectorStorage.getDocument(documentId);
        
        if (!document) {
            return NextResponse.json({
                success: false,
                message: 'Documento no encontrado'
            }, { status: 404 });
        }

        // TODO: Validar permisos de acceso al documento
        const currentUser = req.user;
        
        // Obtener chunks del documento
        const { searchParams } = new URL(req.url);
        const includeChunks = searchParams.get('includeChunks') === 'true';
        const includeEmbeddings = searchParams.get('includeEmbeddings') === 'true';

        let chunks = [];
        if (includeChunks) {
            chunks = await rag.vectorStorage.getChunksByDocument(documentId);
            
            // Remover embeddings si no se solicitan específicamente
            if (!includeEmbeddings) {
                chunks = chunks.map(chunk => {
                    const { embedding, ...chunkWithoutEmbedding } = chunk;
                    return chunkWithoutEmbedding;
                });
            }
        }

        // Preparar respuesta
        const response = {
            document: {
                id: document.id,
                fileName: document.file_name,
                fileType: document.file_type,
                fileSize: document.file_size,
                uploadDate: document.upload_date,
                uploadedBy: document.uploaded_by,
                totalChunks: document.total_chunks,
                
                // Contexto educativo
                context: {
                    subjectId: document.subject_id,
                    topicId: document.topic_id,
                    subtopicId: document.subtopic_id
                },
                
                // Metadatos
                metadata: document.metadata,
                
                // Timestamps
                createdAt: document.created_at,
                updatedAt: document.updated_at
            },
            
            // Chunks si se solicitaron
            ...(includeChunks && {
                chunks: chunks.map(chunk => ({
                    id: chunk.id,
                    chunkIndex: chunk.chunk_index,
                    text: chunk.text,
                    charCount: chunk.char_count,
                    wordCount: chunk.word_count,
                    sentenceCount: chunk.sentence_count,
                    startPosition: chunk.start_position,
                    endPosition: chunk.end_position,
                    sectionTitle: chunk.section_title,
                    pageNumber: chunk.page_number,
                    paragraphNumber: chunk.paragraph_number,
                    isHeading: chunk.is_heading,
                    isList: chunk.is_list,
                    metadata: chunk.metadata,
                    createdAt: chunk.created_at,
                    
                    // Embedding solo si se solicita
                    ...(includeEmbeddings && { embedding: chunk.embedding })
                }))
            }),
            
            // Estadísticas
            stats: {
                totalChunks: chunks.length,
                avgChunkSize: chunks.length > 0 ? 
                    Math.round(chunks.reduce((sum, chunk) => sum + chunk.char_count, 0) / chunks.length) : 0,
                totalTextLength: chunks.reduce((sum, chunk) => sum + chunk.char_count, 0)
            }
        };

        console.log(`[API] Información del documento obtenida: ${documentId}`);
        
        return NextResponse.json({
            success: true,
            data: response
        }, { status: 200 });

    } catch (error) {
        console.error('[API] Error obteniendo documento:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error obteniendo información del documento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * DELETE - Eliminar documento
 */
async function handleDelete(req, { params }) {
    try {
        const { documentId } = params;
        
        if (!documentId) {
            return NextResponse.json({
                success: false,
                message: 'ID de documento requerido'
            }, { status: 400 });
        }

        console.log(`[API] Eliminando documento: ${documentId}`);

        // Inicializar RAG Manager
        const rag = await ensureRAGManager();

        // Verificar que el documento existe y obtener información para validación de permisos
        const document = await rag.vectorStorage.getDocument(documentId);
        
        if (!document) {
            return NextResponse.json({
                success: false,
                message: 'Documento no encontrado'
            }, { status: 404 });
        }

        // TODO: Validar permisos de eliminación
        const currentUser = req.user;
        
        // Solo administradores o el usuario que subió el documento pueden eliminarlo
        if (currentUser.role !== 'admin' && currentUser.userId !== document.uploaded_by) {
            return NextResponse.json({
                success: false,
                message: 'No tienes permisos para eliminar este documento'
            }, { status: 403 });
        }

        // Eliminar documento
        const success = await rag.deleteDocument(documentId);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                message: 'Error eliminando el documento'
            }, { status: 500 });
        }

        console.log(`[API] Documento eliminado exitosamente: ${documentId}`);
        
        return NextResponse.json({
            success: true,
            message: 'Documento eliminado exitosamente',
            data: {
                documentId: documentId,
                fileName: document.file_name,
                deletedAt: new Date().toISOString()
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[API] Error eliminando documento:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error eliminando documento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Middleware de autenticación
 */
async function authenticatedHandler(req, context) {
    return withAuth(async (req) => {
        if (req.method === 'GET') {
            return await handleGet(req, context);
        } else if (req.method === 'DELETE') {
            return await handleDelete(req, context);
        } else {
            return NextResponse.json({
                success: false,
                message: 'Método no permitido'
            }, { status: 405 });
        }
    }, { requireProfessor: true })(req);
}

export { 
    authenticatedHandler as GET,
    authenticatedHandler as DELETE 
};