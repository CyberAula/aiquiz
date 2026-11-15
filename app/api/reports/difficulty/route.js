import { withAuth } from "../../../utils/authMiddleware.js";
import dbConnect from "../../../utils/dbconnect.js";
import Question from "../../../models/Question.js";

// La dificultad se guarda en dos formatos ("facil" / "Fácil", "intermedio" / "Medio"...).
// Se unifican para que no salgan como niveles distintos.
const DIFFICULTY_ORDER = ["Fácil", "Medio", "Avanzado"];
const DIFFICULTY_ALIASES = {
    facil: "Fácil",
    "fácil": "Fácil",
    intermedio: "Medio",
    medio: "Medio",
    avanzado: "Avanzado",
    dificil: "Avanzado",
    "difícil": "Avanzado",
};

async function handler(req) {
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
                    _id: "$difficulty",
                    total: { $sum: 1 },
                    correctas: {
                        $sum: { $cond: [{ $eq: ["$studentAnswer", "$answer"] }, 1, 0] }
                    }
                }
            }
        ];

        const results = await Question.aggregate(pipeline);

        const merged = new Map();
        results.forEach((r) => {
            const raw = String(r._id ?? "").trim();
            const label = DIFFICULTY_ALIASES[raw.toLowerCase()] || raw || "Desconocida";
            const current = merged.get(label) || { total: 0, correctas: 0 };
            current.total += r.total;
            current.correctas += r.correctas;
            merged.set(label, current);
        });

        const rank = (label) => {
            const index = DIFFICULTY_ORDER.indexOf(label);
            return index === -1 ? DIFFICULTY_ORDER.length : index;
        };

        const dificultadResumen = Array.from(merged.entries())
            .sort((a, b) => rank(a[0]) - rank(b[0]))
            .map(([label, r]) => ({
                label,
                total: r.total,
                correctas: r.correctas,
                porcentaje: r.total > 0 ? Number(((r.correctas / r.total) * 100).toFixed(2)) : 0
            }));

        return Response.json({ dificultadResumen });
    } catch (error) {
        return Response.json({ error: "Error al obtener dificultad" }, { status: 500 });
    }
}

export const GET = withAuth(handler, { requireProfessor: true });
