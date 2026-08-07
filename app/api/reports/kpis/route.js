import dbConnect from "../../../utils/dbconnect.js";
import Question from "../../../models/Question.js";

export async function GET(req) {
    try {
        await dbConnect();
        const searchParams = req.nextUrl.searchParams;

        const asignatura = searchParams.get('asignatura');
        const startDate = searchParams.get('fechaInicio');
        const endDate = searchParams.get('fechaFin');

        let baseFilters = { studentReport: false };
        if (asignatura) baseFilters.subject = asignatura;

        let periodFilters = { ...baseFilters };
        if (startDate || endDate) {
            let dateFilter = {};
            if (startDate && startDate !== "null") dateFilter.$gte = new Date(startDate);
            if (endDate && endDate !== "null") {
                let end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }
            periodFilters.$or = [
                { createdAt: dateFilter },
                { created_at: dateFilter }
            ];
        }

        const [totalGlobal, totalPeriodo, studentReportsPeriodo, evaluadasPeriodo] = await Promise.all([
            Question.countDocuments(baseFilters),
            Question.countDocuments(periodFilters),
            Question.countDocuments({ ...periodFilters, studentReport: true }),
            Question.countDocuments({ ...periodFilters, teacherReport: { $ne: null } })
        ]);

        return Response.json({
            totalGlobal,
            totalPeriodo,
            studentReportsPeriodo,
            evaluadasPeriodo
        });
    } catch (error) {
        return Response.json({ error: "Error al obtener KPIs" }, { status: 500 });
    }
}