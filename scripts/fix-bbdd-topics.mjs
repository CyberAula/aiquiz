// Corrección ÚNICA de preguntas antiguas cuyo campo "topic" guarda lo que hoy es un subtema
// (y cuyo "subTopic" está vacío). Pasa en BBDD con las preguntas de marzo-abril de 2025.
//
// Para cada pregunta afectada:
//   subTopic <- valor actual de topic (en minúsculas, como lo guarda la aplicación)
//   topic    <- etiqueta del tema de subjects.js al que pertenece ese subtema
// No modifica ningún otro campo (tampoco updatedAt).
//
// Por defecto NO escribe nada: muestra lo que haría. Para escribir hay que pasar --apply.
//
//   node scripts/fix-bbdd-topics.mjs                 -> simulación
//   node scripts/fix-bbdd-topics.mjs --apply         -> corrige y deja un fichero de respaldo
//   node scripts/fix-bbdd-topics.mjs --revert <fichero-de-respaldo> --apply   -> deshace
//
// Opciones:
//   --apply              Escribe en la base de datos (sin esto solo simula).
//   --subject <SIGLAS>   Asignatura a corregir (por defecto BBDD).
//   --file <ruta>        subjects.js de referencia (por defecto app/constants/subjects.js).
//   --uri <mongo-uri>    Base de datos destino. Si no se indica: env.MONGODB_URI de next.config.js
//                        (la que usa la aplicación) y, si no existe, la variable MONGODB_URI.
//   --alias "viejo=nuevo"  Equivalencia manual para un nombre antiguo que no coincide con ningún
//                        subtema actual (p. ej. una errata corregida). "nuevo" es el título del
//                        subtema actual. Se puede repetir.
//   --backup <ruta>      Dónde guardar el respaldo (por defecto fix-topics-backup-<SIGLAS>-<fecha>.json
//                        en el directorio actual). Contiene _id, topic y subTopic originales.
//   --revert <ruta>      Restaura topic y subTopic desde un fichero de respaldo.
//
// Solo toca preguntas cuyo topic NO es un tema actual, cuyo topic coincide con exactamente un
// subtema actual y cuyo subTopic está vacío. El resto se lista y se deja como está.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const norm = (value) => String(value ?? '').trim().toLowerCase();

