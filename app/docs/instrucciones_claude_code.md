# Tarea: implementar en AIQUIZ el "Estudio 2" (pistas superficiales en preguntas generadas por LLM)

Eres Claude Code trabajando sobre el repositorio de AIQUIZ (Next.js 14 + MongoDB/Mongoose, `basePath: '/aiquiz'`, arrancado con `server.js` detrás de nginx). Lee este documento entero antes de tocar nada, explora el código y propón un plan breve antes de implementar.

## Parámetros del estudio (decididos por el profesor)

- Asignatura: solo `BBDD`. No toques la configuración del resto de asignaturas (CORE, OFI, IWEB…), que siguen en el modo actual.
- Modelo: un único modelo para todo el estudio, `Google_Generative_Flash` de `models.json`, que ya apunta a `gemini-3.5-flash` con `thinking_level: "medium"`. Comprueba que es así, pero no modifiques `models.json`.
- Fechas: no se cambian `from_date` ni `to_date` de la entrada `BBDD` en `abctesting.js`.
- Dificultad: el nivel elegido por el estudiante se envía al modelo en ambas condiciones.
- Historial de respuestas anteriores (`{previousQuestions}`): se elimina por completo de los prompts del estudio (ver apartado 5).

## Contexto: qué sabemos del estudio 1 (no hay que reanalizarlo, es para que entiendas el porqué)

Un A/B entre Gemini y GPT en dos asignaturas (19.370 preguntas respondidas) mostró que:

1. Las preguntas tienen pistas superficiales: la opción correcta es estrictamente la más larga en el 45–62 % de las preguntas (azar: 25 %), y cuando lo es, el acierto sube 10–16 puntos. La posición de la correcta está muy sesgada (Gemini casi nunca la pone en la D) aunque el prompt ya pide "vete intercalando entre las 4 opciones": las instrucciones de prompt no bastan para eliminar el sesgo de posición.
2. El front no baraja las opciones: las muestra en el orden que devuelve el modelo.
3. La dificultad elegida por el estudiante NO se envía al modelo (los prompts de `abctesting.js` no usan `{difficulty}`).
4. `{previousQuestions}` incluye enunciado, opciones completas, índice correcto e índice respondido de preguntas anteriores; actúa como ejemplos en contexto que el modelo imita. En un diseño donde el prompt cambia de un test a otro, contaminaría una condición con la otra; por eso se elimina.
5. `md5Prompt`, `prompt`, `llmModel` y `pull_id` de cada pregunta se leen del documento del estudiante en el momento de responder (`saveQuestion` en `app/components/Question.jsx` llama a `/api/student`), no en el momento de generar. Si el estudiante pide otro test antes de responder el anterior (otra pestaña), la pregunta queda atribuida al pull/prompt equivocado. Esto ya ocurrió en los datos.
6. El timeout de 60 s venía de nginx (`proxy_read_timeout` por defecto) y ya se ha subido fuera del código. El truncado del JSON con 20 preguntas ya está arreglado con `calculateMaxTokens` en `app/utils/llmManager.js`. No hay que tocar nada de esto.

## Objetivo del estudio 2

Pregunta: ¿cuánto del acierto se debe a pistas superficiales de las preguntas?

Diseño intra-estudiante 2×2, con el test (pull) como unidad de aleatorización:

- Factor A — orden de las opciones: `shuffled = true` (barajadas en el servidor) o `false` (orden del modelo).
- Factor B — prompt: `control` o `longitud_equilibrada` (el mismo prompt + un bloque que pide opciones de longitud similar).

Cada test de cada estudiante recibe una de las 4 combinaciones. Un mismo estudiante debe pasar por todas.

## Requisitos de implementación

### 1. Configuración (`app/constants/abctesting.js`)

