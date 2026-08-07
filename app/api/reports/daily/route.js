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
            { $project: { date: { $ifNull: ["$createdAt", "$created_at"] } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Question.aggregate(pipeline);
        const diario = results.map(r => ({ dia: r._id, count: r.count }));

        return Response.json({ diario });
    } catch (error) {
        return Response.json({ error: "Error al obtener actividad diaria" }, { status: 500 });
    }
}