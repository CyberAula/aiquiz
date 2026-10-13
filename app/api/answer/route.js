import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';
import { NextResponse } from 'next/server';
import { computeStudentAnswerOriginal } from '../../utils/studyDesign.js';

await dbConnect();

//POST /API/ANSWER
//api path to create a new answer or report "/api/answer" passing neccesary data (see POST in page.js)
export async function POST(request) {
    try {
        const { id, subject, topic, difficulty, subTopic, query, choices, answer, correct, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, md5Prompt, prompt, pull_id, usageData, responseTime, studentResponseTime, modelId, modelConfig, numQuestionsRequested, numQuestionsReceived, estimatedCost, promptId, shuffled, originalChoices, originalAnswer, permutation, malformed } = await request.json();
        //console.log("received params: ",id, subject, topic, difficulty, subTopic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, prompt);

        //check if question exists in database by id
        const questions = await Question.find({id: id});
        if(questions.length>0){
            console.log("Question already exists, we update it (maybe it was answered or reported)");
            const update = {studentEmail: studentEmail, studentAnswer: studentAnswer, correct: correct, studentReport: studentReport};
            // Modo de estudio per_pull: respuesta en el orden original del modelo, con la permutación ya guardada
            const storedPermutation = questions[0].permutation;
            if (Array.isArray(storedPermutation) && storedPermutation.length > 0) {
                update.studentAnswerOriginal = computeStudentAnswerOriginal(storedPermutation, studentAnswer);
            }
            const questionUpdate = await Question.updateOne({
                id: id},
                update);
            console.log("question updated: ",questionUpdate);
        } else {
            // Modo de estudio per_pull: respuesta en el orden original del modelo (se calcula en el servidor)
            const studentAnswerOriginal = Array.isArray(permutation) && permutation.length > 0
                ? computeStudentAnswerOriginal(permutation, studentAnswer)
                : undefined;
            const newQuestion = new Question({ id, subject, topic, difficulty, subTopic, query, choices, answer, explanation, studentEmail, studentAnswer, correct, studentReport, llmModel, ABC_Testing, md5Prompt, prompt, pull_id, usageData, responseTime, studentResponseTime, modelId, modelConfig, numQuestionsRequested, numQuestionsReceived, estimatedCost, promptId, shuffled, originalChoices, originalAnswer, permutation, studentAnswerOriginal, malformed });
            const savedQuestion = await newQuestion.save();
            console.log("Question created: ", savedQuestion);
        }
        return NextResponse.json({"msg":"question created"});

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}