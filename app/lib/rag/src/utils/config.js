/**
 * CONFIGURACIÓN DEL SISTEMA RAG
 * 
 * Configuraciones centralizadas para el sistema RAG especializado en PDF.
 * Incluye configuraciones para Chroma DB, embeddings, procesamiento y más.
 */

// Configuración por defecto del sistema RAG
const DEFAULT_CONFIG = {
    // Configuración de Chroma DB
    storage: {
        type: 'chromadb',
        host: process.env.CHROMA_HOST || 'localhost',
        port: parseInt(process.env.CHROMA_PORT) || 8000,
        ssl: process.env.CHROMA_SSL === 'true',
        timeout: 30000, // 30 segundos
        retries: 3,
        retryDelay: 2000 // 2 segundos
    },

    // Configuración de embeddings
    embeddings: {
        modelName: process.env.EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
        dimensions: parseInt(process.env.EMBEDDING_DIMENSIONS) || 384,
        batchSize: parseInt(process.env.EMBEDDING_BATCH_SIZE) || 32,
        useCache: process.env.EMBEDDING_CACHE !== 'false',
        cacheSize: parseInt(process.env.EMBEDDING_CACHE_SIZE) || 1000
    },

    // Configuración de chunking para PDFs
    chunking: {
        maxChunkSize: parseInt(process.env.CHUNK_MAX_SIZE) || 500, // Optimizado para PDFs
        minChunkSize: parseInt(process.env.CHUNK_MIN_SIZE) || 150,
        overlapSize: parseInt(process.env.CHUNK_OVERLAP) || 75,
        maxSentencesPerChunk: parseInt(process.env.CHUNK_MAX_SENTENCES) || 5,
        preserveParagraphs: process.env.CHUNK_PRESERVE_PARAGRAPHS !== 'false',
        includeContext: process.env.CHUNK_INCLUDE_CONTEXT !== 'false',
        pdfOptimized: true // Optimizaciones específicas para PDF
    },

    // Configuración de procesamiento de PDF
    pdf: {
        maxFileSize: parseInt(process.env.PDF_MAX_SIZE) || 50 * 1024 * 1024, // 50MB
        qualityThreshold: parseFloat(process.env.PDF_QUALITY_THRESHOLD) || 0.7,
        enhancedExtraction: process.env.PDF_ENHANCED_EXTRACTION !== 'false',
        structureDetection: process.env.PDF_STRUCTURE_DETECTION !== 'false',
        pageSegmentation: process.env.PDF_PAGE_SEGMENTATION !== 'false'
    },

    // Configuración de búsqueda
    search: {
        defaultLimit: parseInt(process.env.SEARCH_DEFAULT_LIMIT) || 10,
        maxLimit: parseInt(process.env.SEARCH_MAX_LIMIT) || 50,
        defaultThreshold: parseFloat(process.env.SEARCH_DEFAULT_THRESHOLD) || 0.15,
        rerankResults: process.env.SEARCH_RERANK !== 'false',
        includeMetadata: process.env.SEARCH_INCLUDE_METADATA !== 'false'
    },

    // Configuración de logging
    logging: {
        enabled: process.env.RAG_LOGGING !== 'false',
        level: process.env.RAG_LOG_LEVEL || 'info',
        includeTimestamps: process.env.RAG_LOG_TIMESTAMPS !== 'false',
        logToFile: process.env.RAG_LOG_TO_FILE === 'true',
        logFile: process.env.RAG_LOG_FILE || './logs/rag.log'
    },

    // Configuración de rendimiento
    performance: {
        maxConcurrentProcessing: parseInt(process.env.RAG_MAX_CONCURRENT) || 2,
        enableCache: process.env.RAG_ENABLE_CACHE !== 'false',
        cacheTimeout: parseInt(process.env.RAG_CACHE_TIMEOUT) || 3600000, // 1 hora
        enableMetrics: process.env.RAG_ENABLE_METRICS !== 'false'
    },

    // Configuración de archivos temporales
    temp: {
        directory: process.env.RAG_TEMP_DIR || './temp_uploads',
        cleanupInterval: parseInt(process.env.RAG_TEMP_CLEANUP) || 3600000, // 1 hora
        maxAge: parseInt(process.env.RAG_TEMP_MAX_AGE) || 86400000, // 24 horas
        autoCleanup: process.env.RAG_TEMP_AUTO_CLEANUP !== 'false'
    }
};

/**
 * Obtiene la configuración completa del sistema RAG
 * 
 * @param {Object} customConfig - Configuración personalizada para sobrescribir
 * @returns {Object} Configuración combinada
 */
