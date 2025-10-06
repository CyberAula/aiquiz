import fs from "fs";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import logger from "@utils/logger.js";

// Logger específico para LLM
const llmLogger = logger.create("LLM");

// Importación dinámica para Anthropic SDK para evitar problemas de shims
let Anthropic;
const loadAnthropic = async () => {
	if (!Anthropic) {
		const anthropicModule = await import("@anthropic-ai/sdk");
		Anthropic = anthropicModule.default;
	}
	return Anthropic;
};

const models = JSON.parse(fs.readFileSync("models.json"));

export async function getModelResponse(modelName, prompt) {
	llmLogger.debug(`Solicitando respuesta del modelo: ${modelName}`);

	// Debug: verificar configuración disponible
	console.log(
		"[LLM Debug] Modelos disponibles:",
		models.models.map((m) => m.name)
	);
	console.log("[LLM Debug] Buscando modelo:", modelName);

	const config = models.models.find((m) => m.name === modelName);

	if (!config) {
		llmLogger.error(`Modelo ${modelName} no encontrado`);
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
										description:
											"A list of quiz questions.",
										items: {
											type: "object",
											properties: {
												query: {
													type: "string",
													description:
														"The quiz question.",
												},
												choices: {
													type: "array",
													description:
														"A list of possible answers for the question.",
													items: {
														type: "string",
														description:
															"An answer choice.",
													},
												},
												answer: {
													type: "integer",
													description:
														"Index of the correct answer in the choices array.",
												},
												explanation: {
													type: "string",
													description:
														"A brief explanation of why the answer is correct.",
												},
											},
											required: [
												"query",
												"choices",
												"answer",
												"explanation",
											],
											additionalProperties: false,
										},
									},
								},
								required: ["questions"],
								additionalProperties: false,
							},
							strict: true,
						},
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
			throw new Error(
				`No se ha configurado el JSON para ${config.name}.`
			);
	}
}

async function OpenAI_API_Request(config, prompt, responseFormat) {
	// Priorizar variables de entorno sobre archivo de configuración
	const apiKey = config.api_key;

	if (!apiKey) {
		throw new Error(
			`Falta la ${config.name} API Key. Configure OPENAI_API_KEY en .env o en models.json`
		);
	}

	const openaiConfig = {
		apiKey: apiKey,
	};

	// Solo agregar organization si existe y no es null
	if (
		config.organization_id &&
		config.organization_id !== null &&
		config.organization_id !== "YOUR_OPENAI_ORG_ID"
	) {
		openaiConfig.organization = config.organization_id;
	}

	const openai = new OpenAI(openaiConfig);

	try {
		// console.log("--------------------------------------------------");
		// console.log("prompt being sent to OpenAI: ", JSON.stringify(prompt, null, 2));

		const response = await openai.chat.completions.create({
			model: config.model,
			messages: [{ role: "user", content: prompt }],
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
		llmLogger.error(`Error durante petición OpenAI`, {
			message: error.message,
			status: error.status,
			code: error.code,
			type: error.type,
			model: config.model,
			promptLength: prompt.length,
		});

		// Log adicional para debugging
		console.error("[OpenAI Error Details]:", {
			error: error.message,
			status: error.status,
			code: error.code,
			model: config.model,
			hasApiKey: !!config.api_key,
			apiKeyPrefix: config.api_key
				? config.api_key.substring(0, 10) + "..."
				: "none",
		});

		throw error;
	}
}

async function Anthropic_API_Request(config, prompt) {
	if (!config.api_key) {
		throw new Error(`Falta la ${config.name} API Key`);
	}

	const AnthropicClient = await loadAnthropic();
	const anthropic = new AnthropicClient({
		apiKey: config.api_key,
	});

	try {
		// console.log("--------------------------------------------------");
		// console.log("prompt being sent to Anthropic: ", JSON.stringify(prompt, null, 2));

		const response = await anthropic.messages.create({
			model: config.model,
			max_tokens: config.config.max_tokens,
			messages: [{ role: "user", content: prompt }],
			temperature: config.config.temperature,
		});

		const textResponse = response.content[0].text;

		// console.log("text response to prompt: ", textResponse);
		// console.log("--------------------------------------------------");

		return textResponse;
	} catch (error) {
		llmLogger.error(`Error durante petición Anthropic`, error);
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
								description: "The quiz question.",
							},
							choices: {
								type: SchemaType.ARRAY,
								description:
									"A list of possible answers for the question.",
								items: {
									type: SchemaType.STRING,
									description: "An answer choice.",
								},
							},
							answer: {
								type: SchemaType.INTEGER,
								description:
									"Index of the correct answer in the choices array.",
							},
							explanation: {
								type: SchemaType.STRING,
								description:
									"A brief explanation of why the answer is correct.",
							},
						},
						required: ["query", "choices", "answer", "explanation"],
					},
				},
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

		const result = await model.generateContent(`${prompt}`);

		// console.log("text response to prompt: ", result.response.text());
		// console.log("--------------------------------------------------");

		return result.response.text();
	} catch (error) {
		llmLogger.error(`Error durante petición Google`, error);
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
			messages: [{ role: "user", content: prompt }],
			model: config.model,
			response_format: { type: "json_object" },
			temperature: config.config.temperature,
			max_tokens: config.config.max_tokens,
		});

		// Procesa el contenido de la respuesta
		const textResponse = response.choices[0]?.message?.content;

		// console.log("text response to prompt: ", textResponse);
		// console.log("--------------------------------------------------");

		return textResponse;
	} catch (error) {
		llmLogger.error(`Error durante petición ${config.name}`, error);
		throw error;
	}
}
