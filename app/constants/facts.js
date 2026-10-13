// Frases que se muestran en la pantalla de espera mientras se generan las preguntas.
// - generic: curiosidades y consejos de tecnología y programación (para cualquier asignatura)
// - CORE, IWEB, BBDD: hechos y curiosidades del temario de cada asignatura (ver subjects.js)
// Usa getFactsForSubject(subject) para obtener las frases de una asignatura.

export const facts = {
    generic: [
        'El primer "bug" documentado fue una polilla real atrapada en un relé del ordenador Harvard Mark II en 1947. El equipo de Grace Hopper la pegó en el cuaderno de registro.',
        'Ada Lovelace escribió en 1843 el que se considera el primer algoritmo pensado para una máquina: calcular los números de Bernoulli con la Máquina Analítica de Charles Babbage.',
        'Python no debe su nombre a la serpiente, sino al grupo de humor británico Monty Python.',
        'Grace Hopper desarrolló en 1952 el A-0, uno de los primeros compiladores, cuando muchos creían que un ordenador solo podía hacer cálculos aritméticos.',
        'FORTRAN, publicado por IBM en 1957, fue el primer lenguaje de alto nivel de uso generalizado. Todavía se usa en simulaciones científicas.',
        'Margaret Hamilton dirigió el equipo que programó el software de vuelo del Apolo 11 y popularizó el término "ingeniería del software".',
        'Linus Torvalds anunció Linux en 1991 diciendo que era "solo un hobby" que no sería "grande ni profesional".',
        'El famoso "Hola, mundo" se popularizó con el libro "The C Programming Language" de Kernighan y Ritchie, publicado en 1978.',
        'El álgebra de los booleanos se debe a George Boole, que la publicó en 1854, casi un siglo antes de que existieran los ordenadores electrónicos.',
        'El byte de 8 bits se convirtió en estándar con la familia de ordenadores IBM System/360, presentada en 1964.',
        'El primer disco duro comercial, el IBM 350 de 1956, guardaba unos 5 millones de caracteres y pesaba cerca de una tonelada.',
        'Douglas Engelbart presentó el ratón en 1968, en una demostración tan adelantada a su época que hoy se conoce como "la madre de todas las demos".',
        'Problema del año 2038: los sistemas que guardan la hora Unix en un entero de 32 bits con signo se desbordarán el 19 de enero de 2038.',
        'Unicode define ya más de 149.000 caracteres: alfabetos de todo el mundo, símbolos matemáticos y, por supuesto, emojis.',
        'Phil Karlton dijo que en informática solo hay dos cosas difíciles: invalidar la caché y ponerle nombre a las cosas.',
        'Donald Knuth advirtió que "la optimización prematura es la raíz de todos los males": primero haz que funcione y luego mide antes de optimizar.',
        'Ley de Hofstadter: todo lleva más tiempo del que esperas, incluso teniendo en cuenta la ley de Hofstadter.',
        'La "depuración con pato de goma" consiste en explicar tu código línea a línea a un pato de goma. Al explicarlo en voz alta, muchas veces encuentras el error tú solo.',
        'El nombre de Stack Overflow viene de un error clásico: el desbordamiento de pila que provoca una recursión sin caso base.',
        'Ningún algoritmo de ordenación basado en comparaciones puede ser, en el peor caso, más rápido que O(n log n).',
        'Lee el mensaje de error completo antes de buscarlo en internet: muchas veces dice exactamente qué línea falla y por qué.',
        'Usar nombres descriptivos para variables y funciones hace que tu código se entienda sin necesidad de comentarios.',
        'Commits pequeños y con mensajes claros hacen mucho más fácil encontrar cuándo y por qué se introdujo un error.',
        'Escribir tests no es perder tiempo: te permite cambiar el código con la tranquilidad de saber si has roto algo.',
        'Divide los problemas grandes en funciones pequeñas que hagan una sola cosa: son más fáciles de probar y de reutilizar.',
        'Repasar con preguntas tipo test es una forma de "práctica de recuperación": intentar recordar refuerza la memoria más que releer los apuntes.',
    ],

    CORE: [
        'Tim Berners-Lee propuso la World Wide Web en el CERN en 1989. La primera página web de la historia sigue disponible en info.cern.ch.',
        'El primer navegador web se llamaba WorldWideWeb y, para no confundirlo con la propia Web, después se rebautizó como Nexus.',
        'El primer mensaje enviado por ARPANET, en 1969, fue "LO": intentaban escribir "LOGIN", pero el sistema se colgó tras la segunda letra.',
        'Tim Berners-Lee ha reconocido que las dos barras "//" de las URL después de "http:" no eran necesarias.',
        'El código HTTP 418 "I\'m a teapot" ("soy una tetera") nació como broma del Día de los Inocentes en el RFC 2324, de 1998.',
        'Un mito dice que el error 404 viene de una sala 404 del CERN donde estaba el servidor web. Es falso: los códigos 4xx simplemente indican errores del cliente.',
        'HTTP es un protocolo sin estado: cada petición es independiente. Por eso se inventaron las cookies (Netscape, 1994), para que el servidor pudiera "recordar" la sesión.',
        'Por convención, HTTP usa el puerto 80 y HTTPS el 443. Los puertos son números de 16 bits, así que van del 0 al 65.535.',
        'HTTP/3 ya no funciona sobre TCP: usa QUIC, un protocolo construido sobre UDP para establecer conexiones más rápido.',
        'Antes de enviar datos, TCP establece la conexión con un "saludo en tres pasos": SYN, SYN-ACK y ACK.',
        'Una conexión TCP queda identificada por cuatro datos: IP y puerto de origen, e IP y puerto de destino.',
        'En REST, GET debe ser seguro (no modifica nada) y PUT y DELETE idempotentes: repetir la misma petición deja el servidor en el mismo estado.',
        'Håkon Wium Lie propuso CSS en 1994. La "cascada" del nombre decide qué regla gana cuando varias afectan al mismo elemento: primero cuenta la especificidad y, a igualdad, la última regla.',
        'El favicon, el iconito de la pestaña del navegador, lo introdujo Internet Explorer 5 en 1999.',
        'Brendan Eich creó JavaScript en unos 10 días en 1995. Antes se llamó Mocha y LiveScript, y el nombre final fue una estrategia de marketing: no tiene nada que ver con Java.',
        'En JavaScript, typeof null devuelve "object". Es un error de la primera implementación del lenguaje que nunca se corrigió para no romper la Web.',
        'En JavaScript, 0.1 + 0.2 no da exactamente 0.3, sino 0.30000000000000004, porque los números siguen el estándar de coma flotante IEEE 754.',
        'En JavaScript, NaN es el único valor que no es igual a sí mismo: NaN === NaN es false. Para comprobarlo, usa Number.isNaN().',
        'Ryan Dahl presentó Node.js en 2009. Usa el motor V8 de Chrome y un único hilo con un bucle de eventos que no se bloquea mientras espera la E/S.',
        'Las promesas y async/await no hacen que JavaScript sea multihilo: permiten seguir ejecutando otras tareas mientras se espera una respuesta.',
        'Linus Torvalds creó Git en 2005, cuando el kernel de Linux perdió la licencia gratuita de BitKeeper. "Git" es un insulto suave en inglés británico, algo así como "tonto".',
        'Cada commit de Git se identifica por un hash criptográfico calculado a partir de su contenido y su historia. Si algo cambia, el hash cambia.',
        '¿Has perdido un commit tras un reset? git reflog guarda por dónde ha pasado HEAD y casi siempre permite recuperarlo.',
        'Edgar F. Codd publicó el modelo relacional en 1970. SQL nació poco después en IBM con el nombre SEQUEL y tuvo que cambiarlo por un problema de marca registrada.',
        'Las migraciones de Sequelize son como un control de versiones del esquema de la base de datos: cada cambio queda registrado y se puede deshacer.',
        'En Express, los middlewares se ejecutan en el orden en que se registran. Si uno no llama a next() ni responde, la petición se queda colgada.',
        'La inyección SQL tiene su propio cómic: en xkcd, "Little Bobby Tables" se llama Robert\'); DROP TABLE Students;--. Por eso hay que usar consultas parametrizadas.',
        'Las contraseñas nunca se guardan en claro: se guarda un hash con sal (bcrypt, scrypt o Argon2), de forma que ni el administrador puede conocerlas.',
        'Autenticación es comprobar quién eres; autorización es decidir qué puedes hacer. Primero va la una y después la otra.',
        'Los mensajes flash se guardan en la sesión y se borran en cuanto se muestran, así que solo se ven una vez, normalmente tras una redirección.',
    ],

    IWEB: [
        'Jordan Walke creó React en Facebook. Se usó primero en el news feed en 2011 y se publicó como código abierto en 2013.',
        'React se define como una biblioteca para construir interfaces, no como un framework: el enrutado o el estado global los aportan otras librerías.',
        'JSX no es HTML: se compila a llamadas de JavaScript. Por eso se escribe className en lugar de class y los eventos van en camelCase, como onClick.',
        'React mantiene una representación de la interfaz en memoria y compara versiones (reconciliación) para tocar en el DOM real solo lo que ha cambiado.',
        'Al renderizar listas, la prop key ayuda a React a identificar cada elemento. Usar el índice como key puede dar errores si la lista se reordena.',
        'Las props son de solo lectura: un componente nunca debe modificar las props que recibe. Lo que cambia con el tiempo va en el estado.',
        'Los hooks llegaron en React 16.8, en 2019, y permitieron usar estado en componentes funcionales sin escribir clases.',
        'Regla de los hooks: llámalos siempre en el nivel superior del componente, nunca dentro de condiciones ni bucles, para que React los encuentre en el mismo orden en cada render.',
        'Si el nuevo estado depende del anterior, usa la forma funcional: setCount(c => c + 1). React puede agrupar varias actualizaciones de estado.',
        'Cambiar el .current de un useRef no provoca un nuevo renderizado. Es ideal para guardar valores que no se muestran o referencias a elementos del DOM.',
        'Un useEffect con el array de dependencias vacío se ejecuta solo después del primer renderizado. Si devuelve una función, esa función hace la limpieza.',
        'En desarrollo, el StrictMode de React monta, desmonta y vuelve a montar los componentes para que detectes efectos que no limpian lo que crean.',
        'Vite significa "rápido" en francés. Lo creó Evan You, el autor de Vue, y sirve el código como módulos ES nativos para arrancar al instante.',
        'En un componente controlado, el valor del input vive en el estado de React y cada pulsación pasa por un onChange.',
        'React Router cambia la URL y la vista sin recargar la página, usando la History API del navegador: así funciona una SPA.',
        'Context API evita el "prop drilling", es decir, pasar una prop por muchos componentes intermedios que no la necesitan.',
        'Redux, creado por Dan Abramov y Andrew Clark en 2015, se inspira en Flux y en el lenguaje Elm: un único almacén de estado y reducers que son funciones puras.',
        'En Redux el estado nunca se modifica directamente: cada reducer devuelve un estado nuevo, lo que permite "viajar en el tiempo" al depurar.',
        'Cuidado con las API keys en el frontend: todo lo que va en el bundle de la aplicación lo puede ver cualquier usuario desde el navegador.',
        'React Native se publicó en 2015 con el lema "Learn once, write anywhere": no ejecuta una web dentro de la app, sino que dibuja componentes nativos reales.',
        'En React Native todo el texto debe ir dentro de un componente <Text>. Un texto suelto dentro de un <View> provoca un error.',
        'En React Native, Flexbox tiene flexDirection: "column" por defecto, al contrario que en la web, donde es "row".',
        'Los estilos de React Native no son CSS: son objetos JavaScript con propiedades en camelCase y números sin "px" (píxeles independientes de la densidad).',
        'FlatList solo renderiza los elementos que están visibles, más un pequeño margen. ScrollView los renderiza todos de golpe, así que no es adecuado para listas largas.',
        'AsyncStorage es un almacenamiento clave-valor asíncrono y sin cifrar: no guardes ahí contraseñas ni tokens sensibles.',
        'Para acceder a la geolocalización en el móvil, la app debe pedir permiso al usuario, y este puede negarlo en cualquier momento.',
        'Fast Refresh recarga al momento los cambios del código conservando el estado de los componentes, sin reiniciar la app.',
        'Hermes es un motor de JavaScript diseñado para React Native que reduce el tiempo de arranque y el consumo de memoria. Viene activado por defecto desde la versión 0.70.',
    ],

    BBDD: [
        'Carlo Strozzi usó el término "NoSQL" en 1998 para una base de datos relacional que no usaba SQL. En 2009 se recuperó como nombre de un encuentro sobre bases de datos distribuidas.',
        'Hoy "NoSQL" suele leerse como "Not only SQL": no sustituye a las bases de datos relacionales, sino que ofrece otros modelos para otros problemas.',
        'Las "Vs" del Big Data empezaron siendo tres (Volumen, Velocidad y Variedad), descritas por Doug Laney en 2001. Después se añadieron Veracidad y Valor.',
        'Eric Brewer planteó el teorema CAP como conjetura en el año 2000, y Seth Gilbert y Nancy Lynch lo demostraron formalmente en 2002.',
        'Según el teorema CAP, cuando hay una partición de red, un sistema distribuido tiene que elegir entre mantener la consistencia o la disponibilidad.',
        'Frente a ACID, muchas bases de datos NoSQL siguen el modelo BASE: Basically Available, Soft state y Eventual consistency.',
        'Douglas Crockford popularizó JSON a principios de los 2000. JSON no admite comentarios: fue una decisión de diseño para mantenerlo simple.',
        'JSON tiene solo seis tipos de datos: string, number, boolean, null, object y array. Las fechas, por ejemplo, suelen guardarse como strings.',
        'En JSON Schema, "required" indica qué propiedades son obligatorias y "additionalProperties": false prohíbe propiedades no definidas en el esquema.',
        'MongoDB toma su nombre de "humongous", "gigantesco" en inglés. Se publicó en 2009.',
        'MongoDB guarda los documentos en BSON, un JSON binario que añade tipos como Date, ObjectId o Decimal128.',
        'El _id que genera MongoDB (ObjectId) ocupa 12 bytes, y los 4 primeros son una marca de tiempo: a partir del _id se puede saber cuándo se creó el documento.',
        'Un documento de MongoDB no puede superar los 16 MB. Para ficheros más grandes existe GridFS, que los divide en trozos.',
        'Una regla útil para diseñar esquemas en MongoDB: lo que se consulta junto, se guarda junto. Embeber evita "joins", pero solo si el array no crece sin límite.',
        'Sin un índice adecuado, MongoDB tiene que recorrer toda la colección (COLLSCAN). Con .explain() puedes ver qué plan ha usado una consulta.',
        'En una agregación el orden de las etapas importa: poner $match lo antes posible reduce los documentos que pasan a las siguientes etapas y permite usar índices.',
        '$unwind genera un documento por cada elemento de un array: si un pedido tiene 3 productos, a la siguiente etapa llegan 3 documentos.',
        'Esta misma aplicación guarda tus respuestas en MongoDB usando Mongoose, el ODM más popular para Node.js.',
        'En 2017, decenas de miles de bases de datos MongoDB expuestas a internet sin autenticación fueron vaciadas por atacantes que pedían un rescate.',
        'El modelo CIA de seguridad se basa en tres pilares: Confidencialidad, Integridad y Disponibilidad (Availability).',
        'En un replica set de MongoDB hay un nodo primario que recibe las escrituras y varios secundarios. Si el primario cae, los demás eligen a uno nuevo automáticamente.',
        'Elegir mal la shard key puede crear "puntos calientes": una clave que siempre crece, como una fecha, manda todas las escrituras nuevas al mismo shard.',
        'Redis significa REmote DIctionary Server. Salvatore Sanfilippo lo creó en 2009 y guarda todos los datos en memoria, por eso es tan rápido.',
        'En Redis es habitual nombrar las claves con dos puntos como separador, por ejemplo usuario:1000:nombre, para organizarlas como si fueran carpetas.',
        'Con EXPIRE puedes ponerle fecha de caducidad a una clave de Redis: es la base para usarlo como caché o para guardar sesiones.',
        'Cassandra nació en Facebook para la búsqueda en la bandeja de entrada y se publicó como código abierto en 2008. Su nombre viene de la profetisa troyana Casandra.',
        'Cassandra no tiene nodo maestro: todos los nodos son iguales (arquitectura peer-to-peer), así que no hay un punto único de fallo.',
        'En Cassandra, la partition key decide en qué nodo se guardan los datos y las clustering columns, en qué orden se guardan dentro de la partición.',
        'En Cassandra las tablas se diseñan a partir de las consultas que vas a hacer, y duplicar datos (desnormalizar) es lo normal.',
        'La teoría de grafos nació en 1736, cuando Euler demostró que era imposible recorrer los siete puentes de Königsberg pasando una sola vez por cada uno.',
        'Las consultas de Cypher, el lenguaje de Neo4j, parecen dibujos en ASCII: (ana:Persona)-[:SIGUE]->(luis:Persona).',
        'En una base de datos de grafos, cada nodo apunta directamente a sus vecinos, así que recorrer relaciones no requiere los costosos joins de las bases de datos relacionales.',
    ],
};

