"use client";

import "./i18n";
import { I18nProvider } from "./I18nProvider";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function ManagerLayout({ children }: { children: ReactNode }) {
	return (
		<div className={inter.className}>
			<I18nProvider>{children}</I18nProvider>
		</div>
	);
}
