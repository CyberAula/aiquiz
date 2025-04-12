"use client";

import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { ClientSideContext } from "../I18nProvider";

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const isClient = useContext(ClientSideContext);

	if (!isClient) return null;

	const changeLanguage = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	return (
		<div className="flex justify-end">
			<button
				onClick={() => changeLanguage("es")}
				className={`px-2 py-1 text-sm rounded ${
					i18n.language === "es"
						? "bg-blue-500 text-white"
						: "bg-gray-200"
				}`}
				aria-label="Cambiar a español"
			>
				ES
			</button>
			<button
				onClick={() => changeLanguage("en")}
				className={`px-2 py-1 text-sm rounded ml-2 ${
					i18n.language === "en"
						? "bg-blue-500 text-white"
						: "bg-gray-200"
				}`}
				aria-label="Change to English"
			>
				EN
			</button>
		</div>
	);
};

export default LanguageSwitcher;
