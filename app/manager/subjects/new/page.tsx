// /app/manager/subjects/new/page.tsx (actualizado)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import Link from "next/link";
import Header from "../../components/common/Header";
import useApiRequest from "../../hooks/useApiRequest";
import ConfirmationModal from "../../components/common/ConfirmationModal"; // Importación del nuevo componente

interface Professor {
	id: string;
	name: string;
	email: string;
}

const NewSubjectPage = () => {
	const { t } = useManagerTranslation();
	const router = useRouter();

	// Estados para el formulario
	const [formData, setFormData] = useState({
		nombre: "",
		siglas: "",
		descripcion: "",
	});
	const [profesores, setProfesores] = useState<Professor[]>([]);

	const [mostrarModalProfesor, setMostrarModalProfesor] = useState(false);
	const [nuevoProfesor, setNuevoProfesor] = useState({
		nombre: "",
		email: "",
	});

	const [error, setError] = useState("");

	// Estado para modal de confirmación de eliminación de profesor
	const [showDeleteProfessorModal, setShowDeleteProfessorModal] =
		useState(false);
	const [professorToDelete, setProfessorToDelete] = useState<string>("");

	// Hook para crear asignatura
	const {
		makeRequest: createSubject,
		loading: isLoading,
		error: apiError,
	} = useApiRequest("/api/manager/subjects", "POST", null, false);

	// Comprobar autenticación y cargar usuario actual
	useEffect(() => {
		const token = localStorage.getItem("jwt_token");
		if (!token) {
			router.push("/manager/login");
			return;
		}

		// Obtener información del usuario actual
		const fetchCurrentUser = async () => {
			try {
				const response = await fetch("/api/manager/auth/me", {
					method: "GET",
					headers: {
						"Authorization": `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				});

				if (response.ok) {
					const data = await response.json();
					if (data.success && data.user) {
						// Agregar el usuario actual como primer profesor
						setProfesores([{
							id: data.user._id,
							name: data.user.name,
							email: data.user.email,
						}]);
					}
				}
			} catch (error) {
				console.error("Error al obtener información del usuario:", error);
			}
		};

		fetchCurrentUser();
	}, [router]);

	// Actualizar mensaje de error si hay error en la API
	useEffect(() => {
		if (apiError) {
			setError(
				t("subjects.createError") || "Error al crear la asignatura"
			);
		}
	}, [apiError, t]);

	// Manejadores de formulario
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	// Añadir un nuevo profesor
	const handleAddProfessor = () => {
		if (!nuevoProfesor.nombre.trim() || !nuevoProfesor.email.trim()) return;

		const newProfessor = {
			id: `profesor-${Date.now()}`,
			name: nuevoProfesor.nombre,
			email: nuevoProfesor.email,
		};

		setProfesores([...profesores, newProfessor]);
		setNuevoProfesor({ nombre: "", email: "" });
		setMostrarModalProfesor(false);
	};

	// Solicitar confirmación para eliminar un profesor
	const handleConfirmRemoveProfessor = (id: string) => {
		setProfessorToDelete(id);
		setShowDeleteProfessorModal(true);
	};

	// Eliminar un profesor después de confirmar
	const handleRemoveProfessor = () => {
		setProfesores(
			profesores.filter((prof) => prof.id !== professorToDelete)
		);
		setShowDeleteProfessorModal(false);
		setProfessorToDelete("");
	};

	// Enviar el formulario para crear la asignatura
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Validar campos requeridos
		if (!formData.nombre || !formData.siglas) {
			setError(
				t("subjects.newSubjectError") ||
					"Nombre y siglas son obligatorios"
			);
			return;
		}

		const subjectData = {
			title: formData.nombre,
			acronym: formData.siglas,
			description: formData.descripcion,
			professors: profesores.map((prof) => ({
				name: prof.name,
				email: prof.email,
			})),
		};

		try {
			const response = await createSubject(subjectData);
			if (response.success) {
				router.push("/manager/subjects");
			} else {
				setError(
					t("subjects.createError") || "Error al crear la asignatura"
				);
			}
		} catch (err) {
			console.error("Error al crear la asignatura:", err);
			setError(
				t("subjects.createError") || "Error al crear la asignatura"
			);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />
			<main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<Link
						href="/manager/subjects"
						className="text-blue-600 hover:underline flex items-center"
					>
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
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						{t("subjects.backToSubjects") || "Volver a asignaturas"}
					</Link>
				</div>

				<h1 className="text-3xl font-bold mb-6">
					{t("subjects.newSubject") || "Nueva asignatura"}
				</h1>

				{error && (
					<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
						{error}
					</div>
				)}

				<form
					onSubmit={handleSubmit}
					className="space-y-6 bg-white p-6 rounded-md shadow-sm"
				>
					{/* Nombre */}
					<div>
						<label
							htmlFor="nombre"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.name") || "Nombre"}
						</label>
						<input
							type="text"
							id="nombre"
							name="nombre"
							value={formData.nombre}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md"
							required
						/>
					</div>

					{/* Siglas */}
					<div>
						<label
							htmlFor="siglas"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.acronym") || "Siglas"}
						</label>
						<input
							type="text"
							id="siglas"
							name="siglas"
							value={formData.siglas}
							onChange={handleInputChange}
							className="w-full p-2 border rounded-md"
							required
						/>
					</div>

					{/* Descripción */}
					<div>
						<label
							htmlFor="descripcion"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							{t("subjectDetail.description") || "Descripción"}
						</label>
						<textarea
							id="descripcion"
							name="descripcion"
							value={formData.descripcion}
							onChange={handleInputChange}
							rows={5}
							className="w-full p-2 border rounded-md"
						></textarea>
					</div>

					{/* Profesores */}
					<div>
						<div className="flex justify-between items-center mb-2">
							<label className="block text-sm font-medium text-gray-700">
								{t("subjectDetail.professors") || "Profesores"}
							</label>
							<button
								type="button"
								onClick={() => setMostrarModalProfesor(true)}
								className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
							>
								<svg
									className="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								{t("subjectDetail.inviteProfessor") ||
									"Invitar profesor"}
							</button>
						</div>
						<div className="bg-gray-100 rounded-md p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
							{profesores.length === 0 ? (
								<p className="text-gray-500 text-center italic">
									{t("subjects.noProfessorsAdded") ||
										"Aquí se mostrarán los profesores que añadas."}
								</p>
							) : (
								<ul className="space-y-2">
									{profesores.map((profesor) => (
										<li
											key={profesor.id}
											className="flex justify-between items-center bg-white p-2 rounded"
										>
											<div>
												<div className="font-medium">
													{profesor.name}
												</div>
												<div className="text-sm text-gray-600">
													{profesor.email}
												</div>
											</div>
											<div className="flex items-center">
												{profesores.length > 1 && profesores.indexOf(profesor) !== 0 && (
													<button
														type="button"
														onClick={() =>
															handleConfirmRemoveProfessor(
																profesor.id
															)
														}
														className="text-red-500 hover:text-red-700"
													>
														<svg
															className="w-5 h-5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth="2"
																d="M6 18L18 6M6 6l12 12"
															/>
														</svg>
													</button>
												)}
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Botones */}
					<div className="flex justify-end space-x-4 mt-8">
						<Link
							href="/manager/subjects"
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							{t("subjectDetail.cancel") || "Cancelar"}
						</Link>
						<button
							type="submit"
							disabled={isLoading}
							className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
						>
							{isLoading ? (
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
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									{t("common.processing") || "Procesando..."}
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
									{t("subjects.createSubject") ||
										"Crear asignatura"}
								</>
							)}
						</button>
					</div>
				</form>

				{/* Modal para añadir profesor */}
				{mostrarModalProfesor && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 w-full max-w-md">
							<h3 className="text-lg font-medium mb-4">
								{t("subjectDetail.inviteProfessor") ||
									"Invitar profesor"}
							</h3>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t("subjectDetail.name") || "Nombre"}
								</label>
								<input
									type="text"
									value={nuevoProfesor.nombre}
									onChange={(e) =>
										setNuevoProfesor({
											...nuevoProfesor,
											nombre: e.target.value,
										})
									}
									placeholder={
										t("subjectDetail.namePlaceholder") ||
										"Nombre del profesor"
									}
									className="w-full p-2 border rounded-md"
								/>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{t("subjectDetail.email") || "Email"}
								</label>
								<input
									type="email"
									value={nuevoProfesor.email}
									onChange={(e) =>
										setNuevoProfesor({
											...nuevoProfesor,
											email: e.target.value,
										})
									}
									placeholder={
										t("subjectDetail.emailPlaceholder") ||
										"Email del profesor"
									}
									className="w-full p-2 border rounded-md"
								/>
							</div>
							<div className="flex justify-end space-x-2">
								<button
									type="button"
									onClick={() =>
										setMostrarModalProfesor(false)
									}
									className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
								>
									{t("subjectDetail.cancel") || "Cancelar"}
								</button>
								<button
									type="button"
									onClick={handleAddProfessor}
									disabled={
										!nuevoProfesor.nombre.trim() ||
										!nuevoProfesor.email.trim()
									}
									className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50"
								>
									{t("subjectDetail.invite") || "Invitar"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal de confirmación para eliminar profesor */}
				<ConfirmationModal
					isOpen={showDeleteProfessorModal}
					title={t("confirmation.deleteProfessor.title")}
					message={t("confirmation.deleteProfessor.message")}
					confirmButtonText={t("common.delete")}
					onConfirm={handleRemoveProfessor}
					onCancel={() => setShowDeleteProfessorModal(false)}
					isDanger={true}
				/>
			</main>
		</div>
	);
};

export default NewSubjectPage;
