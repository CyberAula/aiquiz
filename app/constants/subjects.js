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
                    { title: 'las 5 Vs del Big Data', comment: '', files: [] },
                    { title: 'Data LifeCycle Management', comment: '', files: [] },
                    { title: 'Data Value Pyramid', comment: '', files: [] },
                    { title: 'Sistema Distribuido, Particionamiento y Replicación', comment: '', files: [] },
                    { title: 'Teorema CAP (Consistency, Availability, Partition Tolerance)', comment: '', files: [] },
                    { title: 'ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)', comment: '', files: [] }
                ]
            },
            {
                value: 'json', label: 'JSON y JSON Schema',
                subtopics: [
                    { title: 'Estructura de un documento JSON', comment: '', files: [] },
                    { title: 'Tipos de datos JSON', comment: '', files: [] },
                    { title: 'Arrays y objetos JSON', comment: '', files: [] },
                    { title: 'Que es JSON Schema y para que sirve', comment: '', files: [] },
                    { title: 'Estructura de un documento JSON Schema', comment: '', files: [] }
                ]
            },
            {
                value: 'schema_design', label: 'Schema Design en NoSQL y en MongoDB',
                subtopics: [
                    { title: 'Modelo de datos no relacional o NoSQL', comment: '', files: [] },
                    { title: 'Modelo de datos orientado a documentos con MongoDB', comment: '', files: [] }
                ]
            },
            {
                value: 'mongosh', label: 'MongoDB Shell',
                subtopics: [
                    { title: 'Comandos básicos', comment: '', files: [] },
                    { title: 'Operaciones CRUD', comment: '', files: [] },
                    { title: 'Operaciones de consulta', comment: '', files: [] },
                    { title: 'Operaciones de actualización', comment: '', files: [] },
                    { title: 'Operaciones de eliminación', comment: '', files: [] }
                ]
            },
            {
                value: 'mongodb_aggregation', label: 'MongoDB Aggregation Framework',
                subtopics: [
                    { title: 'Operadores de agregación', comment: '', files: [] },
                    { title: 'Operadores de proyección', comment: '', files: [] },
                    { title: 'Operadores de agrupación', comment: '', files: [] },
                    { title: 'Operador unwind', comment: '', files: [] }
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