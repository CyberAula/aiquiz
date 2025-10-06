// /app/manager/components/subject/useCopyToClipboard.tsx
import { useState } from "react";

interface CopyToClipboardResult {
	copied: boolean;
	copyToClipboard: (text: string) => void;
}

const useCopyToClipboard = (): CopyToClipboardResult => {
	const [copied, setCopied] = useState(false);

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
			// Fallback for browsers that don't support clipboard API
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
};

export default useCopyToClipboard;
