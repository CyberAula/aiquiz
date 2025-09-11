"use client";

import { useState, useContext, FormEvent, ChangeEvent, useEffect } from "react";
import { useManagerTranslation } from "../hooks/useManagerTranslation";
import { ClientSideContext } from "../I18nProvider";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import Link from "next/link";
import useApiRequest from "../hooks/useApiRequest";

const RecoveryPasswordPage = () => {
	const isClient = useContext(ClientSideContext);
	const { t } = useManagerTranslation();

	const [email, setEmail] = useState<string>("");
	const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
	const [recoveryError, setRecoveryError] = useState<string>("");

	// API recuperación
	const {
		makeRequest: sendRecoveryEmail,
		loading,
		error: apiError,
	} = useApiRequest("/api/auth/recovery", "POST", null, false);

	// Actualizar el error si hay error en la API
	useEffect(() => {
		if (apiError) {
			setRecoveryError(
				t("recovery.errorSending") ||
					"Error al enviar el email de recuperación"
			);
		}
	}, [apiError, t]);

	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setRecoveryError("");

		try {
			const response = await sendRecoveryEmail({ email });

			if (response.success) {
				setIsEmailSent(true);
			} else {
				setRecoveryError(
					t("recovery.errorSending") ||
						"Error al enviar el email de recuperación"
				);
			}
		} catch (error) {
			console.error(
				"Error durante la recuperación de contraseña:",
				error
			);
			setRecoveryError(
				t("recovery.errorSending") ||
					"Error al enviar el email de recuperación"
			);
		}
	};

	// Pantalla de confirmación después de enviar el correo
	if (isEmailSent) {
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
							{isClient ? t("recovery.title") : "AIQUIZ"}
						</h1>
					</div>

					<div className="text-center mb-6">
						<p className="text-gray-700">
							{isClient
								? t("recovery.emailSent", { email })
								: `Hemos enviado el link de recuperación de contraseña al correo ${email}`}
						</p>
					</div>

					<div className="flex justify-center">
						<Link
							href="/manager/login"
							className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
						>
							{isClient ? t("recovery.backToLogin") : "Volver"}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Formulario de recuperación de contraseña
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
						{isClient ? t("recovery.title") : "AIQUIZ"}
					</h1>
					{isClient && (
						<h2 className="text-xl text-gray-700 mt-2">
							{t("recovery.subtitle")}
						</h2>
					)}
				</div>

				{isClient && (
					<form onSubmit={handleSubmit}>
						<div className="mb-6">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								{t("recovery.email")}
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={email}
								onChange={handleEmailChange}
								placeholder={t("recovery.emailPlaceholder")}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
							/>
						</div>

						{recoveryError && (
							<div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
								{recoveryError}
							</div>
						)}

						<div className="flex gap-4 mb-2">
							<button
								type="submit"
								disabled={loading}
								className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
							>
								{loading
									? t("recovery.processing")
									: t("recovery.sendLink")}
							</button>

							<Link
								href="/manager/login"
								className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
							>
								{t("recovery.back")}
							</Link>
						</div>
					</form>
				)}
			</div>
		</div>
	);
};

export default RecoveryPasswordPage;
