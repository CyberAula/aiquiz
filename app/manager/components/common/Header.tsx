// /app/manager/components/common/Header.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

/**
 * Componente de cabecera principal para la aplicación
 */
const Header: React.FC = () => {
	const { t, i18n } = useManagerTranslation();
	const pathname = usePathname();
	const router = useRouter();

	/**
	 * Cambia el idioma de la aplicación
	 * @param lang Código del idioma ('en' o 'es')
	 */
	const handleLanguageChange = (lang: string): void => {
		i18n.changeLanguage(lang);
	};

	/**
	 * Cierra la sesión del usuario y redirige a la página de login
	 */
	const handleLogout = (): void => {
		console.log("🔐 Eliminando token JWT del localStorage");
		localStorage.removeItem("jwt_token");
		console.log("🔀 Redireccionando a la página de login");
		router.push("/manager/login");
	};

	/**
	 * Determina si un enlace está activo basado en la ruta actual
	 * @param path Ruta a comprobar
	 */
	const isActive = (path: string): boolean => {
		return pathname.includes(path);
	};

	/**
	 * Genera la clase CSS para un enlace de navegación
	 * @param path Ruta a comprobar
	 */
	const getLinkClassName = (path: string): string => {
		return `inline-flex items-center h-full px-1 border-b-2 text-sm font-medium ${
			isActive(path)
				? "border-gray-900 text-gray-900"
				: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
		}`;
	};

	return (
		<header className="bg-white border-b border-gray-200 h-16">
			<div className="h-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-full items-center">
					<div className="flex h-full">
						<div className="flex-shrink-0 flex items-center">
							<Link
								href="/manager/subjects"
								className="text-3xl font-black"
							>
								AIQUIZ
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-8 h-full">
							<Link
								href="/manager/dashboard"
								className={getLinkClassName("/dashboard")}
							>
								{t("navigation.dashboard")}
							</Link>
							<Link
								href="/manager/subjects"
								className={getLinkClassName("/subjects")}
							>
								{t("navigation.subjects")}
							</Link>
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
						{/* Selector de idioma */}
						<div className="flex items-center border rounded-md overflow-hidden">
							<button
								onClick={() => handleLanguageChange("es")}
								className={`px-3 py-1 text-sm ${
									i18n.language === "es"
										? "bg-gray-800 text-white"
										: "bg-white text-gray-700 hover:bg-gray-100"
								}`}
							>
								ES
							</button>
							<button
								onClick={() => handleLanguageChange("en")}
								className={`px-3 py-1 text-sm ${
									i18n.language === "en"
										? "bg-gray-800 text-white"
										: "bg-white text-gray-700 hover:bg-gray-100"
								}`}
							>
								EN
							</button>
						</div>

						<Link
							href="/manager/account"
							className={getLinkClassName("/account")}
						>
							{t("navigation.account")}
						</Link>
						<button
							onClick={handleLogout}
							className="inline-flex items-center px-3 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-transparent hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							{t("navigation.logout")}
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
