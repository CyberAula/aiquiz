import fs from 'fs';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import LlamaAI from 'llamaai';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const models = JSON.parse(fs.readFileSync('models.json'));

export async function fetchResponse(modelName, payload) {
    const config = models.models.find(m => m.name === modelName);

    if (!config) {
        throw new Error(`Modelo ${modelName} no encontrado.`);
    }

    switch (config.name) {
        case "OpenAI_GPT":
            return await OpenAI_API_Request(config, payload);
        case "Anthropic_Claude":
            return await Anthropic_API_Request(config, payload);
        case "Google_Generative":
            return await Google_API_Request(config, payload);
        case "Facebook_Llama":
            return await Llama_API_Request(config, payload);
        default:
            throw new Error(`No se ha configurado el JSON para ${modelName}.`);
    }
}



async function OpenAI_API_Request(config, payload) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const openai = new OpenAI({
        apiKey: config.api_key,
        organization: config.organization_id,
    });

    try {
        console.log("--------------------------------------------------");
        console.log("Payload being sent to OpenAI: ", JSON.stringify(payload, null, 2));

        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [{ role: 'user', content: payload.message }],
            response_format: {
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
            },
            temperature: config.config.temperature,
            frequency_penalty: config.config.frequency_penalty,
            presence_penalty: config.config.presence_penalty,
            max_tokens: config.config.max_tokens,
            n: config.config.n,
        });

        const textResponse = response.choices[0].message.content;

        console.log("text response to prompt: ", textResponse);
        console.log("--------------------------------------------------");

        return textResponse;

    } catch (error) {
        console.error("Error during OpenAI request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }

}

async function Anthropic_API_Request(config, payload) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const anthropic = new Anthropic({
        apiKey: config.api_key,
        organization: config.organization_id,
    });

    try {
        console.log("--------------------------------------------------");
        console.log("Payload being sent to Anthropic: ", JSON.stringify(payload, null, 2));

        const response = await anthropic.messages.create({
            model: config.model,
            messages: [{ role: 'user', content: payload.message }],
            response_format: jsonResponseFormat,
            temperature: config.config.temperature,
            frequency_penalty: config.config.frequency_penalty,
            presence_penalty: config.config.presence_penalty,
            max_tokens: config.config.max_tokens,
            // n: config.config.n,
        });

        const textResponse = response.choices[0].message.content;

        console.log("text response to prompt: ", textResponse);
        console.log("--------------------------------------------------");

        return textResponse;

    } catch (error) {
        console.error("Error during Anthropic request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }


}

async function Google_API_Request(config, payload) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const google = new GoogleGenerativeAI(config.api_key);

    const schema = {
        description: "List of questions and answers.",
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                questions: {
                    type: SchemaType.ARRAY,
                    description: "A list of quiz questions.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            query: {
                                type: SchemaType.STRING,
                                description: "The quiz question."
                            },
                            choices: {
                                type: SchemaType.ARRAY,
                                description: "A list of possible answers for the question.",
                                items: {
                                    type: SchemaType.STRING,
                                    description: "An answer choice."
                                }
                            },
                            answer: {
                                type: SchemaType.INTEGER,
                                description: "Index of the correct answer in the choices array."
                            },
                            explanation: {
                                type: SchemaType.STRING,
                                description: "A brief explanation of why the answer is correct."
                            }
                        },
                        required: [
                            "query",
                            "choices",
                            "answer",
                            "explanation"
                        ],
                    }
                }
            },
            required: ["questions"],
        },
    };

    const model = google.getGenerativeModel({
        model: config.model,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    try {
        console.log("--------------------------------------------------");
        console.log("Payload being sent to Google: ", JSON.stringify(payload, null, 2));

        const result = await model.generateContent(`${payload.message}`,);

        console.log("text response to prompt: ", result.response.text());
        console.log("--------------------------------------------------");

        return result.response.text();

    } catch (error) {
        console.error("Error during Google request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }
}

async function Llama_API_Request(config, payload) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const llamaAPI = new LlamaAI(config.api_key);

    const apiRequestJson = {
        model: config.model,
        messages: [{ role: "user", content: payload.message }],
        functions: [
            {
                name: "get_questions",
                description: "Get a list of quiz questions.",
                parameters: {
                    type: "object",
                    properties: {
                        questions: {
                            type: "array",
                            description: "A list of quiz questions.",
                            items: {
                                type: "object",
                                properties: {
                                    query: {
                                        type: "string",
                                        description: "The quiz question."
                                    },
                                    choices: {
                                        type: "array",
                                        description: "A list of possible answers for the question.",
                                        items: {
                                            type: "string",
                                            description: "An answer choice."
                                        }
                                    },
                                    answer: {
                                        type: "integer",
                                        description: "Index of the correct answer in the choices array."
                                    },
                                    explanation: {
                                        type: "string",
                                        description: "A brief explanation of why the answer is correct."
                                    }
                                },
                                required: ["query", "choices", "answer", "explanation"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            }
        ],
        function_call: { name: "get_questions" },
        stream: false
    };

    try {
        console.log("--------------------------------------------------");
        console.log("Payload being sent to Llama:", JSON.stringify(apiRequestJson, null, 2));
        console.log("ApiKey:", config.api_key);

        // Llama a la API y procesa la respuesta
        const response = await llamaAPI.run(apiRequestJson);

        // Procesa el contenido de la respuesta
        const output = response?.choices?.[0]?.message;
        if (output?.function_call) {
            console.log("Function call returned:", output.function_call);
            return output.function_call.arguments; // Devuelve los argumentos de la llamada a función
        }

        console.log("Text response to prompt:", output?.content || "No content returned");
        console.log("--------------------------------------------------");

        return output?.content || null;

    } catch (error) {
        console.error("Error during Llama request:", error);
        console.log("--------------------------------------------------");
        throw error;
    }
}


