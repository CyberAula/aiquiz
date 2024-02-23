import { createParser } from 'eventsource-parser'

export async function OpenAIStream(payload, apiKey) {

//texto a binario y viceversa

const encoder = new TextEncoder() 
const decoder = new TextDecoder() 

//solicitud a la API de OpenA
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
         method: 'POST',
        body: JSON.stringify(payload),
    })

    const stream = new ReadableStream({ //interfaz de Streams de JavaScript

        async start(controller) { //se ejecuta cuando se comienza a consumir el stream

            function onParse(event) { //se llama cada vez que se parsea un evento del stream

                if (event.type === 'event') { 

                    const data = event.data

                    if (data === '[DONE]') {

                        controller.close() 
                        return
                    }

                    try {

                        //parsea los datos como JSON y extrae el contenido del texto de la respuesta generada por OpenAI.
                        const json = JSON.parse(data)
                        //console.log('json respuesta openAI:', json)
                        const text = json.choices[0].delta.content 
                        //console.log('texto respuesta openAI:', text)
                        //texto a binario
                        const queue = encoder.encode(text) 

                        //datos al controlador
                        controller.enqueue(queue)

                    } catch (e) {

                        controller.error(e)

                    }
                }
            }

            const parser = createParser(onParse)

            for await (const chunk of res.body) {
                parser.feed(decoder.decode(chunk)) 
            }
        },
    })

    return stream

}

