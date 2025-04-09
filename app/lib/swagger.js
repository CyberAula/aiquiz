import swaggerJsdoc from "swagger-jsdoc";

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "AIQuiz API",
			version: "1.0.0",
			description: "API documentation for AIQuiz application",
		},
		servers: [
			{
				url: "/api",
				description: "Development server",
			},
		],
	},
	apis: ["./app/api/**/route.js"],
};

export const spec = swaggerJsdoc(options);
