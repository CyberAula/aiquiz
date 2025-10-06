/**
 * SERVICIO DE EMBEDDINGS - SISTEMA RAG MANAGER
 * 
 * Versión integrada en el manager para generación de embeddings vectoriales.
 * Optimizado para el procesamiento de documentos PDF educativos.
 */

// Usar dynamic import para @xenova/transformers (ES Module)
let pipeline, env;

async function loadTransformers() {
    if (!pipeline) {
        const transformers = await import('@xenova/transformers');
        pipeline = transformers.pipeline;
        env = transformers.env;
        
        // Configurar transformers para usar modelos alternativos
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        env.useBrowserCache = false;
        
        // Configurar directorio de cache
        const path = require('path');
        env.cacheDir = path.join(process.cwd(), 'cache', 'transformers');
    }
    return { pipeline, env };
}

class EmbeddingService {
    constructor(options = {}) {
        this.modelName = options.modelName || 'Xenova/all-MiniLM-L6-v2';
        this.dimensions = options.dimensions || 384;
        this.batchSize = options.batchSize || 16; // Reducido para PDFs
        this.useCache = options.useCache !== false;
        
        this.extractor = null;
        this.isInitialized = false;
        this.cache = new Map();
        
        console.log(`[RAG-Manager] EmbeddingService configurado con modelo: ${this.modelName}`);
    }

    /**
     * Inicializa el modelo de embeddings
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log(`[RAG-Manager] Inicializando modelo de embeddings: ${this.modelName}`);
            console.log('[RAG-Manager] Nota: La primera ejecución puede tardar varios minutos...');
            
            // Cargar transformers dinámicamente
            await loadTransformers();
            
            this.extractor = await pipeline('feature-extraction', this.modelName, {
                quantized: true,
                revision: 'main'
            });
            
            this.isInitialized = true;
            console.log(`[RAG-Manager] Modelo inicializado exitosamente. Dimensiones: ${this.dimensions}`);
            
            await this.testModel();
            
        } catch (error) {
            console.error('[RAG-Manager] Error inicializando modelo de embeddings:', error.message);
            throw new Error(`Error inicializando embeddings: ${error.message}`);
        }
    }

    /**
     * Genera embedding para un texto individual
     */
    async generateEmbedding(text, options = {}) {
        await this.ensureInitialized();

        if (!text || text.trim().length === 0) {
            throw new Error('Texto vacío o inválido para generar embedding');
        }

        const cacheKey = this.getCacheKey(text);
        if (this.useCache && this.cache.has(cacheKey)) {
            console.log('[RAG-Manager] Embedding encontrado en cache');
            return this.cache.get(cacheKey);
        }

        try {
            const cleanText = this.preprocessText(text);
            const output = await this.extractor(cleanText, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);
            
            if (embedding.length !== this.dimensions) {
                console.warn(`[RAG-Manager] Dimensiones inesperadas: ${embedding.length} (esperado: ${this.dimensions})`);
            }

            if (this.useCache) {
                this.cache.set(cacheKey, embedding);
            }

            return embedding;

        } catch (error) {
            console.error('[RAG-Manager] Error generando embedding:', error.message);
            throw new Error(`Error generando embedding: ${error.message}`);
        }
    }

    /**
     * Genera embeddings para múltiples textos en batch
     */
    async generateEmbeddings(texts, options = {}) {
        await this.ensureInitialized();

        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Array de textos vacío o inválido');
        }

        console.log(`[RAG-Manager] Generando embeddings para ${texts.length} textos...`);

