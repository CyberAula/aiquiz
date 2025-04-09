import dbConnect from "../../utils/dbconnect.js";
import { NextResponse } from "next/server";

import { language } from "../../constants/language";
import { subjectNames } from "../../constants/language";
import Question from "../../models/Question.js";

/**
 * @swagger
 * /dashboard:
 *   post:
 *     summary: Get dashboard data
 *     description: Retrieves statistics and insights about questions for a specific subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Subject code (PRG, CORE, etc.)
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 numQuestionsTotal:
 *                   type: number
 *                   description: Total number of questions
 *                 numQuestionsReported:
 *                   type: number
 *                   description: Number of reported questions
 *                 numQuestionsRight:
 *                   type: number
 *                   description: Number of correctly answered questions
 *                 numQuestionsWrong:
 *                   type: number
 *                   description: Number of incorrectly answered questions
 *                 response1:
 *                   type: string
 *                   description: AI-generated insights about student performance
 *       500:
 *         description: Server error
 */

//to get student track record
await dbConnect();

// Verificar si existe la clave API OpenAi
if (!process.env.OPENAI_API_KEY) {
	throw new Error("Falta la OpenAI API Key");
}

// Manejar las solicitudes HTTP POST
export async function POST(request) {
	console.log("POST request to /api/dashboard");
	try {
		const { subject } = await request.json();
		//get subject name
		const subjectName = subjectNames[subject];

		//first get data from database MongoDB

		//get all languages for subject
		const languages = language[subject];
		//transform languages into array of string of languages
		const languagesArray = languages.map((lang) => lang.label);
		//get all questions for the subject
		const numQuestionsTotal = await Question.countDocuments({
			language: { $in: languagesArray },
		});
		console.log("numQuestionsTotal: ", numQuestionsTotal);

		let questionsReported = await Question.find({
			language: { $in: languagesArray },
			studentReport: true,
		});

		console.log("numQuestionsReported: ", questionsReported.length);

		//get 20 questions reported randomly chosen from the array
		let samplequestionsReported = [];
		if (questionsReported.length > 20) {
			for (let i = 0; i < 20; i++) {
				let randomIndex = Math.floor(
					Math.random() * questionsReported.length
				);
				samplequestionsReported.push(questionsReported[randomIndex]);
			}
		} else {
			samplequestionsReported = questionsReported;
		}

		//count questions right, this is answer is the same as the student answer
		let questionsRight = await Question.find({
			language: { $in: languagesArray },
			studentReport: false,
			$expr: { $eq: ["$answer", "$studentAnswer"] },
		});
		console.log("numQuestionsRight: ", questionsRight.length);

		//get 20 questions right randomly chosen from the array
		let samplequestionsRight = [];
		if (questionsRight.length > 3) {
			for (let i = 0; i < 3; i++) {
				let randomIndex = Math.floor(
					Math.random() * questionsRight.length
				);
				samplequestionsRight.push(questionsRight[randomIndex]);
			}
		} else {
			samplequestionsRight = questionsRight;
		}

		//count questions wrong, this is answer is different from the student answer
		let questionsWrong = await Question.find({
			language: { $in: languagesArray },
			studentReport: false,
			$expr: { $ne: ["$answer", "$studentAnswer"] },
		});
		console.log("numQuestionsWrong: ", questionsWrong.length);

		//get 5 questions wrong randomly chosen from the array
		let samplequestionsWrong = [];
		if (questionsWrong.length > 5) {
			for (let i = 0; i < 5; i++) {
				let randomIndex = Math.floor(
					Math.random() * questionsWrong.length
				);
				samplequestionsWrong.push(questionsWrong[randomIndex]);
			}
		} else {
			samplequestionsWrong = questionsWrong;
		}

		//now ask AI to generate insights:
		let newPrompt = `De un banco de preguntas para la asignatura "${subjectName}" de un grado de ingeniería de la Universidad Politécnica de Madrid, se han respondido ${numQuestionsTotal} preguntas. `;
		//transform languages into array of string of languages
		const languagesNamesArray = languages.map((lang) => lang.label);
		newPrompt += `Las preguntas son sobre ${languagesNamesArray.join(
			", "
		)}. `;

		newPrompt += `Se han respondido ${samplequestionsRight.length} preguntas correctamente, que son las siguientes: `;
		for (let i = 0; i < samplequestionsRight.length; i++) {
			newPrompt += ` Pregunta ${i + 1}: "${
				samplequestionsRight[i].query
			}". `;
		}
		newPrompt += `Se han respondido ${samplequestionsWrong.length} preguntas incorrectamente, que son las siguientes: `;
		for (let i = 0; i < samplequestionsWrong.length; i++) {
			newPrompt += ` Pregunta ${i + 1}: "${
				samplequestionsWrong[i].query
			}". `;
		}
		newPrompt += ` Haz un pequeño reporte en inglés con titulos en h1 con el contenido "Evaluation Insights Report", subtitulos en h2, parrafos en <p className="pb-2"> por cada frase . Con el párrafo y el h2 dentro de un div con la clase de "conocimientos" indicando los "Knowledge of students" y otro div con la clase de "lagunas" con el h2 y p, de las "Knowledge gaps", es decir los temas donde más fallan. Ambos divs de "conocimientos" y "lagunas" envueltos en un div con la clase "reporte". Sin comillas ni html, importante.`;
		newPrompt += ` Añade el siguiente contenido a esta estructura de div: <div className="recomendaciones"> <h2>Recommendations for the teacher </h2> <p className="pb-2 max-w-[66ch]">(Aqui tienes que poner el contenido de los parrados)... </p> </div> . El contenido de los parrafos son consejos e ideas para ayudar a los estudiantes a mejorar sus conocimientos. `;

		console.log("newPrompt: ", newPrompt);
		// Configurar parámetros de la solicitud a la API de OpenAI.
		const payload = {
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: newPrompt }],
			temperature: 1.0,
			frequency_penalty: 0,
			presence_penalty: 0,
			max_tokens: 2048,
			n: 1,
		};
		// Log del payload que estamos por enviar
		console.log("Payload (dashboard) to send to OpenAI: ", payload);

		//const response1 = await OpenAIResponse(payload);

		// Log de la respuesta final
		console.log("Response (dashboard) from OpenAI: ", response1);

		// const response1 = await OpenAIResponse(payload, apiKey);
		/*
        let response2 = '';
        if(samplequestionsReported.length > 0){
            let newPrompt2 = `De un banco de preguntas para la asignatura "${subjectName}" de un grado de ingeniería de la Universidad Politécnica de Madrid, se han respondido ${numQuestionsTotal} preguntas. `;
            newPrompt2 += `Las preguntas son sobre ${languagesNamesArray.join(", ")}. `;
            newPrompt2 += `Los estudiantes además de responder las preguntas pueden reportar las incorrectas. `;
            newPrompt2 += `Se han reportado como incorrectas ${samplequestionsReported.length} preguntas, que son las siguientes: `;
            for (let i = 0; i < samplequestionsReported.length; i++) {
                newPrompt2 += ` Pregunta ${i+1}: "${samplequestionsReported[i].query}". `;
            }
            newPrompt2 += `Identifica los problemas principales en las preguntas reportadas. En formato markdown. `;
            console.log("newPrompt2: ", newPrompt2);
            // Configurar parámetros de la solicitud a la API de OpenAI.
            const payload2 = {
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: newPrompt2 }],
                temperature: 1.0,
                frequency_penalty: 0,
                presence_penalty: 0,
                max_tokens: 2048,
                n: 1,
            };
            // Log del payload que estamos por enviar
            console.log("Payload (dashboard) to send to OpenAI: ", payload2);

            response2 = await OpenAIResponse(payload2);

            // Log de la respuesta final
            console.log("Response (dashboard) from OpenAI: ", response2);
        }
        */

		//send info to user as response in json
		return NextResponse.json({
			numQuestionsTotal,
			numQuestionsReported: questionsReported.length,
			numQuestionsRight: questionsRight.length,
			numQuestionsWrong: questionsWrong.length,
			response1,
		});
	} catch (error) {
		console.error("Error during request:", error.message);
		return new Response("Error during request", { status: 500 });
	}
}
