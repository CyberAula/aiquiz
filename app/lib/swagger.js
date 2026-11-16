import swaggerJsdoc from "swagger-jsdoc";
import { withBasePath } from "../utils/basePath";

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
				url: withBasePath("/api"),
				description: "Development server",
			},
		],
	},
	apis: ["./app/aiquiz/api/**/route.js"],
};

export const spec = swaggerJsdoc(options);
