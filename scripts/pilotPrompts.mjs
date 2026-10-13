// Piloto del Estudio 2: compara las pistas superficiales que genera cada prompt de BBDD.
//
// NO toca la base de datos. Llama directamente al modelo del estudio con getModelResponse.
// Por defecto solo muestra el plan (número de llamadas y tokens estimados); para ejecutar
// las llamadas hay que pasar --run.
//
// Uso (desde la raíz del repo, para que llmManager encuentre models.json):
//   node scripts/pilotPrompts.mjs [--n 5] [--numQuestions 10] [--difficulty intermedio|facil|avanzado|all]
//                                 [--subtopics all|0,3,5] [--concurrency 2]
//                                 [--price-in USD_por_1M] [--price-out USD_por_1M] [--run]
//
// Salida (con --run) en scripts/output/:
//   pilot_<fecha>_questions.csv  una fila por pregunta (métricas de longitud, posición, referenciales)
//   pilot_<fecha>_pulls.csv      una fila por llamada (tokens, tiempo, finishReason, errores)
//   pilot_<fecha>_summary.csv    resumen por prompt (condición)

import fs from 'fs';
import path from 'path';

import { ABC_Testing_List } from '../app/constants/abctesting.js';
import { subjects } from '../app/constants/subjects.js';
import { buildStudyPrompt } from '../app/utils/promptText.js';
import { getPromptById } from '../app/utils/studyDesign.js';
import { questionCueMetrics, summarizeCues, toCsv } from './lib/surfaceCues.mjs';

const SUBJECT = 'BBDD';
const config = ABC_Testing_List[SUBJECT];
const MODEL_NAME = config.models[0];
const PROMPT_IDS = [...new Set(config.conditions.map(c => c.promptId))];
const DIFFICULTIES = ['facil', 'intermedio', 'avanzado'];
// Mismo valor que llmManager.js (incluye tokens de razonamiento): cota superior de salida por pregunta
const TOKENS_PER_QUESTION_UPPER = 700;

// ---------------------------------------------------------------- argumentos
const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};
const RUN = args.includes('--run');
const N = Number(getArg('n', 5));
const NUM_QUESTIONS = Number(getArg('numQuestions', 10));
const DIFFICULTY = getArg('difficulty', 'intermedio');
const SUBTOPICS_ARG = getArg('subtopics', 'all');
const CONCURRENCY = Number(getArg('concurrency', 2));
const PRICE_IN = getArg('price-in', null);
const PRICE_OUT = getArg('price-out', null);

if (DIFFICULTY !== 'all' && !DIFFICULTIES.includes(DIFFICULTY)) {
    console.error(`Dificultad no válida: ${DIFFICULTY}`);
    process.exit(1);
}

// ---------------------------------------------------------------- subtemas de BBDD
const allSubtopics = subjects[SUBJECT].topics.flatMap(t =>
    (t.subtopics || []).map(s => ({ topic: t.label, subTopic: s.title, comment: s.comment || '' })));
const subtopics = SUBTOPICS_ARG === 'all'
    ? allSubtopics
    : SUBTOPICS_ARG.split(',').map(i => allSubtopics[Number(i)]).filter(Boolean);

// ---------------------------------------------------------------- plan de llamadas
// Las llamadas de ambos prompts se intercalan para que el tiempo no se confunda con la condición
const jobs = [];
for (let rep = 0; rep < N; rep++) {
    subtopics.forEach((st, stIndex) => {
        const difficulty = DIFFICULTY === 'all' ? DIFFICULTIES[(rep + stIndex) % 3] : DIFFICULTY;
        for (const promptId of PROMPT_IDS) {
            const prompt = buildStudyPrompt(getPromptById(config, promptId).content, {
                subjectName: subjects[SUBJECT].name,
                topic: st.topic,
                difficulty,
                subTopic: st.subTopic,
                numQuestions: NUM_QUESTIONS,
                studentEmail: 'piloto@example.com',
                comment: st.comment,
            });
            jobs.push({ rep, promptId, difficulty, ...st, prompt });
        }
    });
}

const estInputTokens = jobs.reduce((acc, j) => acc + Math.ceil(j.prompt.length / 3.5), 0);
const estOutputTokens = jobs.length * NUM_QUESTIONS * TOKENS_PER_QUESTION_UPPER;

console.log('------------------------------------------------------------');
console.log(`Piloto ${SUBJECT} con el modelo ${MODEL_NAME}`);
console.log(`Prompts: ${PROMPT_IDS.join(', ')}`);
console.log(`Subtemas: ${subtopics.length} | repeticiones (N): ${N} | preguntas por test: ${NUM_QUESTIONS} | dificultad: ${DIFFICULTY}`);
console.log(`Llamadas al LLM: ${subtopics.length} x ${N} x ${PROMPT_IDS.length} = ${jobs.length}`);
console.log(`Preguntas generadas (aprox.): ${jobs.length * NUM_QUESTIONS}`);
console.log(`Tokens de entrada estimados: ~${estInputTokens.toLocaleString('es-ES')}`);
console.log(`Tokens de salida (incl. razonamiento), cota superior: ~${estOutputTokens.toLocaleString('es-ES')}`);
if (PRICE_IN !== null && PRICE_OUT !== null) {
    const cost = (estInputTokens / 1e6) * Number(PRICE_IN) + (estOutputTokens / 1e6) * Number(PRICE_OUT);
    console.log(`Coste estimado (cota superior): ~${cost.toFixed(2)} USD`);
} else {
    console.log('Pasa --price-in y --price-out (USD por millón de tokens) para estimar el coste.');
}
console.log('------------------------------------------------------------');

if (!RUN) {
    console.log('Modo plan: no se ha hecho ninguna llamada. Añade --run para ejecutar el piloto.');
    process.exit(0);
}

