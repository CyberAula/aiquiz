import chalk from "chalk";

import dbConnect from "../../utils/dbconnect.js";
import Student from "../../models/Student.js";
import Question from "../../models/Question.js";

import aiquizConfig from "../../../aiquiz.config.js";

await dbConnect();

/**
 * @swagger
 * /survey:
 *   post:
 *     summary: Get survey status
 *     description: Checks if a student is eligible to take a survey and provides the survey URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentEmail
 *               - subject
 *             properties:
 *               studentEmail:
 *                 type: string
 *                 description: Email of the student
 *               subject:
 *                 type: string
 *                 description: Subject code (PRG, CORE, etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved survey status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 studentEmail:
 *                   type: string
 *                   description: Email of the student
 *                 survey:
 *                   type: boolean
 *                   description: Whether the student is eligible to take the survey
 *                 urlSurvey:
 *                   type: string
 *                   description: URL of the survey
 *       500:
 *         description: Server error
 */

export async function POST(request) {
	try {
		const { studentEmail, subject } = await request.json();

		let student = await Student.findOne({ studentEmail });
		let subjectIndex = await student?.subjects?.findIndex(
			(s) => s.subjectName === subject
		);
		let survey = student?.subjects[subjectIndex]?.survey;

		// URL de la encuesta con los parámetros del estudiante y la asignatura
		let urlSurvey = aiquizConfig.urlSurvey
			.replace(/studentEmail/g, encodeURIComponent(studentEmail))
			.replace(/subject/g, encodeURIComponent(subject));

		// En caso de que no haya contestado a la encuesta ya, se comprueba si ha contestado a 20 o más preguntas para mostrarla
		if (survey === false) {
			// Contamos cuantas preguntas hay en la base de datos que haya contestado el alumno y sean de esa asignatura
			let questionsAnswered = await Question.find({
				studentEmail,
				subject,
			}).countDocuments();
			console.log("questionsAnswered", questionsAnswered);
			// Si ha contestado a 20 o más preguntas, se le habilita la encuesta
			if (questionsAnswered >= aiquizConfig.numQuestionsForSurvey) {
				survey = true;
				student.subjects[subjectIndex].survey = true;
				await student.save();
			}
		} else {
			// En caso de ser true la encuesta significa que ya la ha contestado por tanto la cambiamos a false
			// para devolverlo y que no pueda volver a contestarla
			survey = false;
		}

		return new Response(
			JSON.stringify({ studentEmail, survey, urlSurvey }),
			{ status: 200 }
		);
	} catch (error) {
		console.error(
			chalk.red("Error in api/survey during request:", error.message)
		);
		return new Response(error.message, { status: 500 });
	}
}
