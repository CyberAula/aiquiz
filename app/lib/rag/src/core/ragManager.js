/**
 * MANAGER PRINCIPAL DEL SISTEMA RAG - ESPECIALIZADO EN PDF
 * 
 * Orquestador principal del sistema RAG optimizado exclusivamente para
 * documentos PDF con almacenamiento en Qdrant.
 * 
 * Funcionalidades:
 * - Pipeline completo: PDF → chunks → embeddings → Qdrant
 * - Búsqueda semántica optimizada con Qdrant
 * - Gestión especializada de documentos PDF
 * - Integración con contexto educativo de AIQuiz
 * 
 * Dependencias:
 * - PDFProcessor: Procesamiento especializado de PDF
 * - TextChunker: División semántica (reutilizado)
 * - EmbeddingService: Generación de embeddings (reutilizado)
 * - QdrantStorage: Almacenamiento vectorial con Qdrant
 */

const PDFProcessor = require('./pdfProcessor');
const TextChunker = require('./textChunker');
const EmbeddingService = require('./embeddingService');
const QdrantStorage = require('../storage/qdrantStorage');
const { v4: uuidv4 } = require('crypto').webcrypto ? require('crypto') : { v4: () => require('crypto').randomUUID() };

class RAGManager {
    constructor(options = {}) {
        // Inicializar servicios especializados
        this.pdfProcessor = new PDFProcessor();
        this.textChunker = new TextChunker(options.chunking || {});
        this.embeddingService = new EmbeddingService(options.embeddings || {});
        this.qdrantStorage = new QdrantStorage(options.storage || {});
        
        // Configuración específica para PDFs
        this.config = {
            enableLogging: options.enableLogging !== false,
            enableCache: options.enableCache !== false,
            maxConcurrentProcessing: options.maxConcurrentProcessing || 2, // Reducido para PDFs
            pdfOptimizations: {
                enhancedTextExtraction: true,
                structurePreservation: true,
                qualityAssessment: true
            },
            ...options
        };

        // Estado del sistema
        this.state = {
            isInitialized: false,
            isProcessing: false,
            processingQueue: [],
            stats: {
                pdfsProcessed: 0,
                chunksGenerated: 0,
                embeddingsCreated: 0,
                searchesPerformed: 0,
                totalPages: 0,
                avgProcessingTime: 0
            }
        };

        console.log('[RAG-PDF] RAGManager inicializado para PDFs con Qdrant');
    }

