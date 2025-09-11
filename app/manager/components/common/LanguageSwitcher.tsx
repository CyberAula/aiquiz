// /app/manager/components/common/LanguageSwitcher.tsx
"use client";

import { useContext } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import { ClientSideContext } from "../../I18nProvider";

/**
 * Componente para cambiar el idioma de la aplicación
 */
const LanguageSwitcher: React.FC = () => {
	const { i18n } = useManagerTranslation();
	const isClient = useContext(ClientSideContext);

	// No renderizar nada si no estamos en el cliente
	if (!isClient) return null;

	/**
	 * Cambia el idioma de la aplicación
	 * @param lang Código del idioma ('en' o 'es')
	 */
	const changeLanguage = (lang: string): void => {
		i18n.changeLanguage(lang);
	};

	/**
	 * Genera la clase CSS para un botón de idioma
	 * @param lang Código del idioma a comprobar
	 */
	const getButtonClassName = (lang: string): string => {
		return `px-2 py-1 text-sm rounded ${
			i18n.language === lang ? "bg-blue-500 text-white" : "bg-gray-200"
		}`;
	};

	return (
		<div className="flex justify-end">
			<button
				onClick={() => changeLanguage("es")}
				className={getButtonClassName("es")}
				aria-label="Cambiar a español"
			>
				ES
			</button>
			<button
				onClick={() => changeLanguage("en")}
				className={getButtonClassName("en")}
				aria-label="Change to English"
			>
				EN
			</button>
		</div>
	);
};

export default LanguageSwitcher;
