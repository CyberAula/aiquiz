import { randomInt } from 'crypto';

// Lógica pura del modo de estudio "per_pull" (sin acceso a base de datos), para poder
// testearla y reutilizarla desde las rutas de la API y los scripts.


// Texto legible de la dificultad para sustituir {difficulty} en los prompts.
// En la base de datos se sigue guardando el valor original (facil / intermedio / avanzado).
export const DIFFICULTY_LABELS = {
    facil: 'fácil',
    intermedio: 'intermedio',
    avanzado: 'avanzado',
};

export function difficultyLabel(difficulty) {
    return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}


// Indica si la configuración de ABCTesting de una asignatura usa aleatorización por pull
export function isPerPullMode(abcTestingConfig) {
    return abcTestingConfig?.randomization === 'per_pull';
}

// Devuelve el prompt (objeto { id, content }) de la configuración con el id indicado
export function getPromptById(abcTestingConfig, promptId) {
    const key = Object.keys(abcTestingConfig)
        .filter(k => k.startsWith('prompt'))
        .find(k => abcTestingConfig[k].id === promptId);
    return key ? abcTestingConfig[key] : undefined;
}


// Aleatorización por bloques permutados.
// activePulls: pulls del estudiante en la asignatura que ocupan hueco (pending u ok),
//              con { blockIndex, positionInBlock, conditionId }.
// conditions:  lista de condiciones de la configuración ({ id, promptId, shuffled }).
// Busca el primer bloque incompleto, la primera posición libre de ese bloque y elige al azar
// una de las condiciones que aún no han aparecido en él. Elegir uniformemente entre las restantes
// equivale a una permutación aleatoria uniforme del bloque y permite rellenar los huecos que
// dejan los pulls fallidos.
export function pickNextSlot(activePulls, conditions, randInt = randomInt) {
    const blockSize = conditions.length;
    const byBlock = new Map();
    for (const pull of activePulls) {
        if (!byBlock.has(pull.blockIndex)) byBlock.set(pull.blockIndex, []);
        byBlock.get(pull.blockIndex).push(pull);
    }

    let blockIndex = 0;
    while ((byBlock.get(blockIndex)?.length ?? 0) >= blockSize) {
        blockIndex++;
    }

    const pullsInBlock = byBlock.get(blockIndex) ?? [];
    const usedPositions = new Set(pullsInBlock.map(p => p.positionInBlock));
    const usedConditions = new Set(pullsInBlock.map(p => p.conditionId));

    let positionInBlock = 0;
    while (usedPositions.has(positionInBlock)) {
        positionInBlock++;
    }

    const remaining = conditions.filter(c => !usedConditions.has(c.id));
    const condition = remaining[randInt(remaining.length)];

    return { blockIndex, positionInBlock, condition };
}


// Baraja las opciones de una pregunta (Fisher–Yates) si shuffled es true.
// Devuelve la pregunta con:
// - choices / answer: orden mostrado al estudiante
// - originalChoices / originalAnswer: orden devuelto por el modelo
// - permutation: choices[i] === originalChoices[permutation[i]]
// - shuffled: si la pregunta se ha barajado realmente
// - malformed: true si no tiene 4 opciones o answer está fuera de rango (no se baraja)
export function shuffleQuestion(question, shuffled, randInt = randomInt) {
    const originalChoices = Array.isArray(question.choices) ? question.choices : [];
    const originalAnswer = question.answer;
    const answerIndex = Number(originalAnswer);

    const malformed = originalChoices.length !== 4 ||
        !Number.isInteger(answerIndex) ||
        answerIndex < 0 || answerIndex >= originalChoices.length;

    const permutation = originalChoices.map((_, i) => i);
    const doShuffle = shuffled && !malformed;
    if (doShuffle) {
        for (let i = permutation.length - 1; i > 0; i--) {
            const j = randInt(i + 1);
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
    }

    return {
        ...question,
        choices: permutation.map(k => originalChoices[k]),
        answer: doShuffle ? permutation.indexOf(answerIndex) : originalAnswer,
        originalChoices: [...originalChoices],
        originalAnswer,
        permutation,
        shuffled: doShuffle,
        malformed,
    };
}


// Índice de la respuesta del estudiante en el orden original del modelo.
// -1 si no respondió (reporte sin respuesta). null si la pregunta no tiene permutación (modo antiguo).
export function computeStudentAnswerOriginal(permutation, studentAnswer) {
    if (studentAnswer === -1) return -1;
    if (!Array.isArray(permutation) || permutation.length === 0) return null;
    const original = permutation[studentAnswer];
    return Number.isInteger(original) ? original : null;
}
