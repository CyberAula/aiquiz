/**
 * ALMACENAMIENTO VECTORIAL CON CHROMA DB - SISTEMA RAG
 * 
 * Servicio de almacenamiento vectorial usando Chroma DB como base de datos
 * vectorial especializada para el sistema RAG semántico.
 * 
 * Funcionalidades:
 * - Almacenamiento eficiente de embeddings en Chroma DB
 * - Búsqueda vectorial optimizada por similitud coseno
 * - Gestión de colecciones por contexto educativo
 * - Metadatos enriquecidos para filtrado
 * - Operaciones CRUD completas para documentos
 * 
 * Dependencias:
 * - chromadb: Cliente oficial de Chroma DB
 */

const { ChromaClient } = require('chromadb');

class ChromaStorage {
    constructor(options = {}) {
        // Configuración de conexión a Chroma DB
        this.config = {
            host: options.host || 'localhost',
            port: options.port || 8000,
            ssl: options.ssl || false,
            headers: options.headers || {},
            ...options
        };

        this.client = null;
        this.collections = new Map(); // Cache de colecciones
        this.isInitialized = false;
        
        // Configuración de colecciones
        this.collectionConfig = {
            embeddingFunction: options.embeddingFunction || null, // Se configurará externamente
            metadata: { "hnsw:space": "cosine" }, // Usar similitud coseno
            dimensions: options.dimensions || 384
        };

        console.log(`[RAG-Chroma] ChromaStorage configurado para ${this.config.host}:${this.config.port}`);
    }

