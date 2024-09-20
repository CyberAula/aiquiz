import dbConnect from "../../utils/dbconnect.js";
import Question from '../../models/Question.js';
import { NextResponse } from 'next/server';

await dbConnect();

//POST /API/ANSWER
//api path to create a new answer or report "/api/answer" passing neccesary data (see POST in page.js)
export async function POST(request) { 
    try {
        const { id, subject, language, difficulty, topic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, created_at, updated_at } = await request.json();
        console.log("received params: ",id, subject, language, difficulty, topic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, created_at, updated_at);
        //check if question exists in database by id
        const questions = await Question.find({id: id});
        if(questions.length>0){
            console.log("Question already exists, we update it (maybe it was answered or reported)");
            const questionUpdate = await Question.updateOne({
                id: id},
                {studentEmail: studentEmail, studentAnswer: studentAnswer, studentReport: studentReport, updated_at: Date.now()});
            console.log("question updated: ",questionUpdate);
        } else {
            const newQuestion = new Question({ id, subject, language, difficulty, topic, query, choices, answer, explanation, studentEmail, studentAnswer, studentReport, created_at, updated_at });
            const savedQuestion = await newQuestion.save();
            console.log("Question created: ", savedQuestion);
        }
        return NextResponse.json({"msg":"question created"});

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}