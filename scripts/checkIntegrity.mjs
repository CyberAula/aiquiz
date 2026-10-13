// Comprobación de integridad del Estudio 2 (modo per_pull). SOLO LECTURA: no escribe en la base de datos.
//
// Uso (desde la raíz del repo):
//   node scripts/checkIntegrity.mjs [--subject BBDD] [--sample 5000] [--pending-minutes 15]
//
// MONGODB_URI se toma de la variable de entorno o, si no existe, de next.config.js (no se imprime).
// Devuelve código de salida 1 si encuentra alguna violación.

import { createRequire } from 'module';
import mongoose from 'mongoose';

import { ABC_Testing_List } from '../app/constants/abctesting.js';
import { computeStudentAnswerOriginal } from '../app/utils/studyDesign.js';

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def;
};
const SUBJECT = getArg('subject', 'BBDD');
const SAMPLE = Number(getArg('sample', 5000));
const PENDING_MINUTES = Number(getArg('pending-minutes', 15));

const config = ABC_Testing_List[SUBJECT];
if (!config?.conditions) {
    console.error(`La asignatura ${SUBJECT} no tiene condiciones per_pull en abctesting.js`);
    process.exit(1);
}
const CONDITION_IDS = config.conditions.map(c => c.id);
const BLOCK_SIZE = CONDITION_IDS.length;

let uri = process.env.MONGODB_URI;
if (!uri) {
    try { uri = require('../next.config.js').env?.MONGODB_URI; } catch { /* sin next.config.js */ }
}
if (!uri) {
    console.error('Define MONGODB_URI (variable de entorno o next.config.js)');
    process.exit(1);
}

// Registro de violaciones (se muestran como mucho 10 ejemplos por tipo)
const violations = new Map();
const violation = (type, detail) => {
    if (!violations.has(type)) violations.set(type, { count: 0, examples: [] });
    const v = violations.get(type);
    v.count++;
    if (v.examples.length < 10) v.examples.push(detail);
};

const isPermutation = (p, n) =>
    Array.isArray(p) && p.length === n && [...p].sort((a, b) => a - b).every((v, i) => v === i);

await mongoose.connect(uri, { readPreference: 'secondaryPreferred' });
const db = mongoose.connection.db;
const questionsCol = db.collection('questions');
const pullsCol = db.collection('pulls');

// ---------------------------------------------------------------- pulls
const pulls = await pullsCol.find({ subject: SUBJECT }).toArray();
const firstPullDate = pulls.reduce((min, p) => (!min || p.createdAt < min ? p.createdAt : min), null);
const pullsByKey = new Map(pulls.map(p => [`${p.studentEmail}|${p.pull_id}`, p]));

console.log('============================================================');
console.log(`Asignatura ${SUBJECT} | pulls: ${pulls.length} | desde: ${firstPullDate?.toISOString() ?? '-'}`);

for (const p of pulls) {
    if (!CONDITION_IDS.includes(p.conditionId)) violation('pull con condición desconocida', `${p._id} ${p.conditionId}`);
    const cond = config.conditions.find(c => c.id === p.conditionId);
    if (cond && (cond.promptId !== p.promptId || cond.shuffled !== p.shuffled)) {
        violation('pull con promptId/shuffled distinto de su condición', `${p._id}`);
    }
    if (p.status === 'error' && p.slotActive) violation('pull en error que sigue ocupando hueco', `${p._id}`);
    if (p.status !== 'error' && !p.slotActive) violation('pull no fallido sin hueco activo', `${p._id}`);
    if (p.status === 'pending' && Date.now() - new Date(p.createdAt).getTime() > PENDING_MINUTES * 60_000) {
        violation(`pull pending hace más de ${PENDING_MINUTES} min`, `${p._id} ${p.studentEmail}`);
    }
    if (/\{\w+\}/.test(p.prompt || '')) violation('prompt de pull con variables sin sustituir', `${p._id} ${(p.prompt.match(/\{\w+\}/) || [])[0]}`);
    if ((p.prompt || '').includes('previousQuestions')) violation('prompt de pull con previousQuestions', `${p._id}`);
}

// Pulls duplicados por (estudiante, pull_id): romperían el join con questions
const pullIdCounts = new Map();
for (const p of pulls) {
    const k = `${p.studentEmail}|${p.pull_id}`;
    pullIdCounts.set(k, (pullIdCounts.get(k) || 0) + 1);
}
for (const [k, c] of pullIdCounts) if (c > 1) violation('pull_id repetido para un estudiante', `${k} x${c}`);

// ---------------------------------------------------------------- bloques y balance por estudiante
const activeByStudent = new Map();
for (const p of pulls.filter(p => p.slotActive)) {
    if (!activeByStudent.has(p.studentEmail)) activeByStudent.set(p.studentEmail, []);
    activeByStudent.get(p.studentEmail).push(p);
}

