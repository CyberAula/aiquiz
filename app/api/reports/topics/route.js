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

        const pipeline = [
            { $match: filters },
            {
                $group: {
                    _id: "$topic",
                    total: { $sum: 1 },
                    correctas: {
                        $sum: { $cond: [{ $eq: ["$studentAnswer", "$answer"] }, 1, 0] }
                    }
                }
            },
            { $sort: { total: -1 } }
        ];

        const results = await Question.aggregate(pipeline);
        const temasFrecuencia = results.map(r => ({
            label: r._id || "Sin Tema",
            total: r.total,
            porcentaje: r.total > 0 ? Number(((r.correctas / r.total) * 100).toFixed(2)) : 0
        }));

        return Response.json({ temasFrecuencia });
    } catch (error) {
        return Response.json({ error: "Error al obtener temas" }, { status: 500 });
    }
}