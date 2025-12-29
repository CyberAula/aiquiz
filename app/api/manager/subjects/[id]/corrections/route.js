import { NextResponse } from "next/server";
import dbConnect from "../../../../../utils/dbconnect";
import Question from "../../../../../models/Question";
import Subject from "../../../../../manager/models/Subject";
import { withAuth, handleError } from "../../../../../utils/authMiddleware";

async function buildSubjectFilter(subjectId) {
    const identifiers = [subjectId];

    try {
        const subject = await Subject.findById(subjectId).lean();
        if (subject?.acronym) identifiers.push(subject.acronym);
        if (subject?.title) identifiers.push(subject.title);
    } catch (error) {
        console.warn('[Corrections API] No se pudo obtener la asignatura para filtros:', error.message);
    }

    return { subject: { $in: identifiers } };
}

async function getCorrections(request, { params }) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "reported";
        const limit = parseInt(searchParams.get("limit") || "25", 10);

        // ✅ Acepta varias formas de los mismos params
        const topicId = searchParams.get("topicId") || searchParams.get("topicRef");
        const topicTitle = searchParams.get("topicTitle") || searchParams.get("topic");

        const subtopicId =
            searchParams.get("subtopicId") ||
            searchParams.get("subTopicId") ||
            searchParams.get("subtopicRef") ||
            searchParams.get("subTopicRef");

        const subtopicTitle =
            searchParams.get("subtopicTitle") ||
            searchParams.get("subTopicTitle") ||
            searchParams.get("subtopic") ||
            searchParams.get("subTopic");

        const topicTitleNorm = topicTitle?.trim().toLowerCase();
        const subtopicTitleNorm = subtopicTitle?.trim().toLowerCase();

        const subjectFilter = await buildSubjectFilter(params.id);

        const filters = {
            ...subjectFilter,
        };

        if (status === "corrected") {
            filters.professorCorrection = true;
            filters.correctedQuestion = true;
        } else {
            filters.studentReport = true;
            filters.$or = [
                { professorCorrection: { $exists: false } },
                { professorCorrection: false },
            ];
        }

        const extraFilters = [];

        if (topicId || topicTitleNorm) {
            const topicConditions = [];
            if (topicId) {
                topicConditions.push({ topicRef: topicId });
                topicConditions.push({ topic: topicId });
            }
            if (topicTitleNorm) {
                topicConditions.push({ topic: topicTitleNorm });
            }
            extraFilters.push({ $or: topicConditions });
        }

        if (subtopicId || subtopicTitleNorm) {
            const subtopicConditions = [];
            if (subtopicId) {
                // ✅ Cubre ids y refs con varios nombres posibles
                subtopicConditions.push({ subtopicRef: subtopicId });
                subtopicConditions.push({ subTopicRef: subtopicId });
                subtopicConditions.push({ subtopic: subtopicId });
                subtopicConditions.push({ subTopic: subtopicId });
            }
            if (subtopicTitleNorm) {
                // ✅ Cubre ambos nombres de campo en BD
                subtopicConditions.push({ subtopic: subtopicTitleNorm });
                subtopicConditions.push({ subTopic: subtopicTitleNorm });
            }
            extraFilters.push({ $or: subtopicConditions });
        }

        if (extraFilters.length > 0) {
            filters.$and = extraFilters;
        }

        const query = Question.find(filters).sort({ createdAt: -1 });

        if (status !== "corrected") {
            query.limit(Number.isNaN(limit) ? 25 : limit);
        }

        const questions = await query.lean();

        return NextResponse.json({
            success: true,
            questions,
        });
    } catch (error) {
        return handleError(error, "Error obteniendo preguntas reportadas");
    }
}

async function updateCorrection(request, { params }) {
    try {
        await dbConnect();

        const body = await request.json();
        const { questionId, isCorrect, reason, customReason, professorAnswer } = body;

        if (!questionId || typeof isCorrect !== 'boolean') {
            return NextResponse.json(
                { success: false, message: 'Datos inválidos para la corrección' },
                { status: 400 }
            );
        }

        const subjectFilter = await buildSubjectFilter(params.id);

        const comments = [];
        if (reason) comments.push(reason);
        if (customReason?.trim()) comments.push(customReason.trim());

        const updatePayload = {
            professorCorrection: true,
            correctedQuestion: !isCorrect,
            studentReport: true,
            professorAnswer: typeof professorAnswer === 'number' ? professorAnswer : -1,
        };

        if (comments.length > 0) {
            updatePayload.teacherComments = comments;
        }

        const question = await Question.findOneAndUpdate(
            {
                _id: questionId,
                ...subjectFilter,
            },
            {
                $set: updatePayload,
            },
            { new: true }
        );

        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Pregunta no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, question });
    } catch (error) {
        return handleError(error, 'Error actualizando la corrección');
    }
}

async function deleteCorrections(request, { params }) {
    try {
        await dbConnect();

        const body = await request.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No se proporcionaron preguntas a eliminar' },
                { status: 400 }
            );
        }

        const subjectFilter = await buildSubjectFilter(params.id);

        const result = await Question.deleteMany({
            _id: { $in: ids },
            ...subjectFilter,
        });

        return NextResponse.json({ success: true, deleted: result.deletedCount });
    } catch (error) {
        return handleError(error, 'Error eliminando preguntas reportadas');
    }
}

export const GET = withAuth(getCorrections, { requireProfessor: true });
export const PATCH = withAuth(updateCorrection, { requireProfessor: true });
export const DELETE = withAuth(deleteCorrections, { requireProfessor: true });