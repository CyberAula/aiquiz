// app/api/manager/subjects/[id]/topics/[topicId]/questionnaires/[questionnaireId]/download/route.js
import { NextResponse } from "next/server";
import dbConnect from "@utils/dbconnect";
import Question from "@app/models/Question";
import { withAuth, handleError } from "@utils/authMiddleware";

// Import dinámico para el modelo Questionnaire (CommonJS)
async function getQuestionnaireModel() {
    const Questionnaire = await import("@app/manager/models/Questionnaire");
    return Questionnaire.default || Questionnaire;
}

/**
 * @swagger
 * /api/manager/subjects/{id}/topics/{topicId}/questionnaires/{questionnaireId}/download:
 *   get:
 *     tags:
 *       - Questionnaires
 *     summary: Descargar cuestionario
 *     description: Descarga un cuestionario en formato PDF o XML
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
 *       - in: path
 *         name: questionnaireId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cuestionario
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, moodle]
 *         description: Formato de descarga
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
 *         description: Cuestionario no encontrado
 *       400:
 *         description: Formato no válido
 *       500:
 *         description: Error del servidor
 */

async function downloadQuestionnaire(request, context) {
    console.log('[Download Questionnaire API] Descargando cuestionario');
    
    try {
        await dbConnect();
        
        const { id, topicId, questionnaireId } = context.params;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');
        
        console.log('[Download Questionnaire API] Parámetros:', {
            subjectId: id,
            topicId,
            questionnaireId,
            format
        });

        // Validar formato
        if (!format || !['pdf', 'moodle'].includes(format)) {
            return NextResponse.json({
                success: false,
                message: "Formato no válido. Use 'pdf' o 'moodle'"
            }, { status: 400 });
        }

        // Obtener modelo Questionnaire
        const Questionnaire = await getQuestionnaireModel();
        
        // Buscar el cuestionario con las preguntas pobladas
        const questionnaire = await Questionnaire.findById(questionnaireId)
            .populate('questions')
            .lean();

        if (!questionnaire) {
            return NextResponse.json({
                success: false,
                message: "Cuestionario no encontrado"
            }, { status: 404 });
        }

        // Verificar que el cuestionario pertenece al tema
        if (questionnaire.topic.toString() !== topicId) {
            return NextResponse.json({
                success: false,
                message: "El cuestionario no pertenece a este tema"
            }, { status: 400 });
        }

        // Incrementar contador de descargas
        await Questionnaire.findByIdAndUpdate(questionnaireId, {
            $inc: { downloadCount: 1 }
        });

        if (format === 'pdf') {
            return generatePDF(questionnaire);
        } else if (format === 'moodle') {
            return generateMoodleXML(questionnaire);
        }

    } catch (error) {
        console.error('[Download Questionnaire API] Error descargando cuestionario:', error);
        return handleError(error, "Error descargando cuestionario");
    }
}

/**
 * Genera un archivo PDF real del cuestionario
 */
function generatePDF(questionnaire) {
    console.log('[Download Questionnaire API] Generando PDF');
    
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
        
        // Título del cuestionario
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(`CUESTIONARIO: ${questionnaire.title}`, maxLineWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * lineHeight + 5;
        
        // Descripción si existe
        if (questionnaire.description) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            const descLines = doc.splitTextToSize(`Descripción: ${questionnaire.description}`, maxLineWidth);
            doc.text(descLines, margin, yPosition);
            yPosition += descLines.length * lineHeight + 5;
        }
        
        // Información del cuestionario
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Número de preguntas: ${questionnaire.questions.length}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Creado: ${new Date(questionnaire.createdAt).toLocaleDateString()}`, margin, yPosition);
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
        questionnaire.questions.forEach((question, index) => {
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
                    const isCorrect = typeof choice === 'object' ? choice.isCorrect : false;
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
            
            yPosition += lineHeight;
        });
        
        // Generar el PDF como buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="cuestionario_${questionnaire._id}.pdf"`);
        
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers
        });
        
    } catch (error) {
        console.error('[Download Questionnaire API] Error generando PDF:', error);
        // Fallback a formato de texto si falla la generación de PDF
        return generateQuestionnaireFallbackPDF(questionnaire);
    }
}

/**
 * Genera un archivo de texto como fallback si falla la generación de PDF
 */
function generateQuestionnaireFallbackPDF(questionnaire) {
    console.log('[Download Questionnaire API] Generando PDF fallback (texto)');
    
    // Contenido del PDF como texto plano (implementación simple)
    let pdfContent = `CUESTIONARIO: ${questionnaire.title}\n\n`;
    
    if (questionnaire.description) {
        pdfContent += `Descripción: ${questionnaire.description}\n\n`;
    }
    
    pdfContent += `Número de preguntas: ${questionnaire.questions.length}\n`;
    pdfContent += `Creado: ${new Date(questionnaire.createdAt).toLocaleDateString()}\n\n`;
    pdfContent += "=".repeat(60) + "\n\n";
    
    questionnaire.questions.forEach((question, index) => {
        pdfContent += `${index + 1}. ${question.text}\n\n`;
        
        if (question.choices && Array.isArray(question.choices)) {
            question.choices.forEach((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex); // A, B, C, D
                const isCorrect = typeof choice === 'object' ? choice.isCorrect : false;
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
        
        pdfContent += "\n" + "-".repeat(40) + "\n\n";
    });

    // Crear respuesta con el contenido como texto plano
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="cuestionario_${questionnaire._id}.txt"`);
    
    return new NextResponse(pdfContent, {
        status: 200,
        headers
    });
}

/**
 * Genera un archivo XML de Moodle del cuestionario
 */
function generateMoodleXML(questionnaire) {
    console.log('[Download Questionnaire API] Generando XML de Moodle');
    
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
<!-- Cuestionario: ${questionnaire.title} -->
<!-- Generado: ${new Date().toISOString()} -->

`;

    questionnaire.questions.forEach((question, index) => {
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
    headers.set('Content-Disposition', `attachment; filename="cuestionario_${questionnaire._id}.xml"`);
    
    return new NextResponse(xmlContent, {
        status: 200,
        headers
    });
}

// Exportar handler con autenticación
export const GET = withAuth(downloadQuestionnaire, { requireProfessor: true });