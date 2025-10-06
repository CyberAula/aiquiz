import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./constants/langs/en";
import { es } from "./constants/langs/es";

// Importar traducciones del manager
import managerEsJSON from "./manager/languages/es.json";
import managerEnJSON from "./manager/languages/en.json";

// Consolidar recursos de traducciones
const resources = {
	en: {
		translation: {
			...en,
			manager: managerEnJSON
		},
	},
	es: {
		translation: {
			...es,
			manager: managerEsJSON
		},
	},
};

// Inicializar i18n de forma síncrona
i18n.use(initReactI18next).init({
	debug: false,
	lng: "es", // Idioma por defecto
	supportedLngs: ["en", "es"],
	fallbackLng: "es",
	resources,
	interpolation: {
		escapeValue: false,
	},
	defaultNS: "translation",
	ns: ["translation"],
	react: {
		useSuspense: false,
	},
});

export default i18n;