let studentsBalanced = 0;
const imbalanceHistogram = new Map();
for (const [email, studentPulls] of activeByStudent) {
    const blocks = new Map();
    for (const p of studentPulls) {
        if (!blocks.has(p.blockIndex)) blocks.set(p.blockIndex, []);
        blocks.get(p.blockIndex).push(p);
    }
    const blockIndexes = [...blocks.keys()].sort((a, b) => a - b);
    blockIndexes.forEach((b, i) => {
        const bp = blocks.get(b);
        if (b !== i) violation('bloques no consecutivos', `${email} bloque ${b}`);
        const conds = bp.map(p => p.conditionId);
        const positions = bp.map(p => p.positionInBlock);
        if (new Set(conds).size !== conds.length) violation('condición repetida dentro de un bloque', `${email} bloque ${b}: ${conds.join(',')}`);
        if (new Set(positions).size !== positions.length) violation('posición repetida dentro de un bloque', `${email} bloque ${b}`);
        if (positions.some(x => x < 0 || x >= BLOCK_SIZE)) violation('posición fuera de rango', `${email} bloque ${b}`);
        // Todos los bloques salvo el último deben estar completos
        if (i < blockIndexes.length - 1 && bp.length !== BLOCK_SIZE) violation('bloque intermedio incompleto', `${email} bloque ${b} (${bp.length})`);
    });
    // Balance esperado: diferencia máxima entre condiciones <= 1 (solo el último bloque puede estar incompleto)
    const counts = CONDITION_IDS.map(id => studentPulls.filter(p => p.conditionId === id).length);
    const diff = Math.max(...counts) - Math.min(...counts);
    imbalanceHistogram.set(diff, (imbalanceHistogram.get(diff) || 0) + 1);
    if (diff <= 1) studentsBalanced++;
    else violation('estudiante desequilibrado (diferencia > 1 entre condiciones)', `${email}: ${counts.join('/')}`);
}

// ---------------------------------------------------------------- preguntas
const questionFilter = { subject: SUBJECT, permutation: { $exists: true } };
const studyQuestions = await questionsCol.find(questionFilter).sort({ createdAt: -1 }).limit(SAMPLE).toArray();
const questionsWithoutStudyFields = firstPullDate
    ? await questionsCol.countDocuments({ subject: SUBJECT, createdAt: { $gte: firstPullDate }, permutation: { $exists: false } })
    : 0;

for (const q of studyQuestions) {
    const id = `${q._id} (pull ${q.pull_id})`;
    const n = (q.originalChoices || []).length;
    if (!isPermutation(q.permutation, n)) { violation('permutation no es una permutación de originalChoices', id); continue; }
    for (let i = 0; i < n; i++) {
        if (q.choices[i] !== q.originalChoices[q.permutation[i]]) { violation('choices[i] !== originalChoices[permutation[i]]', id); break; }
    }
    if (!q.malformed && q.choices[q.answer] !== q.originalChoices[q.originalAnswer]) {
        violation('choices[answer] !== originalChoices[originalAnswer]', id);
    }
    if (!q.shuffled && !q.permutation.every((v, i) => v === i)) violation('pregunta no barajada con permutación no identidad', id);
    const expectedOriginal = computeStudentAnswerOriginal(q.permutation, q.studentAnswer);
    if (q.studentAnswerOriginal !== expectedOriginal) {
        violation('studentAnswerOriginal incorrecto', `${id}: ${q.studentAnswerOriginal} vs ${expectedOriginal}`);
    }
    if (!q.studentReport && q.correct !== (q.answer === q.studentAnswer)) violation('correct no coincide con answer === studentAnswer', id);

    // Pull asociado
    const pull = pullsByKey.get(`${q.studentEmail}|${q.pull_id}`);
    if (!pull) { violation('pregunta per_pull sin Pull asociado', id); continue; }
    if (pull.status !== 'ok') violation('pregunta asociada a un Pull que no está en ok', `${id} status=${pull.status}`);
    if (pull.promptId !== q.promptId || q.prompt !== q.promptId) violation('promptId de la pregunta distinto del Pull', id);
    if (pull.md5Prompt !== q.md5Prompt) violation('md5Prompt de la pregunta distinto del Pull', id);
    if (pull.llmModel !== q.llmModel) violation('llmModel de la pregunta distinto del Pull', id);
    if (q.shuffled && !pull.shuffled) violation('pregunta barajada en un Pull sin barajado', id);
    if (pull.shuffled && !q.shuffled && !q.malformed) violation('pregunta sin barajar en un Pull con barajado', id);
    if (pull.topic !== q.topic || pull.subTopic !== q.subTopic || pull.difficulty !== q.difficulty) violation('topic/subTopic/difficulty distinto del Pull', id);
}

// ---------------------------------------------------------------- informe
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)}%` : '-');
console.log('------------------------------------------------------------');
console.log('Pulls por condición (todos / error / truncados / pending):');
for (const id of CONDITION_IDS) {
    const cp = pulls.filter(p => p.conditionId === id);
    const err = cp.filter(p => p.status === 'error').length;
    const trunc = cp.filter(p => p.truncated).length;
    const pend = cp.filter(p => p.status === 'pending').length;
    console.log(`  ${id.padEnd(36)} ${String(cp.length).padStart(6)}  error ${pct(err, cp.length).padStart(6)}  truncado ${pct(trunc, cp.length).padStart(6)}  pending ${pend}`);
}
console.log('------------------------------------------------------------');
console.log(`Estudiantes con pulls activos: ${activeByStudent.size} | equilibrados (dif. <= 1): ${studentsBalanced}`);
console.log(`Histograma de diferencia max-min entre condiciones por estudiante: ${[...imbalanceHistogram.entries()].sort((a, b) => a[0] - b[0]).map(([d, c]) => `${d}:${c}`).join('  ')}`);
console.log(`Preguntas per_pull revisadas: ${studyQuestions.length} (muestra máx. ${SAMPLE}) | malformadas: ${studyQuestions.filter(q => q.malformed).length}`);
console.log(`Preguntas de ${SUBJECT} posteriores al primer Pull sin campos del estudio: ${questionsWithoutStudyFields}`);
console.log('------------------------------------------------------------');
if (violations.size === 0) {
    console.log('OK: no se han encontrado violaciones.');
} else {
    console.log('VIOLACIONES:');
    for (const [type, v] of violations) {
        console.log(`  - ${type}: ${v.count}`);
        v.examples.forEach(e => console.log(`      ${e}`));
    }
}
console.log('============================================================');

await mongoose.disconnect();
process.exit(violations.size === 0 ? 0 : 1);
