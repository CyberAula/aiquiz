import { useEffect, useState } from 'react'

import { HiCheck, HiOutlineXMark } from 'react-icons/hi2'

const Question = ({ numQuestions, question, order, addSubmission, addReport, setNumCorrect, language, topic, difficulty }) => {
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

    // Post to /aiquiz/api/questions to save data
    const saveQuestion = async (choiceIndex, report) => {
      
      /*example data
      {
        "_id": ObjectId("5f3f8e3e3e3e3e3e3e3e3e3e"),
        "id": 394823782738,
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
        if(studentEmail == null || studentEmail == "" || studentEmail == "undefined" || studentEmail == "null") {
            console.log("NO EMAIL IN LOCALSTORAGE, WE ADD ANONYMOUS@EXAMPLE.COM");
            studentEmail = "anonymous@example.com";
        }

      const data = {};
        data.id = id;
        data.language = language;
        data.difficulty = difficulty;
        data.topic = topic;
        data.query = query;
        data.choices = choices;
        data.answer = answer;
        data.explanation = explanation;
        data.studentEmail = studentEmail;
        if(report) {
            data.studentReport = true;
            data.studentAnswer = selectedChoiceIndex; //if reported, we can use the state to keep what the user selected or -1 if nothing selected
        } else {
            data.studentReport = isSubmittedReport; //if not reported, we can use the state to keep if the user reported or not
            data.studentAnswer = choiceIndex;
        }       
        data.created_at = Date.now();
        data.updated_at = Date.now();
        console.log("data to save: ", data);
        //save to the database in server
        const response = await fetch('/aiquiz/api/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
    };  

    const renderChoices = () => {
        //console.log('renderChoices', choiceObjects);
        return choiceObjects?.map((choice, index) => {
            let style = ''

            style = choice.isSelected
                ? 'border-2 border-white-600/75 bg-cyan-600/20'
                : 'border-purple-500 hover:bg-cyan-600/10'

            let checkOrX = null

            if (isSubmitted) {
                if (index === selectedChoiceIndex) {
                    if (isCorrect()) {
                        style = 'border-2 border-emerald-300 bg-emerald-300/10'
                        checkOrX = (
                            <div>
                                <HiCheck size={30} color='#6ee7b7' />
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
                    style = 'border-emerald-300 bg-emerald-300/10'
                    checkOrX = (
                        <div>
                            <HiCheck size={30} color='#6ee7b7' />
                        </div>
                    )
                }
            }

            return (
                <div
                    key={index}
                    className={`w-full p-4 text-left border rounded cursor-pointer ${style} flex items-center justify-between`}
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
          ? 'pointer-events-none bg-black'
          : 'pointer-events-auto bg-black bg-opacity-50 text-pink-500 border-2 border-pink-700 font-bold hover:bg-pink-400/40';
      return style;
    };

    const submitButtonStyles = () => {
      let style = isSelected
          ? 'pointer-events-auto bg-blue text-white-500 border-2 border-white-700 font-bold hover:bg-blue-400/40'
          : 'pointer-events-auto bg-black bg-opacity-50 text-blue-500 border-2 border-blue-700 font-bold hover:bg-blue-400/40';
        style = isSubmitted
          ? 'pointer-events-none bg-black'
          : style
      return style
  };

    return (
        <div className='max-w-3xl mx-auto'>
        <h2 className='text-sm font-semibold text-pink-300/80' style={{ color: '#86efac'}}>
          Pregunta {order + 1}/{numQuestions} 
        </h2>
        <div className='border border-gray-500/0 rounded'>
          <div className='py-2 mt-2 text-xl'>{query}</div>
          <div className='grid gap-2 mt-4'>{renderChoices()}</div>
          <div className='flex flex-col items-center mt-2 items'>
      
          <div className='flex-col-mobile'>
              {/* botón de enviar */}
              <button onClick={() => { handleAnswerSubmit(); }} className={`mt-2 px-6 py-3 rounded ${submitButtonStyles()} fuente`}            >
                {isSubmitted ? '¡Contestada! ✔️' : 'Responder'}
              </button>            
              
              {/* botón de reporte */}                               
              <button onClick={() => {handleReport()}}   className={`mt-2 px-6 py-3 rounded ${submitButtonReportStyles()} fuente`}   >
                  {!isSubmittedReport ? "Reportar pregunta incorrecta": "Pregunta Reportada! ✔️" }
              </button>
          </div>                
           
              {/* Nuevo botón de explicar */}
              {((isSubmitted && isCorrect()) ) && (
              <div className='mt-2 p-4 rounded bg-stone-700/50'>
                <h3 className='text-emerald-300/60 text-sm font-bold fuente'>
                  Explicación
                </h3>
                <p className='mt-2 text-sm font-light'>{explanation}</p>
              </div>
             )}

          </div>
          {(isSubmitted && !(isCorrect())) && (
            <div className='mt-2 p-4 rounded bg-stone-700/50'>
              <h3 className='text-emerald-300/60 text-sm font-bold fuente'>
                Explicación
              </h3>
              <p className='mt-2 text-sm font-light'>{explanation}</p>
            </div>
          )}
        </div>
      </div>
    )
}
export default Question


