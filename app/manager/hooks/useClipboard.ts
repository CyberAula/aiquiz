import { useState } from "react";

/**
 * Hook personalizado para copiar texto al portapapeles
 * @returns {Object} - { copied, copyToClipboard }
 */
export function useClipboard() {
	const [copied, setCopied] = useState(false);

	/**
	 * Copia el texto proporcionado al portapapeles
	 * @param {string} text - Texto a copiar
	 */
	const copyToClipboard = (text: string) => {
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					setCopied(true);
					// Reset copied state after 2 seconds
					setTimeout(() => setCopied(false), 2000);
				})
				.catch((error) => {
					console.error("Error copying to clipboard:", error);
					setCopied(false);
				});
		} else {
			// Fallback para navegadores que no soportan la API clipboard
			try {
				const textArea = document.createElement("textarea");
				textArea.value = text;
				textArea.style.position = "fixed";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textArea);
				setCopied(successful);
				if (successful) {
					setTimeout(() => setCopied(false), 2000);
				}
			} catch (error) {
				console.error("Fallback: Error copying to clipboard:", error);
				setCopied(false);
			}
		}
	};

	return { copied, copyToClipboard };
}
