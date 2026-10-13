import { test } from 'node:test';
import assert from 'node:assert/strict';

import { questionCueMetrics, summarizeCues, isReferentialChoice, toCsv } from '../scripts/lib/surfaceCues.mjs';

test('métricas: correcta estrictamente más larga', () => {
    const m = questionCueMetrics({ choices: ['aa', 'bbbbbb', 'cc', 'dd'], answer: 1 });
    assert.equal(m.correctIsStrictlyLongest, true);
    assert.equal(m.lengthRatio, 6 / 3);
});

test('métricas: empate en la más larga no cuenta como estrictamente más larga', () => {
    const m = questionCueMetrics({ choices: ['aaaa', 'bbbb', 'cc', 'dd'], answer: 0 });
    assert.equal(m.correctIsStrictlyLongest, false);
    assert.equal(m.correctIsLongestOrTied, true);
});

test('métricas: malformada', () => {
    assert.equal(questionCueMetrics({ choices: ['a', 'b', 'c'], answer: 0 }).malformed, true);
    assert.equal(questionCueMetrics({ choices: ['a', 'b', 'c', 'd'], answer: 4 }).malformed, true);
});

test('opciones referenciales', () => {
    assert.ok(isReferentialChoice('Todas las anteriores son correctas'));
    assert.ok(isReferentialChoice('Ninguna de las anteriores'));
    assert.ok(isReferentialChoice('Ambas son correctas'));
    assert.ok(isReferentialChoice('La segunda y la tercera'));
    assert.ok(!isReferentialChoice('MongoDB almacena documentos BSON'));
    assert.ok(!isReferentialChoice('Un modelo orientado a documentos'));
});

test('resumen por condición', () => {
    const s = summarizeCues([
        questionCueMetrics({ choices: ['aa', 'bbbbbb', 'cc', 'dd'], answer: 1 }),
        questionCueMetrics({ choices: ['aaaa', 'bb', 'cc', 'dd'], answer: 3 }),
        questionCueMetrics({ choices: ['a', 'b'], answer: 0 }),
    ]);
    assert.equal(s.numQuestions, 3);
    assert.equal(s.numMalformed, 1);
    assert.equal(s.pctCorrectStrictlyLongest, 50);
    assert.equal(s.pctPos1, 50);
    assert.equal(s.pctPos3, 50);
});

test('CSV escapa comas y comillas', () => {
    assert.equal(toCsv([{ a: 'x,y', b: 'di "hola"' }], ['a', 'b']), 'a,b\n"x,y","di ""hola"""\n');
});
