/**
 * SIMPLE EMBEDDINGS SERVICE - FALLBACK IMPLEMENTATION
 * 
 * Implementación simple de embeddings que usa TF-IDF como fallback
 * cuando @xenova/transformers no está disponible
 */

const crypto = require('crypto');

class SimpleEmbeddingsService {
    constructor(options = {}) {
        this.modelName = options.modelName || 'simple-tfidf';
        this.enableLogging = options.enableLogging !== false;
        this.vectorDimension = options.vectorSize || 384;
        this.isInitialized = false;
        
        // Vocabulario y estadísticas TF-IDF
        this.vocabulary = new Map();
        this.idf = new Map();
        this.documentFrequency = new Map();
        this.totalDocuments = 0;
        
        if (this.enableLogging) {
            console.log('[Simple Embeddings] Inicializado con TF-IDF fallback');
        }
    }

    /**
     * Inicializa el servicio
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            if (this.enableLogging) {
                console.log('[Simple Embeddings] Inicializando servicio TF-IDF...');
            }

            // Cargar vocabulario base común
            this.loadBaseVocabulary();
            
            this.isInitialized = true;
            
            if (this.enableLogging) {
                console.log(`[Simple Embeddings] Servicio inicializado. Dimensión: ${this.vectorDimension}`);
            }
        } catch (error) {
            console.error('[Simple Embeddings] Error inicializando servicio:', error);
            throw error;
        }
    }

    /**
     * Carga vocabulario base común en español e inglés
     */
    loadBaseVocabulary() {
        const baseWords = [
            // Palabras comunes en español
            'el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al',
            'una', 'ser', 'más', 'todo', 'estar', 'tener', 'hacer', 'poder', 'ir', 'ver', 'saber', 'dar', 'querer', 'venir', 'decir',
            'documento', 'texto', 'información', 'contenido', 'página', 'capítulo', 'sección', 'parte', 'tema', 'concepto', 'ejemplo',
            'datos', 'resultado', 'proceso', 'método', 'sistema', 'problema', 'solución', 'análisis', 'estudio', 'investigación',
            // Palabras comunes en inglés
            'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they',
            'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when',
            'document', 'text', 'information', 'content', 'page', 'chapter', 'section', 'part', 'topic', 'concept', 'example',
            'data', 'result', 'process', 'method', 'system', 'problem', 'solution', 'analysis', 'study', 'research'
        ];

        baseWords.forEach((word, index) => {
            this.vocabulary.set(word, index);
        });

        // Simular frecuencias de documento base
        baseWords.forEach(word => {
            this.documentFrequency.set(word, Math.random() * 100 + 1);
        });

        this.totalDocuments = 100; // Simular 100 documentos base
    }

    /**
     * Genera embedding para un texto usando TF-IDF
     * @param {string} text - Texto para generar embedding
     * @returns {Promise<Array>} Vector de embedding
     */
    async generateEmbedding(text) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (!text || text.trim().length === 0) {
                throw new Error('Texto vacío o nulo');
            }

            // Normalizar texto
            const normalizedText = this.normalizeText(text);
            const words = this.tokenize(normalizedText);

            // Calcular TF (Term Frequency)
            const tf = this.calculateTF(words);

            // Generar vector de embedding
            const embedding = this.generateVector(tf);

            if (this.enableLogging && Math.random() < 0.1) {
                console.log(`[Simple Embeddings] Generado embedding para texto de ${text.length} caracteres`);
            }

            return embedding;
        } catch (error) {
            console.error('[Simple Embeddings] Error generando embedding:', error);
            throw error;
        }
    }

    /**
     * Normaliza el texto
     * @param {string} text - Texto a normalizar
     * @returns {string} Texto normalizado
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Tokeniza el texto
     * @param {string} text - Texto a tokenizar
     * @returns {Array} Lista de tokens
     */
    tokenize(text) {
        return text.split(' ').filter(word => word.length > 2);
    }

    /**
     * Calcula TF (Term Frequency)
     * @param {Array} words - Lista de palabras
     * @returns {Map} Frecuencias de términos
     */
    calculateTF(words) {
        const tf = new Map();
        const totalWords = words.length;

        words.forEach(word => {
            tf.set(word, (tf.get(word) || 0) + 1);
        });

        // Normalizar por total de palabras
        for (const [word, count] of tf) {
            tf.set(word, count / totalWords);
        }

        return tf;
    }

    /**
     * Genera vector de embedding basado en TF-IDF
     * @param {Map} tf - Frecuencias de términos
     * @returns {Array} Vector de embedding
     */
    generateVector(tf) {
        const vector = new Array(this.vectorDimension).fill(0);

        for (const [word, tfValue] of tf) {
            // Obtener índice del vocabulario o crear uno nuevo
            let index = this.vocabulary.get(word);
            if (index === undefined) {
                index = this.vocabulary.size % this.vectorDimension;
                this.vocabulary.set(word, index);
            }

            // Calcular IDF (Inverse Document Frequency)
            const docFreq = this.documentFrequency.get(word) || 1;
            const idf = Math.log(this.totalDocuments / docFreq);

            // Calcular TF-IDF
            const tfidf = tfValue * idf;

            // Asignar al vector usando hash para distribución uniforme
            const hash = this.simpleHash(word);
            const vectorIndex = hash % this.vectorDimension;
            vector[vectorIndex] += tfidf;
        }

        // Normalizar vector
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        if (magnitude > 0) {
            for (let i = 0; i < vector.length; i++) {
                vector[i] /= magnitude;
            }
        }

        return vector;
    }

    /**
     * Función hash simple para distribución uniforme
     * @param {string} str - Cadena a hashear
     * @returns {number} Hash numérico
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }
        return Math.abs(hash);
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
            console.log(`[Simple Embeddings] Procesando ${total} chunks...`);
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
                    console.log(`[Simple Embeddings] Progreso: ${i + 1}/${total} chunks`);
                }
            } catch (error) {
                console.error(`[Simple Embeddings] Error procesando chunk ${i}:`, error);
                throw error;
            }
        }

        if (this.enableLogging) {
            console.log(`[Simple Embeddings] Completado. ${chunksWithEmbeddings.length} chunks procesados`);
        }

        return chunksWithEmbeddings;
    }

    /**
     * Estima el tiempo de procesamiento
     * @param {number} chunkCount - Número de chunks
     * @returns {Object} Estimación de tiempo
     */
    estimateProcessingTime(chunkCount) {
        // TF-IDF es muy rápido
        const avgTimePerChunk = 0.01; // 10ms por chunk
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
            type: 'Simple TF-IDF',
            modelName: this.modelName,
            vectorDimension: this.vectorDimension,
            isInitialized: this.isInitialized,
            maxTokens: 'unlimited',
            description: 'Embeddings usando TF-IDF simple',
            vocabularySize: this.vocabulary.size
        };
    }

    /**
     * Verifica si el servicio está disponible
     * @returns {Promise<boolean>} True si está disponible
     */
    async isAvailable() {
        return true; // Siempre disponible
    }

    /**
     * Cierra el servicio
     */
    async close() {
        if (this.enableLogging) {
            console.log('[Simple Embeddings] Cerrando servicio...');
        }
        
        this.isInitialized = false;
    }
}

module.exports = SimpleEmbeddingsService;