import { test } from 'node:test';
import assert from 'node:assert/strict';

import { calculateMaxTokens, REASONING_TOKENS_RESERVE, TOKENS_PER_QUESTION, BASE_TOKENS_BUFFER } from '../app/utils/tokenLimits.js';

// Configuraciones de ejemplo con la misma forma que models.json (que no está en el repositorio)
const gemini = { name: 'Google_Generative_Flash', config: { max_tokens: 4096, thinking_level: 'medium' } };
const gpt = { name: 'OpenAI_GPT_5_Mini', config: { max_tokens: 4096, reasoning_effort: 'medium' } };
const noReasoning = { name: 'Groq_Llama', config: { max_tokens: 4096, temperature: 0.7 } };

test('modelos que razonan: preguntas x 700 + 500 + reserva de razonamiento', () => {
    assert.equal(calculateMaxTokens(gemini, 5), 12192);
    assert.equal(calculateMaxTokens(gemini, 20), 22692);
    assert.equal(calculateMaxTokens(gpt, 20), 20 * TOKENS_PER_QUESTION + BASE_TOKENS_BUFFER + REASONING_TOKENS_RESERVE);
});

test('modelos sin razonamiento: sin reserva y nunca por debajo de max_tokens de models.json', () => {
    assert.equal(calculateMaxTokens(noReasoning, 5), 4096);   // 5 x 700 + 500 = 4000 < 4096
    assert.equal(calculateMaxTokens(noReasoning, 20), 14500);
});

test('sin número de preguntas se calcula para 1', () => {
    assert.equal(calculateMaxTokens(gemini, undefined), calculateMaxTokens(gemini, 1));
});
