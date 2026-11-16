// Límite de tokens de salida que se envía al proveedor del LLM (sin dependencias de los SDK,
// para poder usarlo desde llmManager.js, los tests y el script de integridad).

// Tokens estimados necesarios por cada pregunta generada (query + choices + answer + explanation).
// Holgura amplia sobre lo medido (~200-400 tokens visibles por pregunta), porque algunos prompts
// piden opciones más largas.
export const TOKENS_PER_QUESTION = 700;
// Margen adicional para el JSON envolvente y variabilidad del modelo
export const BASE_TOKENS_BUFFER = 500;
// Reserva para los tokens de razonamiento de los modelos que razonan (thinking_level / reasoning_effort).
// Cuentan contra el límite de salida y NO dependen del número de preguntas: con Gemini 3.5 Flash en
// thinking_level "medium" se han medido entre ~1.300 y ~3.900 por llamada, también con 2-3 preguntas.
// Sin esta reserva, con pocas preguntas el límite se quedaba en 4096 y el JSON salía truncado
// (sobre todo con el prompt longitud_equilibrada, que pide revisar y alargar los distractores).
// Es un tope, no un gasto: solo se pagan los tokens que realmente se generan.
export const REASONING_TOKENS_RESERVE = 8192;

export const isReasoningModel = (config) =>
    config.config.thinking_level != null || config.config.reasoning_effort != null;

// Calcula el límite de tokens de salida en función del número de preguntas solicitadas, sumando la
// reserva de razonamiento en los modelos que razonan. Usa el valor configurado en models.json como
// mínimo (nunca lo reduce).
// config: entrada del modelo en models.json ({ name, model, config: { max_tokens, ... } })
export function calculateMaxTokens(config, numQuestions) {
    const reasoningReserve = isReasoningModel(config) ? REASONING_TOKENS_RESERVE : 0;
    const estimated = (numQuestions || 1) * TOKENS_PER_QUESTION + BASE_TOKENS_BUFFER + reasoningReserve;
    return Math.max(config.config.max_tokens, estimated);
}
