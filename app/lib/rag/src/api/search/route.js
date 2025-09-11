/**
 * API ENDPOINT - BÚSQUEDA SEMÁNTICA DE DOCUMENTOS
 * 
 * Endpoint para realizar búsquedas semánticas en el sistema RAG.
 * Permite buscar contenido por similitud semántica con filtros contextuales.
 * 
 * POST /api/manager/documents/search
 * 
 * Funcionalidades:
 * - Búsqueda semántica por texto libre
 * - Filtros por contexto educativo (asignatura, tema, subtema)
 * - Configuración de parámetros de búsqueda
 * - Resultados rankeados por relevancia
 * 
 * Dependencias:
 * - RAGManager: Sistema de búsqueda semántica
 * - authMiddleware: Validación de autenticación
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../authMiddleware';

// Importar RAG Manager
const RAGManager = require('../../../../utils/ragSystem/ragManager');

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
 * POST - Búsqueda semántica
 */
async function handleSearch(req) {
    try {
        console.log('[API] Iniciando búsqueda semántica');
        
        const body = await req.json();
        const { 
            query, 
            filters = {}, 
            options = {} 
        } = body;

        // 1. Validar parámetros requeridos
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Se requiere una consulta de búsqueda válida'
            }, { status: 400 });
        }

        if (query.length > 500) {
            return NextResponse.json({
                success: false,
                message: 'La consulta es demasiado larga (máximo 500 caracteres)'
            }, { status: 400 });
        }

        // 2. Validar y normalizar filtros
        const normalizedFilters = {};
        
        if (filters.subjectId) {
            normalizedFilters.subjectId = filters.subjectId;
        }
        if (filters.topicId) {
            normalizedFilters.topicId = filters.topicId;
        }
        if (filters.subtopicId) {
            normalizedFilters.subtopicId = filters.subtopicId;
        }
        if (filters.documentId) {
            normalizedFilters.documentId = filters.documentId;
        }
        if (filters.sectionTitle) {
            normalizedFilters.sectionTitle = filters.sectionTitle;
        }
        if (typeof filters.isHeading === 'boolean') {
            normalizedFilters.isHeading = filters.isHeading;
        }

        // 3. Validar y normalizar opciones
        const normalizedOptions = {
            limit: Math.min(Math.max(parseInt(options.limit) || 10, 1), 50), // Entre 1 y 50
            threshold: Math.min(Math.max(parseFloat(options.threshold) || 0.1, 0), 1), // Entre 0 y 1
            includeMetadata: options.includeMetadata !== false,
            rerankResults: options.rerankResults !== false
        };

        // 4. Verificar permisos de acceso a las asignaturas filtradas
        const currentUser = req.user;
        
        // TODO: Implementar validación de permisos específica
        // Por ahora, validamos que el usuario esté autenticado
        if (!currentUser || !currentUser.userId) {
            return NextResponse.json({
                success: false,
                message: 'Usuario no autorizado'
            }, { status: 403 });
        }

        // 5. Inicializar RAG Manager
        const rag = await ensureRAGManager();

        // 6. Realizar búsqueda semántica
        console.log(`[API] Ejecutando búsqueda: "${query.substring(0, 50)}..."`);
        
        const searchResult = await rag.semanticSearch(
            query.trim(),
            normalizedFilters,
            normalizedOptions
        );

        // 7. Enriquecer resultados con información adicional
        const enrichedResults = searchResult.results.map(result => ({
            id: result.id,
            text: result.text,
            similarity: result.similarity,
            rerankedScore: result.rerankedScore,
            
            // Metadatos del chunk
            chunkInfo: {
                chunkIndex: result.chunk_index,
                charCount: result.char_count,
                wordCount: result.word_count,
                sentenceCount: result.sentence_count,
                sectionTitle: result.section_title,
                pageNumber: result.page_number,
                paragraphNumber: result.paragraph_number,
                isHeading: result.is_heading,
                isList: result.is_list
            },
            
            // Información del documento
            documentInfo: {
                documentId: result.document_id,
                fileName: result.file_name,
                subjectId: result.subject_id,
                topicId: result.topic_id,
                subtopicId: result.subtopic_id
            },
            
            // Metadatos adicionales si se solicitan
            ...(normalizedOptions.includeMetadata && result.metadata ? {
                fullMetadata: JSON.parse(result.metadata)
            } : {})
        }));

        // 8. Responder con resultados
        console.log(`[API] Búsqueda completada: ${enrichedResults.length} resultados en ${searchResult.stats.searchTime}ms`);
        
        return NextResponse.json({
            success: true,
            data: {
                query: query,
                results: enrichedResults,
                stats: {
                    totalFound: searchResult.stats.totalFound,
                    afterFiltering: searchResult.stats.afterFiltering,
                    returned: searchResult.stats.returned,
                    searchTime: searchResult.stats.searchTime,
                    threshold: searchResult.stats.threshold
                },
                filters: normalizedFilters,
                options: normalizedOptions
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[API] Error en búsqueda semántica:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error realizando búsqueda semántica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * GET - Búsqueda simple por parámetros de query
 */
async function handleGetSearch(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');
        const subjectId = searchParams.get('subjectId');
        const topicId = searchParams.get('topicId');
        const subtopicId = searchParams.get('subtopicId');
        const limit = searchParams.get('limit');

        if (!query) {
            return NextResponse.json({
                success: false,
                message: 'Se requiere el parámetro de consulta "q"'
            }, { status: 400 });
        }

        // Crear body simulado para reutilizar la lógica de POST
        const simulatedBody = {
            query: query,
            filters: {
                ...(subjectId && { subjectId }),
                ...(topicId && { topicId }),
                ...(subtopicId && { subtopicId })
            },
            options: {
                ...(limit && { limit: parseInt(limit) }),
                includeMetadata: false // Por defecto false en GET para respuesta más liviana
            }
        };

        // Crear request simulado
        const simulatedReq = {
            ...req,
            json: async () => simulatedBody
        };

        return await handleSearch(simulatedReq);

    } catch (error) {
        console.error('[API] Error en búsqueda GET:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error procesando búsqueda',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Middleware de autenticación
 */
async function authenticatedHandler(req) {
    return withAuth(async (req) => {
        if (req.method === 'POST') {
            return await handleSearch(req);
        } else if (req.method === 'GET') {
            return await handleGetSearch(req);
        } else {
            return NextResponse.json({
                success: false,
                message: 'Método no permitido'
            }, { status: 405 });
        }
    }, { requireProfessor: true })(req);
}

export { 
    authenticatedHandler as POST,
    authenticatedHandler as GET 
};