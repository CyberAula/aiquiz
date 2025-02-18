import fs from 'fs';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import Groq from "groq-sdk";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const models = JSON.parse(fs.readFileSync('models.json'));

export async function getModelResponse(modelName, prompt) {
    const config = models.models.find(m => m.name === modelName);

    if (!config) {
        throw new Error(`Modelo ${modelName} no encontrado.`);
    }

    switch (true) {
        case config.name.startsWith("OpenAI_GPT"):
            const responseFormat = config.name.startsWith("OpenAI_GPT_4o")
                ? {
                    type: "json_schema",
                    json_schema: {
                        name: "quiz",
                        schema: {
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
                                        required: ["query", "choices", "answer", "explanation"],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ["questions"],
                            additionalProperties: false
                        },
                        strict: true
                    }
                }
                : { type: "json_object" };
            return await OpenAI_API_Request(config, prompt, responseFormat);

        case config.name.startsWith("Anthropic"):
            return await Anthropic_API_Request(config, prompt);

        case config.name.startsWith("Google_Generative"):
            return await Google_API_Request(config, prompt);

        case config.name.startsWith("Groq"):
            return await Groq_API_Request(config, prompt);

        default:
            throw new Error(`No se ha configurado el JSON para ${config.name}.`);
    }
}


async function OpenAI_API_Request(config, prompt, responseFormat) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const openai = new OpenAI({
        apiKey: config.api_key,
        organization: config.organization_id,
    });

    try {
        // console.log("--------------------------------------------------");
        // console.log("prompt being sent to OpenAI: ", JSON.stringify(prompt, null, 2));

        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: responseFormat,
            temperature: config.config.temperature,
            frequency_penalty: config.config.frequency_penalty,
            presence_penalty: config.config.presence_penalty,
            max_tokens: config.config.max_tokens,
            n: config.config.n,
        });

        const textResponse = response.choices[0].message.content;

        // console.log("text response to prompt: ", textResponse);
        // console.log("--------------------------------------------------");

        return textResponse;

    } catch (error) {
        console.error("Error during OpenAI request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }

}

async function Anthropic_API_Request(config, prompt) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const anthropic = new Anthropic({
        apiKey: config.api_key,
    });

    try {
        // console.log("--------------------------------------------------");
        // console.log("prompt being sent to Anthropic: ", JSON.stringify(prompt, null, 2));

        const response = await anthropic.messages.create({
            model: config.model,
            max_tokens: config.config.max_tokens,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.config.temperature,
        });

        const textResponse = response.content[0].text;

        // console.log("text response to prompt: ", textResponse);
        // console.log("--------------------------------------------------");

        return textResponse;

    } catch (error) {
        console.error("Error during Anthropic request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }


}

async function Google_API_Request(config, prompt) {
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
            maxOutputTokens: config.config.max_tokens,
            temperature: config.config.temperature,
        },
    });

    try {
        // console.log("--------------------------------------------------");
        // console.log("prompt being sent to Google: ", JSON.stringify(prompt, null, 2));

        const result = await model.generateContent(`${prompt}`,);

        // console.log("text response to prompt: ", result.response.text());
        // console.log("--------------------------------------------------");

        return result.response.text();

    } catch (error) {
        console.error("Error during Google request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }
}

async function Groq_API_Request(config, prompt) {
    if (!config.api_key) {
        throw new Error(`Falta la ${config.name} API Key`);
    }

    const groq = new Groq({ apiKey: config.api_key });

    try {
        // console.log("--------------------------------------------------");
        // console.log(`prompt being sent to ${config.name}:`, JSON.stringify(prompt, null, 2));

        // Llama a la API y procesa la respuesta
        const response = await groq.chat.completions.create({
            messages: [ 
                { role: "user", content: prompt, }, 
            ],
            model: config.model,
            response_format: {"type": "json_object"},
            temperature: config.config.temperature,
            max_tokens: config.config.max_tokens,
        });

        // Procesa el contenido de la respuesta
        const textResponse = response.choices[0]?.message?.content;

        // console.log("text response to prompt: ", textResponse);
        // console.log("--------------------------------------------------");

        return textResponse;

    } catch (error) {
        console.error(`Error during ${config.name} request: `, error);
        console.log("--------------------------------------------------");
        throw error;
    }
}


