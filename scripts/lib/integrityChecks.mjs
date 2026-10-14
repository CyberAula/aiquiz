// Comprobaciones puras usadas por scripts/checkIntegrity.mjs (testeadas en tests/integrityChecks.test.mjs).
// Cada función devuelve una lista de problemas { type, detail }; vacía si todo es correcto.

import { calculateMaxTokens } from '../../app/utils/tokenLimits.js';

// Los `order` de las preguntas guardadas de un pull deben ser enteros únicos en [0, numQuestionsReceived - 1].
// Solo se guardan las preguntas respondidas o reportadas, así que puede haber huecos.
export function checkPullQuestionOrders(orders, numQuestionsReceived) {
    const problems = [];
    const seen = new Set();
    for (const order of orders) {
        if (order === undefined || order === null) {
            problems.push({ type: 'pregunta per_pull sin order', detail: '' });
            continue;
        }
        if (!Number.isInteger(order) || order < 0 || !(order < numQuestionsReceived)) {
            problems.push({ type: 'order fuera de rango [0, numQuestionsReceived - 1]', detail: `order ${order}, recibidas ${numQuestionsReceived}` });
        }
        if (seen.has(order)) {
            problems.push({ type: 'order repetido dentro de un pull', detail: `order ${order}` });
        }
        seen.add(order);
    }
    return problems;
}

// Todo pull en ok debe guardar el límite de tokens enviado al proveedor, y debe coincidir con
// calculateMaxTokens(config del modelo en models.json, preguntas pedidas).
// modelEntry: entrada del modelo del pull en models.json (o undefined si ya no existe).
export function checkPullMaxOutputTokens(pull, modelEntry) {
    if (pull.status !== 'ok') return [];
    if (pull.maxOutputTokensUsed === undefined || pull.maxOutputTokensUsed === null) {
        return [{ type: 'pull ok sin maxOutputTokensUsed', detail: '' }];
    }
    if (!modelEntry) {
        return [{ type: 'modelo del pull no encontrado en models.json', detail: pull.llmModel }];
    }
    const expected = calculateMaxTokens(modelEntry, pull.numQuestionsRequested);
    if (pull.maxOutputTokensUsed !== expected) {
        return [{
            type: 'maxOutputTokensUsed distinto de calculateMaxTokens',
            detail: `guardado ${pull.maxOutputTokensUsed}, esperado ${expected} (${pull.numQuestionsRequested} preguntas, ${pull.llmModel})`,
        }];
    }
    return [];
}
