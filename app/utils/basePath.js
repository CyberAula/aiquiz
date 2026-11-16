// Prefijo bajo el que se sirve la aplicación detrás del proxy inverso (basePath de next.config.js,
// por defecto "/aiquiz"). next.config.js lo publica como process.env.BASE_PATH y Next lo sustituye
// al compilar, tanto en el servidor como en el navegador.
export const BASE_PATH = process.env.BASE_PATH || "";

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
