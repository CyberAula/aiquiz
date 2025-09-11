import logger from "@utils/logger.js";
import videoTranscriptionService from "@utils/videoTranscriptionService.js";
import dbConnect from "@utils/dbconnect.js";
import File from "@models/File.js";
import path from 'path';
import fs from 'fs';

// Logger específico para procesamiento de videos
const videoLogger = logger.create('VideoProcessor');

/**
 * Procesador de videos para integración RAG
 * Maneja la transcripción y almacenamiento de videos para búsqueda contextual
 */
class VideoProcessor {
    constructor() {
        this.ragManager = null;
        this.initializeRAG();
    }

    /**
     * Inicializa el RAG Manager
     */
    async initializeRAG() {
        try {
            // Intentar primero con RAG Manager V2 (Qdrant)
            const qdrantResponse = await fetch('http://localhost:6333/').catch(() => null);
            if (qdrantResponse && qdrantResponse.ok) {
                videoLogger.debug('Qdrant disponible, inicializando RAG Manager V2...');
                try {
                    const RAGManagerV2 = require("@rag/core/ragManagerV2");
                    this.ragManager = new RAGManagerV2({ enableLogging: true });
                    await this.ragManager.initialize();
                    videoLogger.info('RAG Manager V2 (Qdrant) inicializado correctamente');
                    return;
                } catch (ragError) {
                    videoLogger.error('Error inicializando RAG Manager V2:', ragError);
                    throw ragError;
                }
            } else {
                videoLogger.warn('Qdrant no disponible, usando Mock RAG Manager');
                const MockRAGManager = require("@rag/core/mockRAGManager");
                this.ragManager = new MockRAGManager();
                await this.ragManager.initialize();
            }
            
        } catch (error) {
            videoLogger.error('Error inicializando RAG Manager', error);
            // Usar Mock como fallback final
            videoLogger.warn('Fallback a Mock RAG Manager');
            const MockRAGManager = require("@rag/core/mockRAGManager");
            this.ragManager = new MockRAGManager();
            await this.ragManager.initialize();
        }
    }

    /**
     * Procesa un video completo: metadata, transcripción y RAG
     * @param {string} url - URL del video
     * @param {string} subtopicId - ID del subtema
     * @param {string} userId - ID del usuario
     * @param {Object} customData - Datos personalizados opcionales
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async processVideo(url, subtopicId, userId, customData = {}) {
        videoLogger.info('Starting complete video processing', { url: url.substring(0, 50) + '...', subtopicId });
        
        
        try {
            await dbConnect();

            // 1. Detectar plataforma y extraer metadata
            const platform = videoTranscriptionService.detectPlatform(url);
            videoLogger.debug(`Plataforma detectada: ${platform}`);

            const metadata = await videoTranscriptionService.extractMetadata(url, platform);
            videoLogger.info('Metadata extraída', { 
                title: metadata.title, 
                duration: metadata.duration 
            });

            // 2. Obtener transcripción
            const transcription = await videoTranscriptionService.getTranscription(url, platform, metadata);
            videoLogger.info(`Transcription obtained: ${transcription.length} characters`);

            // 3. Crear registro en base de datos
            const fileRecord = await this.createVideoFileRecord(
                url, 
                platform, 
                metadata, 
                subtopicId, 
                userId, 
                customData
            );

            // 4. Procesar transcripción con RAG
            const ragResult = await this.processTranscriptionWithRAG(
                transcription, 
                metadata, 
                fileRecord._id.toString(),
                url
            );

            // 5. Actualizar registro con información RAG
            await this.updateFileWithRAGInfo(fileRecord._id, ragResult, transcription.length);

            // 6. Guardar transcripción en MongoDB
            await videoTranscriptionService.saveTranscription(
                fileRecord._id.toString(),
                transcription,
                { ...metadata, url }
            );

            // 7. Limpiar archivos temporales (se hace automáticamente en el servicio)

            const result = {
                success: true,
                fileRecord,
                metadata,
                transcription: {
                    content: transcription,
                    length: transcription.length,
                    savedInDB: true
                },
                rag: ragResult
            };

            videoLogger.info('Video processing completed successfully', {
                fileId: fileRecord._id,
                transcriptionLength: transcription.length,
                ragChunks: ragResult.chunks || 0
            });

            return result;

        } catch (error) {
            videoLogger.error('Error procesando video', error);
            
            // Limpiar archivos temporales en caso de error (se hace automáticamente en el servicio)
            
            throw new Error(`Error procesando video: ${error.message}`);
        }
    }

    /**
     * Crea el registro del video en la base de datos
     */
    async createVideoFileRecord(url, platform, metadata, subtopicId, userId, customData) {
        videoLogger.debug('Creando registro de video en base de datos');
        
        const fileName = `video_${Date.now()}_${platform}.txt`;
        const videoFile = new File({
            fileName: fileName,
            originalName: customData.title || metadata.title || 'Video sin título',
            mimeType: 'video/external',
            size: 0, // Para videos externos no tenemos tamaño real
            path: '', // Cadena vacía para archivos externos
            fileType: 'video',
            subtopic: subtopicId,
            uploadedBy: userId,
            isExternal: true,
            externalUrl: url,
            platform: platform,
            description: customData.description || metadata.description || '',
            ragProcessed: false
        });

        const savedFile = await videoFile.save();
        videoLogger.info('Video record created', { fileId: savedFile._id });
        
        return savedFile;
    }

