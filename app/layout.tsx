import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="es" suppressHydrationWarning={true}>
			<body suppressHydrationWarning={true} className={inter.className}>
				{children}
			</body>
		</html>
	);
}
