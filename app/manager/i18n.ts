"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import esJSON from "./languages/es.json";
import enJSON from "./languages/en.json";

// Configuración específica para la sección manager
const resources = {
	en: {
		translation: enJSON,
	},
	es: {
		translation: esJSON,
	},
};

// Solo inicializamos i18next una vez
if (!i18n.isInitialized) {
	i18n.use(initReactI18next)
		.use(LanguageDetector)
		.init({
			debug: false,
			supportedLngs: ["en", "es"],
			fallbackLng: "es",
			interpolation: {
				escapeValue: false,
			},
			resources,
			detection: {
				order: ["localStorage", "navigator"],
				lookupLocalStorage: "manager_language",
				caches: ["localStorage"],
			},
			backend: {
				loadPath: "/locales/{{lng}}/{{ns}}.json",
			},
			defaultNS: "translation",
			partialBundledLanguages: true,
		});
}

export default i18n;
