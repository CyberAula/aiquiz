import { test } from 'node:test';
import assert from 'node:assert/strict';

import { facts, getSubjectFacts, buildFactsSequence } from '../app/constants/facts.js';

const SUBJECTS_WITH_FACTS = ['CORE', 'IWEB', 'BBDD'];

test('facts tiene generic y las tres asignaturas, con frases no vacías y sin repetir', () => {
    assert.deepEqual(Object.keys(facts).sort(), ['BBDD', 'CORE', 'IWEB', 'generic']);
    const all = Object.values(facts).flat();
    for (const f of all) {
        assert.equal(typeof f, 'string');
        assert.ok(f.trim().length > 0);
        // La pantalla de espera las escribe letra a letra: que no sean excesivamente largas
        assert.ok(f.length <= 260, `frase demasiado larga (${f.length}): ${f.slice(0, 60)}…`);
    }
    assert.equal(new Set(all).size, all.length, 'hay frases repetidas');
    for (const key of Object.keys(facts)) {
        assert.ok(facts[key].length >= 20, `${key} tiene pocas frases`);
    }
});

test('getSubjectFacts: frases propias solo para CORE, IWEB y BBDD', () => {
    for (const s of SUBJECTS_WITH_FACTS) {
        assert.equal(getSubjectFacts(s), facts[s]);
        assert.equal(getSubjectFacts(s.toLowerCase()), facts[s]);
    }
    for (const s of ['OFI', 'TECW', 'generic', '', undefined, null]) {
        assert.equal(getSubjectFacts(s), null);
    }
});

test('buildFactsSequence: CORE, IWEB y BBDD mezclan dos propias por cada genérica', () => {
    for (const s of SUBJECTS_WITH_FACTS) {
        const seq = buildFactsSequence(s);
        const own = seq.filter(f => facts[s].includes(f));
        const generic = seq.filter(f => facts.generic.includes(f));
        assert.equal(own.length + generic.length, seq.length);
        assert.equal(new Set(own).size, facts[s].length, 'deben salir todas las frases propias');
        assert.equal(generic.length, Math.min(Math.floor(facts[s].length / 2), facts.generic.length));
        // nunca dos genéricas seguidas y la primera es propia
        assert.ok(facts[s].includes(seq[0]));
        for (let i = 1; i < seq.length; i++) {
            assert.ok(!(facts.generic.includes(seq[i]) && facts.generic.includes(seq[i - 1])));
        }
    }
});

test('buildFactsSequence: el resto de asignaturas solo ve frases genéricas', () => {
    for (const s of ['OFI', 'TECW', 'PRG', undefined]) {
        const seq = buildFactsSequence(s);
        assert.equal(seq.length, facts.generic.length);
        assert.ok(seq.every(f => facts.generic.includes(f)));
    }
});

test('buildFactsSequence: el orden cambia entre esperas', () => {
    const firsts = new Set(Array.from({ length: 50 }, () => buildFactsSequence('BBDD')[0]));
    assert.ok(firsts.size > 1);
});