        const embeddings = [];
        const batches = this.createBatches(texts, this.batchSize);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`[RAG-Manager] Procesando batch ${i + 1}/${batches.length} (${batch.length} textos)`);

            try {
                const batchEmbeddings = await this.processBatch(batch);
                embeddings.push(...batchEmbeddings);
            } catch (error) {
                console.error(`[RAG-Manager] Error procesando batch ${i + 1}:`, error.message);
                throw error;
            }
        }

        console.log(`[RAG-Manager] Embeddings generados exitosamente: ${embeddings.length} vectores`);
        return embeddings;
    }

    /**
     * Procesa un chunk de documento y genera su embedding
     */
    async processChunk(chunk) {
        try {
            const embedding = await this.generateEmbedding(chunk.text);
            
            return {
                ...chunk,
                embedding: embedding,
                embeddingMetadata: {
                    model: this.modelName,
                    dimensions: embedding.length,
                    generatedAt: new Date().toISOString(),
                    textLength: chunk.text.length,
                    optimizedForPDF: true
                }
            };
        } catch (error) {
            console.error(`[RAG-Manager] Error procesando chunk ${chunk.id}:`, error.message);
            throw error;
        }
    }

    /**
     * Procesa múltiples chunks y genera sus embeddings
     */
    async processChunks(chunks) {
        console.log(`[RAG-Manager] Procesando embeddings para ${chunks.length} chunks de PDF...`);

        const texts = chunks.map(chunk => chunk.text);
        const embeddings = await this.generateEmbeddings(texts);

        const processedChunks = chunks.map((chunk, index) => ({
            ...chunk,
            embedding: embeddings[index],
            embeddingMetadata: {
                model: this.modelName,
                dimensions: embeddings[index].length,
                generatedAt: new Date().toISOString(),
                textLength: chunk.text.length,
                chunkIndex: index,
                optimizedForPDF: true
            }
        }));

        console.log(`[RAG-Manager] Chunks de PDF procesados exitosamente con embeddings`);
        return processedChunks;
    }

    /**
     * Calcula similitud coseno entre dos embeddings
     */
    cosineSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            throw new Error('Los embeddings deben tener la misma dimensión');
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }

        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);

        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }

        return dotProduct / (norm1 * norm2);
    }

    /**
     * Busca chunks similares a un query (para compatibilidad)
     */
    async searchSimilar(query, chunks, topK = 10) {
        await this.ensureInitialized();

        const queryEmbedding = await this.generateEmbedding(query);

        const similarities = chunks.map(chunk => ({
            chunk: chunk,
            similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, topK).map(item => ({
            ...item.chunk,
            similarity: item.similarity
        }));
    }

    // Métodos auxiliares

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    preprocessText(text) {
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .substring(0, 512); // Limitar longitud para optimización
    }

    getCacheKey(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    async processBatch(texts) {
        const embeddings = [];
        
        for (const text of texts) {
            const embedding = await this.generateEmbedding(text);
            embeddings.push(embedding);
        }
        
        return embeddings;
    }

    async testModel() {
        try {
            const testText = "Este es un texto de prueba para verificar el modelo RAG en Manager.";
            const embedding = await this.generateEmbedding(testText);
            console.log(`[RAG-Manager] Test del modelo exitoso. Dimensiones: ${embedding.length}`);
        } catch (error) {
            console.error('[RAG-Manager] Error en test del modelo:', error.message);
            throw error;
        }
    }

    /**
     * Obtiene información sobre el servicio de embeddings
     */
    getServiceInfo() {
        return {
            modelName: this.modelName,
            dimensions: this.dimensions,
            batchSize: this.batchSize,
            isInitialized: this.isInitialized,
            cacheSize: this.cache.size,
            useCache: this.useCache,
            optimizedFor: 'PDF documents'
        };
    }

    /**
     * Limpia el cache de embeddings
     */
    clearCache() {
        this.cache.clear();
        console.log('[RAG-Manager] Cache de embeddings limpiado');
    }

    /**
     * Estima el tiempo de procesamiento para chunks de PDF
     */
    estimateProcessingTime(chunkCount) {
        const avgTimePerChunk = 0.7; // Ligeramente más tiempo para PDFs
        const totalTime = chunkCount * avgTimePerChunk;
        
        return {
            chunkCount: chunkCount,
            estimatedSeconds: Math.round(totalTime),
            estimatedMinutes: Math.round(totalTime / 60),
            avgTimePerChunk: avgTimePerChunk,
            note: 'Estimación para documentos PDF'
        };
    }
}

module.exports = EmbeddingService;