import Student from '../../models/Student.js';
import dbConnect from '../../utils/dbconnect.js';

export async function POST(req) {
    try {
        const body = await req.json(); // Extrae el cuerpo del request
        const { email } = body;

        if (!email) {
            return new Response(JSON.stringify({ message: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await dbConnect();
        const student = await Student.findOne({ studentEmail: email });

        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(student), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching student data:', error);
        return new Response(JSON.stringify({ message: 'Server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}