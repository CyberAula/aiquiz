const logger = require('./logger.js');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

// Logger específico para transcripción
const transcriptionLogger = logger.create('VideoTranscription');

/**
 * Servicio de transcripción de videos usando AssemblyAI
 * Implementación limpia y directa para máxima confiabilidad
 */
class VideoTranscriptionService {
    constructor() {
        this.tempDir = path.join(process.cwd(), 'transcriptions', 'temp');
        this.ensureDirectories();
        this.initializeConfiguration();
    }

    /**
     * Crear directorios necesarios
     */
    async ensureDirectories() {
        try {
            await fs.promises.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            transcriptionLogger.error('Error creando directorios:', error.message);
        }
    }

    /**
     * Inicializar configuración del servicio
     */
    initializeConfiguration() {
        const config = {
            isDevelopment: process.env.NODE_ENV === 'development',
            assemblyAiKey: process.env.ASSEMBLYAI_API_KEY,
            language: process.env.ASSEMBLYAI_LANGUAGE || 'es'
        };

        transcriptionLogger.info('Configuración de transcripción inicializada', {
            isDevelopment: config.isDevelopment,
            hasAssemblyAiKey: !!config.assemblyAiKey,
            language: config.language
        });

        if (!config.assemblyAiKey || config.assemblyAiKey === 'your_real_assemblyai_api_key_here') {
            transcriptionLogger.warn('⚠️ API key de AssemblyAI no configurada. Obtén una gratis en: https://www.assemblyai.com/');
        }

        this.config = config;
    }

