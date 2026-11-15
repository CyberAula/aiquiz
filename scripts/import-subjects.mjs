// Importación ÚNICA de app/constants/subjects.js a la base de datos del manager
// (colecciones subjects, topics y subtopics). Pensado para ejecutarse una vez al desplegar
// la versión con manager y borrarse después.
//
// Por defecto NO escribe nada: muestra lo que haría. Para escribir hay que pasar --apply.
//
//   node scripts/import-subjects.mjs                      -> simulación
//   node scripts/import-subjects.mjs --apply              -> crea lo que falte
//
// Opciones:
//   --apply            Escribe en la base de datos (sin esto solo simula).
//   --file <ruta>      Fichero subjects.js a importar (por defecto app/constants/subjects.js).
//   --uri <mongo-uri>  Base de datos destino. Si no se indica se usa la misma que la aplicación:
//                      env.MONGODB_URI de next.config.js y, si no existe, la variable MONGODB_URI.
//   --only CORE,BBDD   Importa solo esas asignaturas.
//   --admin <email>    Usuario del manager (ya existente) que queda como administrador y profesor
//                      de las asignaturas que se creen.
//   --update           Además de crear lo que falte, actualiza el nombre de las asignaturas y el
//                      material (description) de los subtemas que ya existan. Sin esta opción lo
//                      que ya existe no se toca.
//
// Es idempotente: se puede lanzar varias veces; las asignaturas se identifican por sus siglas,
// los temas por su título dentro de la asignatura y los subtemas por su título dentro del tema.
// Nunca borra nada.
//
// Correspondencia de campos:
//   subjects[SIGLAS].name      -> Subject.title   (SIGLAS -> Subject.acronym)
//   topic.label                -> Topic.title     (la aplicación recalcula topic.value a partir del título)
//   subtopic.title             -> Subtopic.title
//   subtopic.comment (+ focus) -> Subtopic.description  (es lo que la aplicación envía al modelo como {comment})
// Se respetan títulos y etiquetas tal cual para que las preguntas ya guardadas (que llevan el
// nombre del tema y del subtema) sigan cuadrando en las estadísticas.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
    const args = { apply: false, update: false, file: null, uri: null, only: null, admin: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = () => {
            const value = argv[++i];
            if (!value || value.startsWith('--')) throw new Error(`Falta el valor de ${arg}`);
            return value;
        };
        if (arg === '--apply') args.apply = true;
        else if (arg === '--update') args.update = true;
        else if (arg === '--file') args.file = next();
        else if (arg === '--uri') args.uri = next();
        else if (arg === '--only') args.only = next().split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        else if (arg === '--admin') args.admin = next().trim().toLowerCase();
        else throw new Error(`Opción desconocida: ${arg}`);
    }
    return args;
}

function resolveMongoUri(cliUri) {
    if (cliUri) return { uri: cliUri, source: '--uri' };
    // La aplicación usa el valor de next.config.js (se incrusta al compilar), así que tiene
    // prioridad sobre la variable de entorno para no escribir en una base de datos distinta.
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

// subjects.js usa "export" pero el proyecto no es "type": "module", así que se copia a un
// fichero temporal .mjs para poder importarlo con Node.
async function loadSubjects(filePath) {
    const absolute = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absolute)) throw new Error(`No existe el fichero ${absolute}`);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiquiz-subjects-'));
    const tmpFile = path.join(tmpDir, 'subjects.mjs');
    try {
        fs.copyFileSync(absolute, tmpFile);
        const module = await import(pathToFileURL(tmpFile).href);
        const subjects = module.subjects || module.default;
        if (!subjects || typeof subjects !== 'object') {
            throw new Error(`${absolute} no exporta "subjects"`);
        }
        return { subjects, absolute };
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}

