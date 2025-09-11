// app/api/manager/subjects/[id]/topics/[topicId]/questions/download/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Question from "@app/models/Question";
import { withAuth, handleError } from "@utils/authMiddleware";

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questions/download:
 *   post:
 *     tags:
 *       - Questions
 *     summary: Descargar preguntas seleccionadas
 *     description: Descarga preguntas seleccionadas en formato PDF o XML
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la asignatura
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionIds
 *               - format
 *             properties:
 *               questionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de las preguntas a descargar
 *               format:
 *                 type: string
 *                 enum: [pdf, moodle]
 *                 description: Formato de descarga
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Preguntas no encontradas
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */

async function downloadQuestions(request, context) {
    console.log('[Download Questions API] Descargando preguntas seleccionadas');
    
    try {
        await dbConnect();
        
        const { id, topicId } = context.params;
        const data = await request.json();
        
        const { questionIds, format } = data;
        
        console.log('[Download Questions API] Parámetros:', {
            subjectId: id,
            topicId,
            questionIds: questionIds?.length,
            format
        });

        // Validaciones básicas
        if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Se requiere al menos una pregunta para descargar"
            }, { status: 400 });
        }

        if (!format || !['pdf', 'moodle'].includes(format)) {
            return NextResponse.json({
                success: false,
                message: "Formato no válido. Use 'pdf' o 'moodle'"
            }, { status: 400 });
        }

        // Buscar las preguntas
        const questions = await Question.find({
            _id: { $in: questionIds }
        }).lean();

        if (questions.length === 0) {
            return NextResponse.json({
                success: false,
                message: "No se encontraron preguntas"
            }, { status: 404 });
        }

        console.log(`[Download Questions API] Encontradas ${questions.length} preguntas para descargar`);

        if (format === 'pdf') {
            return generateQuestionsPDF(questions, topicId);
        } else if (format === 'moodle') {
            return generateQuestionsMoodleXML(questions, topicId);
        }

    } catch (error) {
        console.error('[Download Questions API] Error descargando preguntas:', error);
        return handleError(error, "Error descargando preguntas");
    }
}

/**
 * Genera un archivo PDF real de las preguntas
 */
function generateQuestionsPDF(questions, topicId) {
    console.log('[Download Questions API] Generando PDF de preguntas');
    
    try {
        // Importar jsPDF dinámicamente para evitar problemas de SSR
        const { jsPDF } = require('jspdf');
        const doc = new jsPDF();
        
        // Configuración del PDF
        const margin = 20;
        const lineHeight = 7;
        let yPosition = margin;
        const pageHeight = doc.internal.pageSize.height;
        const maxLineWidth = doc.internal.pageSize.width - (margin * 2);
        
        // Título
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('PREGUNTAS SELECCIONADAS', margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Información del documento
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Tema ID: ${topicId}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Número de preguntas: ${questions.length}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += lineHeight * 2;
        
        // Función para añadir una nueva página si es necesario
        const checkPageBreak = (neededHeight) => {
            if (yPosition + neededHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };
        
        // Función para dividir texto largo en líneas
        const splitText = (text, maxWidth) => {
            return doc.splitTextToSize(text, maxWidth);
        };
        
        // Procesar cada pregunta
        questions.forEach((question, index) => {
            checkPageBreak(30); // Espacio mínimo necesario para una pregunta
            
            // Número de pregunta
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}.`, margin, yPosition);
            
            // Texto de la pregunta
            const questionLines = splitText(question.text, maxLineWidth - 20);
            doc.text(questionLines, margin + 15, yPosition);
            yPosition += questionLines.length * lineHeight + 3;
            
            // Opciones de respuesta
            if (question.choices && Array.isArray(question.choices)) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                
                question.choices.forEach((choice, choiceIndex) => {
                    const letter = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                    const isCorrect = typeof choice === 'object' ? choice.isCorrect : choiceIndex === question.answer;
                    const choiceText = typeof choice === 'object' ? choice.text : choice;
                    
                    checkPageBreak(10);
                    
                    let optionText = `   ${letter}) ${choiceText}`;
                    if (isCorrect) {
                        optionText += " ✓";
                        doc.setFont(undefined, 'bold');
                    }
                    
                    const choiceLines = splitText(optionText, maxLineWidth - 20);
                    doc.text(choiceLines, margin + 10, yPosition);
                    yPosition += choiceLines.length * lineHeight;
                    
                    doc.setFont(undefined, 'normal');
                });
            }
            
            // Explicación
            if (question.explanation) {
                checkPageBreak(15);
                yPosition += 3;
                doc.setFont(undefined, 'italic');
                const explanationText = `Explicación: ${question.explanation}`;
                const explanationLines = splitText(explanationText, maxLineWidth - 20);
                doc.text(explanationLines, margin + 10, yPosition);
                yPosition += explanationLines.length * lineHeight;
                doc.setFont(undefined, 'normal');
            }
            
            // Metadata adicional
            const metadata = [];
            if (question.difficulty) {
                metadata.push(`Dificultad: ${question.difficulty}`);
            }
            if (question.generated) {
                metadata.push('Generada automáticamente: Sí');
            }
            
            if (metadata.length > 0) {
                checkPageBreak(10);
                yPosition += 2;
                doc.setFontSize(8);
                doc.setTextColor(100);
                metadata.forEach(meta => {
                    doc.text(meta, margin + 10, yPosition);
                    yPosition += lineHeight - 1;
                });
                doc.setTextColor(0);
                doc.setFontSize(10);
            }
            
            yPosition += lineHeight;
        });
        
        // Generar el PDF como buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="preguntas_${topicId}_${Date.now()}.pdf"`);
        
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers
        });
        
    } catch (error) {
        console.error('[Download Questions API] Error generando PDF:', error);
        // Fallback a formato de texto si falla la generación de PDF
        return generateQuestionsFallbackPDF(questions, topicId);
    }
}