// ---------------------------------------------------------------- ejecución
const { getModelResponse } = await import('../app/utils/llmManager.js');

const pullRows = [];
const questionRows = [];

const runJob = async (job, index) => {
    const row = {
        job: index, rep: job.rep, promptId: job.promptId, difficulty: job.difficulty, topic: job.topic, subTopic: job.subTopic,
        ok: false, error: '', finishReason: '', truncated: '', numQuestionsReceived: 0,
        prompt_tokens: '', completion_tokens: '', reasoning_tokens: '', total_tokens: '', responseTime: '',
    };
    try {
        const res = await getModelResponse(MODEL_NAME, job.prompt, NUM_QUESTIONS);
        Object.assign(row, {
            finishReason: res.finishReason ?? '', truncated: res.truncated ?? '',
            prompt_tokens: res.usage?.prompt_tokens, completion_tokens: res.usage?.completion_tokens,
            reasoning_tokens: res.usage?.reasoning_tokens, total_tokens: res.usage?.total_tokens,
            responseTime: res.responseTime,
        });
        const text = (res.text || '').replace(/^\[|\]$/g, '').replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed.questions)) throw new Error('sin array "questions"');
        row.ok = true;
        row.numQuestionsReceived = parsed.questions.length;
        parsed.questions.forEach((q, qi) => {
            const m = questionCueMetrics(q);
            questionRows.push({
                job: index, rep: job.rep, promptId: job.promptId, difficulty: job.difficulty, topic: job.topic, subTopic: job.subTopic,
                questionIndex: qi, answer: m.answer, malformed: m.malformed,
                len0: m.lengths[0], len1: m.lengths[1], len2: m.lengths[2], len3: m.lengths[3],
                correctIsStrictlyLongest: m.correctIsStrictlyLongest, correctIsLongestOrTied: m.correctIsLongestOrTied,
                lengthRatio: m.lengthRatio, hasReferential: m.hasReferential,
                _metrics: m,
            });
        });
    } catch (error) {
        row.error = error.message;
    }
    pullRows.push(row);
    console.log(`[${pullRows.length}/${jobs.length}] ${job.promptId} | ${job.subTopic} | ${row.ok ? `ok (${row.numQuestionsReceived} preguntas, ${row.responseTime} ms)` : `ERROR: ${row.error}`}`);
};

let next = 0;
const worker = async () => {
    while (next < jobs.length) {
        const i = next++;
        await runJob(jobs[i], i);
    }
};
await Promise.all(Array.from({ length: Math.max(1, CONCURRENCY) }, worker));

// ---------------------------------------------------------------- resumen por condición
const mean = (xs) => { const v = xs.filter(x => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const summaryRows = PROMPT_IDS.map(promptId => {
    const pulls = pullRows.filter(r => r.promptId === promptId);
    const okPulls = pulls.filter(r => r.ok);
    return {
        promptId,
        numPulls: pulls.length,
        pctPullErrors: pulls.length ? (100 * (pulls.length - okPulls.length)) / pulls.length : null,
        pctTruncated: pulls.length ? (100 * pulls.filter(r => r.truncated === true).length) / pulls.length : null,
        ...summarizeCues(questionRows.filter(r => r.promptId === promptId).map(r => r._metrics)),
        meanPromptTokens: mean(okPulls.map(r => r.prompt_tokens)),
        meanCompletionTokens: mean(okPulls.map(r => r.completion_tokens)),
        meanReasoningTokens: mean(okPulls.map(r => r.reasoning_tokens)),
        meanTotalTokens: mean(okPulls.map(r => r.total_tokens)),
        meanResponseTimeMs: mean(okPulls.map(r => r.responseTime)),
    };
});

const outDir = path.resolve('scripts/output');
fs.mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const qCols = ['job', 'rep', 'promptId', 'difficulty', 'topic', 'subTopic', 'questionIndex', 'answer', 'malformed', 'len0', 'len1', 'len2', 'len3', 'correctIsStrictlyLongest', 'correctIsLongestOrTied', 'lengthRatio', 'hasReferential'];
const pCols = ['job', 'rep', 'promptId', 'difficulty', 'topic', 'subTopic', 'ok', 'error', 'finishReason', 'truncated', 'numQuestionsReceived', 'prompt_tokens', 'completion_tokens', 'reasoning_tokens', 'total_tokens', 'responseTime'];
const sCols = Object.keys(summaryRows[0]);
fs.writeFileSync(path.join(outDir, `pilot_${stamp}_questions.csv`), toCsv(questionRows, qCols));
fs.writeFileSync(path.join(outDir, `pilot_${stamp}_pulls.csv`), toCsv(pullRows.sort((a, b) => a.job - b.job), pCols));
fs.writeFileSync(path.join(outDir, `pilot_${stamp}_summary.csv`), toCsv(summaryRows, sCols));

console.log('------------------------------------------------------------');
console.table(summaryRows.map(r => ({
    prompt: r.promptId,
    pulls: r.numPulls,
    '%err': r.pctPullErrors?.toFixed(1),
    preguntas: r.numValid,
    '%correcta+larga': r.pctCorrectStrictlyLongest?.toFixed(1),
    ratioLong: r.meanLengthRatio?.toFixed(3),
    'pos0/1/2/3 %': [r.pctPos0, r.pctPos1, r.pctPos2, r.pctPos3].map(x => x?.toFixed(0)).join('/'),
    '%refer': r.pctWithReferential?.toFixed(1),
    tokens: r.meanTotalTokens?.toFixed(0),
    ms: r.meanResponseTimeMs?.toFixed(0),
})));
console.log(`CSV guardados en ${outDir} (prefijo pilot_${stamp})`);
