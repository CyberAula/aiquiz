import { test } from 'node:test';
import assert from 'node:assert/strict';

import { subjects } from '../app/constants/subjects.js';
import {
    buildClassMaterial,
    buildClassMaterialInstructions,
    buildClassMaterialSection,
    findSubtopic,
} from '../app/utils/promptText.js';
import { migrateComment } from '../scripts/migrateSubjectComments.mjs';

const allSubtopics = Object.entries(subjects).flatMap(([subject, s]) =>
    s.topics.flatMap(t => (t.subtopics || []).map(st => ({ subject, topic: t.label, ...st }))));


// ---------------------------------------------------------------- bloque del prompt

test('material de clase: bloque delimitado con el subtema', () => {
    const block = buildClassMaterial('índices', 'Un índice acelera las consultas.');
    assert.equal(block, "Este es el material que el profesor explicó en clase sobre 'índices':\n<material_de_clase>\nUn índice acelera las consultas.\n</material_de_clase>");
});

test('material de clase: vacío si no hay material (sin etiquetas vacías)', () => {
    assert.equal(buildClassMaterial('x', ''), '');
    assert.equal(buildClassMaterial('x', '   '), '');
    assert.equal(buildClassMaterial('x', undefined), '');
    assert.equal(buildClassMaterialSection('x', '', ''), '');
});

test('indicaciones: uso del material solo si hay material, focus solo si hay focus', () => {
    const both = buildClassMaterialInstructions('material', 'evalúa X');
    assert.ok(both.includes('Usa el contenido de <material_de_clase>'));
    assert.ok(both.includes('Indicaciones del profesor sobre qué deben evaluar las preguntas de este subtema: evalúa X'));

    const onlyFocus = buildClassMaterialInstructions('', 'evalúa X');
    assert.ok(!onlyFocus.includes('material_de_clase'));
    assert.ok(onlyFocus.includes('evalúa X'));

    assert.equal(buildClassMaterialInstructions('', ''), '');
});

test('sección completa: material antes que las indicaciones', () => {
    const section = buildClassMaterialSection('x', 'material', 'evalúa X');
    assert.ok(section.indexOf('</material_de_clase>') < section.indexOf('Usa el contenido'));
    assert.ok(section.indexOf('Usa el contenido') < section.indexOf('evalúa X'));
});

test('findSubtopic ignora mayúsculas', () => {
    const st = allSubtopics.find(s => s.subject === 'BBDD' && s.comment);
    const found = findSubtopic(subjects, 'BBDD', st.topic.toUpperCase(), st.title.toLowerCase());
    assert.equal(found?.title, st.title);
    assert.equal(findSubtopic(subjects, 'BBDD', 'no existe', 'tampoco'), undefined);
});


// ---------------------------------------------------------------- datos de subjects.js

test('subjects.js: ningún comment ni focus con etiquetas <resumen> ni el preámbulo genérico', () => {
    for (const st of allSubtopics) {
        const text = `${st.comment || ''} ${st.focus || ''}`;
        assert.ok(!/resumen\s*>/i.test(text), `${st.subject} / ${st.title}`);
        assert.ok(!/Este es el resumen de la materia desarrollada en clase/.test(text), `${st.subject} / ${st.title}`);
        assert.ok(!/material_de_clase/.test(text), `${st.subject} / ${st.title}`);
    }
});

test('subjects.js: focus, si existe, es un texto no vacío', () => {
    for (const st of allSubtopics.filter(s => 'focus' in s)) {
        assert.equal(typeof st.focus, 'string');
        assert.ok(st.focus.trim().length > 0, `${st.subject} / ${st.title}`);
    }
});


// ---------------------------------------------------------------- migración

test('migración: preámbulo genérico eliminado, sin focus', () => {
    const r = migrateComment('Este es el resumen de la materia desarrollada en clase que puede servirte..., aunque pueden ser más amplias: <resumen> Contenido A. </resumen>');
    assert.deepEqual(r, { comment: 'Contenido A.', focus: '' });
});

test('migración: texto previo específico pasa a focus', () => {
    const r = migrateComment('Las preguntas de este tema evalúan columnas. <resumen>Las columnas dividen el texto.</resumen>');
    assert.deepEqual(r, { comment: 'Las columnas dividen el texto.', focus: 'Las preguntas de este tema evalúan columnas.' });
});

test('migración: prefijo que presenta una lista', () => {
    const r = migrateComment('El contenido de las preguntas de este tema aplica las siguientes funciones de Microsoft Excel: <resumen>Y, O, NO.</resumen>');
    assert.equal(r.comment, 'Y, O, NO.');
    assert.equal(r.focus, 'El contenido de las preguntas de este tema aplica las funciones de Microsoft Excel descritas en el material de clase.');
});

test('migración: etiquetas sobrantes o dentro del texto se eliminan', () => {
    assert.equal(migrateComment('X: <resumen>usa `show dbs</resumen>` y `use</resumen>`.</resumen></resumen>').comment, 'usa `show dbs` y `use`.');
    assert.equal(migrateComment('Sin etiquetas.').comment, 'Sin etiquetas.');
    assert.equal(migrateComment('Sin etiquetas.').focus, '');
});