    /**
     * Inicializa la conexión con Chroma DB
     * 
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('[RAG-Chroma] Inicializando conexión con Chroma DB...');

            // Crear cliente de Chroma
            this.client = new ChromaClient({
                path: `http${this.config.ssl ? 's' : ''}://${this.config.host}:${this.config.port}`,
                headers: this.config.headers
            });

            // Verificar conexión
            await this.client.heartbeat();

            // Crear colección principal si no existe
            await this.ensureCollection('aiquiz_documents');

            this.isInitialized = true;
            console.log('[RAG-Chroma] Conexión establecida exitosamente');

        } catch (error) {
            console.error('[RAG-Chroma] Error inicializando Chroma DB:', error.message);
            throw new Error(`Error conectando a Chroma DB: ${error.message}`);
        }
    }

    /**
     * Asegura que una colección existe, la crea si no existe
     * 
     * @param {string} collectionName - Nombre de la colección
     * @returns {Promise<Object>} Colección de Chroma
     */
    async ensureCollection(collectionName) {
        if (this.collections.has(collectionName)) {
            return this.collections.get(collectionName);
        }

        try {
            // Intentar obtener colección existente
            let collection;
            try {
                collection = await this.client.getCollection({
                    name: collectionName,
                    embeddingFunction: this.collectionConfig.embeddingFunction
                });
                console.log(`[RAG-Chroma] Colección existente encontrada: ${collectionName}`);
            } catch (error) {
                // Si no existe, crearla
                collection = await this.client.createCollection({
                    name: collectionName,
                    metadata: this.collectionConfig.metadata,
                    embeddingFunction: this.collectionConfig.embeddingFunction
                });
                console.log(`[RAG-Chroma] Nueva colección creada: ${collectionName}`);
            }

            // Guardar en cache
            this.collections.set(collectionName, collection);
            return collection;

        } catch (error) {
            console.error(`[RAG-Chroma] Error gestionando colección ${collectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Almacena un documento con sus chunks vectorizados
     * 
     * @param {Object} document - Información del documento
     * @param {Array} chunks - Chunks con embeddings
     * @returns {Promise<string>} ID del documento almacenado
     */
    async storeDocument(document, chunks) {
        await this.ensureInitialized();

        try {
            console.log(`[RAG-Chroma] Almacenando documento: ${document.id} con ${chunks.length} chunks`);

            // Determinar colección basada en contexto educativo
            const collectionName = this.getCollectionName(document);
            const collection = await this.ensureCollection(collectionName);

            // Preparar datos para Chroma
            const ids = chunks.map(chunk => chunk.id);
            const embeddings = chunks.map(chunk => chunk.embedding);
            const documents = chunks.map(chunk => chunk.text);
            const metadatas = chunks.map(chunk => this.prepareMetadata(chunk, document));

            // Almacenar en batch
            await collection.add({
                ids: ids,
                embeddings: embeddings,
                documents: documents,
                metadatas: metadatas
            });

            console.log(`[RAG-Chroma] Documento almacenado exitosamente: ${document.id}`);
            return document.id;

        } catch (error) {
            console.error('[RAG-Chroma] Error almacenando documento:', error.message);
            throw new Error(`Error almacenando en Chroma DB: ${error.message}`);
        }
    }

    /**
     * Busca chunks similares usando búsqueda vectorial
     * 
     * @param {Array} queryEmbedding - Vector de consulta
     * @param {Object} filters - Filtros de búsqueda
     * @param {number} limit - Número máximo de resultados
     * @returns {Promise<Array>} Chunks ordenados por similitud
     */
    async searchSimilar(queryEmbedding, filters = {}, limit = 10) {
        await this.ensureInitialized();

        try {
            console.log(`[RAG-Chroma] Buscando chunks similares (limit: ${limit})`);

            // Determinar colección(es) a buscar
            const collections = await this.getSearchCollections(filters);
            let allResults = [];

            // Buscar en cada colección relevante
            for (const collectionName of collections) {
                try {
                    const collection = await this.ensureCollection(collectionName);
                    
                    // Preparar filtros de metadatos para Chroma
                    const whereClause = this.buildWhereClause(filters);
                    
                    // Realizar búsqueda vectorial
                    const results = await collection.query({
                        queryEmbeddings: [queryEmbedding],
                        nResults: limit * 2, // Buscar más para después filtrar
                        where: whereClause,
                        include: ['documents', 'metadatas', 'distances']
                    });

                    // Procesar resultados
                    if (results.ids[0] && results.ids[0].length > 0) {
                        const processedResults = this.processSearchResults(results);
                        allResults.push(...processedResults);
                    }

                } catch (collectionError) {
                    console.warn(`[RAG-Chroma] Error buscando en colección ${collectionName}:`, collectionError.message);
                    // Continuar con otras colecciones
                }
            }

            // Ordenar por similitud (distancia menor = mayor similitud)
            allResults.sort((a, b) => a.distance - b.distance);

            // Convertir distancia a similitud y limitar resultados
            const finalResults = allResults
                .slice(0, limit)
                .map(result => ({
                    ...result,
                    similarity: 1 - result.distance // Convertir distancia a similitud
                }));

            console.log(`[RAG-Chroma] Búsqueda completada: ${finalResults.length} resultados`);
            return finalResults;

        } catch (error) {
            console.error('[RAG-Chroma] Error en búsqueda vectorial:', error.message);
            throw new Error(`Error en búsqueda vectorial: ${error.message}`);
        }
    }

    /**
     * Obtiene chunks de un documento específico
     * 
     * @param {string} documentId - ID del documento
     * @returns {Promise<Array>} Chunks del documento
     */
    async getChunksByDocument(documentId) {
        await this.ensureInitialized();

        try {
            // Buscar en todas las colecciones
            const allCollections = await this.client.listCollections();
            let allChunks = [];

            for (const collectionInfo of allCollections) {
                try {
                    const collection = await this.client.getCollection({
                        name: collectionInfo.name
                    });

                    const results = await collection.get({
                        where: { "document_id": documentId },
                        include: ['documents', 'metadatas', 'embeddings']
                    });

                    if (results.ids && results.ids.length > 0) {
                        const chunks = this.processGetResults(results);
                        allChunks.push(...chunks);
                    }

                } catch (error) {
                    console.warn(`[RAG-Chroma] Error obteniendo chunks de colección ${collectionInfo.name}:`, error.message);
                }
            }

            // Ordenar por índice de chunk
            allChunks.sort((a, b) => (a.chunk_index || 0) - (b.chunk_index || 0));

            return allChunks;

        } catch (error) {
            console.error('[RAG-Chroma] Error obteniendo chunks por documento:', error.message);
            throw error;
        }
    }

    /**
     * Elimina un documento y todos sus chunks
     * 
     * @param {string} documentId - ID del documento
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async deleteDocument(documentId) {
        await this.ensureInitialized();

        try {
            console.log(`[RAG-Chroma] Eliminando documento: ${documentId}`);

            let deletedCount = 0;
            const allCollections = await this.client.listCollections();

            // Eliminar de todas las colecciones
            for (const collectionInfo of allCollections) {
                try {
                    const collection = await this.client.getCollection({
                        name: collectionInfo.name
                    });

                    // Obtener IDs de chunks del documento
                    const results = await collection.get({
                        where: { "document_id": documentId },
                        include: ['metadatas']
                    });

                    if (results.ids && results.ids.length > 0) {
                        // Eliminar chunks
                        await collection.delete({
                            ids: results.ids
                        });

                        deletedCount += results.ids.length;
                    }

                } catch (error) {
                    console.warn(`[RAG-Chroma] Error eliminando de colección ${collectionInfo.name}:`, error.message);
                }
            }

            console.log(`[RAG-Chroma] Documento eliminado: ${deletedCount} chunks eliminados`);
            return deletedCount > 0;

        } catch (error) {
            console.error('[RAG-Chroma] Error eliminando documento:', error.message);
            throw error;
        }
    }

    /**
     * Lista documentos con filtros
     * 
     * @param {Object} filters - Filtros de búsqueda
     * @returns {Promise<Array>} Lista de documentos únicos
     */
    async listDocuments(filters = {}) {
        await this.ensureInitialized();

        try {
            const collections = await this.getSearchCollections(filters);
            const documentsMap = new Map();

            // Buscar en colecciones relevantes
            for (const collectionName of collections) {
                try {
                    const collection = await this.ensureCollection(collectionName);
                    const whereClause = this.buildWhereClause(filters);

                    const results = await collection.get({
                        where: whereClause,
                        include: ['metadatas']
                    });

                    // Agrupar por documento
                    if (results.metadatas) {
                        results.metadatas.forEach(metadata => {
                            const docId = metadata.document_id;
                            if (!documentsMap.has(docId)) {
                                documentsMap.set(docId, {
                                    id: docId,
                                    file_name: metadata.file_name,
                                    file_type: metadata.file_type,
                                    file_size: metadata.file_size,
                                    subject_id: metadata.subject_id,
                                    topic_id: metadata.topic_id,
                                    subtopic_id: metadata.subtopic_id,
                                    uploaded_by: metadata.uploaded_by,
                                    upload_date: metadata.upload_date,
                                    created_at: metadata.created_at,
                                    total_chunks: 0
                                });
                            }
                            documentsMap.get(docId).total_chunks++;
                        });
                    }

                } catch (error) {
                    console.warn(`[RAG-Chroma] Error listando en colección ${collectionName}:`, error.message);
                }
            }

            return Array.from(documentsMap.values());

        } catch (error) {
            console.error('[RAG-Chroma] Error listando documentos:', error.message);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del almacenamiento
     * 
     * @returns {Promise<Object>} Estadísticas
     */
    async getStats() {
        await this.ensureInitialized();

        try {
            const collections = await this.client.listCollections();
            let totalDocuments = 0;
            let totalChunks = 0;
            const byCollection = [];

            for (const collectionInfo of collections) {
                try {
                    const collection = await this.client.getCollection({
                        name: collectionInfo.name
                    });

                    const count = await collection.count();
                    totalChunks += count;

                    // Estimar documentos únicos en esta colección
                    const uniqueDocs = await collection.get({
                        include: ['metadatas']
                    });

                    const uniqueDocIds = new Set();
                    if (uniqueDocs.metadatas) {
                        uniqueDocs.metadatas.forEach(metadata => {
                            if (metadata.document_id) {
                                uniqueDocIds.add(metadata.document_id);
                            }
                        });
                    }

                    const docCount = uniqueDocIds.size;
                    totalDocuments += docCount;

                    byCollection.push({
                        name: collectionInfo.name,
                        chunks: count,
                        documents: docCount
                    });

                } catch (error) {
                    console.warn(`[RAG-Chroma] Error obteniendo stats de ${collectionInfo.name}:`, error.message);
                }
            }

            return {
                totalDocuments,
                totalChunks,
                avgChunksPerDocument: totalDocuments > 0 ? Math.round(totalChunks / totalDocuments) : 0,
                collections: byCollection,
                dbInfo: {
                    host: this.config.host,
                    port: this.config.port,
                    collectionsCount: collections.length
                }
            };

        } catch (error) {
            console.error('[RAG-Chroma] Error obteniendo estadísticas:', error.message);
            throw error;
        }
    }

    // Métodos auxiliares

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    getCollectionName(document) {
        // Estrategia: una colección por asignatura para mejor organización
        const subjectId = document.subjectId || 'default';
        return `aiquiz_subject_${subjectId}`;
    }

    async getSearchCollections(filters) {
        if (filters.subjectId) {
            return [`aiquiz_subject_${filters.subjectId}`];
        }

        // Si no hay filtro de asignatura, buscar en todas las colecciones relevantes
        const allCollections = await this.client.listCollections();
        return allCollections
            .map(c => c.name)
            .filter(name => name.startsWith('aiquiz_subject_'));
    }

    prepareMetadata(chunk, document) {
        const metadata = chunk.metadata || {};
        
        return {
            // IDs
            document_id: document.id,
            chunk_id: chunk.id,
            chunk_index: metadata.chunkIndex || 0,
            
            // Información del documento
            file_name: document.fileName,
            file_type: document.fileType || 'pdf',
            file_size: document.fileSize,
            
            // Contexto educativo
            subject_id: document.subjectId,
            topic_id: document.topicId || null,
            subtopic_id: document.subtopicId || null,
            
            // Usuario y fechas
            uploaded_by: document.uploadedBy,
            upload_date: document.uploadDate,
            created_at: new Date().toISOString(),
            
            // Información del chunk
            char_count: metadata.charCount || chunk.text.length,
            word_count: metadata.wordCount || 0,
            sentence_count: metadata.sentenceCount || 0,
            
            // Información estructural
            section_title: metadata.structuralInfo?.section || null,
            page_number: metadata.structuralInfo?.page || null,
            paragraph_number: metadata.structuralInfo?.paragraph || null,
            is_heading: metadata.structuralInfo?.isHeading || false,
            is_list: metadata.structuralInfo?.isList || false,
            
            // Posición en documento
            start_position: metadata.startPosition || 0,
            end_position: metadata.endPosition || 0
        };
    }

    buildWhereClause(filters) {
        const where = {};

        if (filters.subjectId) {
            where.subject_id = filters.subjectId;
        }
        if (filters.topicId) {
            where.topic_id = filters.topicId;
        }
        if (filters.subtopicId) {
            where.subtopic_id = filters.subtopicId;
        }
        if (filters.documentId) {
            where.document_id = filters.documentId;
        }
        if (filters.sectionTitle) {
            where.section_title = filters.sectionTitle;
        }
        if (typeof filters.isHeading === 'boolean') {
            where.is_heading = filters.isHeading;
        }

        return Object.keys(where).length > 0 ? where : undefined;
    }

    processSearchResults(results) {
        const processed = [];
        
        for (let i = 0; i < results.ids[0].length; i++) {
            processed.push({
                id: results.ids[0][i],
                text: results.documents[0][i],
                metadata: results.metadatas[0][i],
                distance: results.distances[0][i],
                
                // Campos compatibles con el formato anterior
                document_id: results.metadatas[0][i].document_id,
                chunk_index: results.metadatas[0][i].chunk_index,
                char_count: results.metadatas[0][i].char_count,
                word_count: results.metadatas[0][i].word_count,
                sentence_count: results.metadatas[0][i].sentence_count,
                section_title: results.metadatas[0][i].section_title,
                page_number: results.metadatas[0][i].page_number,
                paragraph_number: results.metadatas[0][i].paragraph_number,
                is_heading: results.metadatas[0][i].is_heading,
                is_list: results.metadatas[0][i].is_list,
                file_name: results.metadatas[0][i].file_name,
                subject_id: results.metadatas[0][i].subject_id,
                topic_id: results.metadatas[0][i].topic_id,
                subtopic_id: results.metadatas[0][i].subtopic_id
            });
        }

        return processed;
    }

    processGetResults(results) {
        const processed = [];
        
        for (let i = 0; i < results.ids.length; i++) {
            processed.push({
                id: results.ids[i],
                text: results.documents ? results.documents[i] : '',
                embedding: results.embeddings ? results.embeddings[i] : null,
                metadata: results.metadatas ? results.metadatas[i] : {},
                
                // Campos adicionales para compatibilidad
                chunk_index: results.metadatas ? results.metadatas[i].chunk_index : 0
            });
        }

        return processed;
    }

    /**
     * Cierra la conexión con Chroma DB
     */
    async close() {
        if (this.client) {
            this.collections.clear();
            this.isInitialized = false;
            console.log('[RAG-Chroma] Conexión cerrada');
        }
    }

    /**
     * Obtiene información sobre el servicio de almacenamiento
     * 
     * @returns {Object} Información del servicio
     */
    getStorageInfo() {
        return {
            name: 'ChromaStorage',
            version: '1.0.0',
            database: 'Chroma DB',
            host: this.config.host,
            port: this.config.port,
            isInitialized: this.isInitialized,
            collectionsCount: this.collections.size,
            features: [
                'Búsqueda vectorial optimizada',
                'Similitud coseno',
                'Colecciones por contexto educativo',
                'Metadatos enriquecidos',
                'Escalabilidad horizontal'
            ]
        };
    }
}

module.exports = ChromaStorage;