    /**
     * Detectar plataforma de video
     * @param {string} url - URL del video
     * @returns {string} Plataforma detectada
     */
    detectPlatform(url) {
        transcriptionLogger.debug('Detectando plataforma', { url });
        
        const urlLower = url.toLowerCase();
        if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
            return 'youtube';
        } else if (urlLower.includes('vimeo.com')) {
            return 'vimeo';
        } else {
            return 'other';
        }
    }

    /**
     * Extraer metadata del video
     * @param {string} url - URL del video
     * @param {string} platform - Plataforma del video
     * @returns {Promise<Object>} Metadata del video
     */
    async extractMetadata(url, platform) {
        transcriptionLogger.debug('Extrayendo metadata del video');
        
        try {
            if (platform === 'youtube') {
                const info = await ytdl.getInfo(url);
                return {
                    title: info.videoDetails.title,
                    duration: this.formatDuration(info.videoDetails.lengthSeconds),
                    author: info.videoDetails.author?.name || 'Desconocido',
                    description: info.videoDetails.description || ''
                };
            } else {
                // Para otras plataformas, metadata básica
                return {
                    title: 'Video sin título',
                    duration: 'Desconocida',
                    author: 'Desconocido',
                    description: ''
                };
            }
        } catch (error) {
            transcriptionLogger.warn('Error extrayendo metadata:', error.message);
            return {
                title: 'Video sin título',
                duration: 'Desconocida',
                author: 'Desconocido',
                description: ''
            };
        }
    }

    /**
     * Formatear duración en segundos a MM:SS
     * @param {number} seconds - Duración en segundos
     * @returns {string} Duración formateada
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Transcribir video usando AssemblyAI
     * @param {string} url - URL del video
     * @param {string} platform - Plataforma del video
     * @param {Object} metadata - Metadata del video
     * @returns {Promise<string>} Transcripción del video
     */
    async getTranscription(url, platform, metadata) {
        transcriptionLogger.info('Starting transcription with AssemblyAI');
        
        if (!this.config.assemblyAiKey || this.config.assemblyAiKey === 'your_real_assemblyai_api_key_here') {
            throw new Error('API key de AssemblyAI no configurada. Obtén una gratis en: https://www.assemblyai.com/');
        }

        try {
            // Transcribir directamente la URL del video
            const transcription = await this.transcribeWithAssemblyAI(url, metadata);
            
            transcriptionLogger.info(`Transcription completed: ${transcription.length} characters`);
            return transcription;

        } catch (error) {
            transcriptionLogger.error('Error en transcripción:', error.message);
            throw error;
        }
    }

    /**
     * Transcribir usando AssemblyAI
     * @param {string} url - URL del video
     * @param {Object} metadata - Metadata del video
     * @returns {Promise<string>} Transcripción
     */
    async transcribeWithAssemblyAI(url, metadata) {
        let audioFilePath = null;
        let uploadUrl = null;
        
        try {
            transcriptionLogger.debug('Downloading video audio');

            // 1. Descargar audio localmente
            audioFilePath = await this.downloadAudio(url, metadata);
            transcriptionLogger.debug(`Audio descargado: ${audioFilePath}`);

            // 2. Subir audio a AssemblyAI
            transcriptionLogger.debug('Uploading audio to AssemblyAI');
            uploadUrl = await this.uploadAudioToAssemblyAI(audioFilePath);
            transcriptionLogger.debug(`Audio subido a: ${uploadUrl.substring(0, 50)}...`);

            // 3. Iniciar transcripción
            transcriptionLogger.debug('Starting transcription process');
            const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
                method: 'POST',
                headers: {
                    'authorization': this.config.assemblyAiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    audio_url: uploadUrl,
                    language_code: this.config.language,
                    punctuate: true,
                    format_text: true,
                    speaker_labels: false,
                    // Optimizaciones para videos educativos
                    auto_highlights: false,
                    content_safety: false,
                    iab_categories: false
                })
            });

            if (!transcriptResponse.ok) {
                const error = await transcriptResponse.json();
                throw new Error(`Error iniciando transcripción: ${error.error || transcriptResponse.statusText}`);
            }

            const transcript = await transcriptResponse.json();
            const transcriptId = transcript.id;

            transcriptionLogger.debug(`Transcripción iniciada con ID: ${transcriptId}`);

            // 4. Esperar a que se complete la transcripción
            const result = await this.waitForTranscription(transcriptId);

            // 5. Limpiar arquivo temporal
            await this.cleanupAudioFile(audioFilePath);

            return result;

        } catch (error) {
            // Limpiar archivo temporal en caso de error
            if (audioFilePath) {
                await this.cleanupAudioFile(audioFilePath);
            }
            transcriptionLogger.error('Error en AssemblyAI:', error.message);
            throw error;
        }
    }

    /**
     * Descargar audio del video localmente
     * @param {string} url - URL del video
     * @param {Object} metadata - Metadata del video
     * @returns {Promise<string>} Ruta del archivo de audio descargado
     */
    async downloadAudio(url, metadata) {
        return new Promise((resolve, reject) => {
            try {
                const videoId = this.extractYouTubeVideoId(url);
                const audioFileName = `${videoId}_${Date.now()}.webm`;
                const audioFilePath = path.join(this.tempDir, audioFileName);

                transcriptionLogger.debug(`Descargando audio a: ${audioFilePath}`);

                // Configurar stream de descarga
                const audioStream = ytdl(url, {
                    quality: 'highestaudio',
                    filter: 'audioonly',
                    format: 'webm'
                });

                const writeStream = fs.createWriteStream(audioFilePath);

                audioStream.pipe(writeStream);

                audioStream.on('error', (error) => {
                    transcriptionLogger.error('Error en stream de audio:', error.message);
                    reject(new Error(`Error descargando audio: ${error.message}`));
                });

                writeStream.on('error', (error) => {
                    transcriptionLogger.error('Error escribiendo archivo:', error.message);
                    reject(new Error(`Error escribiendo archivo de audio: ${error.message}`));
                });

                writeStream.on('finish', () => {
                    transcriptionLogger.debug(`Audio descargado exitosamente: ${audioFilePath}`);
                    resolve(audioFilePath);
                });

            } catch (error) {
                transcriptionLogger.error('Error configurando descarga:', error.message);
                reject(error);
            }
        });
    }

    /**
     * Subir archivo de audio a AssemblyAI
     * @param {string} audioFilePath - Ruta del archivo de audio
     * @returns {Promise<string>} URL del archivo subido
     */
    async uploadAudioToAssemblyAI(audioFilePath) {
        try {
            transcriptionLogger.debug('Subiendo archivo a AssemblyAI...');

            const audioData = await fs.promises.readFile(audioFilePath);
            
            const response = await fetch('https://api.assemblyai.com/v2/upload', {
                method: 'POST',
                headers: {
                    'authorization': this.config.assemblyAiKey,
                    'content-type': 'application/octet-stream'
                },
                body: audioData
            });

            if (!response.ok) {
                throw new Error(`Error subiendo archivo: ${response.statusText}`);
            }

            const result = await response.json();
            transcriptionLogger.debug('Archivo subido exitosamente a AssemblyAI');
            
            return result.upload_url;

        } catch (error) {
            transcriptionLogger.error('Error subiendo archivo a AssemblyAI:', error.message);
            throw error;
        }
    }

    /**
     * Extraer ID de video de YouTube de la URL
     * @param {string} url - URL de YouTube
     * @returns {string} ID del video
     */
    extractYouTubeVideoId(url) {
        const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
        const match = url.match(regex);
        return match ? match[1] : Date.now().toString();
    }

    /**
     * Limpiar archivo temporal de audio
     * @param {string} audioFilePath - Ruta del archivo a eliminar
     */
    async cleanupAudioFile(audioFilePath) {
        try {
            if (audioFilePath && await this.fileExists(audioFilePath)) {
                await fs.promises.unlink(audioFilePath);
                transcriptionLogger.debug(`Archivo temporal eliminado: ${audioFilePath}`);
            }
        } catch (error) {
            transcriptionLogger.debug('Error eliminando archivo temporal:', error.message);
        }
    }

    /**
     * Verificar si un archivo existe
     * @param {string} filePath - Ruta del archivo
     * @returns {Promise<boolean>} True si existe
     */
    async fileExists(filePath) {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Esperar a que se complete la transcripción
     * @param {string} transcriptId - ID de la transcripción
     * @returns {Promise<string>} Texto transcrito
     */
    async waitForTranscription(transcriptId) {
        const maxAttempts = 60; // 10 minutos máximo (10 segundos x 60)
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                    headers: {
                        'authorization': this.config.assemblyAiKey
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error obteniendo transcripción: ${response.statusText}`);
                }

                const result = await response.json();

                if (result.status === 'completed') {
                    if (!result.text || result.text.trim().length === 0) {
                        throw new Error('La transcripción está vacía. El video puede no tener audio o estar en un formato no soportado.');
                    }
                    
                    transcriptionLogger.info(`Transcription completed in ${attempts * 10} seconds`);
                    return result.text;
                    
                } else if (result.status === 'error') {
                    throw new Error(`Error en AssemblyAI: ${result.error}`);
                    
                } else if (result.status === 'processing' || result.status === 'queued') {
                    transcriptionLogger.debug(`Estado: ${result.status}, esperando... (${attempts + 1}/${maxAttempts})`);
                    await this.sleep(10000); // Esperar 10 segundos
                    attempts++;
                    
                } else {
                    throw new Error(`Estado desconocido: ${result.status}`);
                }

            } catch (error) {
                if (attempts >= maxAttempts - 1) {
                    throw error;
                }
                transcriptionLogger.warn(`Error temporal, reintentando... (${attempts + 1}/${maxAttempts})`);
                await this.sleep(10000);
                attempts++;
            }
        }

        throw new Error('Timeout: La transcripción tardó más de 10 minutos');
    }

    /**
     * Dormir por un tiempo determinado
     * @param {number} ms - Milisegundos a dormir
     * @returns {Promise} Promesa que se resuelve después del tiempo
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Limpiar archivos temporales antiguos
     */
    async cleanupOldFiles() {
        try {
            const files = await fs.promises.readdir(this.tempDir);
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas

            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                const stats = await fs.promises.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.promises.unlink(filePath);
                    transcriptionLogger.debug(`Archivo temporal eliminado: ${file}`);
                }
            }
        } catch (error) {
            transcriptionLogger.debug('Error limpiando archivos temporales:', error.message);
        }
    }

    /**
     * Guardar transcripción en MongoDB
     * @param {string} fileId - ID del archivo de video
     * @param {string} transcription - Contenido de la transcripción
     * @param {Object} metadata - Metadata del video
     * @returns {Promise<boolean>} Éxito de la operación
     */
    async saveTranscription(fileId, transcription, metadata) {
        try {
            // Importar modelo dinámicamente para evitar problemas de dependencias circulares
            const File = require('../manager/models/File.js');
            
            const transcriptionData = {
                content: transcription,
                metadata: {
                    title: metadata.title || 'Sin título',
                    author: metadata.author || 'Desconocido', 
                    duration: metadata.duration || 'Desconocida',
                    url: metadata.url || 'No disponible',
                    transcribedAt: new Date(),
                    service: 'assemblyai',
                    language: this.config.language || 'es',
                    characterCount: transcription.length
                }
            };

            // Actualizar el documento con la transcripción
            await File.findByIdAndUpdate(fileId, {
                transcription: transcriptionData
            });
            
            transcriptionLogger.info(`Transcription saved to MongoDB for file: ${fileId}`);
            transcriptionLogger.debug(`Caracteres guardados: ${transcription.length}`);
            
            return true;
            
        } catch (error) {
            transcriptionLogger.error('Error guardando transcripción en MongoDB:', error.message);
            throw new Error(`Error guardando transcripción: ${error.message}`);
        }
    }
}

// Instancia singleton
const videoTranscriptionService = new VideoTranscriptionService();

// Limpiar archivos al inicializar
videoTranscriptionService.cleanupOldFiles();

module.exports = videoTranscriptionService;
module.exports.VideoTranscriptionService = VideoTranscriptionService;