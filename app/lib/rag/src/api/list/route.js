/**
 * API ENDPOINT - LISTADO DE DOCUMENTOS
 * 
 * Endpoint para listar documentos del sistema RAG con filtros y paginación.
 * Permite explorar documentos por contexto educativo y obtener estadísticas.
 * 
 * GET /api/manager/documents/list
 * 
 * Funcionalidades:
 * - Listado paginado de documentos
 * - Filtros por contexto educativo (asignatura, tema, subtema)
 * - Ordenamiento por fecha, nombre, tamaño
 * - Estadísticas de documentos y chunks
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
 * GET - Listar documentos con filtros y paginación
 */
async function handleList(req) {
    try {
        console.log('[API] Listando documentos RAG');

        const { searchParams } = new URL(req.url);
        
        // Parámetros de filtrado
        const filters = {};
        if (searchParams.get('subjectId')) {
            filters.subjectId = searchParams.get('subjectId');
        }
        if (searchParams.get('topicId')) {
            filters.topicId = searchParams.get('topicId');
        }
        if (searchParams.get('subtopicId')) {
            filters.subtopicId = searchParams.get('subtopicId');
        }
        if (searchParams.get('uploadedBy')) {
            filters.uploadedBy = searchParams.get('uploadedBy');
        }

        // Parámetros de paginación
        const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get('limit')) || 20, 1), 100);

        // Parámetros de ordenamiento
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        // Parámetros adicionales
        const includeStats = searchParams.get('includeStats') !== 'false';
        const search = searchParams.get('search'); // Búsqueda por nombre de archivo

        // Validar permisos de acceso
        const currentUser = req.user;
        
        // TODO: Implementar validación de permisos específica por asignatura
        if (!currentUser || !currentUser.userId) {
            return NextResponse.json({
                success: false,
                message: 'Usuario no autorizado'
            }, { status: 403 });
        }

        // Inicializar RAG Manager
        const rag = await ensureRAGManager();

        // Obtener lista completa de documentos (para aplicar filtros locales)
        const allDocuments = await rag.vectorStorage.listDocuments(filters);

        // Aplicar búsqueda por nombre si se especifica
        let filteredDocuments = allDocuments;
        if (search && search.trim().length > 0) {
            const searchTerm = search.toLowerCase().trim();
            filteredDocuments = allDocuments.filter(doc => 
                doc.file_name.toLowerCase().includes(searchTerm)
            );
        }

        // Aplicar ordenamiento
        const sortedDocuments = filteredDocuments.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            // Manejar diferentes tipos de datos
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });

        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex);

        // Formatear documentos para respuesta
        const formattedDocuments = paginatedDocuments.map(doc => ({
            id: doc.id,
            fileName: doc.file_name,
            fileType: doc.file_type,
            fileSize: doc.file_size,
            uploadDate: doc.upload_date,
            uploadedBy: doc.uploaded_by,
            totalChunks: doc.total_chunks,
            
            // Contexto educativo
            context: {
                subjectId: doc.subject_id,
                topicId: doc.topic_id,
                subtopicId: doc.subtopic_id
            },
            
            // Timestamps
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
            
            // Metadatos básicos (sin incluir todo para mantener respuesta liviana)
            processingInfo: doc.metadata ? {
                processingTime: doc.metadata.processingTime,
                textLength: doc.metadata.charCount,
                totalPages: doc.metadata.totalPages
            } : null
        }));

        // Calcular estadísticas si se solicitan
        let stats = null;
        if (includeStats) {
            const systemStats = await rag.getSystemStats();
            
            // Estadísticas específicas del conjunto filtrado
            const filteredStats = {
                totalDocuments: filteredDocuments.length,
                totalChunks: filteredDocuments.reduce((sum, doc) => sum + (doc.total_chunks || 0), 0),
                totalSize: filteredDocuments.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
                avgChunksPerDocument: filteredDocuments.length > 0 ? 
                    Math.round(filteredDocuments.reduce((sum, doc) => sum + (doc.total_chunks || 0), 0) / filteredDocuments.length) : 0,
                
                // Distribución por tipo de archivo
                byFileType: {},
                
                // Distribución temporal (últimos 30 días)
                recentUploads: 0
            };

            // Calcular distribución por tipo
            filteredDocuments.forEach(doc => {
                const fileType = doc.file_type || 'unknown';
                filteredStats.byFileType[fileType] = (filteredStats.byFileType[fileType] || 0) + 1;
            });

            // Calcular uploads recientes
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            filteredStats.recentUploads = filteredDocuments.filter(doc => 
                new Date(doc.created_at) > thirtyDaysAgo
            ).length;

            stats = {
                filtered: filteredStats,
                system: systemStats.storage
            };
        }

        // Información de paginación
        const pagination = {
            page: page,
            limit: limit,
            total: filteredDocuments.length,
            totalPages: Math.ceil(filteredDocuments.length / limit),
            hasNext: endIndex < filteredDocuments.length,
            hasPrev: page > 1,
            startIndex: startIndex + 1,
            endIndex: Math.min(endIndex, filteredDocuments.length)
        };

        console.log(`[API] Documentos listados: ${formattedDocuments.length}/${filteredDocuments.length} total`);
        
        return NextResponse.json({
            success: true,
            data: {
                documents: formattedDocuments,
                pagination: pagination,
                filters: {
                    ...filters,
                    search: search,
                    sortBy: sortBy,
                    sortOrder: sortOrder
                },
                ...(includeStats && { stats })
            }
        }, { status: 200 });

    } catch (error) {
        console.error('[API] Error listando documentos:', error.message);
        
        return NextResponse.json({
            success: false,
            message: 'Error obteniendo lista de documentos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

/**
 * Middleware de autenticación
 */
async function authenticatedHandler(req) {
    return withAuth(async (req) => {
        if (req.method === 'GET') {
            return await handleList(req);
        } else {
            return NextResponse.json({
                success: false,
                message: 'Método no permitido'
            }, { status: 405 });
        }
    }, { requireProfessor: true })(req);
}

export { authenticatedHandler as GET };