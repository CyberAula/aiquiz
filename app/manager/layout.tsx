"use client";

import "../i18n"; // Usar la configuración principal de i18n
import { I18nProvider } from "./I18nProvider";
import { ReactNode } from "react";

export default function ManagerLayout({ children }: { children: ReactNode }) {
	return (
		<div className="font-sans">
			<I18nProvider>{children}</I18nProvider>
		</div>
	);
}
