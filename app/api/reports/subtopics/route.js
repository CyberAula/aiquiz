import dbConnect from "../../../utils/dbconnect.js";
import Question from "../../../models/Question.js";

export async function GET(req) {
    try {
        await dbConnect();
        const searchParams = req.nextUrl.searchParams;
        let filters = { studentReport: false };

        if (searchParams.get('asignatura')) filters.subject = searchParams.get('asignatura');
        const startDate = searchParams.get('fechaInicio');
        const endDate = searchParams.get('fechaFin');

        if (startDate || endDate) {
            let dateFilter = {};
            if (startDate && startDate !== "null") dateFilter.$gte = new Date(startDate);
            if (endDate && endDate !== "null") {
                let end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            filters.$or = [{ createdAt: dateFilter }, { created_at: dateFilter }];
        }

        const page = parseInt(searchParams.get('page')) || 1;
        const pageSize = parseInt(searchParams.get('pageSize')) || 5;

        const pipeline = [
            { $match: filters },
            {
                $group: {
                    _id: { tema: "$topic", subtema: "$subTopic" },
                    total: { $sum: 1 },
                    aciertos: {
                        $sum: { $cond: [{ $eq: ["$studentAnswer", "$answer"] }, 1, 0] }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id.tema",
                    rows: {
                        $push: {
                            subtema: "$_id.subtema",
                            total: "$total",
                            aciertos: "$aciertos"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Question.aggregate(pipeline);

        const totalSubtopicsCount = results.length;
        const totalSubtopicPages = Math.ceil(totalSubtopicsCount / pageSize);
        const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);

        const paginatedSubtemasPorTema = paginatedResults.map(item => ({
            tema: item._id || "Sin Tema",
            rows: item.rows
        }));

        return Response.json({
            paginatedSubtemasPorTema,
            currentSubtopicPage: page,
            totalSubtopicPages,
            totalSubtopicsCount
        });
    } catch (error) {
        return Response.json({ error: "Error al obtener subtemas" }, { status: 500 });
    }
}