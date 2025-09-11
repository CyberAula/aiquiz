/**
 * QDRANT STORAGE V2 - BASADO EN SISTEMA RAG DE REFERENCIA
 * 
 * Implementación mejorada usando el cliente oficial @qdrant/js-client-rest
 * Optimizado para mejor rendimiento y características avanzadas
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const { v4: uuidv4 } = require('uuid');

class QdrantStorageV2 {
    constructor(options = {}) {
        this.baseUrl = options.url || 'http://localhost:6333';
        this.defaultCollection = options.collection || 'aiquiz_documents';
        this.vectorSize = options.vectorSize || 384;
        this.enableLogging = options.enableLogging !== false;
        
        // Cliente oficial de Qdrant
        this.client = new QdrantClient({
            url: this.baseUrl
        });
        
        this.isInitialized = false;
        
        if (this.enableLogging) {
            console.log('[Qdrant V2] Inicializado con:', {
                url: this.baseUrl,
                collection: this.defaultCollection,
                vectorSize: this.vectorSize
            });
        }
    }

    /**
     * Verifica si Qdrant está disponible
     */
    async health() {
        try {
            const collections = await this.client.getCollections();
            return true;
        } catch (error) {
            if (this.enableLogging) {
                console.error('[Qdrant V2] Health check failed:', error.message);
            }
            return false;
        }
    }

    /**
     * Inicializa el storage y crea la colección si no existe
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            if (this.enableLogging) {
                console.log('[Qdrant V2] Inicializando storage...');
            }

            // Verificar conexión
            const isHealthy = await this.health();
            if (!isHealthy) {
                throw new Error('Qdrant no está disponible');
            }

            // Crear colección si no existe
            await this.createCollection();
            
            this.isInitialized = true;
            
            if (this.enableLogging) {
                console.log('[Qdrant V2] Storage inicializado exitosamente');
            }
        } catch (error) {
            console.error('[Qdrant V2] Error inicializando storage:', error);
            throw error;
        }
    }

    /**
     * Crea una colección si no existe
     */
    async createCollection(collectionName = this.defaultCollection, vectorSize = this.vectorSize) {
        try {
            // Verificar si la colección ya existe
            const collections = await this.client.getCollections();
            const exists = collections.collections.some(c => c.name === collectionName);
            
            if (exists) {
                if (this.enableLogging) {
                    console.log(`[Qdrant V2] Colección ${collectionName} ya existe`);
                }
                return { success: true, existed: true };
            }

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Creando colección: ${collectionName}`);
            }

            // Crear colección
            await this.client.createCollection(collectionName, {
                vectors: {
                    size: vectorSize,
                    distance: 'Cosine'
                },
                optimizers_config: {
                    default_segment_number: 2
                },
                on_disk_payload: true
            });

            // Crear índices para búsqueda rápida
            await this.client.createPayloadIndex(collectionName, {
                field_name: 'document_id',
                field_schema: 'keyword',
                wait: true
            });

            await this.client.createPayloadIndex(collectionName, {
                field_name: 'chunk_index',
                field_schema: 'integer',
                wait: true
            });

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Colección ${collectionName} creada con índices`);
            }

            return { success: true, existed: false };
        } catch (error) {
            console.error(`[Qdrant V2] Error creando colección:`, error);
            throw error;
        }
    }

    /**
     * Almacena un documento completo con sus chunks
     */
    async storeDocument(documentMetadata, chunks) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Almacenando documento: ${documentMetadata.fileName}`);
            }

            const collectionName = this.defaultCollection;
            
            // Preparar puntos para Qdrant
            const points = chunks.map((chunk, index) => ({
                id: uuidv4(),
                vector: chunk.embedding,
                payload: {
                    // Metadatos del documento
                    document_id: documentMetadata.id,
                    file_name: documentMetadata.fileName,
                    file_type: documentMetadata.fileType,
                    file_size: documentMetadata.fileSize,
                    subject_id: documentMetadata.subjectId,
                    topic_id: documentMetadata.topicId,
                    subtopic_id: documentMetadata.subtopicId,
                    uploaded_by: documentMetadata.uploadedBy,
                    upload_date: documentMetadata.uploadDate,

                    // Metadatos del chunk
                    chunk_index: index,
                    text: chunk.text,
                    chunk_id: chunk.id,
                    char_count: chunk.metadata?.charCount || chunk.text.length,
                    word_count: chunk.metadata?.wordCount || chunk.text.split(' ').length,
                    sentence_count: chunk.metadata?.sentenceCount || chunk.text.split(/[.!?]+/).length,
                    
                    // Metadatos específicos de PDF
                    page_number: chunk.metadata?.pageNumber,
                    section_title: chunk.metadata?.sectionTitle,
                    is_heading: chunk.metadata?.isHeading || false,
                    is_list: chunk.metadata?.isList || false,
                    
                    // Referencia compuesta para búsquedas
                    point_reference: `${documentMetadata.id}_${index}`,
                    
                    // Timestamp
                    created_at: new Date().toISOString()
                }
            }));

            // Insertar puntos en Qdrant usando el cliente oficial
            await this.client.upsert(collectionName, {
                wait: true,
                points: points
            });

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Documento almacenado: ${points.length} chunks`);
            }

            return {
                success: true,
                documentId: documentMetadata.id,
                chunksStored: points.length
            };
        } catch (error) {
            console.error(`[Qdrant V2] Error almacenando documento:`, error);
            throw error;
        }
    }

    /**
     * Busca chunks similares a un vector de consulta
     */
    async searchSimilar(queryVector, filters = {}, limit = 10) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const collectionName = this.defaultCollection;
            
            // Construir filtro de Qdrant
            const qdrantFilter = this.buildQdrantFilter(filters);

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Buscando chunks similares (limit: ${limit})`);
            }

            // Realizar búsqueda usando el cliente oficial
            const results = await this.client.search(collectionName, {
                vector: queryVector,
                limit: limit,
                filter: qdrantFilter,
                with_payload: true,
                with_vectors: false
            });

            // Transformar resultados al formato esperado
            const transformedResults = results.map(result => ({
                id: result.id,
                similarity: result.score,
                text: result.payload.text,
                document_id: result.payload.document_id,
                file_name: result.payload.file_name,
                subject_id: result.payload.subject_id,
                topic_id: result.payload.topic_id,
                subtopic_id: result.payload.subtopic_id,
                page_number: result.payload.page_number,
                section_title: result.payload.section_title,
                is_heading: result.payload.is_heading,
                is_list: result.payload.is_list,
                char_count: result.payload.char_count,
                sentence_count: result.payload.sentence_count,
                metadata: result.payload
            }));

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Encontrados ${transformedResults.length} chunks similares`);
            }

            return transformedResults;
        } catch (error) {
            console.error(`[Qdrant V2] Error en búsqueda similar:`, error);
            throw error;
        }
    }

    /**
     * Obtiene chunks de un documento específico
     */
    async getChunksByDocument(documentId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const collectionName = this.defaultCollection;
            
            // Usar scroll para obtener todos los chunks del documento
            const results = await this.client.scroll(collectionName, {
                filter: {
                    must: [{
                        key: 'document_id',
                        match: { value: documentId }
                    }]
                },
                with_payload: true,
                with_vectors: true,
                limit: 10000 // Límite alto para obtener todos los chunks
            });

            // Transformar al formato esperado
            const chunks = results.points.map(point => ({
                id: point.id,
                text: point.payload.text,
                embedding: point.vector,
                document_id: point.payload.document_id,
                chunk_index: point.payload.chunk_index,
                page_number: point.payload.page_number,
                section_title: point.payload.section_title,
                is_heading: point.payload.is_heading,
                metadata: point.payload
            }));

            // Ordenar por chunk_index
            chunks.sort((a, b) => a.chunk_index - b.chunk_index);

            return chunks;
        } catch (error) {
            console.error(`[Qdrant V2] Error obteniendo chunks del documento:`, error);
            throw error;
        }
    }

    /**
     * Elimina un documento completo
     */
    async deleteDocument(documentId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Eliminando documento: ${documentId}`);
            }

            const collectionName = this.defaultCollection;
            
            // Eliminar todos los chunks del documento
            await this.client.delete(collectionName, {
                filter: {
                    must: [{
                        key: 'document_id',
                        match: { value: documentId }
                    }]
                },
                wait: true
            });

            if (this.enableLogging) {
                console.log(`[Qdrant V2] Documento ${documentId} eliminado`);
            }

            return true;
        } catch (error) {
            console.error(`[Qdrant V2] Error eliminando documento:`, error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del storage
     */
    async getStats() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const collections = await this.client.getCollections();
            
            let totalPoints = 0;
            const collectionStats = [];
            
            for (const collection of collections.collections) {
                try {
                    const info = await this.client.getCollection(collection.name);
                    const count = info.points_count || 0;
                    
                    totalPoints += count;
                    collectionStats.push({
                        name: collection.name,
                        points: count,
                        vectorSize: info.config?.params?.vectors?.size || 'unknown',
                        distance: info.config?.params?.vectors?.distance || 'unknown'
                    });
                } catch (error) {
                    console.warn(`[Qdrant V2] Error obteniendo stats de ${collection.name}:`, error.message);
                }
            }

            return {
                totalCollections: collections.collections.length,
                totalPoints: totalPoints,
                collections: collectionStats,
                defaultCollection: this.defaultCollection,
                vectorSize: this.vectorSize
            };
        } catch (error) {
            console.error('[Qdrant V2] Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    /**
     * Construye filtros de Qdrant a partir de filtros genéricos
     */
    buildQdrantFilter(filters) {
        const conditions = [];

        if (filters.subjectId) {
            conditions.push({
                key: 'subject_id',
                match: { value: filters.subjectId }
            });
        }

        if (filters.topicId) {
            conditions.push({
                key: 'topic_id',
                match: { value: filters.topicId }
            });
        }

        if (filters.subtopicId) {
            conditions.push({
                key: 'subtopic_id',
                match: { value: filters.subtopicId }
            });
        }

        if (filters.excludeDocumentId) {
            conditions.push({
                key: 'document_id',
                match: { 
                    except: [filters.excludeDocumentId]
                }
            });
        }

        return conditions.length > 0 ? { must: conditions } : undefined;
    }

    /**
     * Información del storage
     */
    getStorageInfo() {
        return {
            type: 'QdrantStorageV2',
            baseUrl: this.baseUrl,
            defaultCollection: this.defaultCollection,
            vectorSize: this.vectorSize,
            distance: 'Cosine',
            clientVersion: 'official',
            isInitialized: this.isInitialized
        };
    }

    /**
     * Cierra la conexión
     */
    async close() {
        if (this.enableLogging) {
            console.log('[Qdrant V2] Cerrando conexión...');
        }
        
        this.isInitialized = false;
        // El cliente oficial maneja la conexión automáticamente
    }
}

module.exports = QdrantStorageV2;