// Frases propias de la asignatura (CORE, IWEB, BBDD) o null si no tiene
export function getSubjectFacts(subject) {
    const key = String(subject ?? '').toUpperCase();
    return key !== 'GENERIC' && facts[key]?.length > 0 ? facts[key] : null;
}

const shuffle = (list, random) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Secuencia de frases para la pantalla de espera, en orden aleatorio:
// - asignaturas con frases propias: dos de la asignatura por cada genérica
// - resto de asignaturas: solo genéricas
export function buildFactsSequence(subject, random = Math.random) {
    const generic = shuffle(facts.generic, random);
    const subjectFacts = getSubjectFacts(subject);
    if (!subjectFacts) return generic;

    const own = shuffle(subjectFacts, random);
    const sequence = [];
    let g = 0;
    own.forEach((fact, i) => {
        sequence.push(fact);
        if (i % 2 === 1 && g < generic.length) sequence.push(generic[g++]);
    });
    return sequence;
}

export const jokes = [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'Why did the JavaScript developer go broke? Because he lost his TypeScript.',
    'Why was the math book sad? Because it had too many problems.',
    "Why do programmers prefer wearing glasses? Because they can't C#.",
    "Why don't programmers like nature? It has too many bugs.",
    'Why do programmers hate nature photographers? They always focus on the bugs.',
    "Why was the JavaScript developer sad? Because he didn't Node how to Express himself.",
    "Why do Java developers wear glasses? Because they don't C#!",
    'Why was the computer cold? It left its Windows open!',
    "Why did the programmer quit his job? Because he didn't get arrays.",
    'Why did the developer go broke? Because he lost his cache.',
    "Why did the programmer go broke? Because he couldn't find an Open Source of income.",
    'Why do C# and Java developers keep breaking their keyboards? Because they use a strongly typed language.',
]
