/**
 * SEMANTIC TEXT CHUNKER - BASADO EN SISTEMA RAG DE REFERENCIA
 * 
 * División inteligente de texto manteniendo coherencia semántica:
 * 1. Por párrafos (mantiene estructura del documento)
 * 2. Por oraciones (mantiene ideas completas)
 * 3. Por palabras (solo si es necesario)
 * 4. Con solapamiento entre chunks para mejor contexto
 */

class SemanticTextChunker {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 512;
        this.overlap = options.overlap || 50;
        this.preserveStructure = options.preserveStructure !== false;
        this.enableLogging = options.enableLogging !== false;
        
        if (this.enableLogging) {
            console.log('[Semantic Chunker] Inicializado con:', {
                chunkSize: this.chunkSize,
                overlap: this.overlap,
                preserveStructure: this.preserveStructure
            });
        }
    }

    /**
     * Divide un texto en chunks semánticamente coherentes
     * @param {string} text - Texto a dividir
     * @param {Object} metadata - Metadatos del documento
     * @returns {Array} Lista de chunks con metadatos
     */
    async chunkDocument(text, metadata = {}) {
        try {
            if (this.enableLogging) {
                console.log('[Semantic Chunker] Procesando texto de', text.length, 'caracteres');
            }

            // Limpiar y normalizar el texto
            const cleanedText = this.cleanText(text);
            
            // Dividir en chunks semánticamente coherentes
            const rawChunks = this.splitTextIntoChunks(cleanedText);
            
            // Enriquecer con metadatos
            const enrichedChunks = rawChunks.map((chunk, index) => ({
                id: `${metadata.documentId || 'doc'}_chunk_${index}`,
                text: chunk,
                index: index,
                metadata: {
                    ...metadata,
                    chunkIndex: index,
                    charCount: chunk.length,
                    wordCount: chunk.split(/\s+/).length,
                    sentenceCount: this.countSentences(chunk),
                    isHeading: this.isHeading(chunk),
                    isList: this.isList(chunk),
                    sectionTitle: this.extractSectionTitle(chunk)
                }
            }));

            if (this.enableLogging) {
                console.log(`[Semantic Chunker] Generados ${enrichedChunks.length} chunks`);
            }

            return enrichedChunks;
        } catch (error) {
            console.error('[Semantic Chunker] Error procesando documento:', error);
            throw error;
        }
    }

    /**
     * Limpia y normaliza el texto
     * @param {string} text - Texto a limpiar
     * @returns {string} Texto limpio
     */
    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')           // Normalizar saltos de línea
            .replace(/\s+/g, ' ')             // Normalizar espacios
            .replace(/\n\s*\n/g, '\n\n')      // Normalizar párrafos
            .trim();
    }

    /**
     * Divide texto en chunks manteniendo coherencia semántica
     * @param {string} text - Texto a dividir
     * @returns {Array} Lista de chunks
     */
    splitTextIntoChunks(text) {
        if (text.length <= this.chunkSize) {
            return [text];
        }

        const chunks = [];
        const paragraphs = text.split(/\n\s*\n/);
        let currentChunk = '';

        for (const paragraph of paragraphs) {
            if (paragraph.length > this.chunkSize) {
                // Párrafo muy largo - dividir por oraciones
                const sentences = this.splitIntoSentences(paragraph);
                
                for (const sentence of sentences) {
                    if (sentence.length > this.chunkSize) {
                        // Oración muy larga - dividir por palabras
                        const sentenceChunks = this.splitLongSentence(sentence);
                        
                        for (const sentenceChunk of sentenceChunks) {
                            if (currentChunk.length + sentenceChunk.length + 1 > this.chunkSize) {
                                if (currentChunk.trim()) {
                                    chunks.push(currentChunk.trim());
                                }
                                currentChunk = sentenceChunk;
                            } else {
                                currentChunk += (currentChunk ? ' ' : '') + sentenceChunk;
                            }
                        }
                    } else {
                        // Oración de tamaño normal
                        if (currentChunk.length + sentence.length + 1 > this.chunkSize) {
                            if (currentChunk.trim()) {
                                chunks.push(currentChunk.trim());
                            }
                            currentChunk = sentence;
                        } else {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        }
                    }
                }
            } else {
                // Párrafo de tamaño normal
                if (currentChunk.length + paragraph.length + 2 > this.chunkSize) {
                    if (currentChunk.trim()) {
                        chunks.push(currentChunk.trim());
                    }
                    currentChunk = paragraph;
                } else {
                    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
                }
            }
        }

        // Añadir último chunk si no está vacío
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        // Crear solapamiento entre chunks
        if (this.overlap > 0 && chunks.length > 1) {
            return this.createOverlappingChunks(chunks);
        }

        return chunks;
    }

    /**
     * Divide texto en oraciones
     * @param {string} text - Texto a dividir
     * @returns {Array} Lista de oraciones
     */
    splitIntoSentences(text) {
        // Regex mejorado para detectar finales de oración
        return text.split(/(?<=[.!?])\s+/)
                  .filter(sentence => sentence.trim().length > 0);
    }

    /**
     * Divide oración larga en fragmentos más pequeños
     * @param {string} sentence - Oración a dividir
     * @returns {Array} Lista de fragmentos
     */
    splitLongSentence(sentence) {
        const words = sentence.split(/\s+/);
        const chunks = [];
        let currentChunk = '';

        for (const word of words) {
            if (currentChunk.length + word.length + 1 > this.chunkSize) {
                if (currentChunk.trim()) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = word;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + word;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Crea chunks con solapamiento para mejor contexto
     * @param {Array} chunks - Lista de chunks sin solapamiento
     * @returns {Array} Lista de chunks con solapamiento
     */
    createOverlappingChunks(chunks) {
        if (chunks.length <= 1) return chunks;

        const result = [chunks[0]];

        for (let i = 1; i < chunks.length; i++) {
            const prevChunk = chunks[i - 1];
            const currentChunk = chunks[i];

            // Obtener las últimas palabras del chunk anterior
            const overlapWords = this.getLastWords(prevChunk, this.overlap);
            
            // Crear nuevo chunk con solapamiento
            const overlappedChunk = overlapWords + ' ' + currentChunk;
            result.push(overlappedChunk);
        }

        return result;
    }

    /**
     * Obtiene las últimas palabras de un texto
     * @param {string} text - Texto
     * @param {number} charCount - Número aproximado de caracteres
     * @returns {string} Últimas palabras
     */
    getLastWords(text, charCount) {
        const words = text.split(/\s+/);
        let result = '';

        for (let i = words.length - 1; i >= 0; i--) {
            if (result.length + words[i].length + 1 > charCount) {
                break;
            }
            result = words[i] + (result ? ' ' + result : '');
        }

        return result;
    }

    /**
     * Cuenta oraciones en un texto
     * @param {string} text - Texto
     * @returns {number} Número de oraciones
     */
    countSentences(text) {
        return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    }

    /**
     * Detecta si un chunk es un encabezado
     * @param {string} text - Texto del chunk
     * @returns {boolean} True si es encabezado
     */
    isHeading(text) {
        // Heurísticas para detectar encabezados
        return text.length < 100 && 
               /^[A-Z\s\d\-\.]+$/.test(text.trim()) &&
               !text.includes('.');
    }

    /**
     * Detecta si un chunk es una lista
     * @param {string} text - Texto del chunk
     * @returns {boolean} True si es lista
     */
    isList(text) {
        return /^[\s]*[-•·*]\s/.test(text) ||
               /^[\s]*\d+\.\s/.test(text) ||
               /^[\s]*[a-zA-Z]\)\s/.test(text);
    }

    /**
     * Extrae título de sección si existe
     * @param {string} text - Texto del chunk
     * @returns {string|null} Título de sección o null
     */
    extractSectionTitle(text) {
        const lines = text.split('\n');
        const firstLine = lines[0].trim();
        
        if (this.isHeading(firstLine)) {
            return firstLine;
        }
        
        return null;
    }

    /**
     * Obtiene estadísticas de chunking
     * @param {Array} chunks - Lista de chunks
     * @returns {Object} Estadísticas
     */
    getChunkingStats(chunks) {
        return {
            totalChunks: chunks.length,
            avgChunkSize: chunks.reduce((sum, chunk) => sum + chunk.text.length, 0) / chunks.length,
            minChunkSize: Math.min(...chunks.map(c => c.text.length)),
            maxChunkSize: Math.max(...chunks.map(c => c.text.length)),
            totalWords: chunks.reduce((sum, chunk) => sum + chunk.metadata.wordCount, 0),
            headingChunks: chunks.filter(c => c.metadata.isHeading).length,
            listChunks: chunks.filter(c => c.metadata.isList).length,
            overlapUsed: this.overlap > 0
        };
    }
}

module.exports = SemanticTextChunker;