function buildDescription(subtopic) {
    const comment = typeof subtopic.comment === 'string' ? subtopic.comment.trim() : '';
    const focus = typeof subtopic.focus === 'string' ? subtopic.focus.trim() : '';
    return [comment, focus].filter(Boolean).join('\n\n');
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const { subjects, absolute } = await loadSubjects(args.file || path.join(ROOT, 'app/constants/subjects.js'));
    const { uri, source } = resolveMongoUri(args.uri);

    let acronyms = Object.keys(subjects);
    if (args.only) {
        const missing = args.only.filter((a) => !acronyms.includes(a));
        if (missing.length) throw new Error(`--only: no están en el fichero: ${missing.join(', ')}`);
        acronyms = acronyms.filter((a) => args.only.includes(a));
    }

    console.log(`Fichero:       ${absolute}`);
    console.log(`Base de datos: ${maskUri(uri)}  (de ${source})`);
    console.log(`Asignaturas:   ${acronyms.join(', ')}`);
    console.log(`Modo:          ${args.apply ? 'ESCRITURA (--apply)' : 'simulación (no escribe; usa --apply para escribir)'}${args.update ? ' + actualizar existentes' : ''}`);
    console.log('');

    const mongoose = require('mongoose');
    mongoose.set('strictQuery', false);
    const Subject = require('../app/manager/models/Subject.js');
    const Topic = require('../app/manager/models/Topic.js');
    const Subtopic = require('../app/manager/models/Subtopic.js');
    const User = require('../app/manager/models/User.js');

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

    const totals = {
        subjects: { created: 0, existing: 0, updated: 0 },
        topics: { created: 0, existing: 0 },
        subtopics: { created: 0, existing: 0, updated: 0, withoutMaterial: 0 },
    };

    try {
        let adminUser = null;
        if (args.admin) {
            adminUser = await User.findOne({ email: args.admin });
            if (!adminUser) throw new Error(`--admin: no existe ningún usuario con email ${args.admin}`);
        }

        for (const acronym of acronyms) {
            const source = subjects[acronym] || {};
            const title = (source.name || acronym).trim();
            const topics = Array.isArray(source.topics) ? source.topics : [];

            let subject = await Subject.findOne({ acronym });
            let line = '';
            if (!subject) {
                totals.subjects.created++;
                line = 'NUEVA';
                if (args.apply) {
                    subject = await new Subject({
                        title,
                        acronym,
                        description: '',
                        administrators: adminUser ? [adminUser._id] : [],
                        professors: adminUser ? [adminUser._id] : [],
                    }).save();
                }
            } else {
                totals.subjects.existing++;
                line = 'ya existe';
                if (args.update && subject.title !== title) {
                    totals.subjects.updated++;
                    line += `, nombre "${subject.title}" -> "${title}"`;
                    if (args.apply) {
                        subject.title = title;
                        await subject.save();
                    }
                }
            }
            console.log(`${acronym} — ${title}  [${line}]`);

            const seenTopics = new Set();
            for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
                const sourceTopic = topics[topicIndex] || {};
                const topicTitle = String(sourceTopic.label || sourceTopic.value || '').trim();
                if (!topicTitle) {
                    console.log(`  ! tema ${topicIndex + 1} sin label ni value: se omite`);
                    continue;
                }
                if (seenTopics.has(topicTitle)) {
                    console.log(`  ! tema repetido en el fichero, se omite la repetición: ${topicTitle}`);
                    continue;
                }
                seenTopics.add(topicTitle);

                let topic = subject ? await Topic.findOne({ subject: subject._id, title: topicTitle }) : null;
                const topicIsNew = !topic;
                if (topicIsNew) {
                    totals.topics.created++;
                    if (args.apply) {
                        topic = await new Topic({ title: topicTitle, description: '', subject: subject._id, order: topicIndex }).save();
                    }
                } else {
                    totals.topics.existing++;
                }

                const subtopics = Array.isArray(sourceTopic.subtopics) ? sourceTopic.subtopics : [];
                let created = 0;
                let existing = 0;
                let updated = 0;
                const seenSubtopics = new Set();

                for (let subtopicIndex = 0; subtopicIndex < subtopics.length; subtopicIndex++) {
                    const sourceSubtopic = typeof subtopics[subtopicIndex] === 'string'
                        ? { title: subtopics[subtopicIndex] }
                        : subtopics[subtopicIndex] || {};
                    const subtopicTitle = String(sourceSubtopic.title || '').trim();
                    if (!subtopicTitle || seenSubtopics.has(subtopicTitle)) {
                        console.log(`  ! subtema sin título o repetido en "${topicTitle}": se omite`);
                        continue;
                    }
                    seenSubtopics.add(subtopicTitle);

                    const description = buildDescription(sourceSubtopic);
                    if (!description) totals.subtopics.withoutMaterial++;

                    let subtopic = topic ? await Subtopic.findOne({ topic: topic._id, title: subtopicTitle }) : null;
                    if (!subtopic) {
                        created++;
                        if (args.apply) {
                            await new Subtopic({ title: subtopicTitle, description, topic: topic._id, order: subtopicIndex }).save();
                        }
                    } else {
                        existing++;
                        if (args.update && (subtopic.description || '') !== description) {
                            updated++;
                            if (args.apply) {
                                subtopic.description = description;
                                await subtopic.save();
                            }
                        }
                    }
                }

                totals.subtopics.created += created;
                totals.subtopics.existing += existing;
                totals.subtopics.updated += updated;
                const parts = [`${created} subtemas nuevos`];
                if (existing) parts.push(`${existing} ya existían`);
                if (updated) parts.push(`${updated} actualizados`);
                console.log(`  ${topicIsNew ? '+' : '='} ${topicTitle}: ${parts.join(', ')}`);
            }
        }

        console.log('');
        console.log(args.apply ? 'Resultado:' : 'Resultado de la simulación (no se ha escrito nada):');
        console.log(`  Asignaturas: ${totals.subjects.created} nuevas, ${totals.subjects.existing} ya existían, ${totals.subjects.updated} renombradas`);
        console.log(`  Temas:       ${totals.topics.created} nuevos, ${totals.topics.existing} ya existían`);
        console.log(`  Subtemas:    ${totals.subtopics.created} nuevos, ${totals.subtopics.existing} ya existían, ${totals.subtopics.updated} actualizados`);
        if (totals.subtopics.withoutMaterial) {
            console.log(`  (${totals.subtopics.withoutMaterial} subtemas del fichero no tienen material de clase)`);
        }
        if (totals.subjects.created && !adminUser) {
            console.log('  Aviso: las asignaturas nuevas quedan sin administrador ni profesores; asígnalos en el manager o repite con --admin <email> antes de crear.');
        }
        if (!args.apply) console.log('\nPara escribir estos cambios, repite el comando añadiendo --apply');
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((error) => {
    console.error(`\nERROR: ${error.message}`);
    process.exit(1);
});
