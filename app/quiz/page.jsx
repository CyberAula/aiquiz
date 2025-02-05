'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, useSpring } from 'framer-motion'
import LoadingScreen from '../components/LoadingScreen'
import Question from '../components/Question'
import Instructions from '../components/Instructions';
import 'highlight.js/styles/atom-one-dark.css';
import { Suspense } from 'react'
import { useTranslation } from "react-i18next";


function QuizPageFun() {
    const { t, i18n } = useTranslation();
    const params = useSearchParams()
    const router = useRouter()

    const language = params.get('language')
    const difficulty = params.get('difficulty')
    const topic = params.get('topic')
    const numQuestions = Number(params.get('numQuestions'))
    const subject = params.get('subject')

    const [quiz, setQuiz] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    const [numSubmitted, setNumSubmitted] = useState(0)
    const [numReported, setNumReported] = useState(0)
    const [numCorrect, setNumCorrect] = useState(0)
    const [progress, setProgress] = useState(0)
    const [responseStream, setResponseStream] = useState('')

    const [showInstructionsModal, setShowInstructionsModal] = useState(true);

    let subjectId = subject.toLowerCase();
    let textSubjectId = `text-${subjectId}-400`

    //barra del progreso
    const scaleX = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.002,
    })

    const handlePlayAgain = () => {
        router.push(`/${subject}`);
    }

    const generateQuestions = async (studentEmail) => {
        let responseText = '';

        try {
            const response = await fetch('api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    difficulty,
                    topic,
                    numQuestions,
                    studentEmail,
                    subject
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            console.log("--------------------------------------------------");
            console.log('SERVER ANSWER', response);

            const data = response.body
            // console.log('data', data)
            if (!data) {
                console.log('WARNING, no data');
                return
            }

            const reader = data.getReader()
            const decoder = new TextDecoder()

            let done = false

            while (!done) {
                // console.log('not done')

                const { value, done: doneReading } = await reader.read()

                // console.log('doneReading', doneReading)

                done = doneReading
                const chunkValue = decoder.decode(value)

                responseText += chunkValue

                setResponseStream((prev) => prev + chunkValue)
            }
            
            // Ajusta el texto de la respuesta para que sea un JSON válido
            let jsonResponse = JSON.parse(responseText.replace(/^\[|\]$/g, '').trim());
            const allQuestions = jsonResponse.questions;
            console.log('All Questions ->', allQuestions);
            console.log("--------------------------------------------------");


            // Ajustar el número de preguntas mostradas en el cuestionario
            const questionsToShow = allQuestions.slice(0, numQuestions);
            setQuiz(questionsToShow); // Establecer el estado de quiz con las preguntas a mostrar                
        } catch (err) {
            console.log('Quiz Page:', err)
            //save error log to file
            const errorLog = {
                date: new Date().toISOString(),
                studentEmail: studentEmail,
                language: language,
                difficulty: difficulty,
                topic: topic,
                numQuestions: numQuestions,
                error: err.message,
                // cleanedResponse: cleanedResponse
            }
            const response = await fetch('/api/error-log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorLog),
            });
        } finally {
            setIsLoading(false)
            // console.log('done loading')
        }
    }

    useEffect(() => {
        console.log("--------------------------------------------------");
        console.log('useEffect called. Getting student email and generating questions...');
        console.log('loading...');
        setIsLoading(true);

        let studentEmail = window.localStorage.getItem('student_email');
        if (studentEmail == null || studentEmail == "" || studentEmail == "undefined" || studentEmail == "null") {
            console.log("NO EMAIL IN LOCALSTORAGE, WE ADD ANONYMOUS@EXAMPLE.COM");
            studentEmail = "anonymous@example.com";
        }
        console.log('studentEmail: ', studentEmail);
        console.log("--------------------------------------------------");


        generateQuestions(studentEmail);
    }, [])


    useEffect(() => {
        //progreso
        setProgress((numSubmitted + numReported) / numQuestions);

        //si todas son enviadas o reportadas ----> end-screen
        //check that quiz array has all elements either submitted or reported
        if (quiz.length > 0 && quiz.every((question) => question.submitted == true || question.reported == true)) {
            let score = 0;
            if (numSubmitted > 0) {
                score = numCorrect / numSubmitted;
            }
            console.log('call END SCREEN in 6 seconds with score', score);
            //do that in 6 seconds to give time for the last question to be reviewed in case the student failed it
            const timer = setTimeout(() => {
                router.push(`/end-screen?score=${score}&subject=${subject}`);
            }
                , 6000);
            return () => clearTimeout(timer);
        }
    }, [numSubmitted, numReported])


    useEffect(() => {
        //actualiza progreso
        scaleX.set(progress)
    }, [progress])

    //take note of the id of the submitted and or reported questions to see if the questionnaire is complete
    const addSubmission = (order) => {
        //clone quiz
        const newquiz = [...quiz];
        newquiz[order].submitted = true;
        setQuiz(newquiz);
        setNumSubmitted((prev) => prev + 1);
    }

    const addReport = (order) => {
        //setNumSubmitted((prev) => prev + 1)
        const newquiz = [...quiz];
        newquiz[order].reported = true;
        setQuiz(newquiz);
        setNumReported((prev) => prev + 1);
    }

    return (
        <div>
               <div className='max-w-3xl mx-auto'>
            {/* renderiza barra de progreso */}
            <motion.div className='progress-bar' style={{ scaleX }} />

            {isLoading ? <><LoadingScreen responseStream={responseStream} /></> : <div className='pt-12'>
                <div className='flex justify-start gap-3 border-b border-gray-400 pb-5'>
                    <button className='btn-sm btn-outline'
                        onClick={handlePlayAgain}>
                        « {t('quizpage.back')}
                    </button>
                    <button className='btn-sm bg-gray-600 text-white hover:bg-slate-900'
                        onClick={() => setShowInstructionsModal(true)}>
                        🛈 {t('quizpage.instructions')}
                    </button>
                </div>
             <div className='pb-6'>
                <h1
                    className='text-3xl font-bold  text-left pt-3 pb-1.5 text-text'
                    style={{
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                    }}
                    // initial={{ opacity: 0, y: -100 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // transition={{ duration: 0.8 }}
                >
                    {t('quizpage.testof')} {language} {t('quizpage.about')} {topic}
                </h1>
              
                <p>{t('quizpage.subjectof')} <span className={`${textSubjectId} font-bold`}> {subject} </span></p>
                {/* recorre la pregunta*/}
                </div>
                {quiz?.map((question, index) => (
                    <div className='mb-12' key={index}>
                        <Question
                            numQuestions={numQuestions}
                            question={question}
                            order={index}
                            key={index}
                            addSubmission={addSubmission}
                            addReport={addReport}
                            setNumCorrect={setNumCorrect}
                            language={language}
                            subject={subject}
                            topic={topic}
                            difficulty={difficulty}
                        />
                    </div>
                ))}
                 
            
                {/* Renderiza la caja de instrucciones solo cuando isLoading es false */}
                {!isLoading && showInstructionsModal && (
                    <Instructions onClose={() => setShowInstructionsModal(false)} />
                )}
            </div>
            }
        </div>
        </div>

    )
}
export default function QuizPage(){
    return <Suspense>
        <QuizPageFun />
    </Suspense>
}