function parseArgs(argv) {
    const args = { apply: false, subject: 'BBDD', file: null, uri: null, aliases: {}, backup: null, revert: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = () => {
            const value = argv[++i];
            if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${arg}`);
            return value;
        };
        if (arg === '--apply') args.apply = true;
        else if (arg === '--subject') args.subject = next().trim().toUpperCase();
        else if (arg === '--file') args.file = next();
        else if (arg === '--uri') args.uri = next();
        else if (arg === '--backup') args.backup = next();
        else if (arg === '--revert') args.revert = next();
        else if (arg === '--alias') {
            const value = next();
            const separator = value.indexOf('=');
            if (separator < 1) throw new Error('--alias debe tener la forma "nombre antiguo=título del subtema actual"');
            args.aliases[norm(value.slice(0, separator))] = norm(value.slice(separator + 1));
        } else throw new Error(`Opción desconocida: ${arg}`);
    }
    return args;
}

function resolveMongoUri(cliUri) {
    if (cliUri) return { uri: cliUri, source: '--uri' };
    const configPath = path.join(ROOT, 'next.config.js');
    if (fs.existsSync(configPath)) {
        try {
            const config = require(configPath);
            if (config?.env?.MONGODB_URI) return { uri: config.env.MONGODB_URI, source: 'next.config.js' };
        } catch (error) {
            console.warn(`Aviso: no se pudo leer next.config.js (${error.message})`);
        }
    }
    if (process.env.MONGODB_URI) return { uri: process.env.MONGODB_URI, source: 'variable MONGODB_URI' };
    throw new Error('No hay base de datos destino: usa --uri o define MONGODB_URI');
}

const maskUri = (uri) => uri.replace(/\/\/([^@/]+)@/, '//***@');

async function loadSubjects(filePath) {
    const absolute = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolute)) throw new Error(`No existe el fichero ${absolute}`);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiquiz-subjects-'));
    const tmpFile = path.join(tmpDir, 'subjects.mjs');
    try {
        fs.copyFileSync(absolute, tmpFile);
        const module = await import(pathToFileURL(tmpFile).href);
        const subjects = module.subjects || module.default;
        if (!subjects || typeof subjects !== 'object') throw new Error(`${absolute} no exporta "subjects"`);
        return { subjects, absolute };
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}

const EMPTY_SUBTOPIC = { $or: [{ subTopic: { $exists: false } }, { subTopic: null }, { subTopic: '' }] };

async function revert(questions, args) {
    const backupPath = path.resolve(process.cwd(), args.revert);
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    const { ObjectId } = require('mongoose').Types;
    console.log(`Respaldo: ${backupPath} (${backup.questions.length} preguntas, asignatura ${backup.subject}, creado ${backup.createdAt})`);

    if (!args.apply) {
        console.log('\nSimulación: se restaurarían topic y subTopic de esas preguntas. Repite con --apply para hacerlo.');
        return;
    }

    let restored = 0;
    for (let i = 0; i < backup.questions.length; i += 500) {
        const operations = backup.questions.slice(i, i + 500).map((question) => ({
            updateOne: {
                filter: { _id: new ObjectId(question._id) },
                update: question.subTopic === undefined
                    ? { $set: { topic: question.topic }, $unset: { subTopic: '' } }
                    : { $set: { topic: question.topic, subTopic: question.subTopic } },
            },
        }));
        const result = await questions.bulkWrite(operations, { ordered: false });
        restored += result.modifiedCount;
    }
    console.log(`\nRestauradas ${restored} preguntas.`);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const { uri, source } = resolveMongoUri(args.uri);
    const mongoose = require('mongoose');

    console.log(`Base de datos: ${maskUri(uri)}  (de ${source})`);
    console.log(`Modo:          ${args.apply ? 'ESCRITURA (--apply)' : 'simulación (no escribe; usa --apply para escribir)'}`);

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    try {
        const questions = mongoose.connection.collection('questions');

        if (args.revert) {
            await revert(questions, args);
            return;
        }

        const { subjects, absolute } = await loadSubjects(args.file || path.join(ROOT, 'app/constants/subjects.js'));
        const subject = subjects[args.subject];
        if (!subject) throw new Error(`La asignatura ${args.subject} no está en ${absolute}`);
        console.log(`Fichero:       ${absolute}`);
        console.log(`Asignatura:    ${args.subject}\n`);

        const topicLabels = new Set((subject.topics || []).map((topic) => topic.label));
        const subtopicToTopics = new Map();
        for (const topic of subject.topics || []) {
            for (const subtopic of topic.subtopics || []) {
                const key = norm(typeof subtopic === 'string' ? subtopic : subtopic.title);
                if (!key) continue;
                if (!subtopicToTopics.has(key)) subtopicToTopics.set(key, new Set());
                subtopicToTopics.get(key).add(topic.label);
            }
        }

        const groups = await questions
            .aggregate([{ $match: { subject: args.subject } }, { $group: { _id: '$topic', total: { $sum: 1 } } }])
            .toArray();

        const plan = [];
        const skipped = [];
        let alreadyFine = 0;

        for (const group of groups) {
            const oldTopic = group._id;
            if (topicLabels.has(oldTopic)) {
                alreadyFine += group.total;
                continue;
            }
            const key = args.aliases[norm(oldTopic)] || norm(oldTopic);
            const candidates = subtopicToTopics.get(key);
            if (!candidates) {
                skipped.push({ oldTopic, total: group.total, reason: 'no coincide con ningún subtema actual (usa --alias)' });
                continue;
            }
            if (candidates.size > 1) {
                skipped.push({ oldTopic, total: group.total, reason: `ambiguo: está en ${[...candidates].join(' / ')}` });
                continue;
            }
            const filter = { $and: [{ subject: args.subject, topic: oldTopic }, EMPTY_SUBTOPIC] };
            const fixable = await questions.countDocuments(filter);
            if (fixable < group.total) {
                skipped.push({ oldTopic, total: group.total - fixable, reason: 'ya tienen subTopic relleno: no se tocan' });
            }
            if (fixable > 0) {
                plan.push({ oldTopic, newTopic: [...candidates][0], newSubTopic: norm(oldTopic), filter, total: fixable });
            }
        }

        const byNewTopic = new Map();
        for (const item of plan) {
            if (!byNewTopic.has(item.newTopic)) byNewTopic.set(item.newTopic, []);
            byNewTopic.get(item.newTopic).push(item);
        }
        for (const [newTopic, items] of byNewTopic) {
            console.log(`Tema "${newTopic}"  <-  ${items.reduce((sum, item) => sum + item.total, 0)} preguntas`);
            items.sort((a, b) => b.total - a.total).forEach((item) => console.log(`    ${String(item.total).padStart(6)}  subtema "${item.newSubTopic}"`));
        }

        const totalToFix = plan.reduce((sum, item) => sum + item.total, 0);
        console.log(`\nYa correctas (topic es un tema actual): ${alreadyFine}`);
        console.log(`A corregir: ${totalToFix} preguntas en ${plan.length} nombres antiguos`);
        if (skipped.length) {
            console.log(`Sin tocar: ${skipped.reduce((sum, item) => sum + item.total, 0)} preguntas`);
            skipped.forEach((item) => console.log(`    ${String(item.total).padStart(6)}  "${item.oldTopic}": ${item.reason}`));
        }

        if (!args.apply) {
            console.log('\nSimulación: no se ha escrito nada. Repite con --apply para corregir.');
            return;
        }
        if (totalToFix === 0) {
            console.log('\nNada que corregir.');
            return;
        }

        // Respaldo con los valores originales, antes de escribir
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.resolve(process.cwd(), args.backup || `fix-topics-backup-${args.subject}-${stamp}.json`);
        const original = [];
        for (const item of plan) {
            const docs = await questions.find(item.filter, { projection: { topic: 1, subTopic: 1 } }).toArray();
            docs.forEach((doc) => original.push({ _id: String(doc._id), topic: doc.topic, subTopic: doc.subTopic }));
        }
        fs.writeFileSync(backupPath, JSON.stringify({ subject: args.subject, createdAt: new Date().toISOString(), questions: original }));
        console.log(`\nRespaldo guardado en ${backupPath} (${original.length} preguntas)`);

        let modified = 0;
        for (const item of plan) {
            const result = await questions.updateMany(item.filter, { $set: { topic: item.newTopic, subTopic: item.newSubTopic } });
            modified += result.modifiedCount;
        }
        console.log(`Corregidas ${modified} preguntas.`);
        console.log(`Para deshacerlo: node scripts/fix-bbdd-topics.mjs --revert "${backupPath}" --apply`);
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(`\nERROR: ${error.message}`);
    process.exit(1);
});
