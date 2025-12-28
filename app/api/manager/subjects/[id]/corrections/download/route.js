import { NextResponse } from "next/server";
import dbConnect from "../../../../../../utils/dbconnect";
import Question from "../../../../../../models/Question";
import Subject from "../../../../../../manager/models/Subject";
import { withAuth, handleError } from "../../../../../../utils/authMiddleware";

async function buildSubjectFilter(subjectId) {
    const identifiers = [subjectId];

    try {
        const subject = await Subject.findById(subjectId).lean();
        if (subject?.acronym) identifiers.push(subject.acronym);
        if (subject?.title) identifiers.push(subject.title);
    } catch (error) {
        console.warn('[Corrections Download API] No se pudo obtener la asignatura para filtros:', error.message);
    }

    return { subject: { $in: identifiers } };
}

async function downloadCorrections(request, { params }) {
    try {
        await dbConnect();

        const { questionIds } = await request.json();

        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No se proporcionaron preguntas para descargar' },
                { status: 400 }
            );
        }

        const subjectFilter = await buildSubjectFilter(params.id);

        const questions = await Question.find({
            _id: { $in: questionIds },
            ...subjectFilter,
            professorCorrection: true,
            correctedQuestion: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        if (questions.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No se encontraron preguntas para descargar' },
                { status: 404 }
            );
        }

        return generateCorrectionsPDF(questions, params.id);
    } catch (error) {
        return handleError(error, 'Error generando PDF de correcciones');
    }
}

function generateCorrectionsPDF(questions, subjectId) {
    try {
        const { jsPDF } = require('jspdf');
        const doc = new jsPDF();

        const margin = 20;
        const lineHeight = 7;
        let yPosition = margin;
        const pageHeight = doc.internal.pageSize.height;
        const maxLineWidth = doc.internal.pageSize.width - margin * 2;

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('PREGUNTAS CORREGIDAS', margin, yPosition);
        yPosition += lineHeight * 2;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Asignatura: ${subjectId}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Número de preguntas: ${questions.length}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, margin, yPosition);
        yPosition += lineHeight * 2;

        const checkPageBreak = (neededHeight) => {
            if (yPosition + neededHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };

        const splitText = (text, maxWidth) => doc.splitTextToSize(text, maxWidth);

        questions.forEach((question, index) => {
            checkPageBreak(30);

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}.`, margin, yPosition);

            const questionLines = splitText(question.text || question.query, maxLineWidth - 20);
            doc.text(questionLines, margin + 15, yPosition);
            yPosition += questionLines.length * lineHeight + 3;

            if (question.choices && Array.isArray(question.choices)) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');

                question.choices.forEach((choice, choiceIndex) => {
                    const letter = String.fromCharCode(65 + choiceIndex);
                    const isCorrect = typeof choice === 'object' ? choice.isCorrect : choiceIndex === question.answer;
                    const choiceText = typeof choice === 'object' ? choice.text : choice;

                    checkPageBreak(10);

                    let optionText = `   ${letter}) ${choiceText}`;
                    if (isCorrect) {
                        optionText += ' ✓';
                        doc.setFont(undefined, 'bold');
                    }

                    const choiceLines = splitText(optionText, maxLineWidth - 20);
                    doc.text(choiceLines, margin + 10, yPosition);
                    yPosition += choiceLines.length * lineHeight;

                    doc.setFont(undefined, 'normal');
                });
            }

            if (question.teacherComments?.length) {
                checkPageBreak(10);
                yPosition += 2;
                doc.setFont(undefined, 'italic');
                const commentsText = `Comentarios: ${question.teacherComments.join('; ')}`;
                const commentLines = splitText(commentsText, maxLineWidth - 20);
                doc.text(commentLines, margin + 10, yPosition);
                yPosition += commentLines.length * lineHeight;
                doc.setFont(undefined, 'normal');
            }

            const studentAnswerText = typeof question.studentAnswer === 'number' && question.studentAnswer >= 0
                ? `Respuesta del alumno: ${String.fromCharCode(65 + question.studentAnswer)}`
                : 'Respuesta del alumno: No ha respondido';

            checkPageBreak(8);
            const studentLines = splitText(studentAnswerText, maxLineWidth - 20);
            doc.text(studentLines, margin + 10, yPosition);
            yPosition += studentLines.length * lineHeight;

            yPosition += lineHeight;
        });

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="correcciones_${subjectId}_${Date.now()}.pdf"`);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers,
        });
    } catch (error) {
        return generateCorrectionsFallback(questions, subjectId);
    }
}

function generateCorrectionsFallback(questions, subjectId) {
    let content = `PREGUNTAS CORREGIDAS\n\n`;
    content += `Asignatura: ${subjectId}\n`;
    content += `Número de preguntas: ${questions.length}\n`;
    content += `Generado: ${new Date().toLocaleDateString()}\n\n`;
    content += '='.repeat(60) + '\n\n';

    questions.forEach((question, index) => {
        content += `${index + 1}. ${question.text || question.query}\n`;

        if (question.choices && Array.isArray(question.choices)) {
            question.choices.forEach((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex);
                const isCorrect = typeof choice === 'object' ? choice.isCorrect : choiceIndex === question.answer;
                const choiceText = typeof choice === 'object' ? choice.text : choice;

                content += `   ${letter}) ${choiceText}`;
                if (isCorrect) {
                    content += ' ✓';
                }
                content += '\n';
            });
        }

        if (question.teacherComments?.length) {
            content += `\n   Comentarios: ${question.teacherComments.join('; ')}\n`;
        }

        if (typeof question.studentAnswer === 'number' && question.studentAnswer >= 0) {
            content += `   Respuesta del alumno: ${String.fromCharCode(65 + question.studentAnswer)}\n`;
        } else {
            content += '   Respuesta del alumno: No ha respondido\n';
        }

        content += '\n' + '-'.repeat(40) + '\n\n';
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="correcciones_${subjectId}_${Date.now()}.txt"`);

    return new NextResponse(content, {
        status: 200,
        headers,
    });
}

export const POST = withAuth(downloadCorrections, { requireProfessor: true });