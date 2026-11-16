// app/aiquiz/api/manager/swagger/route.js
import { NextResponse } from "next/server";
import swaggerJSDoc from "swagger-jsdoc";
import { Glob } from "glob";
import { BASE_PATH } from "../../../utils/basePath";

const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "AIQuiz Manager API",
			version: "1.0.0",
			description: `
# AIQuiz Manager API

API completa para la gestión del sistema AIQuiz Manager, que permite la administración de:

- **Asignaturas**: Creación y gestión de asignaturas académicas
- **Temas**: Organización de contenido por temas
- **Subtemas**: División detallada de contenido
- **Preguntas**: Generación y gestión de preguntas
- **Cuestionarios**: Creación de evaluaciones
- **Archivos**: Gestión de documentos y recursos
- **Videos**: Integración de contenido multimedia

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Include el token en el header:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Usuario de Prueba

Para testing, usa estas credenciales:

- **Email**: admin@upm.es
- **Contraseña**: password123

## Endpoints Pendientes

⚠️ **Nota**: Algunos endpoints están marcados como "PENDIENTE DE IMPLEMENTACIÓN":

- **Subida de archivos**: \`POST ${BASE_PATH}/api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}/files\`
- **Gestión de videos**: \`POST ${BASE_PATH}/api/manager/subjects/{id}/topics/{topicId}/subtopics/{subtopicId}/videos\`

Estos endpoints están documentados pero requieren implementación adicional para el manejo de archivos y videos.

## Estructura de Datos

### Jerarquía
\`\`\`
Asignatura
├── Tema 1
│   ├── Subtema 1.1
│   │   ├── Archivos
│   │   ├── Videos
│   │   └── Preguntas
│   └── Subtema 1.2
└── Tema 2
    └── ...
\`\`\`

### Roles de Usuario
- **admin**: Acceso completo al sistema
- **professor**: Gestión de asignaturas asignadas

## Códigos de Estado

- **200**: Éxito
- **201**: Creado exitosamente
- **400**: Error de validación
- **401**: No autorizado
- **403**: Prohibido
- **404**: No encontrado
- **500**: Error interno del servidor
- **501**: No implementado (funcionalidad pendiente)

## Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.
			`,
			contact: {
				name: "AIQuiz Manager Team",
				email: "admin@upm.es",
			},
			license: {
				name: "MIT",
				url: "https://opensource.org/licenses/MIT",
			},
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Servidor de desarrollo",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT token para autenticación",
				},
			},
			schemas: {
				Error: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: false,
						},
						message: {
							type: "string",
							example: "Error message",
						},
						error: {
							type: "string",
							description: "Detalles del error (solo en desarrollo)",
						},
					},
				},
				User: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						name: {
							type: "string",
							example: "Carlos González",
						},
						email: {
							type: "string",
							format: "email",
							example: "carlos@upm.es",
						},
						role: {
							type: "string",
							enum: ["admin", "professor"],
							example: "admin",
						},
						faculty: {
							type: "string",
							example: "ETSIT",
						},
						department: {
							type: "string",
							example: "Ingeniería Telemática",
						},
					},
				},
				Subject: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						title: {
							type: "string",
							example: "Desarrollo de Aplicaciones Web",
						},
						acronym: {
							type: "string",
							example: "DAW",
						},
						description: {
							type: "string",
							example: "Curso sobre desarrollo web moderno",
						},
						administrators: {
							type: "array",
							items: {
								$ref: "#/components/schemas/User",
							},
						},
						professors: {
							type: "array",
							items: {
								$ref: "#/components/schemas/User",
							},
						},
						createdAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
				Topic: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439012",
						},
						title: {
							type: "string",
							example: "Fundamentos de JavaScript",
						},
						description: {
							type: "string",
							example: "Conceptos básicos de JavaScript",
						},
						order: {
							type: "number",
							example: 1,
						},
						subject: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
				Subtopic: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439013",
						},
						title: {
							type: "string",
							example: "Variables y Tipos de Datos",
						},
						description: {
							type: "string",
							example: "Declaración de variables y tipos primitivos",
						},
						content: {
							type: "string",
							example: "En JavaScript, las variables se pueden declarar...",
						},
						order: {
							type: "number",
							example: 1,
						},
						topic: {
							type: "string",
							example: "507f1f77bcf86cd799439012",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
				Question: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439014",
						},
						text: {
							type: "string",
							example: "¿Cuál es la diferencia entre let y var?",
						},
						type: {
							type: "string",
							enum: ["Opción múltiple", "Verdadero/Falso", "Respuesta corta", "Ensayo"],
							example: "Opción múltiple",
						},
						difficulty: {
							type: "string",
							enum: ["Fácil", "Medio", "Avanzado"],
							example: "Medio",
						},
						choices: {
							type: "array",
							items: {
								type: "object",
								properties: {
									text: {
										type: "string",
										example: "let tiene scope de bloque",
									},
									isCorrect: {
										type: "boolean",
										example: true,
									},
								},
							},
						},
						explanation: {
							type: "string",
							example: "let fue introducido en ES6 y tiene scope de bloque",
						},
						verified: {
							type: "boolean",
							example: true,
						},
						rejected: {
							type: "boolean",
							example: false,
						},
						topic: {
							type: "string",
							example: "507f1f77bcf86cd799439012",
						},
						subtopic: {
							type: "string",
							example: "507f1f77bcf86cd799439013",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
				File: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439015",
						},
						fileName: {
							type: "string",
							example: "documento_1234567890.pdf",
						},
						originalName: {
							type: "string",
							example: "Variables JavaScript.pdf",
						},
						fileType: {
							type: "string",
							enum: ["document", "image", "video", "other"],
							example: "document",
						},
						size: {
							type: "number",
							example: 1024576,
						},
						mimeType: {
							type: "string",
							example: "application/pdf",
						},
						path: {
							type: "string",
							example: "/uploads/documento_1234567890.pdf",
						},
						isExternal: {
							type: "boolean",
							example: false,
						},
						externalUrl: {
							type: "string",
							example: "https://youtube.com/watch?v=abc123",
						},
						platform: {
							type: "string",
							enum: ["local", "youtube", "vimeo", "other"],
							example: "local",
						},
						subtopic: {
							type: "string",
							example: "507f1f77bcf86cd799439013",
						},
						createdAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
							example: "2023-01-01T00:00:00.000Z",
						},
					},
				},
			},
		},
		tags: [
			{
				name: "Authentication",
				description: "Endpoints de autenticación y gestión de sesiones",
			},
			{
				name: "Subjects",
				description: "Gestión de asignaturas académicas",
			},
			{
				name: "Topics",
				description: "Gestión de temas dentro de asignaturas",
			},
			{
				name: "Subtopics",
				description: "Gestión de subtemas dentro de temas",
			},
			{
				name: "Questions",
				description: "Gestión de preguntas y evaluaciones",
			},
			{
				name: "Questionnaires",
				description: "Creación y gestión de cuestionarios",
			},
			{
				name: "Files",
				description: "Gestión de archivos y documentos (🚨 PENDIENTE)",
			},
			{
				name: "Videos",
				description: "Gestión de contenido de video (🚨 PENDIENTE)",
			},
		],
	},
	apis: [
		"./app/aiquiz/api/manager/auth/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/subtopics/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/subtopics/*/files/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/subtopics/*/videos/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/questions/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/topics/*/questionnaires/*/route.js",
		"./app/aiquiz/api/manager/subjects/*/professors/*/route.js",
	],
};

export async function GET() {
	try {
		const specs = swaggerJSDoc(swaggerOptions);
		
		return NextResponse.json(specs, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error generando documentación Swagger:", error);
		return NextResponse.json(
			{
				error: "Error generando documentación",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}