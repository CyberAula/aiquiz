import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    shuffleQuestion,
    computeStudentAnswerOriginal,
    pickNextSlot,
    difficultyLabel,
    getPromptById,
    isPerPullMode,
} from '../app/utils/studyDesign.js';
import { ABC_Testing_List } from '../app/constants/abctesting.js';

const BBDD = ABC_Testing_List.BBDD;
const CONDITIONS = BBDD.conditions;

const sampleQuestion = (answer = 2) => ({
    query: '¿Pregunta?',
    choices: ['opción cero', 'opción uno', 'opción dos', 'opción tres'],
    answer,
    explanation: 'porque sí',
});


// ---------------------------------------------------------------- barajado

test('barajado: invariantes de la permutación en muchas repeticiones', () => {
    const seenPermutations = new Set();
    for (let rep = 0; rep < 2000; rep++) {
        const original = sampleQuestion(rep % 4);
        const q = shuffleQuestion(original, true);

        assert.equal(q.shuffled, true);
        assert.equal(q.malformed, false);
        assert.deepEqual(q.originalChoices, original.choices);
        assert.equal(q.originalAnswer, original.answer);
        assert.deepEqual([...q.permutation].sort(), [0, 1, 2, 3]);
        for (let i = 0; i < 4; i++) {
            assert.equal(q.choices[i], q.originalChoices[q.permutation[i]]);
        }
        assert.equal(q.choices[q.answer], q.originalChoices[q.originalAnswer]);
        seenPermutations.add(q.permutation.join(''));
    }
    // Fisher–Yates debe poder generar las 24 permutaciones
    assert.equal(seenPermutations.size, 24);
});

test('barajado: la posición de la correcta queda aproximadamente uniforme', () => {
    const counts = [0, 0, 0, 0];
    const N = 8000;
    for (let rep = 0; rep < N; rep++) {
        counts[shuffleQuestion(sampleQuestion(0), true).answer]++;
    }
    for (const c of counts) {
        assert.ok(Math.abs(c / N - 0.25) < 0.03, `distribución no uniforme: ${counts}`);
    }
});

test('sin barajar: permutación identidad y originales iguales a los mostrados', () => {
    const original = sampleQuestion(3);
    const q = shuffleQuestion(original, false);
    assert.equal(q.shuffled, false);
    assert.equal(q.malformed, false);
    assert.deepEqual(q.permutation, [0, 1, 2, 3]);
    assert.deepEqual(q.choices, original.choices);
    assert.deepEqual(q.originalChoices, original.choices);
    assert.equal(q.answer, 3);
    assert.equal(q.originalAnswer, 3);
});

test('pregunta malformada: no se baraja y se marca', () => {
    const tresOpciones = shuffleQuestion({ ...sampleQuestion(1), choices: ['a', 'b', 'c'] }, true);
    assert.equal(tresOpciones.malformed, true);
    assert.equal(tresOpciones.shuffled, false);
    assert.deepEqual(tresOpciones.permutation, [0, 1, 2]);
    assert.deepEqual(tresOpciones.choices, ['a', 'b', 'c']);

    const fueraDeRango = shuffleQuestion(sampleQuestion(4), true);
    assert.equal(fueraDeRango.malformed, true);
    assert.equal(fueraDeRango.shuffled, false);
    assert.equal(fueraDeRango.answer, 4);
    assert.deepEqual(fueraDeRango.permutation, [0, 1, 2, 3]);

    assert.equal(shuffleQuestion(sampleQuestion(-1), true).malformed, true);
    assert.equal(shuffleQuestion(sampleQuestion(1.5), true).malformed, true);
});

test('barajado: acepta answer como string numérica del modelo', () => {
    const q = shuffleQuestion(sampleQuestion('2'), true);
    assert.equal(q.malformed, false);
    assert.equal(q.choices[q.answer], 'opción dos');
});


// ---------------------------------------------------------------- studentAnswerOriginal

test('studentAnswerOriginal: respuesta normal', () => {
    const q = shuffleQuestion(sampleQuestion(1), true);
    for (let shown = 0; shown < 4; shown++) {
        const orig = computeStudentAnswerOriginal(q.permutation, shown);
        assert.equal(q.originalChoices[orig], q.choices[shown]);
    }
    // acierto en el orden mostrado <=> acierto en el orden original
    assert.equal(computeStudentAnswerOriginal(q.permutation, q.answer), q.originalAnswer);
});

