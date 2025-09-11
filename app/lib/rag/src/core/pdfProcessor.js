/**
 * PROCESADOR DE PDF - SISTEMA RAG
 * 
 * Servicio especializado exclusivamente en el procesamiento de archivos PDF
 * para el sistema RAG semántico de AIQuiz Manager.
 * 
 * Funcionalidades:
 * - Extracción optimizada de texto de PDFs
 * - Preservación de metadatos estructurales (páginas, secciones)
 * - Detección de elementos como encabezados, párrafos, listas
 * - Manejo robusto de errores específicos de PDF
 * 
 * Dependencias:
 * - pdf-parse: Biblioteca especializada en procesamiento PDF
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class PDFProcessor {
    constructor() {
        this.supportedMimeTypes = [
            'application/pdf'
        ];
        
        this.supportedExtensions = ['.pdf'];
        
        console.log('[RAG-PDF] PDFProcessor inicializado');
    }

    /**
     * Procesa un archivo PDF y extrae su contenido textual con metadatos
     * 
     * @param {Object} file - Archivo PDF a procesar
     * @param {string} file.path - Ruta del archivo
     * @param {string} file.mimetype - Tipo MIME del archivo
     * @param {string} file.originalname - Nombre original del archivo
     * @param {number} file.size - Tamaño del archivo en bytes
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async processDocument(file) {
        try {
            console.log(`[RAG-PDF] Procesando PDF: ${file.originalname}`);
            
            // 1. Validar que es un archivo PDF
            const validation = this.validatePDF(file);
            if (!validation.isValid) {
                throw new Error(`PDF inválido: ${validation.errors.join(', ')}`);
            }

            // 2. Obtener el buffer del archivo
            let pdfBuffer;
            if (file.buffer) {
                // Si tiene buffer, usarlo directamente
                pdfBuffer = file.buffer;
            } else if (file.path) {
                // Si tiene path, leer el archivo
                if (!fs.existsSync(file.path)) {
                    throw new Error(`Archivo PDF no encontrado: ${file.path}`);
                }
                pdfBuffer = fs.readFileSync(file.path);
            } else {
                throw new Error('Archivo PDF no disponible: no se encontró buffer ni path');
            }

            // 3. Procesar el PDF
            const pdfResult = await this.extractPDFContent(pdfBuffer);

            // 4. Analizar estructura del documento
            const structure = this.analyzePDFStructure(pdfResult);

            // 5. Detectar elementos específicos de PDF
            const elements = this.detectPDFElements(pdfResult.text);

            // 6. Preparar resultado enriquecido
            const result = {
                text: pdfResult.text,
                metadata: {
                    // Información del archivo
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    fileType: 'pdf',
                    
                    // Información del PDF
                    totalPages: pdfResult.numpages,
                    pdfInfo: pdfResult.info || {},
                    
                    // Análisis de contenido
                    charCount: pdfResult.text.length,
                    wordCount: this.countWords(pdfResult.text),
                    estimatedReadingTime: this.estimateReadingTime(pdfResult.text),
                    
                    // Estructura detectada
                    structure: structure,
                    elements: elements,
                    
                    // Calidad del procesamiento
                    quality: this.assessPDFQuality(pdfResult),
                    
                    // Timestamp
                    processedAt: new Date().toISOString()
                }
            };

            console.log(`[RAG-PDF] PDF procesado exitosamente: ${result.metadata.totalPages} páginas, ${result.metadata.charCount} caracteres`);
            return result;

        } catch (error) {
            console.error(`[RAG-PDF] Error procesando PDF ${file.originalname}:`, error.message);
            throw new Error(`Error procesando PDF: ${error.message}`);
        }
    }

    /**
     * Extrae contenido del PDF usando pdf-parse
     * 
     * @param {string} filePath - Ruta del archivo PDF
     * @returns {Promise<Object>} Contenido extraído del PDF
     */
    async extractPDFContent(pdfBuffer) {
        try {
            // Opciones optimizadas para extracción de texto
            const options = {
                // Preservar layout para mejor estructura
                normalizeWhitespace: false,
                // Configuración para mejor extracción
                max: 0, // Sin límite de páginas
            };

            const data = await pdfParse(pdfBuffer, options);

            // Normalizar el texto extraído para corregir problemas de codificación
            const normalizedText = this.normalizeText(data.text);

            return {
                text: normalizedText,
                numpages: data.numpages,
                info: data.info,
                metadata: data.metadata,
                version: data.version
            };

        } catch (error) {
            throw new Error(`Error extrayendo contenido del PDF: ${error.message}`);
        }
    }

    /**
     * Analiza la estructura del PDF para detectar páginas y secciones
     * 
     * @param {Object} pdfResult - Resultado del parsing de PDF
     * @returns {Object} Estructura detectada
     */
    analyzePDFStructure(pdfResult) {
        const text = pdfResult.text;
        
        // Detectar páginas por patrones comunes de salto de página
        const pages = this.detectPages(text, pdfResult.numpages);
        
        // Detectar secciones y capítulos
        const sections = this.detectSections(text);
        
        // Detectar párrafos
        const paragraphs = this.detectParagraphs(text);

        return {
            pages: pages,
            sections: sections,
            paragraphs: paragraphs,
            hasTableOfContents: this.hasTableOfContents(text),
            hasReferences: this.hasReferences(text),
            hasIndex: this.hasIndex(text)
        };
    }

    /**
     * Detecta páginas en el texto del PDF
     * 
     * @param {string} text - Texto completo del PDF
     * @param {number} totalPages - Número total de páginas
     * @returns {Array} Array de páginas detectadas
     */
    detectPages(text, totalPages) {
        const pages = [];
        
        // Estrategia 1: Dividir por saltos de página múltiples
        let pageTexts = text.split(/\n\s*\n\s*\n/);
        
        // Si no hay suficientes divisiones, usar longitud aproximada
        if (pageTexts.length < totalPages) {
            const avgPageLength = Math.floor(text.length / totalPages);
            pageTexts = [];
            
            for (let i = 0; i < totalPages; i++) {
                const start = i * avgPageLength;
                const end = Math.min((i + 1) * avgPageLength, text.length);
                pageTexts.push(text.substring(start, end));
            }
        }

        pageTexts.forEach((pageText, index) => {
            if (pageText.trim().length > 0) {
                pages.push({
                    pageNumber: index + 1,
                    text: pageText.trim(),
                    charCount: pageText.length,
                    wordCount: this.countWords(pageText),
                    hasHeader: this.detectPageHeader(pageText),
                    hasFooter: this.detectPageFooter(pageText),
                    hasPageNumber: this.detectPageNumber(pageText, index + 1)
                });
            }
        });

        return pages;
    }

    /**
     * Detecta secciones y capítulos en el texto
     * 
     * @param {string} text - Texto del PDF
     * @returns {Array} Secciones detectadas
     */
    detectSections(text) {
        const sections = [];
        const lines = text.split('\n');
        
        // Patrones para detectar encabezados de sección
        const sectionPatterns = [
            /^(CHAPTER|CAPÍTULO|TEMA|UNIDAD)\s+\d+/i,
            /^\d+\.\s+[A-ZÁÉÍÓÚÑ]/,
            /^\d+\.\d+\s+[A-ZÁÉÍÓÚÑ]/,
            /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{10,50}$/,
        ];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (trimmedLine.length > 5 && trimmedLine.length < 100) {
                for (const pattern of sectionPatterns) {
                    if (pattern.test(trimmedLine)) {
                        sections.push({
                            title: trimmedLine,
                            lineNumber: index + 1,
                            level: this.estimateSectionLevel(trimmedLine),
                            type: this.classifySectionType(trimmedLine)
                        });
                        break;
                    }
                }
            }
        });

        return sections;
    }

    /**
     * Detecta párrafos en el texto
     * 
     * @param {string} text - Texto del PDF
     * @returns {Array} Párrafos detectados
     */
    detectParagraphs(text) {
        const paragraphs = text
            .split(/\n\s*\n/)
            .filter(p => p.trim().length > 50) // Filtrar párrafos muy cortos
            .map((paragraph, index) => ({
                index: index + 1,
                text: paragraph.trim(),
                charCount: paragraph.length,
                wordCount: this.countWords(paragraph),
                sentenceCount: this.countSentences(paragraph),
                startsWithCapital: /^[A-ZÁÉÍÓÚÑ]/.test(paragraph.trim()),
                endsWithPeriod: /\.$/.test(paragraph.trim())
            }));

        return paragraphs;
    }

    /**
     * Detecta elementos específicos del PDF (listas, tablas, etc.)
     * 
     * @param {string} text - Texto del PDF
     * @returns {Object} Elementos detectados
     */
    detectPDFElements(text) {
        return {
            lists: this.detectLists(text),
            tables: this.detectTables(text),
            equations: this.detectEquations(text),
            urls: this.detectURLs(text),
            emails: this.detectEmails(text),
            dates: this.detectDates(text),
            numbers: this.detectNumbers(text)
        };
    }

    /**
     * Detecta listas en el texto
     * 
     * @param {string} text - Texto a analizar
     * @returns {Array} Listas detectadas
     */
    detectLists(text) {
        const lists = [];
        const lines = text.split('\n');
        
        // Patrones para elementos de lista
        const listPatterns = [
            /^\s*[•\-\*]\s+/,           // Viñetas
            /^\s*\d+\.\s+/,             // Numeradas
            /^\s*[a-z]\)\s+/i,          // Letras con paréntesis
            /^\s*[ivxlcdm]+\.\s+/i      // Números romanos
        ];

        let currentList = null;
        
        lines.forEach((line, index) => {
            const isListItem = listPatterns.some(pattern => pattern.test(line));
            
            if (isListItem) {
                if (!currentList) {
                    currentList = {
                        startLine: index + 1,
                        type: this.getListType(line),
                        items: []
                    };
                }
                
                currentList.items.push({
                    text: line.trim(),
                    lineNumber: index + 1
                });
            } else if (currentList && line.trim().length === 0) {
                // Línea vacía, posible fin de lista
                if (currentList.items.length >= 2) {
                    currentList.endLine = index;
                    lists.push(currentList);
                }
                currentList = null;
            }
        });

        // Agregar última lista si existe
        if (currentList && currentList.items.length >= 2) {
            lists.push(currentList);
        }

        return lists;
    }

    /**
     * Detecta posibles tablas en el texto
     * 
     * @param {string} text - Texto a analizar
     * @returns {Array} Tablas detectadas
     */
    detectTables(text) {
        const tables = [];
        const lines = text.split('\n');
        
        // Buscar líneas que parecen filas de tabla (múltiples columnas separadas)
        const tableLines = lines.filter(line => {
            const separators = (line.match(/\s{3,}|\t|\|/g) || []).length;
            return separators >= 2 && line.trim().length > 20;
        });

        if (tableLines.length >= 2) {
            tables.push({
                type: 'detected_table',
                rows: tableLines.length,
                estimatedColumns: Math.max(...tableLines.map(line => 
                    (line.match(/\s{3,}|\t|\|/g) || []).length + 1
                )),
                sample: tableLines.slice(0, 3)
            });
        }

        return tables;
    }

    /**
     * Evalúa la calidad del procesamiento del PDF
     * 
     * @param {Object} pdfResult - Resultado del parsing
     * @returns {Object} Métricas de calidad
     */
    assessPDFQuality(pdfResult) {
        const text = pdfResult.text;
        
        // Métricas de calidad
        const hasContent = text.length > 100;
        const hasReadableText = /[a-zA-ZáéíóúñÁÉÍÓÚÑ]{3,}/.test(text);
        const specialCharRatio = (text.match(/[^\w\s\.\,\;\:\!\?\-]/g) || []).length / text.length;
        const whitespaceRatio = (text.match(/\s/g) || []).length / text.length;
        
        let quality = 'excellent';
        const issues = [];
        
        if (!hasContent) {
            quality = 'poor';
            issues.push('Contenido insuficiente');
        } else if (!hasReadableText) {
            quality = 'poor';
            issues.push('Texto no legible');
        } else if (specialCharRatio > 0.1) {
            quality = 'fair';
            issues.push('Muchos caracteres especiales');
        } else if (whitespaceRatio > 0.5) {
            quality = 'fair';
            issues.push('Espaciado irregular');
        }

        return {
            score: quality,
            issues: issues,
            metrics: {
                hasContent,
                hasReadableText,
                specialCharRatio: Math.round(specialCharRatio * 100) / 100,
                whitespaceRatio: Math.round(whitespaceRatio * 100) / 100
            }
        };
    }

    /**
     * Valida que el archivo sea un PDF válido
     * 
     * @param {Object} file - Archivo a validar
     * @returns {Object} Resultado de validación
     */
    validatePDF(file) {
        const errors = [];
        const warnings = [];

        // Verificar tipo MIME
        if (!this.supportedMimeTypes.includes(file.mimetype)) {
            errors.push(`Tipo de archivo no soportado: ${file.mimetype}. Solo se permiten PDFs.`);
        }

        // Verificar extensión
        const extension = path.extname(file.originalname).toLowerCase();
        if (!this.supportedExtensions.includes(extension)) {
            errors.push(`Extensión no soportada: ${extension}. Solo se permiten archivos .pdf`);
        }

        // Verificar tamaño (máximo 50MB para PDFs)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            errors.push(`PDF demasiado grande: ${Math.round(file.size / 1024 / 1024)}MB (máximo: 50MB)`);
        }

        // Warning para PDFs grandes
        const warningSize = 20 * 1024 * 1024; // 20MB
        if (file.size > warningSize) {
            warnings.push(`PDF de gran tamaño detectado: ${Math.round(file.size / 1024 / 1024)}MB`);
        }

        // Verificar que existe (solo si tiene path)
        if (file.path && !fs.existsSync(file.path)) {
            errors.push(`Archivo PDF no encontrado: ${file.path}`);
        }
        
        // Verificar que tiene buffer o path
        if (!file.buffer && !file.path) {
            errors.push('Archivo PDF no disponible: no se encontró buffer ni path');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            fileType: 'pdf'
        };
    }

    // Métodos auxiliares

    countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    countSentences(text) {
        return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    }

    estimateReadingTime(text) {
        const wordsPerMinute = 200; // Velocidad promedio de lectura
        const wordCount = this.countWords(text);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    detectPageHeader(pageText) {
        const firstLines = pageText.split('\n').slice(0, 3).join(' ');
        return firstLines.length < 100 && /[A-ZÁÉÍÓÚÑ]/.test(firstLines);
    }

    detectPageFooter(pageText) {
        const lastLines = pageText.split('\n').slice(-3).join(' ');
        return lastLines.length < 100 && /\d+/.test(lastLines);
    }

    detectPageNumber(pageText, expectedPageNum) {
        return pageText.includes(expectedPageNum.toString());
    }

    estimateSectionLevel(title) {
        if (/^\d+\.\d+\.\d+/.test(title)) return 3;
        if (/^\d+\.\d+/.test(title)) return 2;
        if (/^\d+\./.test(title)) return 1;
        return 1;
    }

    classifySectionType(title) {
        if (/chapter|capítulo/i.test(title)) return 'chapter';
        if (/section|sección/i.test(title)) return 'section';
        if (/tema|unidad/i.test(title)) return 'unit';
        return 'section';
    }

    getListType(line) {
        if (/^\s*\d+\./.test(line)) return 'numbered';
        if (/^\s*[a-z]\)/.test(line)) return 'lettered';
        if (/^\s*[ivxlcdm]+\./i.test(line)) return 'roman';
        return 'bulleted';
    }

    hasTableOfContents(text) {
        return /table of contents|índice|contenido/i.test(text.substring(0, 2000));
    }

    hasReferences(text) {
        return /references|bibliografía|bibliography/i.test(text);
    }

    hasIndex(text) {
        return /index|índice alfabético/i.test(text.substring(text.length - 2000));
    }

    detectEquations(text) {
        const equations = text.match(/\$[^$]+\$|\\\([^)]+\\\)|\\\[[^\]]+\\\]/g) || [];
        return equations.map(eq => ({ formula: eq.trim() }));
    }

    detectURLs(text) {
        const urls = text.match(/https?:\/\/[^\s]+/g) || [];
        return urls.map(url => ({ url: url.trim() }));
    }

    detectEmails(text) {
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        return emails.map(email => ({ email: email.trim() }));
    }

    detectDates(text) {
        const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/g) || [];
        return dates.map(date => ({ date: date.trim() }));
    }

    detectNumbers(text) {
        const numbers = text.match(/\b\d+(?:\.\d+)?\b/g) || [];
        return numbers.slice(0, 20).map(num => ({ number: parseFloat(num) })); // Limitar a 20
    }

    /**
     * Obtiene información sobre el procesador de PDF
     * 
     * @returns {Object} Información del procesador
     */
    getProcessorInfo() {
        return {
            name: 'PDFProcessor',
            version: '1.0.0',
            supportedTypes: this.supportedMimeTypes,
            supportedExtensions: this.supportedExtensions,
            maxFileSize: '50MB',
            features: [
                'Extracción de texto completo',
                'Análisis de estructura de páginas',
                'Detección de elementos (listas, tablas)',
                'Evaluación de calidad de extracción',
                'Metadatos enriquecidos'
            ]
        };
    }

    /**
     * Normaliza el texto extraído del PDF para UTF-8 correcto
     * 
     * @param {string} text - Texto a normalizar
     * @returns {string} Texto normalizado en UTF-8
     */
    normalizeText(text) {
        if (!text) return '';

        try {
            // Normalización Unicode NFC: combina caracteres base + diacríticos
            // Esto convierte automáticamente "a + ́" → "á", "n + ̃" → "ñ", etc.
            const normalizedText = text.normalize('NFC');
            
            console.log(`[RAG-PDF] UTF-8 normalizado: ${text.length} → ${normalizedText.length} chars`);
            
            return normalizedText;

        } catch (error) {
            console.error('[RAG-PDF] Error en normalización UTF-8:', error);
            return text; // Fallback al texto original
        }
    }
}

module.exports = PDFProcessor;