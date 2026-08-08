import dbConnect from '../../utils/dbconnect.js';
import Student from '../../models/Student.js';
import Question from '../../models/Question.js';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, subject } = body;

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await dbConnect();

        const query = { studentEmail: email };
        if (subject) {
            query.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
        }

        let student = await Student.findOne({ studentEmail: email }).lean();
        const questions = await Question.find(query).lean();

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
                subjectStatsMap[subj] = { subjectName: subj, totalTests: 0, totalCorrect: 0, difficultySum: 0, difficultyCount: 0 };
            }
            subjectStatsMap[subj].totalTests += 1;
            if (q.studentAnswer === q.answer) {
                subjectStatsMap[subj].totalCorrect += 1;
            }

            const diff = String(q.difficulty || '').toLowerCase();
            const difficultyMap = { facil: 0, intermedio: 1, avanzado: 2, dificil: 2 };
            if (difficultyMap[diff] !== undefined) {
                subjectStatsMap[subj].difficultySum += difficultyMap[diff];
                subjectStatsMap[subj].difficultyCount += 1;
            }
        });

        const enrichedSubjects = subjects.map(s => {
            const name = s.subjectName || s;
            const stats = subjectStatsMap[name] || { totalTests: 0, totalCorrect: 0, difficultySum: 0, difficultyCount: 0 };
            const diffNum = stats.difficultyCount > 0 ? stats.difficultySum / stats.difficultyCount : 0;
            const difficultyPct = Number((((diffNum) / 2) * 100).toFixed(3));

            return {
                subjectName: name,
                totalTests: stats.totalTests,
                totalCorrect: stats.totalCorrect,
                difficulty: difficultyPct,
            };
        });

        const totalTests = questions.length;
        const totalCorrect = questions.filter(q => q.studentAnswer === q.answer).length;

        let totalDiffSum = 0;
        let totalDiffCount = 0;
        const difficultyMap = { facil: 0, intermedio: 1, avanzado: 2, dificil: 2 };

        questions.forEach(q => {
            const diff = String(q.difficulty || '').toLowerCase();
            if (difficultyMap[diff] !== undefined) {
                totalDiffSum += difficultyMap[diff];
                totalDiffCount += 1;
            }
        });

        const globalDiffNum = totalDiffCount > 0 ? totalDiffSum / totalDiffCount : 0;
        const globalDifficultyPct = Number((((globalDiffNum) / 2) * 100).toFixed(3));

        const result = {
            studentEmail: email,
            subjects: enrichedSubjects,
            totalTests: totalTests,
            totalCorrect: totalCorrect,
            difficulty: globalDifficultyPct,
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