- Añadir un modo de estudio por pull, activable por asignatura, sin romper el modo actual (prompt y modelo fijos por estudiante) que siguen usando las demás asignaturas. Por ejemplo, una propiedad `randomization: "per_pull"` y una lista de condiciones. Elige tú la forma concreta, pero que sea declarativa y quede documentada en el comentario de cabecera del fichero, que ya explica la estructura.
- La entrada `BBDD` queda con `models: ["Google_Generative_Flash"]`, los dos prompts de la sección Prompts y el nuevo modo activado. El código actual de `app/utils/modelManager.js` ya fuerza un único modelo cuando hay varios prompts; asegúrate de que ese comportamiento sigue siendo correcto con el nuevo modo.
- Los textos de los prompts deben quedar en el fichero tal cual se indican en la sección Prompts (usa constantes compartidas para el bloque común, para que ambas condiciones sean idénticas salvo el bloque experimental).

### 2. Asignación de condición: aleatorización por bloques permutados por estudiante

- La condición se decide en el servidor (`app/api/questions/route.js`), antes de llamar al LLM.
- Usa bloques permutados de 4 por (estudiante, asignatura): en cada bloque aparecen las 4 condiciones una vez, en orden aleatorio. Así el balance dentro de cada estudiante es bueno incluso con pocos tests (en el estudio 1 muchos estudiantes hicieron solo 3–5 tests).
- Guarda lo necesario para reconstruir la asignación: índice de bloque, posición dentro del bloque, condición.
- No reutilices `getEquitablePrompt` ni el `md5Prompt` fijo del estudiante para esta asignatura: en el modo por pull el prompt cambia en cada test.

### 3. Registro de cada pull (colección nueva, p. ej. `Pull`)

Crea un documento por cada petición de generación **antes** de llamar al LLM, y actualízalo al terminar. Campos mínimos: `pull_id`, `studentEmail`, `subject`, `topic`, `subTopic`, `difficulty`, `numQuestionsRequested`, `promptId`, `md5Prompt` (MD5 de la plantilla, como ahora), `prompt` (el prompt final ya rellenado), `shuffled`, `blockIndex`, `positionInBlock`, `llmModel` (nombre en `models.json`), `modelId`, `status` (`pending` | `ok` | `error`), `errorMessage`, `finishReason` / `truncated`, `numQuestionsReceived`, `usageData`, `responseTime`, `createdAt`, `completedAt`.

- `getModelResponse` en `llmManager.js` ya detecta el truncado (`finish_reason === 'length'`, `finishReason === 'MAX_TOKENS'`) pero solo lo escribe en consola: devuélvelo en el resultado para guardarlo.
- Si el JSON del modelo no se puede parsear, el pull queda en `error` y la API devuelve 500 (como ahora, pero registrado).
- Esto sirve para comprobar que ninguna condición falla más que otra. No es una pregunta de investigación, es control de calidad del diseño.

### 4. Barajado en el servidor

En `/api/questions`, después de parsear el JSON del modelo y solo si `shuffled = true`, baraja las opciones de cada pregunta (Fisher–Yates con `crypto.randomInt`). Para cada pregunta envía y guarda:

- `choices`: opciones en el orden mostrado al estudiante.
- `answer`: índice de la correcta en el orden mostrado.
- `originalChoices`: opciones en el orden del modelo.
- `originalAnswer`: índice de la correcta que devolvió el modelo.
- `permutation`: array tal que `choices[i] === originalChoices[permutation[i]]`.
- `shuffled`: booleano.

Si `shuffled = false`, `permutation` es la identidad y `originalChoices`/`originalAnswer` coinciden con `choices`/`answer`. Rellénalos igualmente, para que el análisis sea uniforme.

Si una pregunta no tiene 4 opciones o `answer` está fuera de rango, no la barajes y márcala (p. ej. `malformed: true`). En el estudio 1 hubo 11 de 19.370.

### 5. Eliminar el historial de respuestas anteriores

