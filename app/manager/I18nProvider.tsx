"use client";

import { useState, useEffect, createContext, ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// Crear un contexto para controlar si estamos en el cliente
export const ClientSideContext = createContext(false);

interface I18nProviderProps {
	children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Si no estamos en el cliente, mostramos un contenedor mínimo
	if (!isClient) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="flex items-center justify-center min-h-screen">
					<div className="w-full max-w-md p-8 bg-gray-100 rounded-md shadow-md">
						<div className="text-center">
							<h1 className="text-3xl font-bold text-gray-900">
								AIQUIZ
							</h1>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<I18nextProvider i18n={i18n}>
			<ClientSideContext.Provider value={isClient}>
				{children}
			</ClientSideContext.Provider>
		</I18nextProvider>
	);
}
