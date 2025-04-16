// /app/manager/components/Header.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const Header = () => {
	const { t, i18n } = useTranslation();
	const pathname = usePathname();
	const router = useRouter();

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
	};

	const handleLogout = () => {
		console.log("🔐 Eliminando token JWT del localStorage");
		localStorage.removeItem("jwt_token");
		console.log("🔀 Redireccionando a la página de login");
		router.push("/manager/login");
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
								className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-medium ${
									pathname.includes("/dashboard")
										? "border-gray-900 text-gray-900"
										: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
								}`}
							>
								{t("navigation.dashboard")}
							</Link>
							<Link
								href="/manager/subjects"
								className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-medium ${
									pathname.includes("/subjects")
										? "border-gray-900 text-gray-900"
										: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
								}`}
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
							className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-medium ${
								pathname.includes("/account")
									? "border-gray-900 text-gray-900"
									: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
							}`}
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
