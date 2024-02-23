import { OpenAIStream } from '../../utils/OpenAIStream';

// Verificar si existe la clave API OpenAi
if (!process.env.OPENAI_API_KEY) {
     throw new Error('Falta la OpenAI API Key');
}

// Define este archivo como una función de borde (Edge Function).
export const runtime = 'edge';

// Manejar las solicitudes HTTP POST
export async function POST(request) {
    try {
        const { language, difficulty, topic, numQuestions, query, choices, replacement } = await request.json();

        let firstSentence = '';
        let prompt = '';

        
        console.log("params: lang, difficulty, topic, numquestions: ", language, difficulty, topic, numQuestions);
        // Generación de preguntas
        firstSentence = `Dame ${numQuestions} preguntas de opción múltiple sobre ${topic} en el lenguaje de programación ${language}.`;
        prompt = `${firstSentence}. Las preguntas deben estar en un nivel ${difficulty} de dificultad. Devuelve tu respuesta completamente en forma de objeto JSON. El objeto JSON debe tener una clave denominada "questions", que es un array de preguntas. Cada pregunta del quiz debe incluir las opciones, la respuesta y una breve explicación de por qué la respuesta es correcta. No incluya nada más que el JSON. Las propiedades JSON de cada pregunta deben ser "query" (que es la pregunta), "choices", "answer" y "explanation". Las opciones no deben tener ningún valor ordinal como A, B, C, D ó un número como 1, 2, 3, 4. La respuesta debe ser el número indexado a 0 de la opción correcta. Haz una doble verificación de que cada respuesta correcta corresponda de verdad a la pregunta correspondiente.`;
        

        // Configurar parámetros de la solicitud a la API de OpenAI.
        const payload = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 1.0,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2048,
            stream: true,
            n: 1,
        };

        const apiKey = process.env.OPENAI_API_KEY;

        // Solicitud a la API de OpenAI
        const stream = await OpenAIStream(payload, apiKey);

        // Respuesta generada por la API de OpenAI.
        return new Response(stream);

    } catch (error) {        
        console.error('Error during request:', error.message);
        return new Response('Error during request', { status: 500 });
    }
}