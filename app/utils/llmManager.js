import fs from 'fs';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import Groq from "groq-sdk";
import { GoogleGenAI, Type } from "@google/genai";

const models = JSON.parse(fs.readFileSync('models.json'));

export async function getModelResponse(modelName, prompt) {
    const config = models.models.find(m => m.name === modelName);

    if (!config) {
        throw new Error(`Modelo ${modelName} no encontrado.`);
    }

    switch (true) {
        case config.name.startsWith("OpenAI_GPT"):
            const responseFormat = {
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
            };
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

        const requestParams = {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            response_format: responseFormat,
            temperature: config.config.temperature,
            frequency_penalty: config.config.frequency_penalty,
            presence_penalty: config.config.presence_penalty,
            max_completion_tokens: config.config.max_tokens,
        };

        if (config.config.reasoning_effort) {
            requestParams.reasoning_effort = config.config.reasoning_effort;
        }

        const startTime = Date.now();
        const response = await openai.chat.completions.create(requestParams);
        const responseTime = Date.now() - startTime;

        const textResponse = response.choices[0].message.content;

        const usage = {
            prompt_tokens: response.usage?.prompt_tokens || 0,
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
            reasoning_tokens: response.usage?.completion_tokens_details?.reasoning_tokens || 0,
        };

        console.log("HOLAAAAAAAAAAAAAA text response to prompt: ", textResponse);
        console.log("--------------------------------------------------");

        return { text: textResponse, usage, responseTime, modelId: config.model, modelConfig: config.config, tokenPrice: config.tokenPrice };

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

        const startTime = Date.now();
        const response = await anthropic.messages.create({
            model: config.model,
            max_tokens: config.config.max_tokens,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.config.temperature,
        });
        const responseTime = Date.now() - startTime;

        const textResponse = response.content[0].text;

        const usage = {
            prompt_tokens: response.usage?.input_tokens || 0,
            completion_tokens: response.usage?.output_tokens || 0,
            total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
            reasoning_tokens: 0,
        };

        // console.log("text response to prompt: ", textResponse);
        // console.log("--------------------------------------------------");

        return { text: textResponse, usage, responseTime, modelId: config.model, modelConfig: config.config, tokenPrice: config.tokenPrice };

    } catch (error) {
        console.error("Error during Anthropic request: ", error);
        console.log("--------------------------------------------------");
        throw error;
    }


}

async function Google_API_Request(config, prompt) {
    if (!config.vertex) {
        throw new Error(`Faltan las credenciales de Vertex AI (service account) para ${config.name}`);
    }
    if (!config.project) {
        throw new Error(`Falta el Google Cloud Project ID para ${config.name}`);
    }
    if (!config.location) {
        throw new Error(`Falta el Google Cloud Location para ${config.name}`);
    }

    const ai = new GoogleGenAI({
        vertexai: true,
        project: config.project,
        location: config.location,
        googleAuthOptions: {
            credentials: config.vertex,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        },
    });


    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                description: "A list of quiz questions.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: "The quiz question."
                        },
                        choices: {
                            type: Type.ARRAY,
                            description: "A list of possible answers for the question.",
                            items: {
                                type: Type.STRING,
                                description: "An answer choice."
                            }
                        },
                        answer: {
                            type: Type.INTEGER,
                            description: "Index of the correct answer in the choices array."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of why the answer is correct."
                        }
                    },
                    required: ["query", "choices", "answer", "explanation"],
                }
            }
        },
        required: ["questions"],
    };

    try {
        // console.log("--------------------------------------------------");
        // console.log("prompt being sent to Google: ", JSON.stringify(prompt, null, 2));

        const generationConfig = {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                maxOutputTokens: config.config.max_tokens,
                temperature: config.config.temperature,
            };

        if (config.config.thinking_budget != null) {
            generationConfig.thinkingConfig = { thinkingBudget: config.config.thinking_budget };
        }

        const startTime = Date.now();
        const result = await ai.models.generateContent({
            model: config.model,
            contents: prompt,
            config: generationConfig,
        });
        const responseTime = Date.now() - startTime;

        const usage = {
            prompt_tokens: result.usageMetadata?.promptTokenCount || 0,
            completion_tokens: result.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: result.usageMetadata?.totalTokenCount || 0,
            reasoning_tokens: result.usageMetadata?.thoughtsTokenCount || 0,
        };

        // console.log("text response to prompt: ", result.text);
        // console.log("--------------------------------------------------");

        return { text: result.text, usage, responseTime, modelId: config.model, modelConfig: config.config, tokenPrice: config.tokenPrice };

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

        const startTime = Date.now();
        const response = await groq.chat.completions.create({
            messages: [ 
                { role: "user", content: prompt, }, 
            ],
            model: config.model,
            response_format: {"type": "json_object"},
            temperature: config.config.temperature,
            max_tokens: config.config.max_tokens,
        });
        const responseTime = Date.now() - startTime;

        // Procesa el contenido de la respuesta
        const textResponse = response.choices[0]?.message?.content;

        const usage = {
            prompt_tokens: response.usage?.prompt_tokens || 0,
            completion_tokens: response.usage?.completion_tokens || 0,
            total_tokens: response.usage?.total_tokens || 0,
            reasoning_tokens: 0,
        };

        // console.log("text response to prompt: ", textResponse);
        // console.log("--------------------------------------------------");

        return { text: textResponse, usage, responseTime, modelId: config.model, modelConfig: config.config, tokenPrice: config.tokenPrice };

    } catch (error) {
        console.error(`Error during ${config.name} request: `, error);
        console.log("--------------------------------------------------");
        throw error;
    }
}


