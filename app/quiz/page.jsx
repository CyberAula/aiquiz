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
import Header from "../components/ui/Header"
import { HiArrowLeft } from 'react-icons/hi2'
import Footer from "../components/ui/Footer"


function QuizPageFun() {
    const { t, i18n } = useTranslation();
    const params = useSearchParams()
    const router = useRouter()

    const topic = params.get('topic')
    const difficulty = params.get('difficulty')
    const subTopic = params.get('subTopic')
    const numQuestions = Number(params.get('numQuestions'))
    const subject = params.get('subject')

    const [quiz, setQuiz] = useState([])
    const [isLoading, setIsLoading] = useState(true);

    const [numSubmitted, setNumSubmitted] = useState(0)
    const [numReported, setNumReported] = useState(0)
    const [numCorrect, setNumCorrect] = useState(0)
    const [progress, setProgress] = useState(0)
    const [responseStream, setResponseStream] = useState('')

    const [score, setScore] = useState(0)
    const [quizCompleted, setQuizCompleted] = useState(false)

    const [showInstructionsModal, setShowInstructionsModal] = useState(true);

    let subjectId = subject.toLowerCase();
    let textSubjectId = `text-${subjectId}-400`

    //barra del progreso
    const scaleX = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.002,
    })

    const handleGoBack = () => {
        router.push(`/${subject}`);
    }

    const handleFinish = () => {
        const params = new URLSearchParams({
            score: score.toString(),
            topic,
            difficulty,
            subTopic,
            numQuestions: numQuestions.toString(),
            subject
        });

        const qs = params.toString();

        router.push(`/end-screen?${qs}`);
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
                    topic,
                    difficulty,
                    subTopic,
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
                topic: topic,
                difficulty: difficulty,
                subTopic: subTopic,
                numQuestions: numQuestions,
                error: err.message,
                // cleanedResponse: cleanedResponse
            }
            const response = await fetch('/aiquiz/api/error-log', {
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
            if (numSubmitted > 0) {
                setScore(numCorrect / numSubmitted);
            }
            setQuizCompleted(true)
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
            <div>
                {/* renderiza barra de progreso */}
                <motion.div className='progress-bar' style={{ scaleX }} />

                {isLoading ?
                    <div className="bg-blue-200"><LoadingScreen responseStream={responseStream} /></div> :
                    <div className='container-layout'>
                        <div className='bg-white rounded-md pb-4'>
                            <Header />
                            <div className='margin-items-container flex justify-between gap-3 pb-5'>
                                <button className='btn-sm-icon btn-ghost flex'
                                    onClick={handleGoBack}>
                                    <HiArrowLeft sx={{ fontSize: 18 }} className='mt-1' />
                                    {t('quizpage.back')}
                                </button>
                                <button className='btn-sm btn-outline text-white'
                                    onClick={() => setShowInstructionsModal(true)}>
                                    🛈 {t('quizpage.instructions')}
                                </button>
                            </div>
                            <div className='pb-6 max-w-3xl mx-4 sm:mx-auto flex flex-col justify-center sm:w-3/4 md:w-3/5 xl:w-1/2'>
                                <h1
                                    className='text-3xl font-bold  text-left pt-3 pb-1.5 text-text text-pretty'
                                    style={{
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                    }}
                                // initial={{ opacity: 0, y: -100 }}
                                // animate={{ opacity: 1, y: 0 }}
                                // transition={{ duration: 0.8 }}
                                >
                                    {t('quizpage.testof')} {topic} {t('quizpage.about')} {subTopic}
                                </h1>

                                <p className='mb-6'>{t('quizpage.subjectof')} <span className={`${textSubjectId} font-bold`}> {subject} </span></p>
                                {/* recorre la pregunta*/}


                                {quiz?.map((question, index) => (
                                    <div className='mb-6 md:mb-12' key={index}>
                                        <Question
                                            numQuestions={numQuestions}
                                            question={question}
                                            order={index}
                                            key={index}
                                            addSubmission={addSubmission}
                                            addReport={addReport}
                                            setNumCorrect={setNumCorrect}
                                            topic={topic}
                                            subject={subject}
                                            subTopic={subTopic}
                                            difficulty={difficulty}
                                        />
                                    </div>
                                ))}

                                {quizCompleted && (
                                    <div className='text-center mt-0 mb-6'>
                                        <button className='btn-md rounded pointer-events-auto bg-blue text-white-500 font-bold btn-quizz fuente' onClick={handleFinish}>
                                            {t('quizpage.finish')}
                                        </button>
                                    </div>
                                )}

                            </div>
                            {/* Renderiza la caja de instrucciones solo cuando isLoading es false */}
                            {!isLoading && showInstructionsModal && (
                                <Instructions onClose={() => setShowInstructionsModal(false)} />
                            )}
                        </div>
                        <Footer />
                    </div>
                }
            </div>
        </div>

    )
}
export default function QuizPage() {
    return <Suspense>
        <QuizPageFun />
    </Suspense>
}