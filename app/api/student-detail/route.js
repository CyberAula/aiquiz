import dbConnect from '../../utils/dbconnect.js';
import Student from '../../models/Student.js';
import Question from '../../models/Question.js';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await dbConnect();

        let student = await Student.findOne({ studentEmail: email }).lean();
        const questions = await Question.find({ studentEmail: email }).lean();

        if (!student && questions.length === 0) {
            return new Response(JSON.stringify({ error: 'Student not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let subjects = student ? student.subjects : [];
        if (!student && questions.length > 0) {
            const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);
            subjects = uniqueSubjects.map(subName => ({ subjectName: subName }));
        }

        const subjectStatsMap = {};
        questions.forEach(q => {
            const subj = q.subject || 'General';
            if (!subjectStatsMap[subj]) {
                subjectStatsMap[subj] = { subjectName: subj, totalTests: 0, totalCorrect: 0 };
            }
            subjectStatsMap[subj].totalTests += 1;
            if (q.studentAnswer === q.answer) {
                subjectStatsMap[subj].totalCorrect += 1;
            }
        });

        const enrichedSubjects = subjects.map(s => {
            const name = s.subjectName || s;
            const stats = subjectStatsMap[name] || { totalTests: 0, totalCorrect: 0 };
            return {
                subjectName: name,
                totalTests: stats.totalTests,
                totalCorrect: stats.totalCorrect,
            };
        });

        const totalTests = questions.length;
        const totalCorrect = questions.filter(q => q.studentAnswer === q.answer).length;

        const result = {
            studentEmail: email,
            subjects: enrichedSubjects,
            totalTests: totalTests,
            totalCorrect: totalCorrect,
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching student detail summary:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}