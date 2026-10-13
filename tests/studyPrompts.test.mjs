import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ABC_Testing_List, PROMPT_BASE, BLOQUE_LONGITUD } from '../app/constants/abctesting.js';
import { subjects } from '../app/constants/subjects.js';
import { buildStudyPrompt, JSON_FORMAT_BLOCK } from '../app/utils/promptText.js';
import { getPromptById } from '../app/utils/studyDesign.js';

const BBDD = ABC_Testing_List.BBDD;
const DIFFICULTIES = { facil: 'fácil', intermedio: 'intermedio', avanzado: 'avanzado' };

// Todos los subtemas de BBDD, con su comentario (incluye los comentarios largos con <resumen>)
const bbddSubtopics = subjects.BBDD.topics.flatMap(t =>
    (t.subtopics || []).map(s => ({ topic: t.label, subTopic: s.title, comment: s.comment || '' })));

const build = (promptId, difficulty, { topic, subTopic, comment }) =>
    buildStudyPrompt(getPromptById(BBDD, promptId).content, {
        subjectName: subjects.BBDD.name,
        topic,
        difficulty,
        subTopic,
        numQuestions: 5,
        studentEmail: 'alumno@alumnos.upm.es',
        comment,
    });

test('hay subtemas de BBDD para probar', () => {
    assert.ok(bbddSubtopics.length > 0);
});

for (const promptId of ['control', 'longitud_equilibrada']) {
    for (const [difficulty, label] of Object.entries(DIFFICULTIES)) {
        test(`prompt ${promptId} / ${difficulty}: dificultad en español y sin variables sin sustituir`, () => {
            for (const st of bbddSubtopics) {
                const prompt = build(promptId, difficulty, st);
                assert.ok(prompt.includes(`nivel de dificultad ${label}.`), 'falta la dificultad legible');
                assert.ok(!/\{\w+\}/.test(prompt), `variable sin sustituir en ${st.subTopic}: ${prompt.match(/\{\w+\}/)}`);
                assert.ok(!prompt.includes('previousQuestions'));
                assert.ok(!prompt.includes('num_prev_questions'));
                assert.ok(!prompt.includes('respuestas anteriores'));
                assert.ok(prompt.includes(st.subTopic));
                assert.ok(prompt.includes(subjects.BBDD.name));
                assert.ok(prompt.endsWith(JSON_FORMAT_BLOCK));
            }
        });
    }
}

test('solo longitud_equilibrada contiene el bloque de longitud', () => {
    const st = bbddSubtopics[0];
    const control = build('control', 'intermedio', st);
    const longitud = build('longitud_equilibrada', 'intermedio', st);
    const marker = 'Las 4 opciones deben tener una longitud similar';
    assert.ok(!control.includes(marker));
    assert.ok(longitud.includes(marker));
    assert.ok(longitud.includes('reescribe los distractores'));
});

test('las dos plantillas son idénticas salvo el bloque experimental', () => {
    const control = getPromptById(BBDD, 'control').content;
    const longitud = getPromptById(BBDD, 'longitud_equilibrada').content;
    assert.equal(longitud.replace(BLOQUE_LONGITUD, ''), control);
    assert.ok(control.startsWith(PROMPT_BASE));
    assert.ok(control.endsWith('{comment} \n            '));
});

test('el texto literal de los prompts conserva los espacios finales del documento', () => {
    assert.ok(PROMPT_BASE.startsWith("Eres un profesor experto en '{topic}'. Tu objetivo es generar preguntas tipo test que ayuden al estudiante a repasar la materia. \n"));
    assert.ok(BLOQUE_LONGITUD.startsWith('\n            Requisitos obligatorios para las 4 opciones de cada pregunta:\n'));
});
