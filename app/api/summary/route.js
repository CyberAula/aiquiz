import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";

export async function GET(req) {
    try {
        await dbConnect();

        const searchParams = req.nextUrl.searchParams;
        const startDate = searchParams.get('fechaInicio');
        const endDate = searchParams.get('fechaFin');
        const asignaturasParam = searchParams.get('asignaturas');

        let filters = { studentReport: false };

        if (asignaturasParam) {
            const requestedSubjects = asignaturasParam
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            if (requestedSubjects.length > 0) {
                filters.subject = { $in: requestedSubjects };
            }
        }

        if (startDate || endDate) {
            let dateFilter = {};
            if (startDate && startDate !== "null") dateFilter.$gte = new Date(startDate);
            if (endDate && endDate !== "null") {
                let end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }

            filters.$or = [
                { createdAt: dateFilter },
                { created_at: dateFilter },
            ];
        }

        const grouped = await Question.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: '$subject',
                    total: { $sum: 1 },
                    correct: {
                        $sum: {
                            $cond: [{ $eq: ['$studentAnswer', '$answer'] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const aiquizSubjectStats = grouped.map((row) => ({
            subjectKey: row._id,
            total: row.total,
            correct: row.correct,
        }));

        const totalSubjectsUnicas = aiquizSubjectStats.length;
        const totalTestsAIQuiz = aiquizSubjectStats.reduce((sum, row) => sum + row.total, 0);
        const totalCorrect = aiquizSubjectStats.reduce((sum, row) => sum + row.correct, 0);
        const porcentajeAciertoAIQuiz = totalTestsAIQuiz > 0
            ? ((totalCorrect / totalTestsAIQuiz) * 100).toFixed(1)
            : '0.0';

        return Response.json({
            totalSubjectsUnicas,
            totalTestsAIQuiz,
            porcentajeAciertoAIQuiz,
            aiquizSubjectStats,
        });

    } catch (error) {
        console.error("Error en resumen de AIQuiz:", error);
        return Response.json({ error: "Error al procesar el resumen de AIQuiz" }, { status: 500 });
    }
}