test('studentAnswerOriginal: reporte sin respuesta es -1', () => {
    assert.equal(computeStudentAnswerOriginal([2, 0, 3, 1], -1), -1);
    assert.equal(computeStudentAnswerOriginal(undefined, -1), -1);
});

test('studentAnswerOriginal: re-respuesta usa la permutación guardada', () => {
    const storedPermutation = [3, 1, 0, 2];
    // primero reporta sin responder, luego responde la opción mostrada 0
    assert.equal(computeStudentAnswerOriginal(storedPermutation, -1), -1);
    assert.equal(computeStudentAnswerOriginal(storedPermutation, 0), 3);
    // reporta después de haber respondido la opción mostrada 3
    assert.equal(computeStudentAnswerOriginal(storedPermutation, 3), 2);
});

test('studentAnswerOriginal: modo antiguo sin permutación devuelve null', () => {
    assert.equal(computeStudentAnswerOriginal(undefined, 2), null);
    assert.equal(computeStudentAnswerOriginal([], 2), null);
});


// ---------------------------------------------------------------- bloques permutados

const simulatePulls = (n, randInt) => {
    const active = [];
    for (let i = 0; i < n; i++) {
        const slot = pickNextSlot(active, CONDITIONS, randInt);
        active.push({ blockIndex: slot.blockIndex, positionInBlock: slot.positionInBlock, conditionId: slot.condition.id });
    }
    return active;
};

test('bloques: 4 pulls consecutivos cubren las 4 condiciones', () => {
    for (let rep = 0; rep < 500; rep++) {
        const pulls = simulatePulls(4);
        assert.deepEqual(new Set(pulls.map(p => p.conditionId)), new Set(CONDITIONS.map(c => c.id)));
        assert.deepEqual(pulls.map(p => p.blockIndex), [0, 0, 0, 0]);
        assert.deepEqual(pulls.map(p => p.positionInBlock), [0, 1, 2, 3]);
    }
});

test('bloques: 8 pulls dan 2 de cada condición, uno por bloque', () => {
    const pulls = simulatePulls(8);
    for (const c of CONDITIONS) {
        const ofCondition = pulls.filter(p => p.conditionId === c.id);
        assert.equal(ofCondition.length, 2);
        assert.deepEqual(ofCondition.map(p => p.blockIndex).sort(), [0, 1]);
    }
});

test('bloques: el orden dentro del bloque es aleatorio (24 órdenes posibles)', () => {
    const orders = new Set();
    for (let rep = 0; rep < 2000; rep++) {
        orders.add(simulatePulls(4).map(p => p.conditionId).join('|'));
    }
    assert.equal(orders.size, 24);
});

test('bloques: un pull fallido libera su hueco y su condición', () => {
    const pulls = simulatePulls(3);
    // el segundo pull falla: deja de estar activo
    const failed = pulls[1];
    const active = [pulls[0], pulls[2]];
    const slot = pickNextSlot(active, CONDITIONS);
    assert.equal(slot.blockIndex, 0);
    assert.equal(slot.positionInBlock, failed.positionInBlock);
    // la condición nueva es una de las dos que faltan en el bloque (incluida la del fallido)
    const missing = CONDITIONS.map(c => c.id).filter(id => !active.some(p => p.conditionId === id));
    assert.ok(missing.includes(slot.condition.id));
    assert.ok(missing.includes(failed.conditionId));
});


// ---------------------------------------------------------------- configuración

test('configuración BBDD: modo per_pull con un único modelo y 4 condiciones 2x2', () => {
    assert.equal(isPerPullMode(BBDD), true);
    assert.deepEqual(BBDD.models, ['Google_Generative_Flash']);
    assert.equal(CONDITIONS.length, 4);
    const combos = new Set(CONDITIONS.map(c => `${c.promptId}|${c.shuffled}`));
    assert.deepEqual(combos, new Set(['control|false', 'control|true', 'longitud_equilibrada|false', 'longitud_equilibrada|true']));
    for (const c of CONDITIONS) {
        assert.ok(getPromptById(BBDD, c.promptId), `prompt ${c.promptId} no definido`);
    }
    for (const other of ['OFI', 'CORE', 'IWEB']) {
        assert.equal(isPerPullMode(ABC_Testing_List[other]), false);
    }
});

test('difficultyLabel', () => {
    assert.equal(difficultyLabel('facil'), 'fácil');
    assert.equal(difficultyLabel('intermedio'), 'intermedio');
    assert.equal(difficultyLabel('avanzado'), 'avanzado');
});
