/**
 * MOCK RAG MANAGER PARA PRUEBAS - COMPATIBLE CON QDRANT
 * 
 * Simula el comportamiento del RAG Manager sin necesidad de descargar modelos
 * o conectar a Qdrant. Útil para desarrollo y pruebas.
 */

const crypto = require('crypto');

class MockRAGManager {
    constructor(options = {}) {
        this.enableLogging = options.enableLogging !== false;
        this.initialized = false;
        
        if (this.enableLogging) {
            console.log('[Mock RAG] MockRAGManager inicializado para desarrollo (simula Qdrant)');
        }
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        if (this.enableLogging) {
            console.log('[Mock RAG] Simulando inicialización...');
        }

        // Simular tiempo de inicialización
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.initialized = true;
        
        if (this.enableLogging) {
            console.log('[Mock RAG] Inicialización completada (modo desarrollo)');
        }
    }

    async processPDF(file, context, uploadedBy) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (this.enableLogging) {
            console.log('[Mock RAG] Procesando PDF:', file.originalname);
        }

        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 200));

        // Simular datos de procesamiento
        const documentId = crypto.randomUUID();
        const mockStats = {
            chunks: Math.floor(Math.random() * 50) + 10,
            pages: Math.floor(file.size / 2000) + 1,
            processingTime: 150 + Math.random() * 100,
            textLength: file.size * 2,
            quality: 'good'
        };

        const result = {
            success: true,
            documentId: documentId,
            stats: mockStats,
            pdfInfo: {
                title: file.originalname,
                pages: mockStats.pages,
                hasText: true,
                language: 'es',
                quality: 'good'
            },
            message: 'PDF procesado exitosamente (modo desarrollo)'
        };

        if (this.enableLogging) {
            console.log('[Mock RAG] PDF procesado:', {
                documentId: documentId,
                chunks: mockStats.chunks,
                pages: mockStats.pages
            });
        }

        return result;
    }

    async processDocument(document, contextId, uploadedBy) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (this.enableLogging) {
            console.log('[Mock RAG] Procesando documento de texto:', document.title || 'Sin título');
        }

        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 150));

        // Simular datos de procesamiento para texto
        const documentId = crypto.randomUUID();
        const textLength = document.content ? document.content.length : 0;
        const wordsCount = document.content ? document.content.split(/\s+/).length : 0;
        
        const mockStats = {
            chunks: Math.floor(textLength / 300) + 1, // ~300 chars por chunk
            textLength: textLength,
            wordsCount: wordsCount,
            processingTime: 100 + Math.random() * 50,
            embeddingsGenerated: Math.floor(textLength / 300) + 1,
            quality: 'good'
        };

        const result = {
            success: true,
            documentId: documentId,
            chunks: mockStats.chunks,
            processingTime: mockStats.processingTime,
            stats: mockStats,
            metadata: {
                documentId: documentId,
                title: document.title,
                type: document.metadata?.type || 'text_document',
                contextId: contextId,
                uploadedBy: uploadedBy,
                ...mockStats,
                storedAt: new Date().toISOString()
            },
            message: 'Documento procesado exitosamente (modo desarrollo)'
        };

        if (this.enableLogging) {
            console.log('[Mock RAG] Documento procesado:', {
                documentId: documentId,
                chunks: mockStats.chunks,
                textLength: textLength
            });
        }

        return result;
    }

    async semanticSearch(query, filters = {}, limit = 10) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (this.enableLogging) {
            console.log('[Mock RAG] Búsqueda semántica:', query);
        }

        // Simular búsqueda
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generar resultados mock
        const mockResults = [];
        for (let i = 0; i < Math.min(limit, 3); i++) {
            mockResults.push({
                documentId: crypto.randomUUID(),
                chunkId: `chunk_${i}`,
                text: `Resultado simulado ${i + 1} para la consulta: "${query}"`,
                similarity: 0.8 - (i * 0.1),
                metadata: {
                    page: i + 1,
                    section: `Sección ${i + 1}`,
                    ...filters
                }
            });
        }

        return {
            success: true,
            results: mockResults,
            totalResults: mockResults.length,
            query: query,
            processingTime: 50 + Math.random() * 30
        };
    }

    async getSystemStats() {
        return {
            documentsProcessed: 0,
            totalChunks: 0,
            modelsLoaded: ['mock-model'],
            systemStatus: 'development-mode',
            uptime: Date.now(),
            memoryUsage: process.memoryUsage()
        };
    }

    async deleteDocument(documentId) {
        if (this.enableLogging) {
            console.log('[Mock RAG] Eliminando documento:', documentId);
        }

        return {
            success: true,
            message: 'Documento eliminado (modo desarrollo)'
        };
    }

    async updateDocument(documentId, newContent) {
        if (this.enableLogging) {
            console.log('[Mock RAG] Actualizando documento:', documentId);
        }

        return {
            success: true,
            message: 'Documento actualizado (modo desarrollo)'
        };
    }

    async deleteDocument(documentId) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (this.enableLogging) {
            console.log('[Mock RAG] Eliminando documento:', documentId);
        }

        // Simular eliminación
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            success: true,
            message: 'Documento eliminado (modo desarrollo)',
            documentId: documentId
        };
    }

    async getSystemStats() {
        if (!this.initialized) {
            await this.initialize();
        }

        return {
            system: {
                initialized: this.initialized,
                processing: false,
                queueSize: 0,
                mode: 'development',
                database: 'Mock Qdrant'
            },
            storage: {
                totalCollections: 1,
                totalPoints: 42,
                collections: [
                    {
                        name: 'aiquiz_documents_mock',
                        points: 42,
                        vectorSize: 384,
                        distance: 'Cosine'
                    }
                ],
                defaultCollection: 'aiquiz_documents_mock',
                vectorSize: 384
            },
            embeddings: {
                model: 'mock-embeddings',
                dimensions: 384,
                maxTokens: 512
            },
            processing: {
                pdfsProcessed: 5,
                chunksGenerated: 42,
                embeddingsCreated: 42,
                searchesPerformed: 0,
                totalPages: 25,
                avgProcessingTime: 1500
            }
        };
    }
}

module.exports = MockRAGManager;