/**
 * API ENDPOINT - DOCUMENTOS SIMILARES
 * 
 * Endpoint para buscar documentos similares a uno dado usando similitud semántica.
 * Útil para recomendaciones y exploración de contenido relacionado.
 * 
 * GET /api/manager/documents/[documentId]/similar
 * 
 * Funcionalidades:
 * - Búsqueda de documentos similares por similitud vectorial
 * - Filtros por contexto educativo
 * - Ranking por relevancia semántica
 * - Exclusión del documento original
 * 
 * Dependencias:
 * - RAGManager: Sistema de búsqueda vectorial
 * - authMiddleware: Validación de autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../../../authMiddleware';

// Importar RAG Manager
const RAGManager = require('../../../../../../utils/ragSystem/ragManager');

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
 * GET - Buscar documentos similares
 */
async function handleGetSimilar(req, { params }) {
    try {
        const { documentId } = params;
        
        if (!documentId) {
            return NextResponse.json({
                success: false,
                message: 'ID de documento requerido'
            }, { status: 400 });
        }

        console.log(`[API] Buscando documentos similares a: ${documentId}`);

        // Obtener parámetros de consulta
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 5, 1), 20);
        const sameSubjectOnly = searchParams.get('sameSubjectOnly') === 'true';
        const sameTopicOnly = searchParams.get('sameTopicOnly') === 'true';
        const includeMetadata = searchParams.get('includeMetadata') !== 'false';

        // Inicializar RAG Manager
        const rag = await ensureRAGManager();

        // Verificar que el documento existe
        const document = await rag.vectorStorage.getDocument(documentId);
        
        if (!document) {
            return NextResponse.json({
                success: false,
                message: 'Documento no encontrado'
            }, { status: 404 });
        }

        // TODO: Validar permisos de acceso al documento
        const currentUser = req.user;

        // Preparar filtros adicionales basados en parámetros
        const additionalFilters = {};
        
        if (sameSubjectOnly && document.subject_id) {
            additionalFilters.subjectId = document.subject_id;
        }
        
        if (sameTopicOnly && document.topic_id) {
            additionalFilters.topicId = document.topic_id;
        }

        // Buscar documentos similares
        const startTime = Date.now();
        const similarDocuments = await rag.findSimilarDocuments(documentId, limit * 2); // Buscar más para aplicar filtros

        // Aplicar filtros adicionales si se especificaron
        let filteredDocuments = similarDocuments;
        
        if (Object.keys(additionalFilters).length > 0) {
            filteredDocuments = similarDocuments.filter(doc => {
                if (additionalFilters.subjectId && doc.subjectId !== additionalFilters.subjectId) {
                    return false;
                }
                if (additionalFilters.topicId && doc.topicId !== additionalFilters.topicId) {
                    return false;
                }
                return true;
            });
        }

        // Limitar resultados finales
        const finalResults = filteredDocuments.slice(0, limit);

        // Enriquecer resultados con información adicional si se solicita
        const enrichedResults = [];
        
        for (const similarDoc of finalResults) {
            try {
                const docInfo = await rag.vectorStorage.getDocument(similarDoc.documentId);
                
                const enrichedDoc = {
                    documentId: similarDoc.documentId,
                    fileName: similarDoc.fileName,
                    similarity: {
                        average: similarDoc.avgSimilarity,
                        chunkMatches: similarDoc.chunkMatches
                    },
                    
                    // Contexto educativo
                    context: {
                        subjectId: similarDoc.subjectId,
                        topicId: similarDoc.topicId,
                        subtopicId: similarDoc.subtopicId
                    },
                    
                    // Información básica del documento
                    ...(docInfo && {
                        fileType: docInfo.file_type,
                        fileSize: docInfo.file_size,
                        uploadDate: docInfo.upload_date,
                        uploadedBy: docInfo.uploaded_by,
                        totalChunks: docInfo.total_chunks
                    }),
                    
                    // Metadatos completos si se solicitan
                    ...(includeMetadata && docInfo && {
                        metadata: docInfo.metadata
                    })
                };
                
                enrichedResults.push(enrichedDoc);
                
            } catch (error) {
                console.warn(`[API] Error enriqueciendo documento ${similarDoc.documentId}:`, error.message);
                
                // Incluir resultado básico si hay error obteniendo detalles
                enrichedResults.push({
                    documentId: similarDoc.documentId,
                    fileName: similarDoc.fileName,
                    similarity: {
                        average: similarDoc.avgSimilarity,
                        chunkMatches: similarDoc.chunkMatches
                    },
                    context: {
                        subjectId: similarDoc.subjectId,
                        topicId: similarDoc.topicId,
                        subtopicId: similarDoc.subtopicId
                    },
                    error: 'Información adicional no disponible'
                });
            }
        }

        const searchTime = Date.now() - startTime;

        console.log(`[API] Búsqueda de similares completada: ${enrichedResults.length} documentos en ${searchTime}ms`);
        
        return NextResponse.json({
            success: true,
            data: {
                sourceDocument: {
                    documentId: documentId,
                    fileName: document.file_name,
                    context: {
                        subjectId: document.subject_id,
                        topicId: document.topic_id,
                        subtopicId: document.subtopic_id
                    }
                },
                similarDocuments: enrichedResults,
                stats: {
                    totalFound: similarDocuments.length,
                    afterFiltering: filteredDocuments.length,
                    returned: enrichedResults.length,
                    searchTime: searchTime,
                    filters: {
                        sameSubjectOnly: sameSubjectOnly,
                        sameTopicOnly: sameTopicOnly,
                        limit: limit
                    }
                }
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[API] Error buscando documentos similares:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error buscando documentos similares',
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
            return await handleGetSimilar(req, context);
        } else {
            return NextResponse.json({
                success: false,
                message: 'Método no permitido'
            }, { status: 405 });
        }
    }, { requireProfessor: true })(req);
}

export { authenticatedHandler as GET };