/**
 * QDRANT STORAGE MANAGER
 * 
 * Gestiona la interacción con la base de datos vectorial Qdrant.
 * Proporciona funcionalidades para almacenar, buscar y gestionar embeddings.
 */

const fetch = require('node-fetch');

class QdrantStorage {
    constructor(host = 'localhost', port = 6333) {
        this.baseUrl = `http://${host}:${port}`;
        this.defaultCollection = 'aiquiz_documents';
        this.vectorSize = 384; // Tamaño por defecto para all-MiniLM-L6-v2
    }

    /**
     * Verifica si Qdrant está disponible
     */
    async health() {
        try {
            const response = await fetch(`${this.baseUrl}/`);
            return response.ok;
        } catch (error) {
            console.error('🔍 [Qdrant] Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Crea una colección si no existe
     */
    async createCollection(collectionName = this.defaultCollection, vectorSize = this.vectorSize) {
        try {
            console.log(`📦 [Qdrant] Creando colección: ${collectionName}`);
            
            // Verificar si la colección ya existe
            const exists = await this.collectionExists(collectionName);
            if (exists) {
                console.log(`✅ [Qdrant] Colección ${collectionName} ya existe`);
                return { success: true, existed: true };
            }

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vectors: {
                        size: vectorSize,
                        distance: 'Cosine'
                    },
                    optimizers_config: {
                        default_segment_number: 2
                    },
                    replication_factor: 1
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error creando colección: ${error.status?.error || 'Unknown error'}`);
            }

            console.log(`✅ [Qdrant] Colección ${collectionName} creada exitosamente`);
            return { success: true, existed: false };

        } catch (error) {
            console.error(`❌ [Qdrant] Error creando colección ${collectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Verifica si una colección existe
     */
    async collectionExists(collectionName) {
        try {
            const response = await fetch(`${this.baseUrl}/collections/${collectionName}`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Lista todas las colecciones
     */
    async listCollections() {
        try {
            const response = await fetch(`${this.baseUrl}/collections`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.result?.collections || [];
        } catch (error) {
            console.error('❌ [Qdrant] Error listando colecciones:', error.message);
            throw error;
        }
    }

    /**
     * Inserta documentos en la colección
     */
    async upsertPoints(collectionName, points) {
        try {
            console.log(`📝 [Qdrant] Insertando ${points.length} puntos en ${collectionName}`);

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    points: points
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error insertando puntos: ${error.status?.error || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log(`✅ [Qdrant] ${points.length} puntos insertados exitosamente`);
            return result;

        } catch (error) {
            console.error(`❌ [Qdrant] Error insertando puntos:`, error.message);
            throw error;
        }
    }


    /**
     * Obtiene información de la colección
     */
    async getCollectionInfo(collectionName) {
        try {
            const response = await fetch(`${this.baseUrl}/collections/${collectionName}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error(`❌ [Qdrant] Error obteniendo info de ${collectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Cuenta puntos en una colección
     */
    async countPoints(collectionName) {
        try {
            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points/count`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.result?.count || 0;
        } catch (error) {
            console.error(`❌ [Qdrant] Error contando puntos en ${collectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Elimina puntos específicos por ID
     */
    async deletePoints(collectionName, pointIds) {
        try {
            console.log(`🗑️ [Qdrant] Eliminando ${pointIds.length} puntos de ${collectionName}`);

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    points: pointIds
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error eliminando puntos: ${error.status?.error || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log(`✅ [Qdrant] ${pointIds.length} puntos eliminados exitosamente`);
            return result;

        } catch (error) {
            console.error(`❌ [Qdrant] Error eliminando puntos:`, error.message);
            throw error;
        }
    }

    /**
     * Elimina puntos basado en filtros
     */
    async deletePointsByFilter(collectionName, filter) {
        try {
            console.log(`🗑️ [Qdrant] Eliminando puntos con filtro en ${collectionName}`);

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filter: filter
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error eliminando puntos por filtro: ${error.status?.error || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log(`✅ [Qdrant] Puntos eliminados con filtro exitosamente`);
            return result;

        } catch (error) {
            console.error(`❌ [Qdrant] Error eliminando puntos por filtro:`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene puntos específicos por ID
     */
    async getPoints(collectionName, pointIds) {
        try {
            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: pointIds,
                    with_payload: true,
                    with_vector: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.result || [];
        } catch (error) {
            console.error(`❌ [Qdrant] Error obteniendo puntos:`, error.message);
            throw error;
        }
    }

    /**
     * Scroll por todos los puntos en una colección (para debug)
     */
    async scrollPoints(collectionName, limit = 100, offset = null) {
        try {
            const body = {
                limit: limit,
                with_payload: true,
                with_vector: false
            };

            if (offset) {
                body.offset = offset;
            }

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points/scroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return {
                points: data.result?.points || [],
                next_page_offset: data.result?.next_page_offset
            };
        } catch (error) {
            console.error(`❌ [Qdrant] Error scrolling puntos:`, error.message);
            throw error;
        }
    }

    /**
     * Elimina una colección completa
     */
    async deleteCollection(collectionName) {
        try {
            console.log(`🗑️ [Qdrant] Eliminando colección: ${collectionName}`);

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error eliminando colección: ${error.status?.error || 'Unknown error'}`);
            }

            console.log(`✅ [Qdrant] Colección ${collectionName} eliminada exitosamente`);
            return true;

        } catch (error) {
            console.error(`❌ [Qdrant] Error eliminando colección ${collectionName}:`, error.message);
            throw error;
        }
    }

    /**
     * Inicializa el storage creando la colección por defecto
     */
    async initialize() {
        try {
            console.log('🚀 [Qdrant] Inicializando storage...');
            
            // Verificar conexión
            const isHealthy = await this.health();
            if (!isHealthy) {
                throw new Error('Qdrant no está disponible');
            }

            // Crear colección por defecto si no existe
            await this.createCollection();
            
            console.log('✅ [Qdrant] Storage inicializado exitosamente');
        } catch (error) {
            console.error('❌ [Qdrant] Error inicializando storage:', error.message);
            throw error;
        }
    }

    /**
     * Almacena un documento completo con sus chunks
     */
    async storeDocument(documentMetadata, chunks) {
        try {
            console.log(`📚 [Qdrant] Almacenando documento: ${documentMetadata.fileName}`);
            
            const collectionName = this.defaultCollection;
            
            // Asegurar que la colección existe
            await this.createCollection(collectionName);

            // Preparar puntos para Qdrant
            const points = chunks.map((chunk, index) => ({
                id: `${documentMetadata.id}_chunk_${index}`,
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
                    
                    // Timestamp
                    created_at: new Date().toISOString()
                }
            }));

            // Insertar puntos en Qdrant
            await this.upsertPoints(collectionName, points);
            
            console.log(`✅ [Qdrant] Documento ${documentMetadata.fileName} almacenado con ${points.length} chunks`);
            return {
                success: true,
                documentId: documentMetadata.id,
                chunksStored: points.length
            };

        } catch (error) {
            console.error(`❌ [Qdrant] Error almacenando documento:`, error.message);
            throw error;
        }
    }

    /**
     * Busca chunks similares a un vector de consulta (método para RAG Manager)
     */
    async searchSimilar(queryVector, filters = {}, limit = 10) {
        try {
            const collectionName = this.defaultCollection;
            
            // Construir filtro de Qdrant
            let qdrantFilter = null;
            if (Object.keys(filters).length > 0) {
                qdrantFilter = this.buildQdrantFilter(filters);
            }

            // Realizar búsqueda usando el método interno
            const results = await this._performSearch(collectionName, queryVector, limit, 0.0, qdrantFilter);
            
            // Transformar resultados al formato esperado por el RAG Manager
            return results.map(result => ({
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

        } catch (error) {
            console.error(`❌ [Qdrant] Error en búsqueda similar:`, error.message);
            throw error;
        }
    }

    /**
     * Método interno para realizar búsquedas en Qdrant
     */
    async _performSearch(collectionName, queryVector, limit = 10, scoreThreshold = 0.7, filter = null) {
        try {
            console.log(`🔍 [Qdrant] Buscando documentos similares en ${collectionName} (limit: ${limit})`);

            const searchBody = {
                vector: queryVector,
                limit: limit,
                score_threshold: scoreThreshold,
                with_payload: true,
                with_vector: false
            };

            if (filter) {
                searchBody.filter = filter;
            }

            const response = await fetch(`${this.baseUrl}/collections/${collectionName}/points/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Error en búsqueda: ${error.status?.error || 'Unknown error'}`);
            }

            const result = await response.json();
            const points = result.result || [];
            
            console.log(`✅ [Qdrant] Encontrados ${points.length} documentos similares`);
            return points;

        } catch (error) {
            console.error(`❌ [Qdrant] Error en búsqueda interna:`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene chunks de un documento específico
     */
    async getChunksByDocument(documentId) {
        try {
            const collectionName = this.defaultCollection;
            
            // Construir filtro para el documento
            const filter = {
                must: [{
                    key: "document_id",
                    match: { value: documentId }
                }]
            };

            // Usar scroll para obtener todos los puntos del documento
            let allChunks = [];
            let offset = null;
            
            do {
                const result = await this.scrollPoints(collectionName, 100, offset);
                
                // Filtrar por documento (Qdrant no soporta filtros en scroll directamente)
                const documentChunks = result.points.filter(point => 
                    point.payload.document_id === documentId
                );
                
                allChunks.push(...documentChunks);
                offset = result.next_page_offset;
            } while (offset);

            // Transformar al formato esperado
            return allChunks.map(chunk => ({
                id: chunk.id,
                text: chunk.payload.text,
                embedding: chunk.vector,
                document_id: chunk.payload.document_id,
                chunk_index: chunk.payload.chunk_index,
                page_number: chunk.payload.page_number,
                section_title: chunk.payload.section_title,
                is_heading: chunk.payload.is_heading,
                metadata: chunk.payload
            }));

        } catch (error) {
            console.error(`❌ [Qdrant] Error obteniendo chunks del documento ${documentId}:`, error.message);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del storage
     */
    async getStats() {
        try {
            const collections = await this.listCollections();
            
            let totalPoints = 0;
            const collectionStats = [];
            
            for (const collection of collections) {
                const count = await this.countPoints(collection.name);
                const info = await this.getCollectionInfo(collection.name);
                
                totalPoints += count;
                collectionStats.push({
                    name: collection.name,
                    points: count,
                    vectorSize: info.config?.params?.vectors?.size || 'unknown',
                    distance: info.config?.params?.vectors?.distance || 'unknown'
                });
            }

            return {
                totalCollections: collections.length,
                totalPoints: totalPoints,
                collections: collectionStats,
                defaultCollection: this.defaultCollection,
                vectorSize: this.vectorSize
            };

        } catch (error) {
            console.error('❌ [Qdrant] Error obteniendo estadísticas:', error.message);
            throw error;
        }
    }

    /**
     * Información del storage
     */
    getStorageInfo() {
        return {
            type: 'QdrantStorage',
            baseUrl: this.baseUrl,
            defaultCollection: this.defaultCollection,
            vectorSize: this.vectorSize,
            distance: 'Cosine'
        };
    }

    /**
     * Elimina un documento completo
     */
    async deleteDocument(documentId) {
        try {
            console.log(`🗑️ [Qdrant] Eliminando documento: ${documentId}`);
            
            const collectionName = this.defaultCollection;
            
            // Construir filtro para eliminar todos los chunks del documento
            const filter = {
                must: [{
                    key: "document_id",
                    match: { value: documentId }
                }]
            };

            await this.deletePointsByFilter(collectionName, filter);
            
            console.log(`✅ [Qdrant] Documento ${documentId} eliminado exitosamente`);
            return true;

        } catch (error) {
            console.error(`❌ [Qdrant] Error eliminando documento ${documentId}:`, error.message);
            throw error;
        }
    }

    /**
     * Cierra la conexión (no necesario para Qdrant HTTP)
     */
    async close() {
        console.log('🔒 [Qdrant] Cerrando conexión (HTTP no requiere cierre)');
    }

    /**
     * Construye filtros de Qdrant a partir de filtros genéricos
     */
    buildQdrantFilter(filters) {
        const conditions = [];

        if (filters.subjectId) {
            conditions.push({
                key: "subject_id",
                match: { value: filters.subjectId }
            });
        }

        if (filters.topicId) {
            conditions.push({
                key: "topic_id", 
                match: { value: filters.topicId }
            });
        }

        if (filters.subtopicId) {
            conditions.push({
                key: "subtopic_id",
                match: { value: filters.subtopicId }
            });
        }

        if (filters.excludeDocumentId) {
            conditions.push({
                key: "document_id",
                match: { 
                    except: [filters.excludeDocumentId]
                }
            });
        }

        return conditions.length > 0 ? { must: conditions } : null;
    }
}

module.exports = QdrantStorage;