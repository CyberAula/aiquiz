import fs from "fs";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleGenAI, Type } from "@google/genai";
import { calculateMaxTokens } from "./tokenLimits.js";
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

export async function getModelResponse(modelName, prompt, numQuestions) {
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

	// Límite de salida según el número de preguntas, con reserva para los modelos que razonan
	const maxTokens = calculateMaxTokens(config, Number(numQuestions) || 1);

	switch (true) {
		case config.name.startsWith("OpenAI_GPT"):
			// Salida estructurada con esquema en los modelos actuales; solo los GPT-3.x no la admiten
			const responseFormat = !config.name.startsWith("OpenAI_GPT_3")
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
			return await OpenAI_API_Request(config, prompt, responseFormat, maxTokens);

		case config.name.startsWith("Anthropic"):
			return await Anthropic_API_Request(config, prompt, maxTokens);

		case config.name.startsWith("Google_Generative"):
			// Gemini por Vertex AI (cuenta de servicio en "vertex"); se mantiene el acceso antiguo por "api_key"
			return config.vertex
				? await Google_Vertex_API_Request(config, prompt, maxTokens)
				: await Google_API_Request(config, prompt, maxTokens);

		case config.name.startsWith("Groq"):
			return await Groq_API_Request(config, prompt, maxTokens);

		default:
			throw new Error(
				`No se ha configurado el JSON para ${config.name}.`
			);
	}
}

async function OpenAI_API_Request(config, prompt, responseFormat, maxTokens) {
	// Priorizar variables de entorno sobre archivo de configuración
	const apiKey = config.api_key;

	if (!apiKey) {
		throw new Error(
			`Falta la ${config.name} API Key. Configúrela en el campo api_key de models.json`
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

		const requestParams = {
			model: config.model,
			messages: [{ role: "user", content: prompt }],
			response_format: responseFormat,
			max_completion_tokens: maxTokens,
		};

		// Los modelos de razonamiento (GPT-5.x) rechazan temperature/top_p por el mero hecho de
		// estar presentes, y fallan con frequency_penalty/presence_penalty: solo se envían si
		// están definidos en models.json, para no romper modelos anteriores
		if (config.config.temperature != null) {
			requestParams.temperature = config.config.temperature;
		}
		if (config.config.frequency_penalty != null) {
			requestParams.frequency_penalty = config.config.frequency_penalty;
		}
		if (config.config.presence_penalty != null) {
			requestParams.presence_penalty = config.config.presence_penalty;
		}

		if (config.config.reasoning_effort) {
			requestParams.reasoning_effort = config.config.reasoning_effort;
		}

		const response = await openai.chat.completions.create(requestParams);

		if (response.choices[0].finish_reason === "length") {
			console.warn(`[llmManager] Respuesta de ${config.name} truncada por límite de tokens (max_completion_tokens=${maxTokens}).`);
		}

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

async function Anthropic_API_Request(config, prompt, maxTokens) {
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
			max_tokens: maxTokens,
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

async function Google_API_Request(config, prompt, maxTokens) {
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
			maxOutputTokens: maxTokens,
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

async function Google_Vertex_API_Request(config, prompt, maxTokens) {
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
			scopes: ["https://www.googleapis.com/auth/cloud-platform"],
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
							description: "The quiz question.",
						},
						choices: {
							type: Type.ARRAY,
							description: "A list of possible answers for the question.",
							items: {
								type: Type.STRING,
								description: "An answer choice.",
							},
						},
						answer: {
							type: Type.INTEGER,
							description: "Index of the correct answer in the choices array.",
						},
						explanation: {
							type: Type.STRING,
							description: "A brief explanation of why the answer is correct.",
						},
					},
					required: ["query", "choices", "answer", "explanation"],
				},
			},
		},
		required: ["questions"],
	};

	try {
		const generationConfig = {
			responseMimeType: "application/json",
			responseSchema: responseSchema,
			maxOutputTokens: maxTokens,
		};

		// Google ha deprecado temperature/top_p/top_k y thinking_budget: los próximos modelos
		// devolverán 400 INVALID_ARGUMENT si se envían. Nunca se mandan aunque estén en models.json.
		const deprecatedParams = ["temperature", "top_p", "top_k", "thinking_budget"].filter(
			(p) => config.config[p] != null
		);
		if (deprecatedParams.length > 0) {
			console.warn(`[llmManager] ${config.name}: se ignoran parámetros deprecados por Gemini (${deprecatedParams.join(", ")}). Usa thinking_level en models.json.`);
		}

		// thinking_level: "minimal" | "low" | "medium" | "high". Si no se define, se usa el valor por defecto del modelo
		if (config.config.thinking_level != null) {
			generationConfig.thinkingConfig = { thinkingLevel: config.config.thinking_level };
		}

		const result = await ai.models.generateContent({
			model: config.model,
			contents: prompt,
			config: generationConfig,
		});

		if (result.candidates?.[0]?.finishReason === "MAX_TOKENS") {
			console.warn(`[llmManager] Respuesta de ${config.name} truncada por límite de tokens (maxOutputTokens=${maxTokens}).`);
		}

		return result.text;
	} catch (error) {
		llmLogger.error(`Error durante petición Google (Vertex AI)`, error);
		throw error;
	}
}

async function Groq_API_Request(config, prompt, maxTokens) {
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
			max_tokens: maxTokens,
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
