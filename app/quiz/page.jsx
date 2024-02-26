'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, useSpring } from 'framer-motion'
import LoadingScreen from '../components/LoadingScreen'
import Question from '../components/Question'
import Instructions from '../components/Instructions';
import 'highlight.js/styles/atom-one-dark.css'


const QuizPage = () => {
    const params = useSearchParams()
    const router = useRouter()

    const language = params.get('language')
    const difficulty = params.get('difficulty')
    const topic = params.get('topic')
    const numQuestions = Number(params.get('numQuestions'))
    const subject = params.get('subject')
    let studentEmail = '';

    const [quiz, setQuiz] = useState([]) 
    const [isLoading, setIsLoading] = useState(true);

    const [numSubmitted, setNumSubmitted] = useState(0)
    const [numReported, setNumReported] = useState(0)
    const [numCorrect, setNumCorrect] = useState(0)

    const [progress, setProgress] = useState(0)

    const [responseStream, setResponseStream] = useState('')

    const [showInstructionsModal, setShowInstructionsModal] = useState(true);
 

    //barra del progreso
    const scaleX = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.002,
    })

    const handlePlayAgain = () => {
        router.push(`/${subject}`);
    }

    const generateQuestions = async () => {
        let responseText = ''

        try {
            console.log('fetching questions for student: ', studentEmail)
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    difficulty,
                    topic,
                    numQuestions,
                    studentEmail
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }

            console.log('Respuesta del servidor:', response);

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

            // streaming way
            let cleanedResponse = responseText.replace(/\n/g, '');
            //replace ```json and ``` with nothing (Sometimes the response is wrapped in ```json and ``` which is not valid JSON)
            cleanedResponse = cleanedResponse.replace(/```json/g, '').replace(/```/g, '');
            let jsonResponse = JSON.parse(cleanedResponse)
            const allQuestions = jsonResponse.questions; 
            console.log('allQuestions', allQuestions);
        
            // Ajustar el número de preguntas mostradas en el cuestionario
            const questionsToShow = allQuestions.slice(0, numQuestions);
            setQuiz(questionsToShow); // Establecer el estado de quiz con las preguntas a mostrar                
        } catch (err) {
            console.log('Quiz Page:', err)
        } finally {
            setIsLoading(false)
            // console.log('done loading')
        }
    }

    useEffect(() => {
        console.log('useEffect called. Getting student email and generating questions...');       
        console.log('loading...');
        setIsLoading(true); 

        studentEmail = window.localStorage.getItem('student_email');
        if(studentEmail == null || studentEmail == "" || studentEmail == "undefined" || studentEmail == "null") {
            console.log("NO EMAIL IN LOCALSTORAGE, WE ADD ANONYMOUS@EXAMPLE.COM");
            studentEmail = "anonymous@example.com";
        }
        console.log('studentEmail: ', studentEmail);

        generateQuestions();
    }, [])
    

    useEffect(() => {
        //progreso
        setProgress(numSubmitted / numQuestions)

        //si todas son enviadas ----> end-screen
        //check that quiz array has all elements either submitted or reported
        if( quiz.length > 0 && quiz.every((question) => question.submitted == true || question.reported == true ) ) {
            const score = numCorrect / numSubmitted;
            router.push(`/end-screen?score=${score}&subject=${subject}`);
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
          {/* renderiza barra de progreso */}
          <motion.div className='progress-bar' style={{ scaleX }} />
    
          {isLoading ? <><LoadingScreen responseStream={responseStream} /></>:<div className='pt-12'>
                <div className='flex-col-mobile'>
                    <button  className='inline-block border-2 border-purple-400 rounded text-purple-400 text-center uppercase text-lg font-semibold mx-auto mt-8 px-6 py-2 hover:bg-red-400/40 hover:border-red-400 hover:text-white duration-75 active:bg-red-600 fuente'
                        onClick={handlePlayAgain}>
                        « Volver  
                    </button>
                    <button className='inline-block border-2 border-purple-400 rounded text-purple-400 text-center uppercase text-lg font-semibold mx-auto mt-8 ml-4 px-6 py-2 hover:bg-yellow-400/40 hover:border-yellow-400 hover:text-white duration-75 active:bg-yellow-600 fuente'
                        onClick={() => setShowInstructionsModal(true)}>
                        🛈 Instrucciones
                    </button>
                    </div>
                <motion.h1
                className='text-4xl font-bold mb-8 text-center border rounded mx-auto p-4 fuente'
                style={{
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent', 
                    borderColor: '#86efac', 
                    borderWidth: '2px', 
                    backgroundImage: `linear-gradient(45deg, #86efac, #86efac)`, 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)', 
                }}
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                >
                ¡Test de {language} sobre {topic}!
                </motion.h1>
              {/* recorre la pregunta*/}
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
      )
}
export default QuizPage