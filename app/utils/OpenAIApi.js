import OpenAI from "openai";

// Verificar si existe la clave API OpenAi
if (!process.env.OPENAI_API_KEY) {
    throw new Error('Falta la OpenAI API Key');
}

// Inicializar el cliente OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION_ID,
});

// Función para hacer la solicitud a OpenAI y devolver la respuesta completa en JSON
export async function OpenAIResponse(payload) {

    try {
        console.log("--------------------------------------------------");
        // Log del payload que vamos a enviar
        console.log("Payload being sent to OpenAI: ", JSON.stringify(payload, null, 2));

        // Hacemos la solicitud usando la librería oficial
        const response = await openai.chat.completions.create({
            model: payload.model,
            messages: payload.messages,
            temperature: payload.temperature,
            frequency_penalty: payload.frequency_penalty,
            presence_penalty: payload.presence_penalty,
            max_tokens: payload.max_tokens,
            n: payload.n,
        });

        const textResponse = response.choices[0].message.content;

        // Log de la respuesta recibida
        console.log("text response to prompt: ", textResponse);
        console.log("--------------------------------------------------");
        
        return textResponse;

    } catch (error) {
        console.error("Error during OpenAI request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }
}