    /**
     * Procesa la transcripción con el sistema RAG
     */
    async processTranscriptionWithRAG(transcription, metadata, fileId, url) {
        videoLogger.debug('Processing transcription with RAG');
        
        try {
            if (!this.ragManager) {
                await this.initializeRAG();
            }

            // Crear un documento virtual para la transcripción
            const documentData = {
                id: fileId,
                url: url,
                title: metadata.title,
                content: transcription,
                metadata: {
                    type: 'video_transcription',
                    platform: videoTranscriptionService.detectPlatform(url),
                    duration: metadata.duration,
                    author: metadata.author,
                    processed_at: new Date().toISOString()
                }
            };

            // Procesar con RAG Manager
            const result = await this.ragManager.processDocument(documentData, fileId, 'video_user');
            
            videoLogger.info('Transcription processed with RAG', {
                chunks: result.chunks || 0,
                processingTime: result.processingTime || 0
            });

            return result;

        } catch (error) {
            videoLogger.error('Error procesando transcripción con RAG', error);
            
            // Devolver resultado de fallback
            return {
                success: false,
                error: error.message,
                chunks: 0,
                processingTime: 0,
                fallback: true
            };
        }
    }

    /**
     * Actualiza el registro del archivo con información RAG
     */
    async updateFileWithRAGInfo(fileId, ragResult, transcriptionLength) {
        try {
            const updateData = {
                ragProcessed: ragResult.success || false,
                ragStats: {
                    chunks: ragResult.chunks || 0,
                    pages: 1, // Las transcripciones se consideran como 1 página
                    processingTime: ragResult.processingTime || 0,
                    textLength: transcriptionLength,
                    quality: ragResult.success ? 'good' : 'failed'
                }
            };

            if (ragResult.documentId) {
                updateData.ragDocumentId = ragResult.documentId;
            }

            await File.findByIdAndUpdate(fileId, updateData);
            videoLogger.debug('Registro actualizado con información RAG', { fileId });

        } catch (error) {
            videoLogger.warn('Error actualizando registro con información RAG', error);
        }
    }

    /**
     * Obtiene la transcripción de un video ya procesado
     * @param {string} fileId - ID del archivo de video
     * @returns {Promise<string|null>} Transcripción o null si no existe
     */
    async getVideoTranscription(fileId) {
        try {
            const file = await File.findById(fileId).select('transcription');
            
            if (file && file.transcription && file.transcription.content) {
                return file.transcription.content;
            }

            return null;
        } catch (error) {
            videoLogger.error('Error obteniendo transcripción desde MongoDB', error);
            return null;
        }
    }

    /**
     * Elimina un video y su transcripción del sistema
     * @param {string} fileId - ID del archivo de video
     * @returns {Promise<boolean>} Éxito de la eliminación
     */
    async deleteVideo(fileId) {
        videoLogger.info('Deleting video from system', { fileId });
        
        try {
            // 1. Eliminar de RAG si existe
            if (this.ragManager) {
                try {
                    await this.ragManager.deleteDocument(fileId);
                    videoLogger.debug('Video eliminado del RAG');
                } catch (ragError) {
                    videoLogger.warn('Error eliminando del RAG', ragError);
                }
            }

            // 2. Eliminar registro de base de datos (incluye transcripción automáticamente)
            await File.findByIdAndDelete(fileId);
            videoLogger.info('Video deleted successfully', { fileId });

            return true;

        } catch (error) {
            videoLogger.error('Error eliminando video', error);
            return false;
        }
    }

    /**
     * Busca videos por contenido usando RAG
     * @param {string} query - Consulta de búsqueda
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} Resultados de búsqueda
     */
    async searchVideos(query, limit = 5) {
        videoLogger.debug('Buscando videos por contenido', { query, limit });
        
        try {
            if (!this.ragManager) {
                await this.initializeRAG();
            }

            const results = await this.ragManager.search(query, limit);
            
            // Filtrar solo resultados de videos
            const videoResults = results.filter(result =>
                result.metadata?.type === 'video_transcription'
            );

            videoLogger.info(`Found ${videoResults.length} relevant videos`);
            return videoResults;

        } catch (error) {
            videoLogger.error('Error buscando videos', error);
            return [];
        }
    }
}

// Instancia singleton
const videoProcessor = new VideoProcessor();

export default videoProcessor;
export { VideoProcessor };