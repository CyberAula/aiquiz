import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ABC_Testing_List, PROMPT_BASE, BLOQUE_LONGITUD } from '../app/constants/abctesting.js';
import { subjects } from '../app/constants/subjects.js';
import { buildStudyPrompt, JSON_FORMAT_BLOCK } from '../app/utils/promptText.js';
import { getPromptById } from '../app/utils/studyDesign.js';

const BBDD = ABC_Testing_List.BBDD;
const DIFFICULTIES = { facil: 'fácil', intermedio: 'intermedio', avanzado: 'avanzado' };

// Todos los subtemas de BBDD, con su material de clase (comment) y focus
const bbddSubtopics = subjects.BBDD.topics.flatMap(t =>
    (t.subtopics || []).map(s => ({ topic: t.label, subTopic: s.title, comment: s.comment || '', focus: s.focus || '' })));

const build = (promptId, difficulty, { topic, subTopic, comment, focus }) =>
    buildStudyPrompt(getPromptById(BBDD, promptId).content, {
        subjectName: subjects.BBDD.name,
        topic,
        difficulty,
        subTopic,
        numQuestions: 5,
        studentEmail: 'alumno@alumnos.upm.es',
        comment,
        focus,
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
                // material de clase delimitado y antes de la tarea
                assert.ok(!/resumen>/i.test(prompt), 'quedan etiquetas <resumen>');
                if (st.comment.trim()) {
                    assert.ok(prompt.includes(`<material_de_clase>\n${st.comment.trim()}\n</material_de_clase>`));
                    assert.ok(prompt.indexOf('</material_de_clase>') < prompt.indexOf('Dame 5 preguntas'));
                    assert.ok(prompt.includes('Usa el contenido de <material_de_clase> como referencia principal'));
                }
            }
        });
    }
}

test('todas las asignaturas del estudio: prompt final correcto en cada subtema', () => {
    for (const subject of ['BBDD', 'BDNR', 'BDFI', 'CORE', 'IWEB', 'OFI']) {
        const config = ABC_Testing_List[subject];
        const subtopics = subjects[subject].topics.flatMap(t =>
            (t.subtopics || []).map(s => ({ topic: t.label, subTopic: s.title, comment: s.comment || '', focus: s.focus || '' })));
        assert.ok(subtopics.length > 0, `${subject} sin subtemas`);
        for (const promptId of ['control', 'longitud_equilibrada']) {
            for (const st of subtopics) {
                const where = `${subject} / ${promptId} / ${st.subTopic}`;
                const prompt = buildStudyPrompt(getPromptById(config, promptId).content, {
                    subjectName: subjects[subject].name, topic: st.topic, difficulty: 'avanzado', subTopic: st.subTopic,
                    numQuestions: 10, studentEmail: 'alumno@alumnos.upm.es', comment: st.comment, focus: st.focus,
                });
                // El material de clase puede contener llaves de código (JSX, objetos JS...): se excluye de la comprobación
                const withoutMaterial = prompt
                    .replace(/<material_de_clase>[\s\S]*?<\/material_de_clase>/, '')
                    .replace(st.focus.trim() || '\u0000', '');
                assert.ok(!/\{\w+\}/.test(withoutMaterial), `variable sin sustituir en ${where}: ${withoutMaterial.match(/\{\w+\}/)}`);
                assert.ok(prompt.includes(`'${subjects[subject].name}'`), where);
                assert.ok(prompt.includes('nivel de dificultad avanzado.'), where);
                assert.ok(!prompt.includes('previousQuestions') && !prompt.includes('respuestas anteriores'), where);
                assert.ok(prompt.endsWith(JSON_FORMAT_BLOCK), where);
                if (st.comment.trim()) assert.ok(prompt.includes(`<material_de_clase>\n${st.comment.trim()}\n</material_de_clase>`), where);
                if (st.focus.trim()) assert.ok(prompt.includes(st.focus.trim()), where);
            }
        }
    }
});

test('solo longitud_equilibrada contiene el bloque de longitud', () => {
    const st = bbddSubtopics[0];
    const control = build('control', 'intermedio', st);
    const longitud = build('longitud_equilibrada', 'intermedio', st);
    // Marcador que no depende de la redacción concreta de cada requisito
    const marker = 'Requisitos obligatorios para las 4 opciones';
    assert.ok(!control.includes(marker));
    assert.ok(longitud.includes(marker));
});

test('las dos plantillas son idénticas salvo el bloque experimental', () => {
    const control = getPromptById(BBDD, 'control').content;
    const longitud = getPromptById(BBDD, 'longitud_equilibrada').content;
    assert.equal(longitud.replace(BLOQUE_LONGITUD, ''), control);
    assert.ok(control.startsWith(PROMPT_BASE));
    assert.ok(control.endsWith('{classMaterialInstructions}\n            '));
});

test('el texto literal de los prompts conserva los espacios finales del documento', () => {
    assert.ok(PROMPT_BASE.startsWith("Eres un profesor experto en '{topic}'. Tu objetivo es generar preguntas tipo test que ayuden al estudiante a repasar la materia. \n"));
    assert.ok(BLOQUE_LONGITUD.startsWith('\n            Requisitos obligatorios para las 4 opciones de cada pregunta:\n'));
});
