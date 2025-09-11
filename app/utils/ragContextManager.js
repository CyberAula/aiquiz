import dbConnect from "@utils/dbconnect.js";
import Subtopic from "@app/manager/models/Subtopic.js";
import File from "@app/manager/models/File.js";
import logger from "@utils/logger.js";
import videoProcessor from "@utils/videoProcessor.js";
import fs from 'fs';
import path from 'path';

// Logger específico para RAG
const ragLogger = logger.create('RAG');

/**
 * Busca contexto relevante para un subtema específico
 * @param {string} subtopicId - ID del subtema
 * @param {string} topic - Nombre del tema para la consulta
 * @param {number} maxFragments - Número máximo de fragmentos a retornar
 * @returns {Promise<string>} Contexto combinado de los documentos
 */
export async function getRAGContextForSubtopic(subtopicId, topic, maxFragments = 3) {
    try {
        ragLogger.debug(`Buscando contexto para subtema: ${subtopicId}`, { topic, maxFragments });
        
        if (!subtopicId) {
            ragLogger.warn("No se proporcionó subtopicId, usando generación sin contexto");
            return "";
        }

        await dbConnect();

        // 1. Buscar el subtema y sus archivos asociados
        const subtopic = await Subtopic.findById(subtopicId)
            .populate('files')
            .lean();

        if (!subtopic) {
            ragLogger.error(`Subtema no encontrado: ${subtopicId}`);
            return "";
        }

        if (!subtopic.files || subtopic.files.length === 0) {
            ragLogger.info(`No hay archivos asociados al subtema: ${subtopic.name}`);
            return "";
        }

        ragLogger.info(`Encontrados ${subtopic.files.length} archivos para el subtema: ${subtopic.name}`);

        // 2. Leer archivos de texto disponibles (implementación simple)
        const contextParts = [];
        const uploadsDir = path.join(process.cwd(), 'uploads');

        for (const file of subtopic.files) {
            try {
                // Procesar videos de manera especial
                if (file.fileType === 'video' && file.isExternal) {
                    ragLogger.debug(`Procesando video: ${file.originalName}`);
                    
                    // Obtener transcripción del video
                    const transcription = await videoProcessor.getVideoTranscription(file._id.toString());
                    
                    if (transcription && transcription.trim()) {
                        // Usar toda la transcripción pero limitada para contexto
                        const preview = transcription.substring(0, 800).trim();
                        
                        contextParts.push({
                            filename: `🎥 ${file.originalName}`,
                            content: `Video: ${file.originalName}\nURL: ${file.externalUrl}\nPlataforma: ${file.platform}\n\nTranscripción:\n${preview}${transcription.length > 800 ? '...' : ''}`,
                            relevance: 1.2, // Videos tienen mayor relevancia
                            type: 'video'
                        });
                        
                        ragLogger.debug(`Transcripción de video añadida: ${transcription.length} caracteres`);
                    } else {
                        // Si no hay transcripción, usar información básica
                        contextParts.push({
                            filename: `🎥 ${file.originalName}`,
                            content: `Video: ${file.originalName} (${file.platform}) - Contenido de video relacionado con ${subtopic.name}\nURL: ${file.externalUrl}`,
                            relevance: 0.7,
                            type: 'video'
                        });
                        
                        ragLogger.debug(`Video sin transcripción: ${file.originalName}`);
                    }
                    continue;
                }

                // Procesar archivos normales
                const fileName = file.fileName || file.filename;
                if (!fileName) {
                    ragLogger.warn(`Archivo sin nombre válido`, { fileId: file._id });
                    continue;
                }
                
                const filePath = path.join(uploadsDir, fileName);
                
                // Verificar si el archivo existe
                if (fs.existsSync(filePath)) {
                    // Por ahora, solo procesamos archivos de texto simples
                    if (file.mimeType && file.mimeType.startsWith('text/')) {
                        const content = fs.readFileSync(filePath, 'utf8');
                        const preview = content.substring(0, 500).trim();
                        
                        if (preview) {
                            contextParts.push({
                                filename: file.originalName,
                                content: preview,
                                relevance: 1.0,
                                type: 'document'
                            });
                        }
                    } else {
                        // Para PDFs y otros formatos, agregamos información básica
                        contextParts.push({
                            filename: file.originalName,
                            content: `Documento: ${file.originalName} (${file.mimeType || file.mimetype}) - Contenido relacionado con ${subtopic.name}`,
                            relevance: 0.8,
                            type: 'document'
                        });
                    }
                }
            } catch (fileError) {
                ragLogger.warn(`Error leyendo archivo ${file.fileName || file.filename}`, { error: fileError.message });
            }
        }

        // 3. Si no hay contenido específico, usar información del subtema
        if (contextParts.length === 0) {
            const subtopicInfo = {
                filename: "Información del subtema",
                content: `Subtema: ${subtopic.name}. Descripción: ${subtopic.description || 'Sin descripción disponible'}. Tema relacionado: ${topic}`,
                relevance: 0.5
            };
            contextParts.push(subtopicInfo);
        }

        // 4. Construir contexto final priorizando por relevancia
        const sortedParts = contextParts
            .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
            .slice(0, maxFragments);

        const contextFragments = sortedParts
            .map((part, index) => {
                const typeEmoji = part.type === 'video' ? '🎥' : part.type === 'document' ? '📄' : '📋';
                return `[${typeEmoji} Fuente ${index + 1}: ${part.filename}]\n${part.content}`;
            })
            .join('\n\n');

        if (contextFragments.trim()) {
            ragLogger.success(`Contexto generado: ${contextFragments.length} caracteres de ${contextParts.length} archivos`);
            ragLogger.trace("Contenido del contexto", { contextFragments });
            return contextFragments;
        } else {
            ragLogger.warn("No se pudo generar contexto útil");
            return "";
        }

    } catch (error) {
        ragLogger.error("Error al obtener contexto", error);
        // No fallar la generación de preguntas por error en contexto
        return "";
    }
}

/**
 * Genera un prompt enriquecido con contexto RAG
 * @param {string} basePrompt - Prompt base del sistema
 * @param {string} ragContext - Contexto obtenido del RAG
 * @returns {string} Prompt combinado
 */
export function enhancePromptWithRAG(basePrompt, ragContext) {
    if (!ragContext || ragContext.trim() === "") {
        return basePrompt;
    }

    const ragEnhancement = `
CONTEXTO ESPECÍFICO DEL MATERIAL EDUCATIVO:
${ragContext}

INSTRUCCIONES:
- Utiliza prioritariamente la información del contexto específico proporcionado arriba
- Las preguntas deben estar basadas en el contenido real del material educativo
- Mantén la coherencia con los conceptos y ejemplos del contexto
- Si el contexto no contiene suficiente información para alguna pregunta, puedes complementar con conocimiento general

PROMPT ORIGINAL:
${basePrompt}`;

    return ragEnhancement;
}