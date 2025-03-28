export const subjects = {
    PRG: {
        name: 'Programación',
        topics: [
            {
                value: 'java', label: 'Java',
                subtopics: [
                    { title: 'Declaración de variables', comment: '', files: [] },
                    { title: 'Tipos de datos, operadores y expresiones', comment: '', files: [] },
                    { title: 'Bucles y condicionales', comment: '', files: [] },
                    { title: 'Uso de Break y Continue', comment: '', files: [] },
                    { title: 'Clases y objetos', comment: '', files: [] },
                    { title: 'Comandos try, catch y finally', comment: '', files: [] },
                    { title: 'Manejo de excepciones', comment: '', files: [] }
                ]
            }
        ]
    },
    CORE: {
        name: 'Computación en Red',
        topics: [
            {
                value: 'http', label: 'HTTP',
                subtopics: [
                    { title: 'URLs', comment: '', files: [] },
                    { title: 'Formato peticiones HTTP', comment: '', files: [] },
                    { title: 'Cabeceras HTTP', comment: '', files: [] },
                    { title: 'Métodos POST, PUT, GET, DELETE, HEAD', comment: '', files: [] },
                    { title: 'Códigos de respuesta', comment: '', files: [] },
                    { title: 'Caché web', comment: '', files: [] },
                    { title: 'Gestión de estado: parámetros ocultos, cookies, sesión', comment: '', files: [] }
                ]
            },
            {
                value: 'html', label: 'HTML',
                subtopics: [
                    { title: 'Estructura básica de un documento HTML', comment: '', files: [] },
                    { title: 'Atributos HTML', comment: '', files: [] },
                    { title: 'Id y clase HTML', comment: '', files: [] },
                    { title: 'Etiquetas de texto', comment: '', files: [] },
                    { title: 'Etiquetas de hipervínculo', comment: '', files: [] },
                    { title: 'Etiquetas de imagen', comment: '', files: [] },
                    { title: 'Etiquetas de lista', comment: '', files: [] },
                    { title: 'Tablas', comment: '', files: [] },
                    { title: 'Formularios', comment: '', files: [] },
                    { title: 'Etiquetas de audio y video', comment: '', files: [] }
                ]
            },
            {
                value: 'css', label: 'CSS',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Selectores y prioridad', comment: '', files: [] },
                    { title: 'Modelo de caja: margin, padding, border', comment: '', files: [] },
                    { title: 'Unidades de medida', comment: '', files: [] },
                    { title: 'Posicionamiento', comment: '', files: [] },
                    { title: 'Display y visibility', comment: '', files: [] },
                    { title: 'Flexbox', comment: '', files: [] },
                    { title: 'Grid', comment: '', files: [] },
                    { title: 'Float y clear', comment: '', files: [] },
                    { title: 'Diseño responsive', comment: '', files: [] },
                    { title: 'Media queries', comment: '', files: [] },
                    { title: 'Variables CSS', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript_cliente', label: 'JavaScript Cliente',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Eventos y manejo de eventos', comment: '', files: [] },
                    { title: 'DOM y manipulación del DOM', comment: '', files: [] },
                    { title: 'Objeto document y window', comment: '', files: [] },
                    { title: 'Temporizadores', comment: '', files: [] },
                    { title: 'SessionStorage y LocalStorage', comment: '', files: [] },
                    { title: 'Alert, confirm y prompt', comment: '', files: [] },
                    { title: 'AJAX y fetch API', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript', label: 'Lenguaje JavaScript',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Const, let, var', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Paso por referencia vs paso por valor', comment: '', files: [] },
                    { title: 'Tipos primitivos', comment: '', files: [] },
                    { title: 'Objetos JavaScript', comment: '', files: [] },
                    { title: 'Clases y herencia', comment: '', files: [] },
                    { title: 'Notación de puntos y corchetes', comment: '', files: [] },
                    { title: 'Clonado de objetos', comment: '', files: [] },
                    { title: 'Notación arrow', comment: '', files: [] },
                    { title: 'This, bind, call, apply', comment: '', files: [] },
                    { title: 'Closures', comment: '', files: [] },
                    { title: 'Modo estricto', comment: '', files: [] },
                    { title: 'Modulos ES6 y CommonJS', comment: '', files: [] },
                    { title: 'Métodos de arrays (forEach, map, filter, reduce)', comment: '', files: [] },
                    { title: 'Asincronía: callbacks, promesas, async/await', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'JSON', comment: '', files: [] }
                ]
            },
            {
                value: 'git', label: 'Git',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Comandos básicos', comment: '', files: [] },
                    { title: 'Repositorios locales y remotos', comment: '', files: [] },
                    { title: 'Commits', comment: '', files: [] },
                    { title: 'Branches', comment: '', files: [] },
                    { title: 'Merge y rebase', comment: '', files: [] },
                    { title: 'Conflictos', comment: '', files: [] },
                    { title: 'Tags', comment: '', files: [] },
                    { title: 'GitHub', comment: '', files: [] }
                ]
            },
            {
                value: 'node', label: 'Node',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Process', comment: '', files: [] },
                    { title: 'NPM y versionado paquetes', comment: '', files: [] },
                    { title: 'File System', comment: '', files: [] },
                    { title: 'Sistema de archivos', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Eventos', comment: '', files: [] },
                    { title: 'package.json', comment: '', files: [] }
                ]
            },
            {
                value: 'sequelize', label: 'ORM: Sequelize',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Ventajas y desventajas', comment: '', files: [] },
                    { title: 'Conexión a la base de datos', comment: '', files: [] },
                    { title: 'Modelos', comment: '', files: [] },
                    { title: 'Migraciones', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Consultas', comment: '', files: [] },
                    { title: 'Asociaciones', comment: '', files: [] }
                ]
            },
            {
                value: 'express', label: 'Express',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Estructura del proyecto', comment: '', files: [] },
                    { title: 'Rutas', comment: '', files: [] },
                    { title: 'Middleware', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'Manejo de archivos', comment: '', files: [] },
                    { title: 'Manejo de formularios', comment: '', files: [] },
                    { title: 'Manejo de cookies', comment: '', files: [] },
                    { title: 'Manejo de sesiones', comment: '', files: [] },
                    { title: 'Manejo de peticiones HTTP', comment: '', files: [] },
                    { title: 'Manejo de respuestas', comment: '', files: [] },
                    { title: 'Paginación', comment: '', files: [] },
                    { title: 'Embed Javascript (EJS)', comment: '', files: [] },
                    { title: 'Mensajes flash', comment: '', files: [] },
                    { title: 'Autenticación', comment: '', files: [] },
                    { title: 'Autorización', comment: '', files: [] }
                ]
            }
        ]
    },
    TECW: {
        name: 'Tecnologías Web',
        topics: [
            {
                value: 'http', label: 'HTTP',
                subtopics: [
                    { title: 'URLs', comment: '', files: [] },
                    { title: 'Formato peticiones HTTP', comment: '', files: [] },
                    { title: 'Cabeceras HTTP', comment: '', files: [] },
                    { title: 'Métodos POST, PUT, GET, DELETE, HEAD', comment: '', files: [] },
                    { title: 'Códigos de respuesta', comment: '', files: [] },
                    { title: 'Caché web', comment: '', files: [] },
                    { title: 'Gestión de estado: parámetros ocultos, cookies, sesión', comment: '', files: [] }
                ]
            },
            {
                value: 'html', label: 'HTML',
                subtopics: [
                    { title: 'Estructura básica de un documento HTML', comment: '', files: [] },
                    { title: 'Atributos HTML', comment: '', files: [] },
                    { title: 'Id y clase HTML', comment: '', files: [] },
                    { title: 'Etiquetas de texto', comment: '', files: [] },
                    { title: 'Etiquetas de hipervínculo', comment: '', files: [] },
                    { title: 'Etiquetas de imagen', comment: '', files: [] },
                    { title: 'Etiquetas de lista', comment: '', files: [] },
                    { title: 'Tablas', comment: '', files: [] },
                    { title: 'Formularios', comment: '', files: [] },
                    { title: 'Etiquetas de audio y video', comment: '', files: [] }
                ]
            },
            {
                value: 'css', label: 'CSS',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Selectores y prioridad', comment: '', files: [] },
                    { title: 'Modelo de caja: margin, padding, border', comment: '', files: [] },
                    { title: 'Unidades de medida', comment: '', files: [] },
                    { title: 'Posicionamiento', comment: '', files: [] },
                    { title: 'Display y visibility', comment: '', files: [] },
                    { title: 'Flexbox', comment: '', files: [] },
                    { title: 'Grid', comment: '', files: [] },
                    { title: 'Float y clear', comment: '', files: [] },
                    { title: 'Diseño responsive', comment: '', files: [] },
                    { title: 'Media queries', comment: '', files: [] },
                    { title: 'Variables CSS', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript_cliente', label: 'JavaScript Cliente',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Eventos y manejo de eventos', comment: '', files: [] },
                    { title: 'DOM y manipulación del DOM', comment: '', files: [] },
                    { title: 'Objeto document y window', comment: '', files: [] },
                    { title: 'Temporizadores', comment: '', files: [] },
                    { title: 'SessionStorage y LocalStorage', comment: '', files: [] },
                    { title: 'Alert, confirm y prompt', comment: '', files: [] },
                    { title: 'AJAX y fetch API', comment: '', files: [] }
                ]
            },
            {
                value: 'javascript', label: 'Lenguaje JavaScript',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Const, let, var', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Paso por referencia vs paso por valor', comment: '', files: [] },
                    { title: 'Tipos primitivos', comment: '', files: [] },
                    { title: 'Objetos JavaScript', comment: '', files: [] },
                    { title: 'Clases y herencia', comment: '', files: [] },
                    { title: 'Notación de puntos y corchetes', comment: '', files: [] },
                    { title: 'Clonado de objetos', comment: '', files: [] },
                    { title: 'Notación arrow', comment: '', files: [] },
                    { title: 'This, bind, call, apply', comment: '', files: [] },
                    { title: 'Closures', comment: '', files: [] },
                    { title: 'Modo estricto', comment: '', files: [] },
                    { title: 'Modulos ES6 y CommonJS', comment: '', files: [] },
                    { title: 'Métodos de arrays (forEach, map, filter, reduce)', comment: '', files: [] },
                    { title: 'Asincronía: callbacks, promesas, async/await', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'JSON', comment: '', files: [] }
                ]
            },
            {
                value: 'node', label: 'Node',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Process', comment: '', files: [] },
                    { title: 'NPM y versionado paquetes', comment: '', files: [] },
                    { title: 'File System', comment: '', files: [] },
                    { title: 'Sistema de archivos', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Eventos', comment: '', files: [] },
                    { title: 'package.json', comment: '', files: [] }
                ]
            },
            {
                value: 'sequelize', label: 'ORM: Sequelize',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Ventajas y desventajas', comment: '', files: [] },
                    { title: 'Conexión a la base de datos', comment: '', files: [] },
                    { title: 'Modelos', comment: '', files: [] },
                    { title: 'Migraciones', comment: '', files: [] },
                    { title: 'Streams', comment: '', files: [] },
                    { title: 'Consultas', comment: '', files: [] },
                    { title: 'Asociaciones', comment: '', files: [] }
                ]
            },
            {
                value: 'express', label: 'Express',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Estructura del proyecto', comment: '', files: [] },
                    { title: 'Rutas', comment: '', files: [] },
                    { title: 'Middleware', comment: '', files: [] },
                    { title: 'Manejo de errores', comment: '', files: [] },
                    { title: 'Manejo de archivos', comment: '', files: [] },
                    { title: 'Manejo de formularios', comment: '', files: [] },
                    { title: 'Manejo de cookies', comment: '', files: [] },
                    { title: 'Manejo de sesiones', comment: '', files: [] },
                    { title: 'Manejo de peticiones HTTP', comment: '', files: [] },
                    { title: 'Manejo de respuestas', comment: '', files: [] },
                    { title: 'Paginación', comment: '', files: [] },
                    { title: 'Embed Javascript (EJS)', comment: '', files: [] },
                    { title: 'Mensajes flash', comment: '', files: [] },
                    { title: 'Autenticación', comment: '', files: [] },
                    { title: 'Autorización', comment: '', files: [] }
                ]
            }

        ]
    },
    BBDD: {
        name: 'Bases de Datos No Relacionales',
        topics: [
            {
                value: 'intro_nosql', label: 'Introducción a NoSQL',
                subtopics: [
                    { title: 'las 5 Vs del Big Data', comment: 'Este es el resumen de la materia desarrollada en clase. Volumen: se refiere al gran cantidad de datos que se generan y se recopilan en un sistema de big data. Estos datos pueden provenir de fuentes internas, como bases de datos de una empresa, o externas, como las redes sociales. Variedad: se refiere a la diversidad de tipos de datos que se manejan en un sistema de big data. Estos datos pueden ser estructurados, como las bases de datos relacionales, o no estructurados o semiestructurados, como los datos que se usan en las bases de datos no relacionales, incluso en formato de texto libre o imágenes. Velocidad: se refiere a la capacidad de un sistema de big data para procesar y analizar grandes cantidades de datos en tiempo real. Esto es importante para poder tomar decisiones en tiempo real y adaptarse rápidamente a los cambios en el mercado. Veracidad: se refiere a la confiabilidad y exactitud de los datos que se recopilan y utilizan en un sistema de big data. Es importante tener datos confiables para poder realizar análisis precisos y tomar decisiones correctas. Valor: se refiere al beneficio que se puede obtener al analizar y utilizar los datos en un sistema de big data. El análisis de datos puede ayudar a una empresa a mejorar su eficiencia, aumentar sus ingresos y tomar decisiones estratégicas.', files: [] },
                    { title: 'Data LifeCycle Management', comment: 'Este es el resumen de la materia desarrollada en clase. 1. Generación (creación o captura) de datos. 2. Almacenamiento y protección. 3. Uso. 4. Archivo. 5. Destrucción', files: [] },
                    { title: 'Data Value Pyramid', comment: 'Este es el resumen de la materia desarrollada en clase. La pirámide de valor de los datos representa cómo los datos aumentan de valor a medida que se transforman y procesan. Está dividida en cinco niveles que reflejan la progresión desde la recopilación de datos básicos hasta la toma de decisiones basada en esos datos. El primer nivel es Records (Registros), donde los datos se recopilan y se muestran en su forma bruta. Este nivel corresponde a la simple recolección de datos (Raw Data Gathering), como por ejemplo almacenar datos en una base de datos o en un archivo CSV. El segundo nivel es Charts (Gráficos), donde los datos se limpian, agregan y visualizan para hacerlos más comprensibles. Un ejemplo sería la creación de gráficos o tablas que faciliten la interpretación de la información. El tercer nivel es Reports (Informes), donde se analizan los datos para identificar patrones, estructuras y relaciones. Este análisis permite generar informes con información estructurada que facilite la toma de decisiones. El cuarto nivel es Predictions (Predicciones), donde se aplican métodos de aprendizaje e inferencia para generar recomendaciones o predicciones basadas en los datos analizados. Esto permite obtener información procesable para anticipar comportamientos futuros. Finalmente, el quinto nivel es Actions (Acciones), donde se toman decisiones y se ejecutan acciones basadas en la información obtenida de las predicciones. En este nivel, se extrae el valor real de los datos mediante la automatización de decisiones o la implementación de estrategias basadas en las recomendaciones obtenidas. La pirámide muestra cómo los datos evolucionan desde simples registros hasta información valiosa que puede guiar la toma de decisiones estratégicas, aumentando su valor en cada nivel. ', files: [] },
                    { title: 'Sistema Distribuido, Particionamiento y Replicación', comment: 'Este es el resumen de la materia desarrollada en clase. Un sistema distribuido es una colección de máquinas independientes que aparecen ante el usuario del sistema como una única máquina. Hay tres principales razones por las que se puede querer distribuir una base de datos en varias máquinas: 1. Escalabilidad. Si el volumen de datos, la carga de lectura o la carga de escritura crece más de lo que una sola máquina puede manejar, podemos distribuir la carga a través de múltiples máquinas. 2. Tolerancia a los fallos/alta disponibilidad. Si la aplicación necesita seguir funcionando incluso si una máquina (o varias máquinas, o la red, o un centro de datos entero) se cae, podemos utilizar múltiples máquinas para tener redundancia. Cuando una falla, otra puede tomar el relevo. 3. Latencia. Si tenemos usuarios en todo el mundo, es posible que queramos tener servidores en diferentes localizaciones de manera que cada usuario pueda ser atendido desde un centro de datos que esté geográficamente cerca de ellos. Esto evita que los usuarios tengan que esperar a que los paquetes de red viajen por medio mundo. Ventajas y desventajas. Un sistema distribuido tiene varias ventajas: Escalabilidad, Tolerancia a los fallos/alta disponibilidad y Latencia. Desventajas o problemas: Concurrencia, ya que cada ordenador de la red ejecuta eventos de forma independiente y al mismo tiempo que los otros, Falta de un reloj global, Dificultad de gestión y administración, Seguridad, Dependencia de la Red, Más Hardware (y además heterogéneo), Detectar fallos, gestionar fallos, mitigar fallos, recuperar el sistema.', files: [] },
                    { title: 'Teorema CAP (Consistency, Availability, Partition Tolerance)', comment: 'Este es el resumen de la materia desarrollada en clase. El teorema de CAP también se llama Teorema de Brewer. Dice lo siguiente es imposible para un sistema computacional distribuido ofrecer simultáneamente las siguientes tres garantías: Consistencia (Consistency) – todos los nodos ven los mismos datos al mismo tiempo. Siempre que un dato es actualizado, todos los usuarios tienen acceso a esa última versión. Disponibilidad (Availability)  – garantiza que cada petición recibe una respuesta acerca de si tuvo éxito o no. Cualquier operación puede ser ejecutada sin demora. Tolerancia a la partición (Partition) – los datos son distribuidos a través de dos o más nodos de la red y el sistema puede seguir funcionando, incluso, cuando algunos de estos nodos son totalmente inaccesibles (network partition).', files: [] },
                    { title: 'ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)', comment: 'Este es el resumen de la materia desarrollada en clase. ACID son las siglas de Atomicidad, Consistencia, aIslamiento y Durabilidad. Una secuencia de operaciones (transacción): Se ejecutará del todo o nada (A). na vez completada, la BD quedará en un estado en el que no se viola ninguna restricción de integridad (C). Las transacciones concurrentes son independientes y no se afectan unas a otras (I). Las modificaciones efectuadas por una transacción podrán recuperarse ante fallas del sistema (D)', files: [] }
                ]
            },
            {
                value: "json", label: "JSON y JSON Schema",
                subtopics: [
                    { title: "Estructura de un documento JSON", comment: "Este es el resumen de la materia desarrollada en clase. JSON son las siglas de JavaScript Object Notation. JSON es un formato ligero de representación, almacenamiento e intercambio de datos  independiente de cualquier lenguaje de programación. Tiene forma de texto plano, de simple de lectura, escritura y generación. Un documento JSON está compuesto por pares clave-valor, donde las claves son cadenas y los valores pueden ser de distintos tipos como números, cadenas, objetos, arrays, booleanos o nulos. Un aspecto en el que se ha insistido en clase es que un objeto es un conjunto no ordenado de pares clave-valor y un array es un conjunto ordenado de valores.", files: [] },
                    { title: "Tipos de datos JSON", comment: "Este es el resumen de la materia desarrollada en clase. JSON admite varios tipos de datos: números, cadenas, booleanos (true/false), objetos, arrays y nulos. Cada tipo de dato permite estructurar la información de manera flexible. En JSON, un array es una lista ordenada de valores y un objeto es una colección de pares clave-valor. Un aspecto en el que se ha insistido en clase es que un objeto es un conjunto no ordenado de pares clave-valor y un array es un conjunto ordenado de valores.", files: [] },
                    { title: "Que es JSON Schema y para que sirve", comment: "Este es el resumen de la materia desarrollada en clase. JSON Schema es un vocabulario para definir la estructura y validación de documentos JSON. Permite asegurar que los datos JSON sigan una estructura predefinida así como documentarlos ya que JSON no admite añadir comentarios. La diferencia entre un documento bien formado y un documento válido es que si decimos que está bien formado es que el formato es JSON y si decimos que es válido es que valida contra un JSON schema.", files: [] },
                    { title: "Estructura de un documento JSON Schema", comment: "Este es el resumen de la materia desarrollada en clase. Un documento JSON Schema define las propiedades, tipos y restricciones de los datos JSON, facilitando la validación y el cumplimiento de formatos específicos así como su documentación. El JSON Schema tiene keywords, que son cualquier propiedad que aparece en el JSON Schema. Hay keywords especiales como ‘$id, $schema, $comment’, Annotation keywords y Validation keywords. Las Anotations keywords ‘title’ y ‘description’ son sólo descriptivas. No añaden restricciones a los datos que se validan. La intención del esquema se establece con estas dos palabras clave. Luego las tres principales Validation keywords son ‘type’ para indicar el tipo de datos que se espera (normalmente Object si estoy en el primer nivel), ‘properties’ para indicar la estructura de las propiedades que debe tener el JSON que estamos validando y ‘required’ para indicar qué propiedades son obligatorias. Dentro del type string el campo ‘format’ se usa para indicar el tipo semántico de un valor de tipo string, como fechas, correos electrónicos o URLs.", files: [] }
                ]
            },
            {
                value: "schema_design", label: "Schema Design en NoSQL y en MongoDB",
                subtopics: [
                    { title: "Modelo de datos no relacional o NoSQL", comment: "Este es el resumen de la materia desarrollada en clase. Un modelo de datos NoSQL se basa en la flexibilidad para almacenar y procesar datos no estructurados o semiestructurados, usando documentos, pares clave-valor, columnas o grafos. ¿Cuándo necesito NoSQL? CUANDO TENGO DATOS NO RELACIONALES, NO ESTRUCTURADOS O SEMIESTRUCTURADOS Y adicionalmente se puede dar uno o varios de los siguientes: Si el volumen de datos es muy muy grande y necesito escalabilidad horizontal. Si busco una alta disponibilidad o tolerancia a fallos o muy baja latencia (lo que implicaría distribuir mi sistema). Si genero muchos datos temporales que no corresponden al almacén de datos principal (carritos de compra, personalización de portales, logs, datos de temperatura, posiciones, etc.). Si mi BBDD ha sido desnormalizada (el esquema de datos ha crecido desproporcionalmente) por razones de rendimiento o por conveniencia para utilizar los datos en una aplicación. Si mi dataset tiene grandes cantidades de texto o imágenes, BLOB (Binary Large Objects). Si hay consultas contra datos que no implican relaciones jerárquicas sencillas; recomendaciones o consultas de inteligencia de negocio o analíticas. Ejemplo: “toda la gente en una red social que no ha comprado un libro este año que ha dejado de seguir a gente que si ha comprado un libro“. Si usas transacciones que no necesitan ser durables (no pasa nada si se pierde un dato o al menos puedo relajar la condición de durabilidad). e.j. Likes (los sites AJAX tienen muchos casos de uso de este estilo). En general se ha insistido en que es un cambio de mentalidad. Para Relacional se crea un modelo de datos normalizado sin pensar en los patrones de acceso. Más adelante podremos ampliarlo cuando surjan nuevas preguntas y necesidades de consulta. Organizaremos cada tipo de datos en su propia tabla. Para NoSQL o No Relacional no empezamos a diseñar el esquema hasta que conozcamos las preguntas a las que tendrá que responder. Es esencial comprender los problemas empresariales y los casos de uso de la aplicación por adelantado. Debe mantener el menor número posible de tablas. Hay 4 familias o tecnologías NoSQL, que ordenadas de menor a mayor por complejidad de los datos que manejan son Clave-valor, Familia de Columnas, Documentos y Grafos. Y ordenadas por tamaño de los datos que manejan son de mayor a menor Clave-valor, Familia de Columnas, Documentos y Grafos. ", files: [] },
                    { title: "Modelo de datos orientado a documentos con MongoDB", comment: "Este es el resumen de la materia desarrollada en clase. MongoDB usa un modelo de datos orientado a documentos, donde los datos se almacenan en formato BSON (similar a JSON) y permiten estructuras complejas y anidadas. El concepto clave aquí es el pre-join o embed de los datos, que consiste en almacenar datos relacionados directamente dentro de un mismo documento para mejorar el rendimiento de las consultas y reducir la necesidad de hacer joins en tiempo de ejecución. Relación 1 a 1: En una relación uno a uno, los datos relacionados se pueden incrustar directamente dentro de un documento principal. Por ejemplo, un perfil de usuario con datos personales podría almacenarse dentro del mismo documento que representa al usuario, evitando la necesidad de hacer una consulta separada para recuperar esos datos. Relación 1 a N: En una relación uno a muchos, los datos relacionados pueden incrustarse como un array dentro de un documento. Por ejemplo, un usuario y sus múltiples direcciones de correo electrónico pueden almacenarse en un array dentro del mismo documento del usuario, de modo que una consulta al documento del usuario también devuelva automáticamente las direcciones asociadas. Esto se hace normalmente en el caso de 1 a N con N pequeño (máximo unos cientos). En la relación 1 a N con N grande no se hace pre-join, por ejemplo ciudadanos y ciudad. En la relación M a N también se puede hacer pre-join como un array, añadiendo redundancia de los datos si es necesario y conveniente.", files: [] }
                ]
            },
            {
                value: "mongosh", label: "MongoDB Shell y Aggregation",
                subtopics: [
                    { title: "Comandos básicos e índices", comment: "Este es el resumen de la materia desarrollada en clase. MongoDB Shell permite interactuar con bases de datos mediante comandos básicos como `show dbs`, `use`, `db.collection.find()` y `exit`. Antes de entrar en la Shell tenemos que importar datos con mongoimport. Se ha dado mucha importancia a los índices, que son una estructura de datos adicional que se utiliza para optimizar determinadas búsquedas. Requiere su propio espacio en disco y contiene una copia de los datos de la tabla. Eso significa que un índice es una redundancia. Crear un índice no cambia los datos de la tabla. El índice se tiene que actualizar cada vez que se inserta, actualiza o borran campos. El índice tiene un funcionamiento similar al índice de un libro, guardando parejas de elementos: el elemento que se desea indexar y su posición en la base de datos. No se puede indexar todos los campos. El comando para crear un índice es db.collection.createIndex", files: [] },
                    { title: "Operaciones CRUD", comment: "Este es el resumen de la materia desarrollada en clase. Las operaciones CRUD (Create, Read, Update, Delete) permiten crear, leer, actualizar y eliminar documentos dentro de una colección de MongoDB. En clase se han hecho muchos ejemplos de queries simples de operaciones CRUD, con diferentes query selectors en el find como $gt, $lt, $gte, $lte, $in, $nin, $or, $and, $exists, sort, skip y limit, projection. En el updateOne y updateMany $set, $unset, $inc, $rename, $min, $max, $push y $pull. ", files: [] },
                    { title: "Operadores de agregación match, group, project, sort", comment: "Este es el resumen de la materia desarrollada en clase. El framework de agregación de MongoDB funciona por fases o stages, cada fase ve la salida del anterior, es decir el conjunto de documentos es inicialmente la colección pero va evolucionando y se va modificando fase a fase. Los operadores de agregación permiten transformar y analizar datos mediante etapas como `$match`, `$group`, `$project` y `$sort`.", files: [] },
                    { title: "Operador de agregación unwind", comment: "Este es el resumen de la materia desarrollada en clase. El operador `$unwind` descompone arrays en múltiples documentos, permitiendo que cada elemento del array se trate como un documento independiente. Este operador lo hemos usado en clase en combinación con el resto de operadores, para descomponer los arrays.", files: [] }
                ]
            }, 
            {
                value: "security",
                label: "Seguridad en NoSQL",
                subtopics: [
                    {
                        title: "Modelo CIA",
                        comment: "Este es el resumen de la materia desarrollada en clase. El objetivo principal de la ciberseguridad es garantizar la confidencialidad, integridad y disponibilidad de la información y los sistemas informáticos, y protegerlos de ataques maliciosos o accidentales. La **confidencialidad** asegura que la información llegue solamente a las personas autorizadas. Contra la confidencialidad pueden darse fugas y filtraciones de información, así como accesos no autorizados. La confidencialidad es una propiedad de difícil recuperación y puede minar la confianza de los demás en la organización. Además, puede suponer el incumplimiento de leyes y compromisos contractuales relativos a la custodia de los datos. La **integridad** consiste en mantener las características de completitud y corrección de los datos. Contra la integridad, la información puede aparecer manipulada, corrupta o incompleta, afectando directamente al correcto desempeño de las funciones de una organización. La integridad incluye la protección contra la modificación o destrucción indebidas de la información y la garantía de no repudio y autenticidad. El **no repudio** es la garantía de que el remitente recibe un comprobante de entrega y que el destinatario tiene una prueba de la identidad del remitente para que ninguno pueda negar posteriormente haber procesado los datos. La **autenticidad** implica que la información es genuina y confiable, permitiendo la confianza en la validez de una transmisión, un mensaje o el originador del mensaje. La **disponibilidad** garantiza que los servicios y los datos estén accesibles cuando se necesiten. La carencia de disponibilidad supone una interrupción del servicio que afecta directamente a la productividad de las organizaciones y también afecta indirectamente a la reputación, la imagen y la ventaja competitiva."
                    },
                    {
                        title: "Modelo AAAA",
                        comment: "Este es el resumen de la materia desarrollada en clase. El modelo AAAA incluye **autenticación**, **autorización**, **contabilidad (accounting)** y **auditoría**. La **autenticación** verifica la identidad del usuario mediante credenciales como contraseñas, tokens de un solo uso (OTP), certificados digitales o parámetros biométricos (huellas dactilares, reconocimiento facial, etc.). Se suele usar el MFA (múltiple factor de autenticación) donde se pide al usuario que verifique su identidad usando dos factores de autenticación (2FA). Los factores de autenticación se deben elegir de dos categorías de autenticación que incluyen: algo que sabes (como una contraseña), algo que tienes (como un dispositivo) y algo que eres (como una característica biométrica). La **autorización** controla qué recursos puede usar un usuario autenticado, estableciendo configuraciones de acceso basadas en derechos de usuario y políticas locales. Esto puede incluir modelos de control de acceso como ACL (Access Control List), RBAC (Role-Based Access Control), ABAC (Attribute-Based Access Control) y PBAC (Policy-Based Access Control). La **contabilidad (accounting)** registra a qué recursos se accedió, en qué momento, quién y qué comandos se emitieron. La información recopilada puede incluir ID de usuario, descripción del servicio, volumen de datos y duración de la sesión, siendo útil para la gestión, planificación y facturación. La **auditoría** combina la autenticidad (asegurar que la información y los usuarios sean genuinos) y la trazabilidad (determinar quién hizo qué y en qué momento). La trazabilidad es clave para analizar incidentes, perseguir atacantes y aprender de las experiencias."
                    },
                    {
                        title: "Caso MongoDB y otras consideraciones",
                        comment: "Este es el resumen de la materia desarrollada en clase. MongoDB proporciona mecanismos de autenticación (SCRAM, certificados x.509 y autenticación externa) y autorización basada en roles y privilegios (RBAC, ABAC). Asegura la integridad mediante backups continuos y snapshots, y la disponibilidad mediante réplicas. También permite cifrado de datos en tránsito (usando TLS/SSL) y en reposo (con 4 opciones principales cifrando el disco entero, todos los datos, solo algunos campos o cifrando usando el ODM). La auditoría permite rastrear las acciones que hacen los usuarios. Y el principio de mínimo privilegio (PoLP) consiste en Cada programa y cada usuario del sistema debe operar utilizando el menor conjunto de privilegios necesarios para completar el trabajo. Principalmente, este principio limita el daño que puede resultar de un accidente o error. Otras consideraciones de seguridad adicionales a los principios CIA y AAAA son: Limitar la exposición de red, no escuchar en 0.0.0.0, porque escuchará en todas las interfaces de red. Configurar adecuadamente el firewall. Ejecutar MongoDB con un usuario dedicado (no como root). Comprobar a menudo la configuración y el despliegue. Comprobar fallos de seguridad oficiales publicados por MongoDB."
                    }
                ]
            },
            {
                value: "odms", label: "ODMs",
                subtopics: [
                    { title: 'Concepto de ODM', comment: 'Este es el resumen de la materia desarrollada en clase. En el desarrollo de una aplicación suelen estar involucradas dos entidades diferentes, por una parte el código que mueve la aplicación y por otra los datos que se manejan. Un ODM (Object Document Mapper o Mapeo Objeto-Documento) es una técnica de programación que se suele materializar en forma de librería o módulo escrita en el lenguaje de programación que estemos usando, permite convertir los objetos de una aplicación a un formato adecuado para ser almacenados en cualquier base de datos. Los ODMs permiten  realizar las acciones CRUD (Create, Read, Update, Delete) sin necesidad de incluir queries en el código. De modo que en lugar de ejecutar queries a nuestras colecciones de documentos (en una BBDD NoSQL) ejecutaremos llamadas a objetos. Existen diversos ODMs para diferentes lenguajes de programación: NodeJS -> Mongoose, HumbleJS.. Java -> OdmManager, Morphia,..Python -> MongoEngine, Mongothon..' },
                    { title: 'Ventajas y Desventajas de los ODMs', comment: 'Este es el resumen de la materia desarrollada en clase. Ventajas: Muchas cosas se hacen automáticamente. Por ej: conectar a la BBDD, convertir tipos (sobretodo problemáticos DATE y TIME). Fomenta/fuerza el patrón MVC (Modelo Vista Controlador) y la app queda más limpia. Separación por capas. DRY (Don’t Repeat Yourself): el código del modelo queda en un sitio, fácil de actualizar, mantener y reutilizar. Abstrae de la BBDD, con lo que se podrá cambiar en el futuro de tecnología de BBDD. Suele evitar inyecciones de código y “sanitiza” en general el código. Desventajas: Para empezar pueden llegar a ser muy complejos. Puede llevar una curva de aprendizaje que podría retrasar el tiempo de desarrollo del proyecto. Se necesita alta estandarización de código y una buena arquitectura de la aplicación.          Hay ocasiones en las que interviene un gran número de registros por cada petición. Puede saturar la memoria de objetos (por ejemplo reportes que incluyan muchísimos datos)' }
                ]
            },
            {
                value: 'replicacion_particionamiento', label: 'Replicación y Particionamiento',
                subtopics: [ 
                    { title: 'Replicación de Datos', comment: `Este es el resumen de la materia desarrollada en clase. 
                        La replicación de datos en bases de datos NoSQL es la técnica de mantener copias idénticas de los datos en diferentes nodos para asegurar la disponibilidad y la tolerancia a fallos. Cuando un nodo falla, otro nodo puede continuar sirviendo las solicitudes de los clientes sin interrupciones.  ¿Por qué?: para Mantener datos a salvo (recuperación frente a desastres), Alta Disponibilidad, Mayor rendimiento de lecturas, Reducir la latencia.
Existen diferentes tipos de replicación, como la replicación síncrona y la replicación asíncrona. En la síncrona el Líder espera respuesta de que al menos un seguidor que ha conseguido replicar los datos esto tiene como ventaja que aumenta la garantía de datos en seguidores pero como desventaja puede bloquear el flujo. En la asíncrona el Líder no espera respuesta de los seguidores y sigue procesando peticiones de escritura, la ventaja es que el Líder procesa datos aún fallando seguidores, pero la desventaja es que pueden perderse datos.
Existen algoritmos para el manejo de la replicación: Líder individual, Líder múltiple y Sin líder. 
En "líder individual" Solo el líder acepta peticiones de escritura Los seguidores aplican los cambios según los logs de replicación y Las peticiones de lectura se pueden enviar al líder o a los seguidores. La replicación se realiza por logs y pueden ser Basados en sentencias, Basado en registros de escritura, Basados en filas, Basado en triggers. Posibles implicaciones cuando el líder cae: En replicación asíncrona, el nuevo líder puede no estar actualizado. Una solución habitual es descartar los cambios que había en el viejo líder (para evitar conflictos) cuando se vuelve a meter en el cluster. 
En "líder individual" en algunos escenarios dos nodos creen que son líderes. Es decir, hay alguna condición de carrera que hace creer al viejo líder que sigue siendo líder y procesa peticiones de escritura lo que da lugar a conflictos. Una forma de abordarlo es apagar los nodos. Con esto ganas que no se generen conflictos y por tanto consistencia de datos pero dejas de dar servicios. Hay que definir el timeout para determinar que un líder cae. Hay veces que por congestión de red al nodo no le han llegado bien los pings  y si pones un timeout muy pequeño puedes provocar restructuraciones del cluster innecesarias dando posibilidades de fallo como las anteriores. Pero si pones uno muy grande, la reacción y recuperación del sistema es mucho más lenta. 
En "líder múltiple" se permite que más de un nodo procese peticiones de escritura. La mayor desventaja es la gestión de conflictos. 
En "Sin líder" cualquier réplica puede aceptar peticiones de escritura Se envían varias peticiones (escritura o lectura) a la vez a varios nodos. Buscan la consistencia de datos mediante Quorums de lectura (r) y escritura (w) + técnicas como read-repair. 
En mongoDB la replicación se maneja de la siguiente forma: la replicación se despliega un clúster llamado “Replica set”. Importante: Es Replicación de líder individual asíncrona, Servidor principal (líder) + secundarios (seguidores), Logs basados en sentencias, Servidores informan de su estado y versión de datos mediante latidos (pings), Limitación de 50 nodos réplica, Servidores tienen prioridad de ser elegidos principal.
                        `},
                    { title: 'Particionamiento de Datos', comment: `Este es el resumen de la materia desarrollada en clase. 
                        El particionamiento de datos es el proceso de dividir una base de datos en múltiples segmentos llamados particiones. Cada partición puede residir en un nodo diferente del sistema. Esto permite distribuir la carga de trabajo y mejorar el rendimiento y la escalabilidad. 
                        El particionamiento  se puede categorizar en función de como se dividen los datos (usando el valor de la clave primaria con rango o hash o introduciendo también índices secundarios que es más complejo), o en función de como se gestionan las particiones, de forma algorítmica o fija o de forma dinámica. 
                        El particionamiento clave-valor, los mas conocidos son rango y hash. 
                        En rango se selecciona en qué partición se va escribir o leer en función de si la clave está dentro de un rango. Por ejemplo la clave primaria puede ser de tipo temporal, alfabética, numérica, etc. Por ejemplo podemos hacer particiones en función del día. Crear un partición con los datos de cada día O hacer la partición ordenando alfabéticamente, de la A a la C en este nodo, de la D a la F en este otro. 
                        En Hash lo que se hace es aplicar un hash a la clave primara antes de procesar la petición de escritura. De esta manera los datos se guardan uniformemente y evitas el problema de los patrones pero pierdes efectividad de búsquedas porque básicamente tienes que mirar en todas las particiones. A parte de la efectividad de búsquedas tiene también problemas de escritura. Por ejemplo en una red social, el hash aplicado a un influencer puede generar mas escrituras en forma de comentarios que otros usuarios, concentrado más registros en una partición que en otra. 
                        En el particionamiento algorítmico o fijo se definen números fijos de particiones. En cuanto a como gestionamos las particiones. La primera es la algorítmica con numero fijo de particiones la App determina a que partición dirigirse. Es decir, implementa una lógica adicional antes de hacer peticiones a las particiones. En general la clave es critica por lo que hemos dicho de que se llenan unos mas que otros. En general, esta aproximación es mejor usarla cuando sabemos que los datos son homogéneos. Rebalanceo complicado sobre todo si hay grandes cantidades de datos. 
                        Por otro lado tenemos el dinámico, donde las particiones se ajustan al tamaño de los datos. Es una forma más eficiente porque el balanceo como veremos a continuación es trivial y porque es mas resistente (por así decir) a que los datos no sean uniformes. Lo malo es que el localizador se convierte en un cuello de botella y es un punto único de fallo (es decir que si falla esto falla toda la app).
                        `},
                    { title: 'Implementación en mongoDB', comment: `Este es el resumen de la materia desarrollada en clase. 
                        Particionamiento + Replicación, Generalmente se suelen aplicar los dos procedimientos a la vez.
                        Una partición suele estar también replicada varias veces.
                        Implementación en mongoDB: 
                        En MongoDB, la particiones se llaman “Shards”. 
                        Es partición dinámica, pero permite definir un set inicial de shards, 
                        El localizador es el llamado Config Server, 
                        Introduce también un router Mongos que provee una interfaz entre los clientes y los shards,
                        Las claves pueden estar basadas en hash o en rango`
                    }
                    ]

            },           
            {
                value: "clave-valor", label: "Clave-valor y Redis",
                subtopics: [
                    { title: "Modelo de datos clave-valor", comment: "Este es el resumen de la materia desarrollada en clase. El modelo de datos clave-valor almacena datos en pares clave-valor, donde cada clave es única y se asocia con un valor. Este modelo es simple y eficiente, permitiendo un acceso rápido a los datos. Es ideal para almacenar datos que no requieren relaciones complejas y que se acceden de forma rápida y sencilla. Algunos ejemplos de casos de uso son: Caché de aplicaciones web, Sesiones de usuarios, Contadores, Listas de tareas, Colas de mensajes, Datos temporales. Modelo de datos muy sencillo: colección de pares clave/valor. Similar a diccionarios o maps. Basadas en DHT (Distributed Hash Tables). La clave es el identificador único que le permite acceder al valor asociado. Ejemplos de clave válidas: nombre de archivo, URI, hash, DNI, número de cuenta, número seguridad social, MAC address, … El valor es lo que se recupera, puede variar desde el contenido de una página HTML, un fichero, una imagen, una lista o incluso otro par clave-valor encapsulado con un objeto. Las operaciones de lectura y escritura tienen un desempeño altísimo, tienen una alta disponibilidad de los datos y son más sencillas de particionar que otras BBDD NoSQL.", files: [] },
                    { title: "Estructurar claves", comment: "Este es el resumen de la materia desarrollada en clase. Es importante estructurar y definir bien las claves para que se pueda obtener el valor correspondiente, para que sea eficiente, para que se particione adecuadamente, para que el código de las aplicaciones sea más legible y mantenible. Para ello se vio en clase cómo introducir abstracciones utilizando los namespaces o categorías separados por algún carácter, típicamente ':'. Ejemplos: Category:identifier (person:12321  user:ebarra   company:nike), Category:identifier:attribute (person:12321:name  person:12321:age  person:12321:address), Category:subcategory:identifier (spain:person:12321  online:order:23659), CategoryShort:identifier ( p:12321   per:12321), CategoryWithDate:identifier (Order24062021:123 ), CategoryWithDate:number:customeridentifier (Order24062021:773:ebarra). Unas últimas recomendaciones fueron No diseñar claves muy largas (una clave de 1024 bytes ocupará mucha memoria e implicará muchas comparaciones costosas para las búsquedas). No diseñar claves muy cortas y poco usables (una clave como 'u1000flw' es poco usable y tiene solo pocos bytes menos que 'user:1000:followers'). Mantenerse fiel a un esquema y no mezclar. Es decir, usamos “:” para los namespaces. “.” y “-” para separar palabras. El carácter separador (':') no se debe permitir en el identificador. Es muy recomendable que la clave sea inmutable, es decir, no es buena idea 'human_resources:person:12321'. ¿Qué pasa si la persona cambia de departamento? ->  implicará cambiar su clave y también todas las referencias a dicha clave.", files: [] }
                ]
            },
            {
                value: "columns", label: "BBDD Columnas y Cassandra",
                subtopics: [
                    { title: "Propiedades de las BBDDD de columnas", comment: "Este es el resumen de la materia desarrollada en clase. Las bases de datos de columnas organizan internamente la información por columnas. Esto permite obtener la información de una columna de manera mucho más rapida. Sin embargo, realizar escrituras es mucho más caro debido a que es necesario insertar información en varios sitios de la memoria. Por ello son BBDD que se utilizan principalmente en aplicaciones análiticas, en las que hay muchas más escrituras que lecturas.", files: [] },
                    { title: "Cassandra", comment: "Este es el resumen de la materia desarrollada en clase. Cassandra es una base de datos de columnas que permite una gran escalabilidad. Cassandra particiona la información y está diseñada para trabajar con un gran número de nodos. Dentro del teorema PAC, Cassandra se situa en Available y Partition Tolerant por defecto, pudiendose incrementar la consistencia a cambio de una menor disponibilidad.", files: [] },
                    { title: "Clave primaria", comment: "Este es el resumen de la materia desarrollada en clase. La clave primaria en Cassandra puede estar formada por varias columnas. A su vez, la clave se divide en la partion key y clustering key. Sobre esta clave se calcula un hash, el cual se utiliza para particionar la información entre los nodos. Al ejecutar busquedas, es necesario introducir todos los valores de la partition key o Cassandra devuelve un error al no saber en que nodo ha de buscar. La clustering key fija la ordenación de la información dentro de los nodos. Es necesario elegir que columnas pertenecen a cada clave teniendo en cuenta que la clave primaria resultante ha de ser única para cada entrada de la fila.", files: [] },
                    { title: "Modelados de datos en Cassandra", comment: "Este es el resumen de la materia desarrollada en clase. El modelado de datos en Cassandra es difente al del resto de BBDD puesto que no se realiza un modelo conceptual entidad-relacion. En su lugar se realiza un diseño basado en queries, de manera que para cada query se diseña una tabla específica para obtener los datos necesarios. Esto se debe a que dependiendo de los valores elegidos para la partition y clustering key, se podrán realizar unas consultas u otras. La información no se ha de normalizar y es habitual y recomendable duplicar la información en varias tablas.", files: [] }
                ]
            },
            {
                value: "graph", label: "Grafos y Neo4j",
                subtopics: [
                    { title: "Características básicas bases de datos orientadas a grafos", "comment": "Las bases de datos orientadas a grafos se caracterízan en que la información se modela como un grafo. Esto hace que sean idóneas para entornos en los que existen muchas relaciones entre los datos ya que con una base de datos relacional se requerían joins anidados lo que es computacionalmente costoso. Existen 2 tipos de base de datos orientadas a grafo: 1) nativas: el procesamiento del grafo y el almacenamiento del grafo es nativo (index-free adjacency) 2) no nativas: procesamiento o almacenamiento del grafo no nativo. A diferencia de otras bases de datos no relacionales el escalado horizontal no es trivial. No hay un lenguaje de consulta único, cada base de datos tiene el suyo, aunque en 2024 see aprobó el Graph Query Language.", files: [] },
                    { title: "Grafos y árboles", "comment": "Un grafo es un conjunto de vértices (nodos) conectado a través de aristas (relaciones). Teoría de grafos desarrollada por Euler. Tipos de grafos: no dirigidos, dirigidos, con pesos, dirigido con pesos. Grado de un nodo: cantidad de aristas que salen o entran de un nodo. Grado positivo: cantidad de aristas que salen de un nodo. Grado negativo: cantidad de aristas qeu entran en un nodo. Grafo conexo: todo par de nodos están conectados al menos por un camino. Grafo fuertemente conexo: grafo dirigido y conexo. Grafo debilmente conexo: grafo conexo si no se tiene en cuenta la dirrección de las aristas. Representaciones de los grafos como lista: lista de incidencia y lista de adyacencia. Representación de un grafo en forma de matriz: matriz de incidencia y matriz de adyacencia. Árbol es un tipo de grafo sin bucles y qeu conecta a todos los vértices. Tipos de nodo en un árbol: raíz, padre, hijo, hoja. Grado de un árbol: número máximo de nodos hijos que tiene alguno de los nodos del árbol. Árbol binario: árbol de grado 2. Algoritmos de grafos: dijkstra, bellman-ford, floyd-warshall, búsqueda en anchura, búsqueda en profundidad.", files: [] },
                    { title: "Casos de uso", "comment": "Casos de uso de bases de datos orientadas a grafos: 1) Redes sociales: sugerencias de amistad, predicción de comportamientos; 2) sistemas de recomendación: e-commerce, sistemas de perfilado, sugerencia de productos; 3) cálculo de rutas óptimas; 4) gestión de redes de comunicación; 5) detección de patrones a través de modelos de IA; 6) sistema de rastreo y detección de fraude.   ", files: [] },
                    { title: "Operaciones CRUD Cypher (Neo4j)", "comment": "Las operaciones CRUD (Create, Read, Update, Delete) permiten crear, leer, actualizar y eliminar propiedades, relaciones y nodos de un grafo. En clase se han hecho muchos ejemplos de queries simples de operaciones CRUD con cypher, con diferentes patrones a través de la sentencia MATCH, incluyendo filtrado por propiedades, relaciones, importancia de indicar o no el sentido en los patrones, y una combinación de ellos. También se han hecho consultas con funciones shortestPath, clausula WHERE, ORDER BY, SKIP y LIMIT. En el CREATE se enseña a crear nodos, relaciones, subgrafos completos. En el SET se enseña a actualizar nodos, propiedades de nodos, propiedades de relaciones, relacioens, y etiquetas de nodo. Con DELETE y DETACH DELETE se enseña a eliminar nodos, relaciones o paths. Con REMOVE se enseña a borrar propiedades o etiquetas.", files: [] },
                ]
            }             
        ]
    },
    IWEB: {
        name: 'Ingeniería Web',
        topics: [
            {
                value: 'react', label: 'React',
                subtopics: [
                    { title: 'Creación y uso de componentes', comment: '', files: [] },
                    { title: 'Ciclo de vida de un componente', comment: '', files: [] },
                    { title: 'Props y State', comment: '', files: [] },
                    { title: 'PropTypes y DefaultProps', comment: '', files: [] },
                    { title: 'UseRef y UseState', comment: '', files: [] },
                    { title: 'Sintaxis y uso de JSX', comment: '', files: [] },
                    { title: 'Hook UseEffect', comment: '', files: [] },
                    { title: 'Manejo de eventos', comment: '', files: [] },
                    { title: 'React Router', comment: '', files: [] },
                    { title: 'Context API', comment: '', files: [] },
                    { title: 'Redux', comment: '', files: [] },
                    { title: 'React Native', comment: '', files: [] },
                    { title: 'Componentes controlados y formulariosI', comment: '', files: [] }
                ]
            },
            {
                value: 'swift', label: 'Swift',
                subtopics: [
                    { title: 'Variables y constantes', comment: '', files: [] },
                    { title: 'Opcionales', comment: '', files: [] },
                    { title: 'Condicionales y bucles', comment: '', files: [] },
                    { title: 'Uso de guard y defer', comment: '', files: [] },
                    { title: 'Clases, estructuras y métodos', comment: '', files: [] },
                    { title: 'Uso de if let y guard let', comment: '', files: [] },
                    { title: 'Nil coalescing', comment: '', files: [] }
                ]
            }
        ]
    },
    CDPS: {
        name: 'Centros de Datos y Provisión de Servicios',
        topics: [
            {
                value: 'python', label: 'Python',
                subtopics: [
                    { title: 'Funciones, argumentos y valores de retorno', comment: '', files: [] },
                    { title: 'Funciones lambda', comment: '', files: [] },
                    { title: 'Condicionales y bucles', comment: '', files: [] },
                    { title: 'Uso de Break y Continue', comment: '', files: [] },
                    { title: 'Listas, tuplas y diccionarios', comment: '', files: [] },
                    { title: 'Clases, objetos y herencia', comment: '', files: [] }
                ]
            }
        ]
    },
    IBDN: {
        name: 'Ingeniería de Big Data en la Nube',
        topics: [
            {
                value: 'big_data', label: 'Introducción a Big Data',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'las 5 Vs del Big Data', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] }
                ]
            },
            {
                value: 'programacion_funcional', label: 'Programación funcional',
                subtopics: [
                    { title: 'Conceptos básicos', comment: '', files: [] },
                    { title: 'Composición de funciones', comment: '', files: [] },
                    { title: 'Funciones puras', comment: '', files: [] },
                    { title: 'Inmutabilidad', comment: '', files: [] },
                    { title: 'Efectos secundarios', comment: '', files: [] },
                    { title: 'Funciones de orden superior', comment: '', files: [] },
                    { title: 'Funciones lambda', comment: '', files: [] },
                    { title: 'Recursividad', comment: '', files: [] },
                    { title: 'Evaluación perezosa', comment: '', files: [] },
                    { title: 'Programación declarativa vs programación imperativa', comment: '', files: [] }
                ]
            },
            {
                value: 'lisp', label: 'Lisp',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'CAR, CDR, CONS, EQ', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Listas', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Recursividad', comment: '', files: [] }
                ]
            },
            {
                value: 'scala', label: 'Scala',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Scala vs Java', comment: '', files: [] },
                    { title: 'Sintaxis básica', comment: '', files: [] },
                    { title: 'Tipos de datos', comment: '', files: [] },
                    { title: 'Funciones', comment: '', files: [] },
                    { title: 'Clases y objetos', comment: '', files: [] },
                    { title: 'Traits', comment: '', files: [] },
                    { title: 'Pattern matching', comment: '', files: [] },
                    { title: 'Ejecución de programas Scala', comment: '', files: [] },
                    { title: 'map, flatMap, filter, reduce, groupBy', comment: '', files: [] }
                ]
            },
            {
                value: 'sbt', label: 'SBT',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Estructura de un proyecto SBT', comment: '', files: [] },
                    { title: 'Compilación y ejecución de un proyecto', comment: '', files: [] },
                    { title: 'Dependencias', comment: '', files: [] }
                ]
            },
            {
                value: 'actores_akka', label: 'Actores y Akka',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Comunicación síncrona y asíncrona', comment: '', files: [] },
                    { title: 'Concurrencia', comment: '', files: [] },
                    { title: 'Estado compartido', comment: '', files: [] },
                    { title: 'Actores', comment: '', files: [] },
                    { title: 'Mensajes', comment: '', files: [] },
                    { title: 'Akka', comment: '', files: [] }
                ]
            },
            {
                value: 'hadoop', label: 'Hadoop',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Arquitectura', comment: '', files: [] },
                    { title: 'HDFS', comment: '', files: [] },
                    { title: 'MapReduce', comment: '', files: [] },
                    { title: 'YARN', comment: '', files: [] },
                    { title: 'Hive, HBase, Pig, Nifi, Flume, Accumulo, Avro, Chuwka, Mahout, Spark, Zookeeper', comment: '', files: [] },
                    { title: 'Parquet', comment: '', files: [] },
                    { title: 'Bases de Datos no relacionales: Redis, Cassandra, MongoDB', comment: '', files: [] },
                    { title: 'Kafka', comment: '', files: [] }
                ]
            },
            {
                value: 'spark', label: 'Spark',
                subtopics: [
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Arquitectura', comment: '', files: [] },
                    { title: 'Spark vs Hadoop', comment: '', files: [] },
                    { title: 'RDD Dataframes y Datasets', comment: '', files: [] },
                    { title: 'Acciones y Transformaciones', comment: '', files: [] },
                    { title: 'Collect, Count, First, Take, Reduce, Filter, Map, FlatMap, GroupBy, GroupByKey, ReduceByKey', comment: '', files: [] },
                    { title: 'Spark SQL', comment: '', files: [] },
                    { title: 'Spark Streaming', comment: '', files: [] },
                    { title: 'SparkML', comment: '', files: [] },
                    { title: 'spark-submit', comment: '', files: [] }
                ]
            },
            {
                value: 'despliegue_nube', label: 'Despliegue en la nube',
                subtopics: [
                    { title: 'Historia y evolución', comment: '', files: [] },
                    { title: 'Características principales', comment: '', files: [] },
                    { title: 'Ventajas y desventajas', comment: '', files: [] },
                    { title: 'IaaS, PaaS, SaaS', comment: '', files: [] },
                    { title: 'Nube pública, privada, híbrida', comment: '', files: [] },
                    { title: 'Proveedores de servicios en la nube', comment: '', files: [] },
                    { title: 'AWS', comment: '', files: [] },
                    { title: 'OpenStack', comment: '', files: [] },
                    { title: 'Seguridad en Cloud', comment: '', files: [] }
                ]
            }
        ]
    }
}