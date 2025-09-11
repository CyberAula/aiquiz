/**
 * SERVICIO DE CHUNKING SEMÁNTICO - SISTEMA RAG MANAGER
 * 
 * Versión integrada en el manager para división semántica de texto PDF.
 * Optimizado para documentos educativos y estructura de PDFs académicos.
 */

const nlp = require('compromise');
const { split } = require('sentence-splitter');

class TextChunker {
    constructor(options = {}) {
        // Configuración optimizada para PDFs educativos
        this.config = {
            maxChunkSize: options.maxChunkSize || 500,        // Optimizado para PDFs
            minChunkSize: options.minChunkSize || 150,        
            overlapSize: options.overlapSize || 75,           
            maxSentencesPerChunk: options.maxSentencesPerChunk || 5,  
            preserveParagraphs: options.preserveParagraphs !== false,
            includeContext: options.includeContext !== false,
            pdfOptimized: true // Optimizaciones específicas para PDF
        };

        console.log('[RAG-Manager] TextChunker inicializado para PDFs');
    }

    /**
     * Divide un documento PDF en chunks semánticamente coherentes
     */
    async chunkDocument(document, contextInfo = {}) {
        try {
            console.log(`[RAG-Manager] Iniciando chunking de PDF (${document.text.length} caracteres)`);

            const cleanText = this.preprocessText(document.text);
            const sentences = this.extractSentences(cleanText);
            const structure = this.analyzePDFStructure(cleanText, document.metadata);
            const chunks = this.createSemanticChunks(sentences, structure);
            const enrichedChunks = this.enrichChunksWithMetadata(chunks, document.metadata, contextInfo, structure);

            console.log(`[RAG-Manager] Chunking completado: ${enrichedChunks.length} chunks generados`);
            return enrichedChunks;

        } catch (error) {
            console.error('[RAG-Manager] Error en chunking:', error.message);
            throw new Error(`Error dividiendo documento: ${error.message}`);
        }
    }

