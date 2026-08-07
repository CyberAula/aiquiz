import dbConnect from '../../utils/dbconnect.js';
import Student from '../../models/Student.js';
import Question from '../../models/Question.js';

export async function POST(req) {
    try {
        const body = await req.json();
        const { emails, fechaInicio, fechaFin } = body;

        await dbConnect();

        const query = emails && Array.isArray(emails) ? { studentEmail: { $in: emails } } : {};
        const students = await Student.find(query).lean();
        const targetEmails = students.map(s => s.studentEmail);

        const questionMatch = { studentEmail: { $in: targetEmails } };

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

        const statsMap = {};
        statsAggregation.forEach(stat => {
            statsMap[stat._id] = {
                totalTests: stat.totalTests,
                totalCorrect: stat.correctTests
            };
        });

        const result = students.map(student => {
            const stats = statsMap[student.studentEmail] || { totalTests: 0, totalCorrect: 0 };
            return {
                studentEmail: student.studentEmail,
                subjects: student.subjects,
                totalTests: stats.totalTests,
                totalCorrect: stats.totalCorrect,
            };
        });

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