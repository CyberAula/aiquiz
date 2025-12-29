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

        const subject = await Subject.findById(params.id).lean();
        return generateCorrectionsPDF(questions, subject);
    } catch (error) {
        return handleError(error, 'Error generando PDF de correcciones');
    }
}

function generateCorrectionsPDF(questions, subject) {
    try {
        const { jsPDF } = require('jspdf');
        const doc = new jsPDF();
        const subjectTitle = subject?.title || subject?.name || subject?._id || 'Asignatura';
        const subjectId = subject?._id?.toString() || 'subject';

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
        doc.text(`Asignatura: ${subjectTitle}`, margin, yPosition);
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

        const renderUnderlinedText = (text, x, underlineColor) => {
            const lines = splitText(text, maxLineWidth - 20);
            lines.forEach((line) => {
                checkPageBreak(lineHeight);
                if (underlineColor) {
                    doc.setTextColor(underlineColor.r, underlineColor.g, underlineColor.b);
                } else {
                    doc.setTextColor(0, 0, 0);
                }
                doc.text(line, x, yPosition);
                if (underlineColor) {
                    const width = doc.getTextWidth(line);
                    doc.setDrawColor(underlineColor.r, underlineColor.g, underlineColor.b);
                    doc.setLineWidth(0.5);
                    doc.line(x, yPosition + 1, x + width, yPosition + 1);
                }
                yPosition += lineHeight;
            });
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(0, 0, 0);
        };

        questions.forEach((question, index) => {
            checkPageBreak(30);
            const topicLabel = question.topic || 'Sin tema';
            const subtopicLabel = question.subTopic || 'Sin subtema';

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Tema: ${topicLabel}`, margin, yPosition);
            yPosition += lineHeight;
            doc.text(`Subtema: ${subtopicLabel}`, margin, yPosition);
            yPosition += lineHeight + 2;

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}.`, margin, yPosition);

            const questionLines = splitText(question.text || question.query, maxLineWidth - 20);
            doc.text(questionLines, margin + 15, yPosition);
            yPosition += questionLines.length * lineHeight + 3;

            if (question.choices && Array.isArray(question.choices)) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');

                const professorAnswerIndex =
                    typeof question.professorAnswer === 'number' ? question.professorAnswer : -1;
                const modelAnswerIndex =
                    typeof question.answer === 'number' ? question.answer : -1;
                const professorMatchesModel =
                    professorAnswerIndex >= 0 && professorAnswerIndex === modelAnswerIndex;
                const choices = [...question.choices];
                const noneOptionIndex = choices.length;
                if (professorAnswerIndex === noneOptionIndex) {
                    choices.push({
                        text: 'Ninguna de las anteriores',
                    });
                }

                choices.forEach((choice, choiceIndex) => {
                    const letter = String.fromCharCode(65 + choiceIndex);
                    const choiceText = typeof choice === 'object' ? choice.text : choice;

                    let underlineColor = null;
                    if (professorMatchesModel && choiceIndex === professorAnswerIndex) {
                        underlineColor = { r: 34, g: 139, b: 34 };
                    } else if (!professorMatchesModel) {
                        if (choiceIndex === modelAnswerIndex) {
                            underlineColor = { r: 220, g: 38, b: 38 };
                        }
                        if (choiceIndex === professorAnswerIndex) {
                            underlineColor = { r: 34, g: 139, b: 34 };
                        }
                    }

                    const optionText = `   ${letter}) ${choiceText}`;
                    renderUnderlinedText(optionText, margin + 10, underlineColor);
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
        return generateCorrectionsFallback(questions, subject);
    }
}

function generateCorrectionsFallback(questions, subject) {
    const subjectTitle = subject?.title || subject?.name || subject?._id || 'Asignatura';
    const subjectId = subject?._id?.toString() || 'subject';
    let content = `PREGUNTAS CORREGIDAS\n\n`;
    content += `Asignatura: ${subjectTitle}\n`;
    content += `Número de preguntas: ${questions.length}\n`;
    content += `Generado: ${new Date().toLocaleDateString()}\n\n`;
    content += '='.repeat(60) + '\n\n';

    questions.forEach((question, index) => {
        const topicLabel = question.topic || 'Sin tema';
        const subtopicLabel = question.subTopic || 'Sin subtema';
        content += `Tema: ${topicLabel}\n`;
        content += `Subtema: ${subtopicLabel}\n`;
        content += `${index + 1}. ${question.text || question.query}\n`;

        if (question.choices && Array.isArray(question.choices)) {
            const professorAnswerIndex =
                typeof question.professorAnswer === 'number' ? question.professorAnswer : -1;
            const modelAnswerIndex =
                typeof question.answer === 'number' ? question.answer : -1;
            const professorMatchesModel =
                professorAnswerIndex >= 0 && professorAnswerIndex === modelAnswerIndex;
            const choices = [...question.choices];
            const noneOptionIndex = choices.length;
            if (professorAnswerIndex === noneOptionIndex) {
                choices.push({ text: 'Ninguna de las anteriores' });
            }

            choices.forEach((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex);
                const choiceText = typeof choice === 'object' ? choice.text : choice;

                let suffix = '';
                if (professorMatchesModel && choiceIndex === professorAnswerIndex) {
                    suffix = ' [PROFESOR]';
                } else if (!professorMatchesModel) {
                    if (choiceIndex === modelAnswerIndex) {
                        suffix = ' [MODELO INCORRECTA]';
                    }
                    if (choiceIndex === professorAnswerIndex) {
                        suffix = ' [PROFESOR]';
                    }
                }
                content += `   ${letter}) ${choiceText}${suffix}\n`;
            });
        }

        if (question.teacherComments?.length) {
            content += `\n   Comentarios: ${question.teacherComments.join('; ')}\n`;
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