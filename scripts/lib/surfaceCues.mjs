// Métricas de pistas superficiales de una pregunta tipo test (usadas por el script piloto).

// Opciones que hacen referencia a otras opciones (no tienen sentido si las opciones se barajan)
const REFERENTIAL_PATTERNS = [
    /todas las (anteriores|opciones|respuestas)/i,
    /ninguna de las (anteriores|opciones|respuestas)/i,
    /\bambas\b/i,
    /\blas dos (anteriores|primeras|últimas)\b/i,
    /\b(la|las) (primera|segunda|tercera|cuarta)s? y (la )?(primera|segunda|tercera|cuarta)\b/i,
    /\bopci(ó|o)n(es)? (anterior|anteriores|[a-d]|[1-4])\b/i,
    /^\s*[A-D] y [A-D]\s*\.?\s*$/,
    /\ball of the above\b/i,
    /\bnone of the above\b/i,
];

export function isReferentialChoice(choice) {
    const text = String(choice ?? '');
    return REFERENTIAL_PATTERNS.some(re => re.test(text));
}

// Devuelve las métricas de una pregunta { choices, answer } en el orden devuelto por el modelo
export function questionCueMetrics(question) {
    const choices = Array.isArray(question.choices) ? question.choices.map(c => String(c ?? '')) : [];
    const answer = Number(question.answer);
    const malformed = choices.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer >= choices.length;

    const lengths = choices.map(c => c.length);
    const metrics = {
        numChoices: choices.length,
        answer: Number.isInteger(answer) ? answer : null,
        malformed,
        lengths,
        correctIsStrictlyLongest: null,
        correctIsLongestOrTied: null,
        lengthRatio: null,
        hasReferential: choices.some(isReferentialChoice),
    };
    if (malformed) return metrics;

    const correctLength = lengths[answer];
    const others = lengths.filter((_, i) => i !== answer);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    metrics.correctIsStrictlyLongest = others.every(l => correctLength > l);
    metrics.correctIsLongestOrTied = others.every(l => correctLength >= l);
    metrics.lengthRatio = mean > 0 ? correctLength / mean : null;
    return metrics;
}

// Resumen por condición de una lista de métricas de preguntas
export function summarizeCues(metricsList) {
    const valid = metricsList.filter(m => !m.malformed);
    const n = valid.length;
    const pct = (count) => (n > 0 ? (100 * count) / n : null);
    const positions = [0, 1, 2, 3].map(p => valid.filter(m => m.answer === p).length);
    const ratios = valid.map(m => m.lengthRatio).filter(r => r != null);
    return {
        numQuestions: metricsList.length,
        numValid: n,
        numMalformed: metricsList.length - n,
        pctCorrectStrictlyLongest: pct(valid.filter(m => m.correctIsStrictlyLongest).length),
        pctCorrectLongestOrTied: pct(valid.filter(m => m.correctIsLongestOrTied).length),
        meanLengthRatio: ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null,
        pctPos0: pct(positions[0]),
        pctPos1: pct(positions[1]),
        pctPos2: pct(positions[2]),
        pctPos3: pct(positions[3]),
        pctWithReferential: metricsList.length ? (100 * metricsList.filter(m => m.hasReferential).length) / metricsList.length : null,
    };
}

// Escapa un valor para CSV
export function csvValue(value) {
    if (value === null || value === undefined) return '';
    const text = typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(4) : String(value);
    return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows, columns) {
    return [columns.join(','), ...rows.map(r => columns.map(c => csvValue(r[c])).join(','))].join('\n') + '\n';
}
