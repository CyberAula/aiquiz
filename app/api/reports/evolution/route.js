import dbConnect from "../../../utils/dbconnect.js";
import Question from "../../../models/Question.js";

export async function GET(req) {
    try {
        await dbConnect();
        const searchParams = req.nextUrl.searchParams;
        let filters = { studentReport: false };

        if (searchParams.get('asignatura')) {
            filters.subject = searchParams.get('asignatura');
        }

        const startDate = searchParams.get('fechaInicio');
        const endDate = searchParams.get('fechaFin');

        let dateFilter = {};
        if (startDate && startDate !== "null") dateFilter.$gte = new Date(startDate);
        if (endDate && endDate !== "null") {
            let end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        } else {
            // Por defecto últimos 12 meses si no pasan fecha de inicio
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
            twelveMonthsAgo.setDate(1);
            twelveMonthsAgo.setHours(0, 0, 0, 0);
            dateFilter.$gte = twelveMonthsAgo;
        }

        filters.$or = [
            { createdAt: dateFilter },
            { created_at: dateFilter }
        ];

        const pipeline = [
            { $match: filters },
            { $project: { date: { $ifNull: ["$createdAt", "$created_at"] } } },
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ];

        const results = await Question.aggregate(pipeline);

        const monthsNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        let evolucionMensual = [];

        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;

            const found = results.find(r => r._id.year === year && r._id.month === month);
            evolucionMensual.push({
                label: `${monthsNames[month - 1]} ${year}`,
                total: found ? found.total : 0
            });
        }

        return Response.json({ evolucionMensual });
    } catch (error) {
        return Response.json({ error: "Error al obtener evolución" }, { status: 500 });
    }
}