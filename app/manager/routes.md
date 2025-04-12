# Ampliación de AIQUIZ



## 🧩 Modelos de datos


## 🛠️ Rutas de la API Rest
## 🌐Rutas del gestor de asignaturas

### ENTRYPOINT (Redirige a login)
```
/manager
```

### AUTHORITATION
```json
/manager/login							| 01 Inicio de sesión
/manager/register						| 02 Registro de usuario
/manager/recovery-password				| 03 Recuperar contraseña
```

### SUBJECTS 
```json
/manager/subjects						| 04 Ver todas las asignaturas										
/manager/subjects/new					| 05 Nueva asignatura

/manager/subjects/[id]/topics			| 06 Ver todos los TEMAS de UNA ASIGNATURA
/manager/subjects/[id]/topics/new		| 07 Añadir un TEMA

/manager/subjects/[id]/teachers			| 08 Ver todos los PROFESORES de UNA ASIGNATURA
/manager/subjects/[id]/teachers/new		| 09 Añadir un PROFESOR

/manager/subjects/[id]/settings			| 10 Editar una ASIGNATURA (nombre, siglas, descripción, temas + eliminar)
```

### TOPICS
```json
/manager/subjects/[id]/topics/[id]/subtopics		| 11 Ver todos los SUBTEMAS de UN TEMA 
/manager/subjects/[id]/topics/[id]/subtopics/new	| 12 Añadir un SUBTEMAS

/manager/subjects/[id]/topics/[id]/settings			| 13 Editar un TEMA (nombre, descripción, subtemas + eliminar)
```

### SUBTOPICS
```json
/manager/subjects/[id]/topics/[id]/subtopics/[id]/information	| 14 Ver todos los CONTENIDOS de UN SUBTEMA

/manager/subjects/[id]/topics/[id]/subtopics/[id]/questions		| 15 Ver banco de PREGUNTAS de UN SUBTEMA

/manager/subjects/[id]/topics/[id]/subtopics/[id]/tests			| 16 Ver todos los TESTS de UN SUBTEMA

/manager/subjects/[id]/topics/[id]/subtopics/[id]/settings		| 17 Editar un SUBTEMA (nombre, descripción + eliminar)
```