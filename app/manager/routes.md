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
/manager/login							| 01 Inicio de sesión										OK
/manager/recovery-password				| 02 Recuperar contraseña									OK
```

### SUBJECTS 
```json
/manager/subjects						| 03 Ver todas las asignaturas								OK
/manager/subjects/new					| 04 Nueva asignatura										OK

/manager/subjects/[id]/topics			| 05 Ver todos los TEMAS de UNA ASIGNATURA					OK
/manager/subjects/[id]/topics/new		| 06 Añadir un TEMA											!!

/manager/subjects/[id]/teachers			| 07 Ver todos los PROFESORES de UNA ASIGNATURA				OK
/manager/subjects/[id]/teachers/new		| 08 Añadir un PROFESOR										OK

/manager/subjects/[id]/settings			| 09 Editar una ASIGNATURA (nombre, siglas, descripción, temas + eliminar)		OK
```

### TOPICS
```json
/manager/subjects/[id]/topics/[id]/subtopics		| 10 Ver todos los SUBTEMAS de UN TEMA 			!!
/manager/subjects/[id]/topics/[id]/subtopics/new	| 11 Añadir un SUBTEMAS							!!

/manager/subjects/[id]/topics/[id]/settings			| 12 Editar un TEMA (nombre, descripción, subtemas + eliminar)		!!
```

### SUBTOPICS
```json
/manager/subjects/[id]/topics/[id]/subtopics/[id]/information	| 13 Ver todos los CONTENIDOS de UN SUBTEMA		!!

/manager/subjects/[id]/topics/[id]/subtopics/[id]/questions		| 14 Ver banco de PREGUNTAS de UN SUBTEMA		!!

/manager/subjects/[id]/topics/[id]/subtopics/[id]/tests			| 15 Ver todos los TESTS de UN SUBTEMA			!!

/manager/subjects/[id]/topics/[id]/subtopics/[id]/settings		| 16 Editar un SUBTEMA (nombre, descripción + eliminar)	!!
```

### Progeso
8/16 = 50%