- Los prompts del estudio no contienen `{previousQuestions}` ni `{num_prev_questions}` (ver sección Prompts).
- En `app/utils/promptManager.js` (`fillPrompt`), en el modo por pull no ejecutes las consultas de `getPreviousQuestions` ni el `countDocuments` de `num_prev_questions`: no se usan y solo añaden latencia.
- El modo antiguo (resto de asignaturas y el prompt por defecto sin ABC testing) debe seguir comportándose exactamente igual que ahora; no borres `getPreviousQuestions`, `getPreviousQuestionPrompt` ni `getChoicesWithNumbers` mientras otras asignaturas los usen.

### 6. Dificultad en el prompt

- `fillPrompt` ya recibe `difficulty` con los valores `facil`, `intermedio`, `avanzado` (`app/constants/difficulties.js`). Al sustituir `{difficulty}`, conviértelo a texto legible en español: `facil` → `fácil`, `intermedio` → `intermedio`, `avanzado` → `avanzado`.
- Sigue guardando en cada pregunta el valor original (`facil` / `intermedio` / `avanzado`) en el campo `difficulty`, como ahora.

### 7. Metadatos del pull viajan con las preguntas (no se leen del estudiante al responder)

- `/api/questions` devuelve en cabeceras (como ya hace con `X-Model-Id`, `X-Usage-*`, etc.) también `X-Pull-Id`, `X-Prompt-Id`, `X-Md5-Prompt`, `X-Shuffled`, `X-Block-Index`, `X-Position-In-Block`. Los campos por pregunta del apartado 4 van dentro del JSON de cada pregunta.
- `app/quiz/page.jsx` (`generateQuestions`) añade esos metadatos a cada pregunta, igual que hace ya con `usageData`, `responseTime`, `modelId`…
- `app/components/Question.jsx` (`saveQuestion`) envía `pull_id`, `md5Prompt`, `promptId`, `shuffled`, `llmModel`, `originalChoices`, `originalAnswer`, `permutation` tomados de la pregunta, **no** de `/api/student`. Mantén la llamada a `/api/student` como respaldo solo para las asignaturas en modo antiguo.
- El prompt final rellenado se guarda en el documento `Pull`. Mantén el campo `prompt` en `Question` para las asignaturas en modo antiguo; en el modo por pull puede quedar vacío o con el `promptId`, pero documenta lo que hagas.
- `app/api/answer/route.js` y `app/models/Question.js`: añade los campos nuevos (`promptId`, `shuffled`, `originalChoices`, `originalAnswer`, `permutation`, `studentAnswerOriginal`, `malformed`). Calcula en el servidor `studentAnswerOriginal = permutation[studentAnswer]` (o `-1` si `studentAnswer` es `-1`). En la rama de actualización (pregunta ya existente: re-respuesta o reporte) actualiza también `studentAnswerOriginal`.
- `correct` debe seguir calculándose en el orden mostrado (`answer === studentAnswer`), igual que ahora.
- No cambies cómo se mide `studentResponseTime` (`Date.now() - questionRenderedAt`; todas las preguntas del test se montan a la vez, así que es acumulado desde que se carga el test). Debe seguir siendo comparable con el estudio 1.

### 8. Compatibilidad y seguridad

- Los documentos antiguos de `questions` y `students` deben seguir funcionando (dashboard, reports, `evaluationReportedQuestions`). Los campos nuevos son opcionales.
- `models.json` y `next.config.js` contienen claves de API y credenciales: no las imprimas en logs, no las copies a otros ficheros y no las añadas al control de versiones. Si necesitas ejemplos, usa `models.json.example` / `next.config.js.template`.
- Quita el `console.log("HOLAAAAAAAAAAAAAA text response to prompt: ", textResponse)` de `OpenAI_API_Request`.

## Prompts (texto literal)

El bloque de formato JSON que añade `fillPrompt` al final (desde "Devuelve tu respuesta completamente en forma de objeto JSON…" hasta "…vete intercalando entre las 4 opciones.") no se toca y se aplica igual a ambas condiciones.

