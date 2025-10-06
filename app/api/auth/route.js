/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Authentication check
 *     description: Checks if the user is authenticated
 *     responses:
 *       401:
 *         description: Authentication required
 *         headers:
 *           WWW-Authenticate:
 *             schema:
 *               type: string
 *             description: Authentication method required
 */

export async function GET(Request) {
	return new Response("Authentication Required!", {
		status: 401,
		headers: {
			"WWW-Authenticate": "Basic realm='private_pages'",
		},
	});
}