function getRAGConfig(customConfig = {}) {
    return mergeConfig(DEFAULT_CONFIG, customConfig);
}

/**
 * Combina configuraciones de manera profunda
 * 
 * @param {Object} defaultConfig - Configuración por defecto
 * @param {Object} customConfig - Configuración personalizada
 * @returns {Object} Configuración combinada
 */
function mergeConfig(defaultConfig, customConfig) {
    const merged = { ...defaultConfig };
    
    for (const [key, value] of Object.entries(customConfig)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            merged[key] = mergeConfig(merged[key] || {}, value);
        } else {
            merged[key] = value;
        }
    }
    
    return merged;
}

/**
 * Valida la configuración del sistema RAG
 * 
 * @param {Object} config - Configuración a validar
 * @returns {Object} Resultado de validación
 */
function validateConfig(config) {
    const errors = [];
    const warnings = [];

    // Validar configuración de storage
    if (!config.storage.host) {
        errors.push('Se requiere host de Chroma DB');
    }
    if (!config.storage.port || config.storage.port < 1 || config.storage.port > 65535) {
        errors.push('Puerto de Chroma DB inválido');
    }

    // Validar configuración de embeddings
    if (!config.embeddings.modelName) {
        errors.push('Se requiere nombre del modelo de embeddings');
    }
    if (config.embeddings.dimensions < 100 || config.embeddings.dimensions > 2000) {
        warnings.push('Dimensiones de embeddings fuera del rango recomendado (100-2000)');
    }

    // Validar configuración de chunking
    if (config.chunking.maxChunkSize < config.chunking.minChunkSize) {
        errors.push('Tamaño máximo de chunk debe ser mayor al mínimo');
    }
    if (config.chunking.overlapSize >= config.chunking.minChunkSize) {
        warnings.push('Overlap de chunks muy grande comparado con tamaño mínimo');
    }

    // Validar configuración de PDF
    if (config.pdf.maxFileSize < 1024 * 1024) { // 1MB mínimo
        warnings.push('Tamaño máximo de PDF muy pequeño (mínimo recomendado: 1MB)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Obtiene configuración específica para el entorno
 * 
 * @param {string} environment - Entorno (development, production, test)
 * @returns {Object} Configuración específica del entorno
 */
function getEnvironmentConfig(environment = process.env.NODE_ENV || 'development') {
    const envConfigs = {
        development: {
            logging: {
                level: 'debug',
                enabled: true
            },
            performance: {
                enableMetrics: true
            },
            storage: {
                retries: 1 // Menos reintentos en desarrollo
            }
        },
        
        production: {
            logging: {
                level: 'warn',
                logToFile: true
            },
            performance: {
                maxConcurrentProcessing: 4, // Más concurrencia en producción
                enableCache: true
            },
            storage: {
                retries: 5,
                timeout: 60000 // Más tiempo en producción
            }
        },
        
        test: {
            logging: {
                enabled: false
            },
            storage: {
                host: 'localhost',
                port: 8001 // Puerto diferente para tests
            },
            temp: {
                autoCleanup: true,
                maxAge: 300000 // 5 minutos para tests
            }
        }
    };

    return envConfigs[environment] || envConfigs.development;
}

/**
 * Crea configuración para contenedor Docker
 * 
 * @returns {Object} Configuración optimizada para Docker
 */
function getDockerConfig() {
    return {
        storage: {
            host: 'chromadb', // Nombre del servicio en docker-compose
            port: 8000,
            timeout: 60000,
            retries: 10, // Más reintentos para startup de contenedores
            retryDelay: 5000
        },
        temp: {
            directory: '/tmp/rag_uploads',
            autoCleanup: true
        },
        logging: {
            logToFile: false, // Usar stdout en contenedores
            level: 'info'
        }
    };
}

/**
 * Configuración de colecciones de Chroma DB por contexto educativo
 * 
 * @param {string} subjectId - ID de la asignatura
 * @returns {Object} Configuración de colección
 */
function getCollectionConfig(subjectId) {
    return {
        name: `aiquiz_subject_${subjectId}`,
        metadata: {
            "hnsw:space": "cosine",
            "hnsw:construction_ef": 200,
            "hnsw:M": 16
        },
        embedding_function: null // Se configura externamente
    };
}

module.exports = {
    DEFAULT_CONFIG,
    getRAGConfig,
    validateConfig,
    getEnvironmentConfig,
    getDockerConfig,
    getCollectionConfig,
    mergeConfig
};