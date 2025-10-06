// /app/manager/login/page.tsx
"use client";

import { useState, useEffect, useContext, FormEvent, ChangeEvent } from "react";
import { useManagerTranslation } from "../hooks/useManagerTranslation";
import { useRouter, useSearchParams } from "next/navigation";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { ClientSideContext } from "../I18nProvider";
import Link from "next/link";
import useApiRequest from "../hooks/useApiRequest";

interface Credentials {
	email: string;
	password: string;
}

const LoginPage = () => {
	const isClient = useContext(ClientSideContext);
	const { t } = useManagerTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [credentials, setCredentials] = useState<Credentials>({
		email: "",
		password: "",
	});

	const [loginError, setLoginError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// API login
	const {
		makeRequest: login,
		loading,
		error: apiError,
	} = useApiRequest("/api/manager/auth/login", "POST", null, false);

	// Actualizar el error de login si hay error en la API
	useEffect(() => {
		if (apiError) {
			setLoginError(t("login.loginError"));
		}
	}, [apiError, t]);

	// Comprobar si viene de la aceptación de invitación o restablecimiento de contraseña
	useEffect(() => {
		const message = searchParams.get('message');
		if (message === 'invitation-accepted') {
			setSuccessMessage(t("success.accountActivated"));
		} else if (message === 'password-reset-success') {
			setSuccessMessage(t("success.passwordReset"));
		}
	}, [searchParams]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setCredentials((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoginError("");

		try {
			const response = await login(credentials);

			if (response.success) {
				// Guardar token JWT en localStorage
				localStorage.setItem("jwt_token", response.token);
				router.push("/manager/subjects");
			} else {
				setLoginError(t("login.loginError"));
			}
		} catch (error) {
			console.error("❌ Error durante el login:", error);
			setLoginError(t("login.loginError"));
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-white">
			<div className="w-full max-w-md p-8 bg-gray-100 rounded-md shadow-md">
				{isClient && (
					<div className="mb-4">
						<LanguageSwitcher />
					</div>
				)}

				<div className="text-center mb-6">
					<h1 className="text-3xl font-bold text-gray-900">
						{isClient ? t("login.title") : "AIQUIZ"}
					</h1>
					{isClient && (
						<h2 className="text-xl text-gray-700 mt-2">
							{t("login.subtitle")}
						</h2>
					)}
				</div>

				{isClient && (
					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								{t("login.email")}
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={credentials.email}
								onChange={handleChange}
								placeholder={t("login.emailPlaceholder")}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						<div className="mb-6">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								{t("login.password")}
							</label>
							<input
								type="password"
								id="password"
								name="password"
								value={credentials.password}
								onChange={handleChange}
								placeholder={t("login.passwordPlaceholder")}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{loginError && (
							<div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
								{loginError}
							</div>
						)}

						{successMessage && (
							<div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-sm">
								{successMessage}
							</div>
						)}

						<div className="mb-2">
							<button
								type="submit"
								disabled={loading}
								className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
							>
								{loading
									? t("login.processing")
									: t("login.loginButton")}
							</button>
						</div>

						<div className="text-center mt-2">
							<Link
								href="/manager/recovery-password"
								className="text-sm text-blue-600 hover:underline"
							>
								{t("login.recoverPassword")}
							</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default LoginPage;
