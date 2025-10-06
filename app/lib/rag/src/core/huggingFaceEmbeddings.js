/**
 * HUGGING FACE EMBEDDINGS SERVICE - BASADO EN SISTEMA RAG DE REFERENCIA
 * 
 * Genera embeddings usando modelos de Hugging Face con @xenova/transformers
 * Optimizado para uso en Node.js con importación dinámica ESM
 */

class HuggingFaceEmbeddingsService {
    constructor(options = {}) {
        this.modelName = options.modelName || 'Xenova/all-MiniLM-L6-v2';
        this.quantized = options.quantized !== undefined ? options.quantized : false;
        this.enableLogging = options.enableLogging !== false;
        
        // Cache para el modelo y pipeline
        this.embeddingModel = null;
        this.pipelineModule = null;
        this.vectorDimension = null;
        this.isInitialized = false;
        
        if (this.enableLogging) {
            console.log('[HuggingFace Embeddings] Inicializado con modelo:', this.modelName);
        }
    }

    /**
     * Importa dinámicamente las dependencias de @xenova/transformers
     * @returns {Promise<Object>} Módulo pipeline
     */
    async importDependencies() {
        if (!this.pipelineModule) {
            try {
                const { pipeline } = await import('@xenova/transformers');
                this.pipelineModule = pipeline;
                
                if (this.enableLogging) {
                    console.log('[HuggingFace Embeddings] Módulo @xenova/transformers importado');
                }
            } catch (error) {
                console.error('[HuggingFace Embeddings] Error al importar @xenova/transformers:', error);
                throw error;
            }
        }
        return this.pipelineModule;
    }

    /**
     * Inicializa el modelo de embeddings
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            if (this.enableLogging) {
                console.log('[HuggingFace Embeddings] Inicializando modelo:', this.modelName);
            }

            // Asegurar que el módulo pipeline está disponible
            const pipeline = await this.importDependencies();

            // Cargar el modelo usando @xenova/transformers
            this.embeddingModel = await pipeline('feature-extraction', this.modelName, {
                quantized: this.quantized
            });

            // Determinar dimensión del vector
            this.vectorDimension = await this.getEmbeddingDimension();
            
            this.isInitialized = true;
            
            if (this.enableLogging) {
                console.log(`[HuggingFace Embeddings] Modelo cargado. Dimensión: ${this.vectorDimension}`);
            }
        } catch (error) {
            console.error('[HuggingFace Embeddings] Error inicializando modelo:', error);
            throw error;
        }
    }

    /**
     * Genera embedding para un texto
     * @param {string} text - Texto para generar embedding
     * @returns {Promise<Array>} Vector de embedding
     */
    async generateEmbedding(text) {
        try {
            // Asegurar que el modelo esté inicializado
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (!text || text.trim().length === 0) {
                throw new Error('Texto vacío o nulo');
            }

            // Generar embedding
            const result = await this.embeddingModel(text, {
                pooling: 'mean',
                normalize: true
            });

            // Extraer el vector de embedding
            const embedding = Array.from(result.data);
            
            if (this.enableLogging && Math.random() < 0.1) { // Log 10% de las veces
                console.log(`[HuggingFace Embeddings] Generado embedding para texto de ${text.length} caracteres`);
            }

            return embedding;
        } catch (error) {
            console.error('[HuggingFace Embeddings] Error generando embedding:', error);
            throw error;
        }
    }

    /**
     * Procesa múltiples chunks generando embeddings
     * @param {Array} chunks - Lista de chunks de texto
     * @returns {Promise<Array>} Chunks con embeddings
     */
    async processChunks(chunks) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const chunksWithEmbeddings = [];
        const total = chunks.length;

        if (this.enableLogging) {
            console.log(`[HuggingFace Embeddings] Procesando ${total} chunks...`);
        }

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            
            try {
                const embedding = await this.generateEmbedding(chunk.text);
                
                chunksWithEmbeddings.push({
                    ...chunk,
                    embedding: embedding
                });

                // Log progreso cada 10 chunks o al final
                if (this.enableLogging && (i % 10 === 0 || i === total - 1)) {
                    console.log(`[HuggingFace Embeddings] Progreso: ${i + 1}/${total} chunks`);
                }
            } catch (error) {
                console.error(`[HuggingFace Embeddings] Error procesando chunk ${i}:`, error);
                throw error;
            }
        }

        if (this.enableLogging) {
            console.log(`[HuggingFace Embeddings] Completado. ${chunksWithEmbeddings.length} chunks procesados`);
        }

        return chunksWithEmbeddings;
    }

    /**
     * Obtiene la dimensión del vector de embedding
     * @returns {Promise<number>} Dimensión del vector
     */
    async getEmbeddingDimension() {
        try {
            if (this.vectorDimension) {
                return this.vectorDimension;
            }

            // Generar embedding de ejemplo para obtener dimensión
            const sampleText = 'Texto de ejemplo para obtener la dimensión del embedding';
            const embedding = await this.generateEmbedding(sampleText);
            
            this.vectorDimension = embedding.length;
            return this.vectorDimension;
        } catch (error) {
            console.error('[HuggingFace Embeddings] Error obteniendo dimensión:', error);
            throw error;
        }
    }

    /**
     * Estima el tiempo de procesamiento
     * @param {number} chunkCount - Número de chunks
     * @returns {Object} Estimación de tiempo
     */
    estimateProcessingTime(chunkCount) {
        // Estimación basada en rendimiento aproximado
        const avgTimePerChunk = 0.5; // 500ms por chunk aproximadamente
        const totalSeconds = chunkCount * avgTimePerChunk;
        
        return {
            totalSeconds: Math.round(totalSeconds),
            estimatedMinutes: Math.ceil(totalSeconds / 60),
            chunksPerMinute: Math.round(60 / avgTimePerChunk)
        };
    }

    /**
     * Obtiene información del servicio
     * @returns {Object} Información del servicio
     */
    getServiceInfo() {
        return {
            type: 'HuggingFace',
            modelName: this.modelName,
            quantized: this.quantized,
            vectorDimension: this.vectorDimension,
            isInitialized: this.isInitialized,
            maxTokens: 512, // Límite típico del modelo
            description: 'Embeddings usando @xenova/transformers'
        };
    }

    /**
     * Verifica si el servicio está disponible
     * @returns {Promise<boolean>} True si está disponible
     */
    async isAvailable() {
        try {
            // Temporalmente deshabilitado debido a problemas con sharp module
            if (this.enableLogging) {
                console.warn('[HuggingFace Embeddings] Temporalmente deshabilitado por problemas con sharp module');
            }
            return false;
            
            // await this.importDependencies();
            // return true;
        } catch (error) {
            if (this.enableLogging) {
                console.warn('[HuggingFace Embeddings] Servicio no disponible:', error.message);
            }
            return false;
        }
    }

    /**
     * Cierra el servicio y limpia recursos
     */
    async close() {
        if (this.enableLogging) {
            console.log('[HuggingFace Embeddings] Cerrando servicio...');
        }
        
        this.embeddingModel = null;
        this.isInitialized = false;
        this.vectorDimension = null;
    }
}

module.exports = HuggingFaceEmbeddingsService;