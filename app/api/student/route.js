import Student from "../../models/Student.js";
import dbConnect from "../../utils/dbconnect.js";

/**
 * @swagger
 * /student:
 *   post:
 *     summary: Get student data
 *     description: Retrieves student data based on email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the student
 *     responses:
 *       200:
 *         description: Successfully retrieved student data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Student ID
 *                 studentEmail:
 *                   type: string
 *                   description: Email of the student
 *                 subjects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       subjectName:
 *                         type: string
 *                         description: Name of the subject
 *                       subjectModel:
 *                         type: string
 *                         description: Model assigned to the subject
 *                       ABC_Testing:
 *                         type: boolean
 *                         description: Whether ABC testing is enabled
 *                       survey:
 *                         type: boolean
 *                         description: Whether survey is completed
 *                       md5Prompt:
 *                         type: string
 *                         description: MD5 hash of the prompt
 *                       prompt:
 *                         type: string
 *                         description: Prompt used for generating questions
 *       400:
 *         description: Email is required
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

export async function POST(req) {
	try {
		const body = await req.json(); // Extrae el cuerpo del request
		const { email } = body;

		if (!email) {
			return new Response(
				JSON.stringify({ message: "Email is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		await dbConnect();
		const student = await Student.findOne({ studentEmail: email });

		if (!student) {
			return new Response(
				JSON.stringify({ message: "Student not found" }),
				{
					status: 404,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		return new Response(JSON.stringify(student), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching student data:", error);
		return new Response(JSON.stringify({ message: "Server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
