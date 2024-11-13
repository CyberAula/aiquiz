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

const jsonResponseFormat = {
    "type": "json_schema",
    "json_schema": {
        "name": "quiz",
        "schema": {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "description": "A list of quiz questions.",
                    "items": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The quiz question."
                            },
                            "choices": {
                                "type": "array",
                                "description": "A list of possible answers for the question.",
                                "items": {
                                    "type": "string",
                                    "description": "An answer choice."
                                }
                            },
                            "answer": {
                                "type": "integer",
                                "description": "Index of the correct answer in the choices array."
                            },
                            "explanation": {
                                "type": "string",
                                "description": "A brief explanation of why the answer is correct."
                            }
                        },
                        "required": [
                            "query",
                            "choices",
                            "answer",
                            "explanation"
                        ],
                        "additionalProperties": false
                    }
                }
            },
            "required": [
                "questions"
            ],
            "additionalProperties": false
        },
        "strict": true
    }
};

// Función para hacer la solicitud a OpenAI y devolver la respuesta completa en JSON
export async function openAIResponse(payload) {

    try {
        console.log("--------------------------------------------------");
        // Log del payload que vamos a enviar
        console.log("Payload being sent to OpenAI: ", JSON.stringify(payload, null, 2));

        // Hacemos la solicitud usando la librería oficial
        const response = await openai.chat.completions.create({
            model: payload.model,
            messages: payload.messages,
            response_format: jsonResponseFormat,
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