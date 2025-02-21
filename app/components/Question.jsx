import { useEffect, useState } from 'react'
import { HiCheck, HiOutlineXMark } from 'react-icons/hi2'
import nextConfig from '../../next.config';
import urljoin from 'url-join';
import { useTranslation } from "react-i18next";
import CheckOutlined from "@mui/icons-material/CheckOutlined";


const basePath = nextConfig.basePath || '';

const Question = ({ numQuestions, question, order, addSubmission, addReport, setNumCorrect, language, subject, topic, difficulty }) => {
    const { t, i18n } = useTranslation();

    //console.log('order:', order);
    //console.log('question:', question);

    //random id to identify the question in the db and not use the query
    const [id, setId] = useState(Math.floor(Math.random() * 1000000000));

    const { query, choices, answer, explanation } = question
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isExplained, setIsExplained] = useState(false)
    const [isSelected, setIsSelected] = useState(false)
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(-1)
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Nuevo
    const [isSubmittedReport, setIsSubmittedReport] = useState(false);

    //console.log("choices:", choices);
    let newChoiceObjects = choices.map((choice) => ({
        text: choice,
        isSelected: false
    }))
    //console.log("array map choices:", newChoiceObjects);
    const [choiceObjects, setChoiceObjects] = useState(newChoiceObjects);
    //console.log('choiceObjects:', choiceObjects);

    //opción correcta
    const isCorrect = () => {
        return Number(answer) === selectedChoiceIndex
    }

    //manejo de selección de opciones
    const handleChoiceSelect = (choiceIndex) => {
        if (isSubmitted) return
        console.log("is submitted")
        setSelectedChoiceIndex(choiceIndex)
        setIsSelected(true)
 
        setChoiceObjects((prevChoiceObjects) =>
            prevChoiceObjects.map((choice, index) => {
                return {
                    ...choice,
                    isSelected: choiceIndex === index ? true : false,
                 
                }
               
            })
        )

        // Almacena la respuesta seleccionada
        setSelectedAnswer(question.choices[choiceIndex]);
    }

    // Manejo de envío de respuestas
    const handleAnswerSubmit = async () => {
        if (isSubmitted || !isSelected) return;

        setIsSubmitted(true);
        addSubmission(order);
        const choiceIndex = choiceObjects.findIndex((choice) => choice.isSelected);
        setSelectedChoiceIndex(choiceIndex);

        if (isCorrect()) {
            setNumCorrect((prevNumCorrect) => prevNumCorrect + 1);
            setIsExplained(true);
        }
        //save to the database in server
        await saveQuestion(choiceIndex, false);
    };

    // Post to /api/questions to save data
    const saveQuestion = async (choiceIndex, report) => {

        /*example data
        {
          "_id": ObjectId("5f3f8e3e3e3e3e3e3e3e3e3e"),
          "id": 394823782738,
          "subject": "CORE",
          "language": "JavaScript",
          "difficulty": "intermedio",
          "topic": "asincronía",
          "query": "¿Qué método se utiliza para ejecutar una función después de cierto tiempo en JavaScript?",
          "choices": [
              "setTimeout()",
              "wait()",
              "delay()",
              "executeAfter()"
          ],
          "answer": 0,
          "explanation": "El método setTimeout() se utiliza en JavaScript para ejecutar una función después de cierto tiempo, permitiendo así la programación asíncrona y el manejo de tareas diferidas en el tiempo.",
          "studentEmail": "pepe@alumnos.upm.es",
          "studentAnswer": 0
          "studentReport": false
          }*/
        let studentEmail = window.localStorage.getItem('student_email');
        if (studentEmail == null || studentEmail == "" || studentEmail == "undefined" || studentEmail == "null") {
            console.log("NO EMAIL IN LOCALSTORAGE, WE ADD ANONYMOUS@EXAMPLE.COM");
            studentEmail = "anonymous@example.com";
        }



        // Obtenemos el llmModel, el ABC_Testing, el hash del prompt y el prompt del estudiante
        let llmModel = 'undefined';
        let ABC_Testing = false;
        let md5Prompt = '';
        let prompt = '';

        const urlStudent = urljoin(basePath, `/api/student`);
        const responseStudent = await fetch(urlStudent, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: studentEmail }),
        });

        if (!responseStudent.ok) {
            console.error('Failed to fetch student data');
            return;
        }

        const student = await responseStudent.json();
        const subjectData = student.subjects.find(s => s.subjectName === subject);

        if (subjectData) {
            llmModel = subjectData.subjectModel;
            ABC_Testing = subjectData.ABC_Testing;
            md5Prompt = subjectData.md5Prompt;
            prompt = subjectData.prompt;
        }

        
        //estructura de datos a guardar
        const data = {};
        data.id = id;
        data.subject = subject;
        data.language = language;
        data.difficulty = difficulty;
        data.topic = topic;
        data.query = query;
        data.choices = choices;
        data.answer = answer;
        data.explanation = explanation;
        data.studentEmail = studentEmail;
        data.llmModel = llmModel;
        data.ABC_Testing = ABC_Testing;
        data.md5Prompt = md5Prompt;
        data.prompt = prompt;
        if (report) {
            data.studentReport = true;
            data.studentAnswer = selectedChoiceIndex; //if reported, we can use the state to keep what the user selected or -1 if nothing selected
        } else {
            data.studentReport = isSubmittedReport; //if not reported, we can use the state to keep if the user reported or not
            data.studentAnswer = choiceIndex;
        }
        console.log("data to save: ", data);

        // Save to the database in server
        const url = urljoin(basePath, '/api/answer');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            console.error("Failed to save question", await response.text());
        }
    };

    const renderChoices = () => {
        //console.log('renderChoices', choiceObjects);
        return choiceObjects?.map((choice, index) => {
            let style = ''

            style = choice.isSelected
                ? 'border-2 border-blue-500 bg-cyan-600/20'
                : 'border-gray-400 hover:bg-cyan-600/10'

            let checkOrX = null

            if (isSubmitted) {
                if (index === selectedChoiceIndex) {
                    if (isCorrect()) {
                        style = ' border-2 border-emerald-500 bg-emerald-300/30  '
                        checkOrX = (
                            <div>
                                <HiCheck size={30} className='text-emerald-500'/>
                            </div>
                        )
                    } else {
                        style = 'border-2 border-red-400 bg-red-400/10'
                        checkOrX = (
                            <div>
                                <HiOutlineXMark size={30} color='#f87171' />
                            </div>
                        )
                    }
                }
            }

            if (isExplained) {
                if (index === Number(answer)) {
                    style = 'border-2 border-emerald-500 bg-emerald-300/30'
                    checkOrX = (
                        <div>
                            <HiCheck size={30} className='text-emerald-500' />
                        </div>
                    )
                }
            }

            return (
                <div
                    key={index}
                    className={`w-full px-4 py-3 text-left border rounded cursor-pointer ${style} flex items-center justify-between`}
                    onClick={() => handleChoiceSelect(index)}
                >
                    <pre className=' whitespace-pre-wrap'>
                        {/* <code>{choice.text}</code> */}
                        {/* <code className=' bg-opacity-0 '>{choice.text}</code> */}
                        <code
                            className='rounded'
                            style={{
                                padding: 5,
                                backgroundColor: 'transparent',
                            }}
                        >
                            {choice.text}
                        </code>
                    </pre>

                    {checkOrX}
                </div>
            )
        })
    }    


    const handleReport = async () => {
      if (isSubmittedReport) 
      {
        console.log("Question already reported");
        return;
      }
      setIsSubmittedReport(true);
      addReport(order);
      await saveQuestion(-1, true);
    }

    const submitButtonReportStyles = () => {
      let style = isSubmittedReport
          ? 'pointer-events-none font-bold text-green-800'
          : 'pointer-events-auto bg-opacity-50 btn-report font-bold';
      return style;
    };

    const submitButtonStyles = () => {
      let style = isSelected
          ? 'pointer-events-auto bg-blue text-white-500 font-bold btn-quizz'
          : 'pointer-events-auto btn-quizz-inactive';
        style = isSubmitted
          ? 'pointer-events-none bg-blue-950 text-white'
          : style
      return style
  };

    return (
        <div className=' flex'>
       <div className='flex flex-col w-full'>
        <h2 className='text-sm font-semibold w-fit bg-blue-100 rounded px-1.5 py-0.5 inline-block text-blue-600'>
          {t('question.question')} {order + 1}/{numQuestions} 
        </h2>
        <div className='border border-gray-500/0 rounded w-full'>
          <div className='py-2 text-lg font-medium'>{query}</div>
          <div className='grid gap-2 mt-1'>{renderChoices()}</div>
          <div className='flex flex-col items-start mt-2 items'>
          <div className=' flex flex-col sm:flex-row w-full gap-1 md:gap-3 mt-3'>
              {/* botón de enviar */}
              <button onClick={() => { handleAnswerSubmit(); }} className={ `btn-md rounded ${submitButtonStyles()} fuente` }            >
          
                { isSubmitted ? <span> {t("question.answered")} <CheckOutlined className="mb-1 text-blue-300" /> </span> : t('question.answer')  }
            
              </button>            
              
              {/* botón de reporte */}                               
              <button onClick={() => {handleReport()}}   className={`btn-xs rounded ${submitButtonReportStyles()} fuente`}   >
                  {!isSubmittedReport ? t('question.report'): <span className="text-xs gap-1">{t('question.reported')} <CheckOutlined className="mb-1" sx = {{fontSize: 16}} />  </span>}
              </button>
          </div>                
           
              {/* Nuevo botón de explicar */}
              {((isSubmitted && isCorrect()) ) && (
              <div className='mt-4 p-4 rounded bg-blue-200/50 border border-blue-400'>
                <h3 className='text-gray-800 text-sm uppercase  font-bold fuente'>
                {t('question.explanation')}
                </h3>
                <p className='mt-2 text-[15px] font-normal text-text text-pretty'>{explanation}</p>
              </div>
             )}

          </div>
          </div>
          {(isSubmitted && !(isCorrect())) && (
            <div className='mt-4 p-4 rounded bg-blue-200/50 border border-blue-400'>
               <h3 className='text-blue-950 text-sm uppercase  font-bold fuente'>
               {t('question.explanation')}
                </h3>
                <p className='mt-2 text-[15px] font-normal text-text text-pretty'>{explanation}</p>
             
            </div>
          )}
        </div>
      </div>
    )
}
export default Question