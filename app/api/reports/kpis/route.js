import { withAuth } from "../../../utils/authMiddleware.js";
import dbConnect from "../../../utils/dbconnect.js";
import Question from "../../../models/Question.js";

async function handler(req) {
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
            // Evaluadas: reportadas por el alumno y revisadas por un profesor (pestaña Correcciones o evaluación antigua)
            Question.countDocuments({ $and: [{ ...periodFilters, studentReport: true }, { $or: [{ professorCorrection: true }, { teacherReport: { $ne: null } }] }] })
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

export const GET = withAuth(handler, { requireProfessor: true });