    preprocessText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[""'']/g, '"')
            .replace(/[–—]/g, '-')
            .trim();
    }

    extractSentences(text) {
        const result = split(text);
        
        return result
            .filter(item => item.type === 'Sentence')
            .map((sentence, index) => ({
                text: sentence.raw.trim(),
                index: index,
                start: sentence.range[0],
                end: sentence.range[1],
                length: sentence.raw.length
            }))
            .filter(sentence => sentence.text.length > 0);
    }

    analyzePDFStructure(text, metadata) {
        const structure = {
            paragraphs: [],
            sections: [],
            lists: [],
            headers: []
        };

        // Detectar párrafos
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        structure.paragraphs = paragraphs.map((paragraph, index) => ({
            index: index,
            text: paragraph.trim(),
            start: text.indexOf(paragraph),
            end: text.indexOf(paragraph) + paragraph.length,
            wordCount: this.countWords(paragraph),
            isHeading: this.isLikelyHeading(paragraph)
        }));

        // Detectar encabezados específicos de PDF
        structure.headers = structure.paragraphs
            .filter(p => p.isHeading)
            .map(p => ({
                ...p,
                level: this.estimateHeaderLevel(p.text)
            }));

        // Usar información de estructura del PDF si está disponible
        if (metadata && metadata.structure) {
            structure.pdfSections = metadata.structure.sections || [];
            structure.pdfPages = metadata.structure.pages || [];
        }

        return structure;
    }

    createSemanticChunks(sentences, structure) {
        const chunks = [];
        let currentChunk = {
            sentences: [],
            text: '',
            charCount: 0,
            sentenceCount: 0
        };

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            const potentialText = currentChunk.text + ' ' + sentence.text;
            const potentialCharCount = potentialText.length;

            const wouldExceedSize = potentialCharCount > this.config.maxChunkSize;
            const wouldExceedSentences = currentChunk.sentenceCount >= this.config.maxSentencesPerChunk;
            const shouldRespectParagraph = this.config.preserveParagraphs && 
                this.isEndOfParagraph(sentence, structure);

            if ((wouldExceedSize || wouldExceedSentences || shouldRespectParagraph) && 
                currentChunk.charCount >= this.config.minChunkSize) {
                
                chunks.push(this.finalizeChunk(currentChunk, chunks.length));
                currentChunk = this.createNewChunkWithOverlap(currentChunk, sentence);
            } else {
                currentChunk.sentences.push(sentence);
                currentChunk.text = currentChunk.text ? currentChunk.text + ' ' + sentence.text : sentence.text;
                currentChunk.charCount = currentChunk.text.length;
                currentChunk.sentenceCount = currentChunk.sentences.length;
            }
        }

        if (currentChunk.charCount >= this.config.minChunkSize) {
            chunks.push(this.finalizeChunk(currentChunk, chunks.length));
        }

        return chunks;
    }

    finalizeChunk(chunk, index) {
        const sentences = chunk.sentences;
        const firstSentence = sentences[0];
        const lastSentence = sentences[sentences.length - 1];

        return {
            id: `chunk_${index}`,
            text: chunk.text.trim(),
            sentences: sentences,
            metadata: {
                chunkIndex: index,
                charCount: chunk.charCount,
                wordCount: this.countWords(chunk.text),
                sentenceCount: chunk.sentenceCount,
                startPosition: firstSentence?.start || 0,
                endPosition: lastSentence?.end || chunk.charCount,
                firstSentenceIndex: firstSentence?.index || 0,
                lastSentenceIndex: lastSentence?.index || 0
            }
        };
    }

    createNewChunkWithOverlap(previousChunk, newSentence) {
        const overlapSentences = [];
        let overlapCharCount = 0;

        for (let i = previousChunk.sentences.length - 1; i >= 0; i--) {
            const sentence = previousChunk.sentences[i];
            if (overlapCharCount + sentence.length <= this.config.overlapSize) {
                overlapSentences.unshift(sentence);
                overlapCharCount += sentence.length;
            } else {
                break;
            }
        }

        const newChunk = {
            sentences: [...overlapSentences, newSentence],
            text: '',
            charCount: 0,
            sentenceCount: 0
        };

        newChunk.text = newChunk.sentences.map(s => s.text).join(' ');
        newChunk.charCount = newChunk.text.length;
        newChunk.sentenceCount = newChunk.sentences.length;

        return newChunk;
    }

    enrichChunksWithMetadata(chunks, documentMetadata, contextInfo, structure) {
        return chunks.map((chunk, index) => {
            const section = this.detectSection(chunk, structure);
            const page = this.detectPage(chunk, documentMetadata);

            const enrichedMetadata = {
                ...chunk.metadata,
                
                documentInfo: {
                    fileName: documentMetadata.fileName,
                    fileType: 'pdf',
                    totalPages: documentMetadata.totalPages,
                    processedAt: documentMetadata.processedAt
                },

                educationalContext: {
                    subjectId: contextInfo.subjectId,
                    topicId: contextInfo.topicId,
                    subtopicId: contextInfo.subtopicId
                },

                structuralInfo: {
                    section: section?.title || 'Unknown',
                    subsection: section?.subsection,
                    page: page?.pageNumber,
                    paragraph: this.detectParagraph(chunk, structure),
                    isHeading: this.chunkContainsHeading(chunk, structure),
                    isList: this.chunkContainsList(chunk, structure)
                },

                navigation: {
                    previousChunk: index > 0 ? `chunk_${index - 1}` : null,
                    nextChunk: index < chunks.length - 1 ? `chunk_${index + 1}` : null,
                    relativePosition: (index + 1) / chunks.length
                },

                pdfSpecific: {
                    sourceType: 'pdf',
                    quality: documentMetadata.quality?.score,
                    extractionMethod: 'pdf-parse'
                },

                createdAt: new Date().toISOString()
            };

            return {
                ...chunk,
                metadata: enrichedMetadata
            };
        });
    }

    // Métodos auxiliares
    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    isLikelyHeading(text) {
        const trimmedText = text.trim();
        return trimmedText.length < 100 && 
               !trimmedText.endsWith('.') &&
               trimmedText.length > 5;
    }

    estimateHeaderLevel(text) {
        if (text.length < 30) return 1;
        if (text.length < 50) return 2;
        return 3;
    }

    isEndOfParagraph(sentence, structure) {
        return structure.paragraphs.some(p => 
            sentence.end >= p.end - 10 && sentence.end <= p.end + 10
        );
    }

    detectSection(chunk, structure) {
        const chunkStart = chunk.metadata.startPosition;
        
        for (let i = structure.headers.length - 1; i >= 0; i--) {
            const header = structure.headers[i];
            if (header.start <= chunkStart) {
                return {
                    title: header.text,
                    level: header.level,
                    index: header.index
                };
            }
        }
        
        return null;
    }

    detectPage(chunk, documentMetadata) {
        if (!documentMetadata.structure?.pages) return null;
        
        const chunkStart = chunk.metadata.startPosition;
        
        for (const page of documentMetadata.structure.pages) {
            if (chunkStart >= page.start && chunkStart <= page.end) {
                return page;
            }
        }
        
        return null;
    }

    detectParagraph(chunk, structure) {
        const chunkStart = chunk.metadata.startPosition;
        
        for (let i = 0; i < structure.paragraphs.length; i++) {
            const paragraph = structure.paragraphs[i];
            if (chunkStart >= paragraph.start && chunkStart <= paragraph.end) {
                return paragraph.index + 1;
            }
        }
        
        return null;
    }

    chunkContainsHeading(chunk, structure) {
        return structure.headers.some(header => 
            chunk.metadata.startPosition <= header.start && 
            chunk.metadata.endPosition >= header.end
        );
    }

    chunkContainsList(chunk, structure) {
        return structure.lists?.some(list => 
            list.position >= chunk.metadata.startPosition && 
            list.position <= chunk.metadata.endPosition
        ) || false;
    }

    getChunkingStats(chunks) {
        const charCounts = chunks.map(c => c.metadata.charCount);
        const wordCounts = chunks.map(c => c.metadata.wordCount);
        const sentenceCounts = chunks.map(c => c.metadata.sentenceCount);

        return {
            totalChunks: chunks.length,
            avgCharCount: Math.round(charCounts.reduce((a, b) => a + b, 0) / chunks.length),
            minCharCount: Math.min(...charCounts),
            maxCharCount: Math.max(...charCounts),
            avgWordCount: Math.round(wordCounts.reduce((a, b) => a + b, 0) / chunks.length),
            avgSentenceCount: Math.round(sentenceCounts.reduce((a, b) => a + b, 0) / chunks.length),
            config: this.config
        };
    }
}

module.exports = TextChunker;