```javascript
// Bloque común a ambas condiciones
const PROMPT_BASE = `Eres un profesor experto en '{topic}'. Tu objetivo es generar preguntas tipo test que ayuden al estudiante a repasar la materia. 
            Soy un estudiante de una asignatura de universidad llamada '{subjectName}'. Estoy repasando para el examen de la asignatura. 
            
            Dame {numQuestions} preguntas que tengan 4 opciones, siendo solo una de ellas la respuesta correcta. 
            Las preguntas deben ser sobre '{subTopic}' enmarcadas en el tema '{topic}'. 
            Las preguntas deben tener un nivel de dificultad {difficulty}. 
            Cada opción debe ser autónoma y comprensible por sí sola: no incluyas opciones que hagan referencia a otras opciones (como "todas las anteriores", "ninguna de las anteriores", "ambas son correctas" o "la segunda y la tercera"), porque las opciones se mostrarán en orden aleatorio.
            `;

// Bloque exclusivo de la condición experimental
const BLOQUE_LONGITUD = `
            Requisitos obligatorios para las 4 opciones de cada pregunta:
            - Las 4 opciones deben tener una longitud similar: el número de palabras de cada opción no debe diferir en más de un 20% del de las demás.
            - La respuesta correcta no debe ser la opción más larga, ni la más detallada, ni la única con matices o salvedades.
            - Para igualar longitudes, añade detalle a los distractores en lugar de recortar la respuesta correcta.
            - Las 4 opciones deben tener la misma estructura gramatical, el mismo nivel de precisión técnica y usar la terminología propia del tema.
            Antes de devolver el resultado, revisa cada pregunta: si la respuesta correcta es la opción más larga, reescribe los distractores hasta que no lo sea.
            `;

// control:              PROMPT_BASE + `{comment} \n            `
// longitud_equilibrada: PROMPT_BASE + BLOQUE_LONGITUD + `{comment} \n            `
```

## Pruebas y verificación (obligatorio antes de dar la tarea por terminada)

1. Tests unitarios (o un script de verificación si el repo no tiene framework de tests) para:
   - el barajado: `choices[i] === originalChoices[permutation[i]]` y `choices[answer] === originalChoices[originalAnswer]`;
   - `studentAnswerOriginal` correcto en respuesta normal, en reporte sin respuesta (`-1`) y en re-respuesta;
   - la aleatorización por bloques: en 4 pulls consecutivos de un estudiante aparecen las 4 condiciones;
   - el prompt final de cada condición: contiene la dificultad en español, no contiene `{previousQuestions}` ni ninguna variable sin sustituir, y solo `longitud_equilibrada` contiene el bloque de longitud.
2. Script de comprobación de integridad sobre la base de datos (solo lectura) que verifique en una muestra las relaciones anteriores, que cada pregunta del modo por pull tenga su `Pull` asociado y que el balance de condiciones por estudiante sea el esperado.
3. Script piloto (`scripts/`), que no toque la base de datos de producción: para una lista de subtemas de `BBDD` sacada de `subjects.js`, genera N tests con cada prompt usando `getModelResponse` y calcula por condición: % de preguntas en que la correcta es estrictamente la opción más larga (en caracteres), ratio longitud correcta / media de longitudes, distribución de la posición de la correcta, % con opciones referenciales, tokens y tiempo de respuesta. Salida en CSV. Avísame del número de llamadas y del coste aproximado antes de ejecutarlo; no lo ejecutes sin mi confirmación.
4. Prueba manual en local de un test completo en cada una de las 4 condiciones, comprobando que lo guardado en `questions` y en `Pull` es coherente.

## Entregables

- Plan breve antes de implementar.
- Cambios de código con commits pequeños y descriptivos.
- Un resumen final con: ficheros tocados, esquema de los campos nuevos (`Question` y `Pull`), cómo se activa o desactiva el modo de estudio, cómo ejecutar tests y scripts, y cualquier supuesto que hayas tenido que hacer.