/**
 * Genera un archivo de texto como fallback si falla la generación de PDF
 */
function generateQuestionsFallbackPDF(questions, topicId) {
    console.log('[Download Questions API] Generando PDF fallback (texto)');
    
    let pdfContent = `PREGUNTAS SELECCIONADAS\n\n`;
    pdfContent += `Tema ID: ${topicId}\n`;
    pdfContent += `Número de preguntas: ${questions.length}\n`;
    pdfContent += `Generado: ${new Date().toLocaleDateString()}\n\n`;
    pdfContent += "=".repeat(60) + "\n\n";
    
    questions.forEach((question, index) => {
        pdfContent += `${index + 1}. ${question.text}\n\n`;
        
        if (question.choices && Array.isArray(question.choices)) {
            question.choices.forEach((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                const isCorrect = typeof choice === 'object' ? choice.isCorrect : choiceIndex === question.answer;
                const choiceText = typeof choice === 'object' ? choice.text : choice;
                
                pdfContent += `   ${letter}) ${choiceText}`;
                if (isCorrect) {
                    pdfContent += " ✓";
                }
                pdfContent += "\n";
            });
        }
        
        if (question.explanation) {
            pdfContent += `\n   Explicación: ${question.explanation}\n`;
        }
        
        if (question.difficulty) {
            pdfContent += `   Dificultad: ${question.difficulty}\n`;
        }
        
        if (question.generated) {
            pdfContent += `   Generada automáticamente: Sí\n`;
        }
        
        pdfContent += "\n" + "-".repeat(40) + "\n\n";
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="preguntas_${topicId}_${Date.now()}.txt"`);
    
    return new NextResponse(pdfContent, {
        status: 200,
        headers
    });
}

/**
 * Genera un archivo XML de Moodle de las preguntas
 */
function generateQuestionsMoodleXML(questions, topicId) {
    console.log('[Download Questions API] Generando XML de Moodle de preguntas');
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
<!-- Preguntas seleccionadas -->
<!-- Tema ID: ${topicId} -->
<!-- Generado: ${new Date().toISOString()} -->

`;

    questions.forEach((question, index) => {
        xmlContent += `  <question type="multichoice">
    <name>
      <text>Pregunta ${index + 1}</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[${question.text}]]></text>
    </questiontext>
    <defaultgrade>1.0000000</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
`;

        if (question.choices && Array.isArray(question.choices)) {
            question.choices.forEach((choice, choiceIndex) => {
                const isCorrect = typeof choice === 'object' ? choice.isCorrect : choiceIndex === question.answer;
                const choiceText = typeof choice === 'object' ? choice.text : choice;
                const fraction = isCorrect ? "100" : "0";
                
                xmlContent += `    <answer fraction="${fraction}" format="html">
      <text><![CDATA[${choiceText}]]></text>
    </answer>
`;
            });
        }

        if (question.explanation) {
            xmlContent += `    <generalfeedback format="html">
      <text><![CDATA[${question.explanation}]]></text>
    </generalfeedback>
`;
        }

        xmlContent += `  </question>

`;
    });

    xmlContent += `</quiz>`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/xml; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="preguntas_${topicId}_${Date.now()}.xml"`);
    
    return new NextResponse(xmlContent, {
        status: 200,
        headers
    });
}

// Exportar handler con autenticación
export const POST = withAuth(downloadQuestions, { requireProfessor: true });