import { test } from 'node:test';
import assert from 'node:assert/strict';

import { checkPullQuestionOrders, checkPullMaxOutputTokens } from '../scripts/lib/integrityChecks.mjs';

const types = (problems) => problems.map(p => p.type);

// ---------------------------------------------------------------- order

test('order: únicos y en rango, aunque falten preguntas sin responder', () => {
    assert.deepEqual(checkPullQuestionOrders([0, 1, 2, 3, 4], 5), []);
    assert.deepEqual(checkPullQuestionOrders([4, 0, 2], 5), []);
    assert.deepEqual(checkPullQuestionOrders([], 5), []);
});

test('order: repetido', () => {
    assert.deepEqual(types(checkPullQuestionOrders([0, 1, 1], 5)), ['order repetido dentro de un pull']);
});

test('order: fuera de rango', () => {
    assert.deepEqual(types(checkPullQuestionOrders([5], 5)), ['order fuera de rango [0, numQuestionsReceived - 1]']);
    assert.deepEqual(types(checkPullQuestionOrders([-1], 5)), ['order fuera de rango [0, numQuestionsReceived - 1]']);
    assert.deepEqual(types(checkPullQuestionOrders([1.5], 5)), ['order fuera de rango [0, numQuestionsReceived - 1]']);
    assert.deepEqual(types(checkPullQuestionOrders([0], undefined)), ['order fuera de rango [0, numQuestionsReceived - 1]']);
});

test('order: ausente', () => {
    assert.deepEqual(types(checkPullQuestionOrders([0, undefined, null], 5)), ['pregunta per_pull sin order', 'pregunta per_pull sin order']);
});

// ---------------------------------------------------------------- maxOutputTokensUsed

const gemini = { name: 'Google_Generative_Flash', config: { max_tokens: 4096, thinking_level: 'medium' } };
const okPull = (extra) => ({ status: 'ok', llmModel: 'Google_Generative_Flash', numQuestionsRequested: 20, ...extra });

test('maxOutputTokensUsed: correcto si coincide con calculateMaxTokens de las preguntas pedidas', () => {
    assert.deepEqual(checkPullMaxOutputTokens(okPull({ maxOutputTokensUsed: 22692 }), gemini), []);
    assert.deepEqual(checkPullMaxOutputTokens(okPull({ numQuestionsRequested: 5, maxOutputTokensUsed: 12192 }), gemini), []);
});

test('maxOutputTokensUsed: ausente o distinto en un pull ok', () => {
    assert.deepEqual(types(checkPullMaxOutputTokens(okPull({}), gemini)), ['pull ok sin maxOutputTokensUsed']);
    assert.deepEqual(types(checkPullMaxOutputTokens(okPull({ maxOutputTokensUsed: 4096 }), gemini)), ['maxOutputTokensUsed distinto de calculateMaxTokens']);
    assert.deepEqual(types(checkPullMaxOutputTokens(okPull({ maxOutputTokensUsed: 22692 }), undefined)), ['modelo del pull no encontrado en models.json']);
});

test('maxOutputTokensUsed: no se exige en pulls fallidos o pendientes', () => {
    assert.deepEqual(checkPullMaxOutputTokens({ status: 'error' }, gemini), []);
    assert.deepEqual(checkPullMaxOutputTokens({ status: 'pending' }, gemini), []);
});
