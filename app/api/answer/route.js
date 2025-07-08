import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';
import { NextResponse } from 'next/server';

await dbConnect();

//POST /API/ANSWER
//api path to create a new answer or report "/api/answer" passing neccesary data (see POST in page.js)
export async function POST(request) { 
    try {
        const { id, subject, topic, difficulty, subTopic, query, choices, answer, correct, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, md5Prompt, prompt} = await request.json();
        //console.log("received params: ",id, subject, topic, difficulty, subTopic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, llmModel, ABC_Testing, prompt);
        
        //check if question exists in database by id
        const questions = await Question.find({id: id});
        if(questions.length>0){
            console.log("Question already exists, we update it (maybe it was answered or reported)");
            const questionUpdate = await Question.updateOne({
                id: id},
                {studentEmail: studentEmail, studentAnswer: studentAnswer, correct: correct, studentReport: studentReport});
            console.log("question updated: ",questionUpdate);
        } else {
            const newQuestion = new Question({ id, subject, topic, difficulty, subTopic, query, choices, answer, explanation, studentEmail, studentAnswer, correct, studentReport, llmModel, ABC_Testing, md5Prompt, prompt});
            const savedQuestion = await newQuestion.save();
            console.log("Question created: ", savedQuestion);
        }
        return NextResponse.json({"msg":"question created"});

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}