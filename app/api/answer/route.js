import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";
import { NextResponse } from "next/server";

await dbConnect();

/**
 * @swagger
 * /answer:
 *   post:
 *     summary: Save answer or report
 *     description: Saves a student's answer to a question or reports a question as incorrect
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - subject
 *               - language
 *               - difficulty
 *               - topic
 *               - query
 *               - choices
 *               - answer
 *               - explanation
 *               - studentEmail
 *               - studentAnswer
 *               - studentReport
 *             properties:
 *               id:
 *                 type: number
 *                 description: Unique ID for the question
 *               subject:
 *                 type: string
 *                 description: Subject code (PRG, CORE, etc.)
 *               language:
 *                 type: string
 *                 description: Language of the question
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level
 *               topic:
 *                 type: string
 *                 description: Topic of the question
 *               query:
 *                 type: string
 *                 description: The question text
 *               choices:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of possible answers
 *               answer:
 *                 type: number
 *                 description: Index of the correct answer
 *               explanation:
 *                 type: string
 *                 description: Explanation of the correct answer
 *               studentEmail:
 *                 type: string
 *                 description: Email of the student
 *               studentAnswer:
 *                 type: number
 *                 description: Index of the student's answer
 *               studentReport:
 *                 type: boolean
 *                 description: Whether the student reported the question as incorrect
 *               llmModel:
 *                 type: string
 *                 description: LLM model used for generating the question
 *               ABC_Testing:
 *                 type: boolean
 *                 description: Whether ABC testing is enabled
 *               md5Prompt:
 *                 type: string
 *                 description: MD5 hash of the prompt
 *               prompt:
 *                 type: string
 *                 description: Prompt used for generating the question
 *     responses:
 *       200:
 *         description: Successfully saved answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   description: Success message
 *       500:
 *         description: Server error
 */

//POST /API/ANSWER
//api path to create a new answer or report "/api/answer" passing neccesary data (see POST in page.js)
export async function POST(request) {
	try {
		const {
			id,
			subject,
			language,
			difficulty,
			topic,
			query,
			choices,
			answer,
			explanation,
			studentEmail,
			studentAnswer,
			studentReport,
			llmModel,
			ABC_Testing,
			md5Prompt,
			prompt,
		} = await request.json();
		//console.log("received params: ",id, subject, language, difficulty, topic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, prompt);

		//check if question exists in database by id
		const questions = await Question.find({ id: id });
		if (questions.length > 0) {
			console.log(
				"Question already exists, we update it (maybe it was answered or reported)"
			);
			const questionUpdate = await Question.updateOne(
				{
					id: id,
				},
				{
					studentEmail: studentEmail,
					studentAnswer: studentAnswer,
					studentReport: studentReport,
				}
			);
			console.log("question updated: ", questionUpdate);
		} else {
			const newQuestion = new Question({
				id,
				subject,
				language,
				difficulty,
				topic,
				query,
				choices,
				answer,
				explanation,
				studentEmail,
				studentAnswer,
				studentReport,
				llmModel,
				ABC_Testing,
				md5Prompt,
				prompt,
			});
			const savedQuestion = await newQuestion.save();
			console.log("Question created: ", savedQuestion);
		}
		return NextResponse.json({ msg: "question created" });
	} catch (error) {
		console.error("Error during request:", error.message);
		return new Response("Error during request", { status: 500 });
	}
}
