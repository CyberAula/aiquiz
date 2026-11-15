import { withAuth } from '../../utils/authMiddleware.js';
import dbConnect from '../../utils/dbconnect.js';
import Student from '../../models/Student.js';
import Question from '../../models/Question.js';

async function handler(req) {
    try {
        const body = await req.json();
        const { studentIDs, fechaInicio, fechaFin, subject } = body;

        await dbConnect();

        const questionMatch = {};
        let students = null;

        if (subject) {
            // Vista de una asignatura: los alumnos salen de las preguntas respondidas en ella
            questionMatch.subject = subject;
            questionMatch.studentEmail = Array.isArray(studentIDs)
                ? { $in: studentIDs }
                : { $nin: [null, ''] };
        } else {
            const query = studentIDs && Array.isArray(studentIDs) ? { studentEmail: { $in: studentIDs } } : {};
            students = await Student.find(query).lean();
            questionMatch.studentEmail = { $in: students.map(s => s.studentEmail) };
        }

        if (fechaInicio || fechaFin) {
            questionMatch.createdAt = {};
            if (fechaInicio) {
                questionMatch.createdAt.$gte = new Date(`${fechaInicio}T00:00:00.000Z`);
            }
            if (fechaFin) {
                questionMatch.createdAt.$lte = new Date(`${fechaFin}T23:59:59.999Z`);
            }
        }

        const statsAggregation = await Question.aggregate([
            { $match: questionMatch },
            {
                $group: {
                    _id: "$studentEmail",
                    totalTests: { $sum: 1 },
                    correctTests: {
                        $sum: {
                            $cond: [{ $eq: ["$studentAnswer", "$answer"] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        let result;

        if (subject) {
            result = statsAggregation
                .map(stat => ({
                    studentEmail: stat._id,
                    subjects: [{ subjectName: subject }],
                    totalTests: stat.totalTests,
                    totalCorrect: stat.correctTests,
                }))
                .sort((a, b) => b.totalTests - a.totalTests);
        } else {
            const statsMap = {};
            statsAggregation.forEach(stat => {
                statsMap[stat._id] = {
                    totalTests: stat.totalTests,
                    totalCorrect: stat.correctTests
                };
            });

            result = students.map(student => {
                const stats = statsMap[student.studentEmail] || { totalTests: 0, totalCorrect: 0 };
                return {
                    studentEmail: student.studentEmail,
                    subjects: student.subjects,
                    totalTests: stats.totalTests,
                    totalCorrect: stats.totalCorrect,
                };
            });
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error generating students summary:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export const POST = withAuth(handler, { requireProfessor: true });
