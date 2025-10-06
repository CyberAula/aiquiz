"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManagerTranslation } from "../hooks/useManagerTranslation";
import Header from "../components/common/Header";
import useApiRequest from "../hooks/useApiRequest";

const FACULTIES = [
	"ETSIT",
	"ETSIINF",
	"ETSII",
	"ETSIAE",
	"ETSIAM",
	"ETSICCP",
	"ETSIN",
];

const AccountPage = () => {
	const { t } = useManagerTranslation();
	const router = useRouter();

	const [profileData, setProfileData] = useState({
		name: "",
		email: "",
		faculty: "",
	});

	const [userRole, setUserRole] = useState("professor");

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [profileMessage, setProfileMessage] = useState({
		type: "",
		text: "",
	});
	const [passwordMessage, setPasswordMessage] = useState({
		type: "",
		text: "",
	});
	const [isEditing, setIsEditing] = useState(false);

	//	✅ Solo una llamada automática GET
	const {
		data: userData,
		loading: loadingUserData,
		error: userDataError,
	} = useApiRequest("/api/manager/auth/me", "GET");

	const {
		makeRequest: updateProfile,
		loading: updatingProfile,
		error: updateProfileError,
	} = useApiRequest("/api/manager/auth/me", "PUT", null, false);

	const {
		makeRequest: changePassword,
		loading: changingPassword,
		error: changePasswordError,
	} = useApiRequest("/api/account/password", "PUT", null, false);

	//	Comprobación del token (opcional porque el layout ya la hace)
	useEffect(() => {
		const token = localStorage.getItem("jwt_token");
		if (!token) router.push("/manager/login");
	}, [router]);

	useEffect(() => {
		if (userData?.success && userData.user) {
			setProfileData({
				name: userData.user.name ?? "",
				email: userData.user.email ?? "",
				faculty: userData.user.faculty ?? "",
			});
			setUserRole(userData.user.role ?? "professor");
		}
	}, [userData]);

	useEffect(() => {
		if (userDataError) {
			setProfileMessage({
				type: "error",
				text:
					userDataError.message ??
					t("account.errorLoadingData") ??
					"Error al cargar los datos de la cuenta",
			});
		}
		if (updateProfileError) {
			setProfileMessage({
				type: "error",
				text:
					updateProfileError.message ??
					t("account.errorUpdatingProfile") ??
					"Error al actualizar el perfil",
			});
		}
		if (changePasswordError) {
			setPasswordMessage({
				type: "error",
				text:
					changePasswordError.message ??
					t("account.errorChangingPassword") ??
					"Error al cambiar la contraseña",
			});
		}
	}, [userDataError, updateProfileError, changePasswordError, t]);

	const handleProfileChange = ({ target }) =>
		setProfileData((prev) => ({ ...prev, [target.name]: target.value }));

	const handlePasswordChange = ({ target }) =>
		setPasswordData((prev) => ({ ...prev, [target.name]: target.value }));

	const toggleEditMode = () => {
		setIsEditing((prev) => !prev);
		if (isEditing && userData?.user) {
			setProfileData({
				name: userData.user.name ?? "",
				email: userData.user.email ?? "",
				faculty: userData.user.faculty ?? "",
			});
		}
		setProfileMessage({ type: "", text: "" });
	};

	const handleSaveProfile = async () => {
		if (!profileData.name || !profileData.email) {
			setProfileMessage({
				type: "error",
				text:
					t("account.requiredFields") ??
					"Nombre y email son obligatorios",
			});
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(profileData.email)) {
			setProfileMessage({
				type: "error",
				text: t("account.invalidEmail") ?? "Formato de email inválido",
			});
			return;
		}
		setProfileMessage({ type: "", text: "" });
		
		// Para profesores, excluir email y faculty de la actualización
		const updateData = userRole === "professor" 
			? { name: profileData.name }
			: profileData;
			
		const response = await updateProfile(updateData);

		if (response?.success) {
			setProfileMessage({
				type: "success",
				text:
					response.message ??
					t("account.profileUpdated") ??
					"Perfil actualizado correctamente",
			});
			setIsEditing(false);
		} else {
			setProfileMessage({
				type: "error",
				text:
					response?.message ??
					t("account.errorUpdatingProfile") ??
					"Error al actualizar el perfil",
			});
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPasswordMessage({
				type: "error",
				text:
					t("account.passwordsMismatch") ??
					"Las contraseñas no coinciden",
			});
			return;
		}
		if (passwordData.newPassword.length < 8) {
			setPasswordMessage({
				type: "error",
				text:
					t("account.passwordTooShort") ??
					"La contraseña debe tener al menos 8 caracteres",
			});
			return;
		}
		setPasswordMessage({ type: "", text: "" });
		const response = await changePassword(passwordData);

		if (response?.success) {
			setPasswordMessage({
				type: "success",
				text:
					response.message ??
					t("account.passwordChanged") ??
					"Contraseña actualizada correctamente",
			});
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} else {
			setPasswordMessage({
				type: "error",
				text:
					response?.message ??
					t("account.errorChangingPassword") ??
					"Error al cambiar la contraseña",
			});
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<h1 className="text-3xl font-bold mb-8">
					{t("account.title") ?? "Mi cuenta"}
				</h1>

				{loadingUserData ? (
					<div className="flex justify-center my-8">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
					</div>
				) : (
					<div className="bg-white shadow rounded-lg overflow-hidden">
						{/* Información de perfil */}
						<div className="p-6 border-b border-gray-200">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-semibold">
									{t("account.profileInfo") ??
										"Información de perfil"}
								</h2>
								<button
									type="button"
									onClick={toggleEditMode}
									className={`px-4 py-2 rounded-md ${
										isEditing
											? "bg-gray-200 text-gray-700"
											: "bg-gray-800 text-white"
									}`}
								>
									{isEditing
										? t("account.cancel") ?? "Cancelar"
										: t("account.edit") ?? "Editar"}
								</button>
							</div>

							{profileMessage.text && (
								<div
									className={`mb-4 p-3 rounded ${
										profileMessage.type === "success"
											? "bg-green-100 text-green-700"
											: "bg-red-100 text-red-700"
									}`}
								>
									{profileMessage.text}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										{t("account.name") ?? "Nombre"}
									</label>
									<input
										type="text"
										id="name"
										name="name"
										value={profileData.name}
										onChange={handleProfileChange}
										disabled={!isEditing || updatingProfile}
										className={`w-full p-2 border rounded-md ${
											!isEditing
												? "bg-gray-100"
												: "border-gray-300 focus:ring-2 focus:ring-blue-500"
										}`}
									/>
								</div>

								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										{t("account.email") ?? "Correo"}
										{userRole === "professor" && (
											<span className="text-xs text-gray-500 ml-2">
												(No editable)
											</span>
										)}
									</label>
									<input
										type="email"
										id="email"
										name="email"
										value={profileData.email}
										onChange={handleProfileChange}
										disabled={!isEditing || updatingProfile || userRole === "professor"}
										className={`w-full p-2 border rounded-md ${
											!isEditing || userRole === "professor"
												? "bg-gray-100"
												: "border-gray-300 focus:ring-2 focus:ring-blue-500"
										}`}
									/>
								</div>

								{userRole === "admin" && (
									<div>
										<label
											htmlFor="faculty"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											{t("account.faculty") ?? "Facultad"}
										</label>
										<select
											id="faculty"
											name="faculty"
											value={profileData.faculty}
											onChange={handleProfileChange}
											disabled={!isEditing || updatingProfile}
											className={`w-full p-2 border rounded-md ${
												!isEditing
													? "bg-gray-100"
													: "border-gray-300 focus:ring-2 focus:ring-blue-500"
											}`}
										>
											<option value="">
												{t("account.selectFaculty") ??
													"Selecciona una facultad"}
											</option>
											{FACULTIES.map((faculty) => (
												<option
													key={faculty}
													value={faculty}
												>
													{faculty}
												</option>
											))}
										</select>
									</div>
								)}

								{userData?.user?.lastLogin && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{t("account.lastLogin") ??
												"Último acceso"}
										</label>
										<div className="p-2 bg-gray-100 rounded-md">
											{new Date(
												userData.user.lastLogin
											).toLocaleString()}
										</div>
									</div>
								)}
							</div>

							{isEditing && (
								<div className="mt-6 flex justify-end">
									<button
										type="button"
										onClick={handleSaveProfile}
										disabled={updatingProfile}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
									>
										{updatingProfile ? (
											<>
												<svg
													className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													/>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													/>
												</svg>
												{t("common.saving") ??
													"Guardando..."}
											</>
										) : (
											<>
												<svg
													className="w-5 h-5 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M5 13l4 4L19 7"
													/>
												</svg>
												{t("account.saveChanges") ??
													"Guardar cambios"}
											</>
										)}
									</button>
								</div>
							)}
						</div>

						{/* Cambio de contraseña */}
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-6">
								{t("account.changePassword") ??
									"Cambiar contraseña"}
							</h2>

							{passwordMessage.text && (
								<div
									className={`mb-4 p-3 rounded ${
										passwordMessage.type === "success"
											? "bg-green-100 text-green-700"
											: "bg-red-100 text-red-700"
									}`}
								>
									{passwordMessage.text}
								</div>
							)}

							<form onSubmit={handleChangePassword}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label
											htmlFor="currentPassword"
											className="block text-sm font-medium text-gray-700 mb-1"
										>
											{t("account.currentPassword") ??
												"Contraseña actual"}{" "}
											<span className="text-xs text-blue-600 ml-2 cursor-pointer">
												(
												{t("account.forgotten") ??
													"¿olvidada?"}
												)
											</span>
										</label>
										<input
											type="password"
											id="currentPassword"
											name="currentPassword"
											value={passwordData.currentPassword}
											onChange={handlePasswordChange}
											disabled={changingPassword}
											className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>

									<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label
												htmlFor="newPassword"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												{t("account.newPassword") ??
													"Nueva contraseña"}
											</label>
											<input
												type="password"
												id="newPassword"
												name="newPassword"
												value={passwordData.newPassword}
												onChange={handlePasswordChange}
												disabled={changingPassword}
												className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>

										<div>
											<label
												htmlFor="confirmPassword"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												{t("account.confirmPassword") ??
													"Repetir nueva contraseña"}
											</label>
											<input
												type="password"
												id="confirmPassword"
												name="confirmPassword"
												value={
													passwordData.confirmPassword
												}
												onChange={handlePasswordChange}
												disabled={changingPassword}
												className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
									</div>

									<div className="mt-6 flex justify-end">
										<button
											type="submit"
											disabled={changingPassword}
											className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
										>
											{changingPassword ? (
												<>
													<svg
														className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														/>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
														/>
													</svg>
													{t("common.processing") ??
														"Procesando..."}
												</>
											) : (
												<>
													<svg
														className="w-5 h-5 mr-1"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
														/>
													</svg>
													{t(
														"account.changePassword"
													) ?? "Cambiar contraseña"}
												</>
											)}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default AccountPage;
