import { NextResponse } from 'next/server';


//POST /aiquiz/API/ERROR-LOG
//api path to create a new error log "/aiquiz/api/error-log" passing neccesary data (see POST in page.js)
//and save it to a file
export async function POST(request) { 
    try {
        const { date, studentEmail, topic, difficulty, subTopic, numQuestions, error, cleanedResponse } = await request.json();
        //get request body
        //const body = await request.text();
        console.log("received params: ",error, date, studentEmail, topic, difficulty, subTopic, numQuestions);
        //save error to file
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'errors.log');
        const errorFull = {
            date: date,
            studentEmail: studentEmail,
            topic: topic,
            difficulty: difficulty,
            subTopic: subTopic,
            numQuestions: numQuestions,
            error: error,
            cleanedResponse: cleanedResponse
        }
        fs.appendFile(filePath, JSON.stringify(errorFull), (err) => {
            if (err) throw err;
            console.log('Error saved to file');
        });
        return NextResponse.json({"msg":"error saved to file"});

    } catch (error) {
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}