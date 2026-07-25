import dbConnect from '../../utils/dbconnect.js';
import Student from '../../models/Student.js';
import Question from '../../models/Question.js';

export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;
        console.log(email)

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await dbConnect();

        // 1. Buscamos al estudiante en la colección Student
        let student = await Student.findOne({ studentEmail: email }).lean();

        // 2. Buscamos todas las preguntas/tests respondidos por este alumno
        const questions = await Question.find({ studentEmail: email }).lean();

        // Si no está en Student ni tiene preguntas, entonces realmente no existe
        if (!student && questions.length === 0) {
            return new Response(JSON.stringify({ error: 'Student not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Si tiene preguntas pero no estaba en la colección Student, deducimos sus asignaturas de las preguntas
        let subjects = student ? student.subjects : [];
        if (!student && questions.length > 0) {
            const uniqueSubjects = Array.from(new Set(questions.map(q => q.subject))).filter(Boolean);
            subjects = uniqueSubjects.map(subName => ({ subjectName: subName }));
        }

        // 3. Calculamos total de tests y aciertos
        const totalTests = questions.length;
        const totalCorrect = questions.filter(q => q.studentAnswer === q.answer).length;

        // 4. Devolvemos el objeto unificado
        const result = {
            studentEmail: email,
            subjects: subjects,
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