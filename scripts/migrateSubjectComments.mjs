// Migración (una sola vez) de los campos `comment` de app/constants/subjects.js.
//
// Antes: comment = "Este es el resumen de la materia ... : <resumen> ... </resumen>"   (CORE, BBDD, ...)
//        comment = "Las preguntas de este tema evalúan ... <resumen> ... </resumen>"      (OFI)
// Después:
//        comment = solo el material explicado en clase (sin preámbulo ni etiquetas)
//        focus   = pautas del profesor sobre qué preguntar (el texto previo a <resumen> que no es el
//                  preámbulo genérico), solo si existe
// Las instrucciones sobre cómo usar el material las añade el prompt (ver buildClassMaterial en
// app/utils/promptText.js).
//
// Localiza cada propiedad `comment` con un parser (acorn) y solo reescribe esos literales; el resto del
// fichero queda intacto.
//
// Uso (desde la raíz del repo):
//   node scripts/migrateSubjectComments.mjs           -> informe, no escribe
//   node scripts/migrateSubjectComments.mjs --write   -> reescribe subjects.js

import fs from 'fs';
import * as acorn from 'acorn';

const FILE = 'app/constants/subjects.js';
const WRITE = process.argv.includes('--write');

// Preámbulo genérico repetido en todos los subtemas: sus instrucciones pasan al prompt
const GENERIC_PREAMBLE = /^Este es el resumen de la materia desarrollada en clase\b/;
const TAG = /<\s*\/?\s*resumen\s*>/gi;

export function migrateComment(comment) {
    const text = String(comment ?? '');
    const open = text.search(/<\s*resumen\s*>/i);
    if (open < 0) {
        // Sin etiquetas: todo es material de clase
        return { comment: text.replace(TAG, '').trim(), focus: '' };
    }
    const prefix = text.slice(0, open).trim();
    const material = text.slice(open).replace(TAG, '').trim();

    let focus = '';
    if (prefix && !GENERIC_PREAMBLE.test(prefix)) {
        focus = prefix;
        // "…aplica las siguientes funciones de Microsoft Excel:" + lista en el material
        if (/:\s*$/.test(focus)) {
            focus = focus.replace(/ las siguientes (.*?):\s*$/, ' las $1 descritas en el material de clase.');
            if (/:\s*$/.test(focus)) focus = focus.replace(/:\s*$/, ' (ver el material de clase).');
        }
    }
    return { comment: material, focus };
}

const toTemplateLiteral = (value) =>
    '`' + value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${').replace(/\r/g, '\\r') + '`';

const literalValue = (node) => {
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked;
    return null;
};

// Solo se ejecuta como script (no al importar migrateComment desde los tests)
if (process.argv[1]?.endsWith('migrateSubjectComments.mjs')) {
    const source = fs.readFileSync(FILE, 'utf8');
    const ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module' });

    const edits = [];
    const stats = { comments: 0, changed: 0, withFocus: 0, withoutTags: 0, preambleRemoved: 0, emptyComments: 0 };
    const examples = [];

    const visit = (node, parentObject) => {
        if (!node || typeof node.type !== 'string') return;
        if (node.type === 'ObjectExpression') {
            for (const prop of node.properties) {
                const key = prop.key?.name ?? prop.key?.value;
                if (prop.type === 'Property' && key === 'comment') {
                    const value = literalValue(prop.value);
                    if (value === null) throw new Error(`comment no literal en la posición ${prop.start}`);
                    if (node.properties.some(p => (p.key?.name ?? p.key?.value) === 'focus')) {
                        throw new Error(`El subtema de la posición ${prop.start} ya tiene focus: ¿migración ya aplicada?`);
                    }
                    stats.comments++;
                    if (!value.trim()) { stats.emptyComments++; continue; }
                    const migrated = migrateComment(value);
                    if (!/<\s*resumen\s*>/i.test(value)) stats.withoutTags++;
                    if (GENERIC_PREAMBLE.test(value.trim())) stats.preambleRemoved++;
                    if (migrated.focus) stats.withFocus++;
                    let replacement = toTemplateLiteral(migrated.comment);
                    if (migrated.focus) replacement += `, focus: ${toTemplateLiteral(migrated.focus)}`;
                    if (migrated.comment !== value || migrated.focus) {
                        stats.changed++;
                        edits.push({ start: prop.value.start, end: prop.value.end, replacement });
                        const title = literalValue(node.properties.find(p => (p.key?.name ?? p.key?.value) === 'title')?.value ?? {}) ?? '?';
                        if (migrated.focus && examples.filter(e => e.focus).length < 3 || !migrated.focus && examples.filter(e => !e.focus).length < 2) {
                            examples.push({ title, before: value, ...migrated });
                        }
                    }
                }
            }
        }
        for (const k of Object.keys(node)) {
            const child = node[k];
            if (Array.isArray(child)) child.forEach(c => visit(c, node));
            else if (child && typeof child.type === 'string') visit(child, node);
        }
    };
    visit(ast);

    let output = source;
    for (const e of edits.sort((a, b) => b.start - a.start)) {
        output = output.slice(0, e.start) + e.replacement + output.slice(e.end);
    }

    // Comprobación: el fichero resultante parsea y no quedan etiquetas <resumen>
    acorn.parse(output, { ecmaVersion: 'latest', sourceType: 'module' });
    const leftoverTags = (output.match(TAG) || []).length;

    const short = (s, n = 160) => JSON.stringify(s.length > n ? s.slice(0, n) + '…' : s);
    console.log('------------------------------------------------------------');
    console.log(`comments: ${stats.comments} | vacíos: ${stats.emptyComments} | modificados: ${stats.changed}`);
    console.log(`preámbulo genérico eliminado: ${stats.preambleRemoved} | con focus: ${stats.withFocus} | sin etiquetas (todo material): ${stats.withoutTags}`);
    console.log(`etiquetas <resumen> restantes: ${leftoverTags}`);
    console.log('------------------------------------------------------------');
    for (const ex of examples) {
        console.log(`· ${ex.title}`);
        console.log(`  antes:   ${short(ex.before)}`);
        console.log(`  comment: ${short(ex.comment)}`);
        if (ex.focus) console.log(`  focus:   ${short(ex.focus)}`);
    }
    console.log('------------------------------------------------------------');

    if (leftoverTags > 0) {
        console.error('Quedan etiquetas <resumen>: no se escribe nada.');
        process.exit(1);
    }
    if (WRITE) {
        fs.writeFileSync(FILE, output);
        console.log(`${FILE} reescrito (${edits.length} cambios).`);
    } else {
        console.log('Modo informe: no se ha escrito nada. Usa --write para aplicar.');
    }
}
