// Prefijo bajo el que se sirve la aplicación detrás del proxy inverso (basePath de next.config.js,
// por defecto "/aiquiz"). Se toma del propio Next (process.env.__NEXT_ROUTER_BASEPATH, que Next
// sustituye al compilar con el basePath real, en servidor y navegador), así que siempre coincide con
// el prefijo con el que se sirven las páginas. BASE_PATH (del env de next.config.js) queda de respaldo.
export const BASE_PATH = process.env.__NEXT_ROUTER_BASEPATH || process.env.BASE_PATH || "";

// Antepone el basePath a una ruta de la aplicación: "/api/answer" -> "/aiquiz/api/answer".
// Para fetch, <a href>, window.location y URLs que se devuelven al navegador.
// NO usar con <Link> ni router.push: Next ya añade el basePath por su cuenta.
export function withBasePath(path = "/") {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return `${BASE_PATH}${normalized}`;
}

// Quita el basePath del principio de una ruta si lo lleva: "/aiquiz/api/x" -> "/api/x".
export function stripBasePath(path) {
	if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`) || path.startsWith(`${BASE_PATH}?`))) {
		return path.slice(BASE_PATH.length) || "/";
	}
	return path;
}