    /**
     * Inicializa todos los servicios del sistema RAG
     * 
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.state.isInitialized) {
            return;
        }

        try {
            console.log('[RAG-PDF] Inicializando sistema RAG para PDFs...');

            // Inicializar servicios en orden
            await this.embeddingService.initialize();
            await this.qdrantStorage.initialize();

            this.state.isInitialized = true;
            console.log('[RAG-PDF] Sistema RAG inicializado exitosamente');

        } catch (error) {
            console.error('[RAG-PDF] Error inicializando sistema RAG:', error.message);
            throw new Error(`Error inicializando RAG: ${error.message}`);
        }
    }

    /**
     * Procesa un documento PDF completo: parsing, chunking, embeddings y almacenamiento
     * 
     * @param {Object} file - Archivo PDF a procesar
     * @param {Object} context - Contexto educativo (subject, topic, subtopic)
     * @param {string} uploadedBy - ID del usuario que subió el archivo
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async processPDF(file, context, uploadedBy) {
        await this.ensureInitialized();

        const documentId = uuidv4();
        const startTime = Date.now();

        try {
            console.log(`[RAG-PDF] Iniciando procesamiento de PDF: ${file.originalname}`);
            this.state.isProcessing = true;

            // 1. Validar que es un PDF
            const validation = this.pdfProcessor.validatePDF(file);
            if (!validation.isValid) {
                throw new Error(`PDF inválido: ${validation.errors.join(', ')}`);
            }

            // 2. Procesar PDF (extraer texto y metadatos estructurales)
            console.log('[RAG-PDF] Paso 1/5: Procesando PDF...');
            const processedPDF = await this.pdfProcessor.processDocument(file);

            // Log de calidad del procesamiento
            if (processedPDF.metadata.quality.score === 'poor') {
                console.warn(`[RAG-PDF] Calidad de extracción baja: ${processedPDF.metadata.quality.issues.join(', ')}`);
            }

            // 3. Dividir en chunks semánticos optimizados para PDF
            console.log('[RAG-PDF] Paso 2/5: Creando chunks semánticos...');
            const chunks = await this.textChunker.chunkDocument(processedPDF, {
                ...context,
                sourceType: 'pdf',
                pdfMetadata: processedPDF.metadata
            });

            // 4. Generar embeddings
            console.log('[RAG-PDF] Paso 3/5: Generando embeddings...');
            const estimatedTime = this.embeddingService.estimateProcessingTime(chunks.length);
            console.log(`[RAG-PDF] Tiempo estimado: ${estimatedTime.estimatedMinutes} minutos para ${chunks.length} chunks`);
            
            const chunksWithEmbeddings = await this.embeddingService.processChunks(chunks);

            // 5. Preparar metadatos del documento PDF
            const documentMetadata = {
                id: documentId,
                fileName: file.originalname,
                fileType: 'pdf',
                fileSize: file.size,
                subjectId: context.subjectId,
                topicId: context.topicId,
                subtopicId: context.subtopicId,
                uploadedBy: uploadedBy,
                uploadDate: new Date().toISOString(),
                metadata: {
                    ...processedPDF.metadata,
                    chunkingStats: this.textChunker.getChunkingStats(chunks),
                    embeddingModel: this.embeddingService.getServiceInfo(),
                    processingTime: Date.now() - startTime,
                    
                    // Métricas específicas de PDF
                    pdfQuality: processedPDF.metadata.quality,
                    totalPages: processedPDF.metadata.totalPages,
                    estimatedReadingTime: processedPDF.metadata.estimatedReadingTime,
                    structuralElements: {
                        sections: processedPDF.metadata.structure.sections.length,
                        paragraphs: processedPDF.metadata.structure.paragraphs.length,
                        lists: processedPDF.metadata.elements.lists.length,
                        tables: processedPDF.metadata.elements.tables.length
                    }
                }
            };

            // 6. Almacenar en Chroma DB
            console.log('[RAG-PDF] Paso 4/5: Almacenando en Chroma DB...');
            
            // Agregar document ID a cada chunk
            const chunksForStorage = chunksWithEmbeddings.map(chunk => ({
                ...chunk,
                documentId: documentId,
                metadata: {
                    ...chunk.metadata,
                    documentId: documentId,
                    sourceType: 'pdf'
                }
            }));

            await this.qdrantStorage.storeDocument(documentMetadata, chunksForStorage);

            // 7. Actualizar estadísticas
            this.updateStats({
                pdfsProcessed: 1,
                chunksGenerated: chunks.length,
                embeddingsCreated: chunks.length,
                totalPages: processedPDF.metadata.totalPages,
                processingTime: Date.now() - startTime
            });

            const totalTime = Date.now() - startTime;
            console.log(`[RAG-PDF] PDF procesado exitosamente en ${Math.round(totalTime / 1000)}s`);

            return {
                success: true,
                documentId: documentId,
                stats: {
                    chunks: chunks.length,
                    pages: processedPDF.metadata.totalPages,
                    processingTime: totalTime,
                    fileSize: file.size,
                    textLength: processedPDF.text.length,
                    quality: processedPDF.metadata.quality.score
                },
                metadata: documentMetadata,
                pdfInfo: {
                    structuralElements: documentMetadata.metadata.structuralElements,
                    readingTime: processedPDF.metadata.estimatedReadingTime,
                    extractionQuality: processedPDF.metadata.quality
                }
            };

        } catch (error) {
            console.error(`[RAG-PDF] Error procesando PDF ${file.originalname}:`, error.message);
            throw new Error(`Error procesando PDF: ${error.message}`);
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * Realiza búsqueda semántica especializada en contenido PDF
     * 
     * @param {string} query - Consulta de búsqueda
     * @param {Object} filters - Filtros de búsqueda
     * @param {Object} options - Opciones de búsqueda
     * @returns {Promise<Object>} Resultados de búsqueda
     */
    async semanticSearch(query, filters = {}, options = {}) {
        await this.ensureInitialized();

        try {
            console.log(`[RAG-PDF] Búsqueda semántica en PDFs: "${query}"`);
            const startTime = Date.now();

            // Configuración optimizada para PDFs
            const searchOptions = {
                limit: options.limit || 10,
                threshold: options.threshold || 0.15, // Threshold ligeramente más alto para PDFs
                includeMetadata: options.includeMetadata !== false,
                rerankResults: options.rerankResults !== false,
                pdfOptimized: true,
                ...options
            };

            // 1. Generar embedding para la consulta
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);

            // 2. Buscar chunks similares en Qdrant
            const similarChunks = await this.qdrantStorage.searchSimilar(
                queryEmbedding, 
                filters, 
                searchOptions.limit * 2
            );

            // 3. Filtrar por threshold de similitud
            const filteredChunks = similarChunks.filter(
                chunk => chunk.similarity >= searchOptions.threshold
            );

            // 4. Re-ranking específico para PDFs
            let rankedChunks = filteredChunks;
            if (searchOptions.rerankResults) {
                rankedChunks = this.rerankPDFResults(query, filteredChunks);
            }

            // 5. Limitar resultados finales
            const finalResults = rankedChunks.slice(0, searchOptions.limit);

            // 6. Enriquecer con contexto específico de PDF
            const enrichedResults = searchOptions.includeMetadata 
                ? await this.enrichPDFSearchResults(finalResults)
                : finalResults;

            // 7. Actualizar estadísticas
            this.updateStats({ searchesPerformed: 1 });

            const searchTime = Date.now() - startTime;
            console.log(`[RAG-PDF] Búsqueda completada en ${searchTime}ms. Resultados: ${finalResults.length}`);

            return {
                success: true,
                query: query,
                results: enrichedResults,
                stats: {
                    totalFound: similarChunks.length,
                    afterFiltering: filteredChunks.length,
                    returned: finalResults.length,
                    searchTime: searchTime,
                    threshold: searchOptions.threshold,
                    optimizedForPDF: true
                },
                filters: filters,
                pdfContext: this.analyzePDFSearchContext(enrichedResults)
            };

        } catch (error) {
            console.error('[RAG-PDF] Error en búsqueda semántica:', error.message);
            throw new Error(`Error en búsqueda: ${error.message}`);
        }
    }

    /**
     * Busca PDFs similares a uno dado
     * 
     * @param {string} documentId - ID del documento PDF
     * @param {number} limit - Número de PDFs similares
     * @returns {Promise<Array>} PDFs similares
     */
    async findSimilarPDFs(documentId, limit = 5) {
        await this.ensureInitialized();

        try {
            // Obtener chunks del PDF
            const documentChunks = await this.qdrantStorage.getChunksByDocument(documentId);
            
            if (documentChunks.length === 0) {
                return [];
            }

            // Usar múltiples chunks representativos (inicio, medio, fin)
            const representativeChunks = this.selectRepresentativeChunks(documentChunks);
            
            const allSimilarChunks = [];

            // Buscar con cada chunk representativo
            for (const chunk of representativeChunks) {
                const similarChunks = await this.qdrantStorage.searchSimilar(
                    chunk.embedding,
                    { excludeDocumentId: documentId },
                    limit * 2
                );
                allSimilarChunks.push(...similarChunks);
            }

            // Agrupar por documento y calcular similitud promedio
            const documentSimilarities = this.aggregatePDFSimilarities(allSimilarChunks);

            return documentSimilarities.slice(0, limit);

        } catch (error) {
            console.error('[RAG-PDF] Error buscando PDFs similares:', error.message);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas específicas del sistema RAG para PDFs
     * 
     * @returns {Promise<Object>} Estadísticas completas
     */
    async getSystemStats() {
        await this.ensureInitialized();

        try {
            const storageStats = await this.qdrantStorage.getStats();
            const embeddingInfo = this.embeddingService.getServiceInfo();

            return {
                system: {
                    initialized: this.state.isInitialized,
                    processing: this.state.isProcessing,
                    queueSize: this.state.processingQueue.length,
                    optimizedFor: 'PDF documents'
                },
                storage: {
                    ...storageStats,
                    database: 'Qdrant',
                    collections: storageStats.collections
                },
                embeddings: embeddingInfo,
                processing: {
                    ...this.state.stats,
                    avgPagesPerPDF: this.state.stats.pdfsProcessed > 0 ? 
                        Math.round(this.state.stats.totalPages / this.state.stats.pdfsProcessed) : 0,
                    avgProcessingTime: this.calculateAvgProcessingTime()
                },
                config: this.config,
                pdfProcessor: this.pdfProcessor.getProcessorInfo(),
                qdrantStorage: this.qdrantStorage.getStorageInfo()
            };

        } catch (error) {
            console.error('[RAG-PDF] Error obteniendo estadísticas:', error.message);
            throw error;
        }
    }

    // Métodos auxiliares especializados para PDF

    selectRepresentativeChunks(chunks) {
        if (chunks.length <= 3) return chunks;

        // Seleccionar chunks del inicio, medio y final
        const indices = [
            0, // Primer chunk
            Math.floor(chunks.length / 2), // Chunk del medio
            chunks.length - 1 // Último chunk
        ];

        return indices.map(i => chunks[i]);
    }

    aggregatePDFSimilarities(similarChunks) {
        const documentSimilarities = new Map();
        
        for (const chunk of similarChunks) {
            const docId = chunk.document_id;
            if (!documentSimilarities.has(docId)) {
                documentSimilarities.set(docId, {
                    documentId: docId,
                    similarities: [],
                    fileName: chunk.file_name,
                    subjectId: chunk.subject_id,
                    topicId: chunk.topic_id,
                    subtopicId: chunk.subtopic_id,
                    totalPages: 0,
                    chunkMatches: 0
                });
            }
            
            const docSim = documentSimilarities.get(docId);
            docSim.similarities.push(chunk.similarity);
            docSim.chunkMatches++;
            
            // Obtener número de páginas si está disponible
            if (chunk.metadata && chunk.metadata.totalPages) {
                docSim.totalPages = chunk.metadata.totalPages;
            }
        }

        // Calcular similitud promedio y ordenar
        return Array.from(documentSimilarities.values())
            .map(doc => ({
                ...doc,
                avgSimilarity: doc.similarities.reduce((a, b) => a + b, 0) / doc.similarities.length,
                maxSimilarity: Math.max(...doc.similarities)
            }))
            .sort((a, b) => b.avgSimilarity - a.avgSimilarity);
    }

    rerankPDFResults(query, chunks) {
        return chunks.map(chunk => {
            let score = chunk.similarity;
            
            // Bonus por elementos estructurales de PDF
            if (chunk.is_heading) {
                score += 0.1; // Encabezados son más relevantes
            }
            
            if (chunk.section_title && chunk.section_title.toLowerCase().includes(query.toLowerCase())) {
                score += 0.15; // Coincidencia en título de sección
            }
            
            // Bonus por chunks de páginas iniciales (introducción, resumen)
            if (chunk.page_number && chunk.page_number <= 3) {
                score += 0.05;
            }
            
            // Penalty por chunks muy cortos en PDFs (posiblemente metadatos)
            if (chunk.char_count < 100) {
                score -= 0.1;
            }
            
            // Bonus por chunks con buena estructura
            if (chunk.sentence_count >= 2 && chunk.sentence_count <= 5) {
                score += 0.05;
            }
            
            return {
                ...chunk,
                rerankedScore: Math.min(score, 1.0)
            };
        }).sort((a, b) => b.rerankedScore - a.rerankedScore);
    }

    async enrichPDFSearchResults(results) {
        // Enriquecer con información específica de PDF
        return results.map(result => ({
            ...result,
            pdfContext: {
                pageNumber: result.page_number,
                sectionTitle: result.section_title,
                isHeading: result.is_heading,
                isFromList: result.is_list,
                estimatedPage: result.page_number ? `Página ${result.page_number}` : 'Página desconocida'
            },
            readabilityScore: this.calculateReadabilityScore(result.text),
            relevanceIndicators: this.extractRelevanceIndicators(result.text)
        }));
    }

    analyzePDFSearchContext(results) {
        const pageNumbers = results.map(r => r.page_number).filter(p => p);
        const sections = results.map(r => r.section_title).filter(s => s);
        
        return {
            pagesFound: [...new Set(pageNumbers)].sort((a, b) => a - b),
            sectionsFound: [...new Set(sections)],
            avgPageNumber: pageNumbers.length > 0 ? 
                Math.round(pageNumbers.reduce((a, b) => a + b, 0) / pageNumbers.length) : null,
            hasHeadings: results.some(r => r.is_heading),
            hasLists: results.some(r => r.is_list)
        };
    }

    calculateReadabilityScore(text) {
        // Puntuación simple de legibilidad
        const sentences = text.split(/[.!?]+/).length;
        const words = text.split(/\s+/).length;
        const avgWordsPerSentence = words / sentences;
        
        if (avgWordsPerSentence < 15) return 'easy';
        if (avgWordsPerSentence < 25) return 'moderate';
        return 'complex';
    }

    extractRelevanceIndicators(text) {
        const indicators = [];
        
        if (/\b(important|importante|clave|key)\b/i.test(text)) {
            indicators.push('contains_keywords');
        }
        if (/\b(example|ejemplo|for instance|por ejemplo)\b/i.test(text)) {
            indicators.push('contains_examples');
        }
        if (/\b(conclusion|conclusión|summary|resumen)\b/i.test(text)) {
            indicators.push('contains_summary');
        }
        
        return indicators;
    }

    calculateAvgProcessingTime() {
        if (this.state.stats.pdfsProcessed === 0) return 0;
        
        // Implementar cálculo de tiempo promedio
        return Math.round(this.state.stats.avgProcessingTime / this.state.stats.pdfsProcessed);
    }

    updateStats(updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (this.state.stats[key] !== undefined) {
                if (key === 'processingTime') {
                    // Calcular promedio móvil para tiempo de procesamiento
                    this.state.stats.avgProcessingTime = 
                        (this.state.stats.avgProcessingTime + value) / 2;
                } else {
                    this.state.stats[key] += value;
                }
            }
        }
    }

    async ensureInitialized() {
        if (!this.state.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * Elimina un documento del sistema RAG
     * 
     * @param {string} documentId - ID del documento a eliminar
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async deleteDocument(documentId) {
        await this.ensureInitialized();

        try {
            if (this.config.enableLogging) {
                console.log(`[RAG-PDF] Eliminando documento: ${documentId}`);
            }

            // Eliminar del almacenamiento Qdrant
            await this.qdrantStorage.deleteDocument(documentId);
            
            if (this.config.enableLogging) {
                console.log(`[RAG-PDF] Documento ${documentId} eliminado exitosamente`);
            }

            return {
                success: true,
                documentId: documentId,
                message: 'Documento eliminado exitosamente'
            };
        } catch (error) {
            console.error('[RAG-PDF] Error eliminando documento:', error);
            throw error;
        }
    }

    /**
     * Cierra todos los servicios del sistema RAG
     */
    async shutdown() {
        console.log('[RAG-PDF] Cerrando sistema RAG...');
        
        await this.qdrantStorage.close();
        this.state.isInitialized = false;
        
        console.log('[RAG-PDF] Sistema RAG cerrado');
    }
}

module.exports = RAGManager;