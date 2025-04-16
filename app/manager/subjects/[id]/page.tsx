// /app/manager/subjects/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Importamos solo los componentes realmente necesarios
import TopicsTab from "../../components/topics/TopicsTab";
import ProfessorsTab from "../../components/topics/ProfessorsTab";
import SettingsTab from "../../components/topics/SettingsTab";
import InviteModal from "../../components/topics/InviteModal";
import EditTopicModal from "../../components/topics/EditTopicModal";

// Interfaces
interface SubTopic {
	id: string;
	title: string;
}

interface Topic {
	id: string;
	title: string;
	description: string;
	subtopics: SubTopic[];
}

interface Professor {
	id: string;
	name: string;
	email: string;
}

interface Subject {
	id: string;
	title: string;
	acronym: string;
	description: string;
	topics: Topic[];
	professors: Professor[];
}

export default function SubjectDetailPage() {
	const { id } = useParams();
	const router = useRouter();
	const { t } = useTranslation();

	const [subject, setSubject] = useState<Subject | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("topics");
	const [copied, setCopied] = useState(false);

	// Datos para la pantalla de ajustes
	const [editMode, setEditMode] = useState(false);
	const [editedSubject, setEditedSubject] = useState<Subject | null>(null);
	const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
	const [showInviteModal, setShowInviteModal] = useState(false);

	useEffect(() => {
		const fetchSubjectDetails = async () => {
			setLoading(true);
			try {
				// Simulamos la carga de datos
				console.log(`📤 Simulando petición GET a /api/subjects/${id}`);

				// Uso de setTimeout para simular el tiempo de carga
				setTimeout(() => {
					// Datos simulados con UUIDs
					const mockData = {
						id: "550e8400-e29b-41d4-a716-446655440000",
						title: "Computación en red (CORE)",
						acronym: "CORE",
						description:
							"Una red de computadoras, red de ordenadores o red informática es un conjunto de equipos nodos y software conectados entre sí por medio de dispositivos físicos que envían y reciben impulsos eléctricos, ondas electromagnéticas o cualquier otro medio para el transporte de datos, con la finalidad de compartir información, recursos y ofrecer servicios.",
						topics: [
							{
								id: "7e9d5eb7-9058-4754-b325-062ace8c2249",
								title: "HTTP",
								description:
									"El protocolo de transferencia de hipertexto (en inglés: Hypertext Transfer (...)) Ver descripción",
								subtopics: [
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
										title: "URLs",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d480",
										title: "Formato peticiones HTTP",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
										title: "Cabeceras HTTP",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d482",
										title: "Métodos POST, PUT GET, DELETE, HEAD",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d483",
										title: "Códigos de respuesta",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d484",
										title: "Caché web",
									},
									{
										id: "f47ac10b-58cc-4372-a567-0e02b2c3d485",
										title: "Gestión de estado: parámetros ocultos, cookies, sesión",
									},
								],
							},
							{
								id: "6b86b273-6e81-4e47-a252-08a2c3d53778",
								title: "HTML",
								description:
									"HTML es un lenguaje de marcado que posibilita definir la estructura de (...)",
								subtopics: [
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3480",
										title: "Declaración de variables",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3481",
										title: "Tipos de datos operadores y expresiones",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3482",
										title: "Bucles y condicionales",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3483",
										title: "Uso de break y continue",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3484",
										title: "Clases y objetos",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3485",
										title: "Comandos try, catch y finally",
									},
									{
										id: "d4735e3a-5caa-4bd7-9db8-c40f4c8a3486",
										title: "Manejo de excepciones",
									},
								],
							},
							{
								id: "ef2d127d-ea53-4e70-804d-bff65e45c8a7",
								title: "CSS",
								description:
									"CSS es un lenguaje de diseño gráfico para definir y crear la presentación de documentos.",
								subtopics: [],
							},
						],
						professors: [
							{
								id: "37e1a2c3-d1c0-4f1c-a5d8-f72f3391e32a",
								name: "Carlos González",
								email: "cgonzalez@upm.es",
							},
							{
								id: "0cae5fb4-4819-4a06-bba2-aa98b3a8425e",
								name: "Marina Yeros",
								email: "myeros@upm.es",
							},
						],
					};

					console.log(
						`📥 Respuesta simulada recibida para asignatura ${id}`
					);
					setSubject(mockData);
					setEditedSubject(mockData);
					setLoading(false);
				}, 800);
			} catch (error) {
				console.error("Error fetching subject details:", error);
				setLoading(false);
			}
		};

		if (id) {
			fetchSubjectDetails();
		}
	}, [id]);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	// Función para copiar la URL al portapapeles
	const copyToClipboard = (text: string) => {
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					setCopied(true);
					// Reset copied state after 2 seconds
					setTimeout(() => setCopied(false), 2000);
				})
				.catch((error) => {
					console.error("Error copying to clipboard:", error);
					setCopied(false);
				});
		} else {
			// Fallback for browsers that don't support clipboard API
			try {
				const textArea = document.createElement("textarea");
				textArea.value = text;
				textArea.style.position = "fixed";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand("copy");
				document.body.removeChild(textArea);
				setCopied(successful);
				if (successful) {
					setTimeout(() => setCopied(false), 2000);
				}
			} catch (error) {
				console.error("Fallback: Error copying to clipboard:", error);
				setCopied(false);
			}
		}
	};

	const handleCopySubjectUrl = () => {
		if (subject) {
			const url = `http://localhost:3000/${subject.acronym}`;
			copyToClipboard(url);
		}
	};

	// Handlers para la pantalla de ajustes
	const handleEditToggle = () => {
		setEditMode(!editMode);
		if (editMode && subject) {
			// Reset to original values if canceling edit
			setEditedSubject(subject);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setEditedSubject((prev) => (prev ? { ...prev, [name]: value } : null));
	};

	const handleSaveChanges = () => {
		if (!editedSubject) return;

		console.log(`📤 Simulando petición PUT a /api/subjects/${id}`);
		console.log("Datos enviados:", editedSubject);

		// Simular guardado exitoso
		setTimeout(() => {
			console.log(`📥 Respuesta simulada: actualización exitosa`);
			setSubject(editedSubject);
			setEditMode(false);
		}, 800);
	};

	const handleAddProfessor = (name: string, email: string) => {
		console.log(
			`📤 Simulando petición POST a /api/subjects/${id}/professors`
		);
		console.log("Datos enviados:", { name, email });

		// Simular añadir profesor
		setTimeout(() => {
			console.log(`📥 Respuesta simulada: profesor añadido exitosamente`);
			if (subject) {
				const newProfessor = {
					id: `professor-${Date.now()}`,
					name,
					email,
				};

				const updatedSubject = {
					...subject,
					professors: [...subject.professors, newProfessor],
				};

				setSubject(updatedSubject);
				if (editedSubject) {
					setEditedSubject(updatedSubject);
				}
			}
		}, 800);
	};

	const handleRemoveProfessor = (professorId: string) => {
		console.log(
			`📤 Simulando petición DELETE a /api/subjects/${id}/professors/${professorId}`
		);

		// Simular eliminar profesor
		setTimeout(() => {
			console.log(
				`📥 Respuesta simulada: profesor eliminado exitosamente`
			);
			if (subject) {
				const updatedSubject = {
					...subject,
					professors: subject.professors.filter(
						(p) => p.id !== professorId
					),
				};

				setSubject(updatedSubject);
				if (editedSubject) {
					setEditedSubject(updatedSubject);
				}
			}
		}, 800);
	};

	const handleAddTopic = () => {
		console.log(`📤 Simulando petición POST a /api/subjects/${id}/topics`);
		console.log("Datos enviados: Nuevo tema");

		// Simular añadir tema
		setTimeout(() => {
			console.log(`📥 Respuesta simulada: tema añadido exitosamente`);
			if (subject) {
				const newTopic = {
					id: `topic-${Date.now()}`,
					title: t("subjectDetail.newTopic"),
					description: "",
					subtopics: [],
				};

				const updatedSubject = {
					...subject,
					topics: [...subject.topics, newTopic],
				};

				setSubject(updatedSubject);
				if (editedSubject) {
					setEditedSubject(updatedSubject);
				}
			}
		}, 800);
	};

	const handleEditTopic = (topicId: string, newTitle: string) => {
		console.log(
			`📤 Simulando petición PATCH a /api/subjects/${id}/topics/${topicId}`
		);
		console.log("Datos enviados:", { title: newTitle });

		// Simular editar tema
		setTimeout(() => {
			console.log(`📥 Respuesta simulada: tema actualizado exitosamente`);
			if (subject) {
				const updatedTopics = subject.topics.map((topic) =>
					topic.id === topicId ? { ...topic, title: newTitle } : topic
				);

				const updatedSubject = {
					...subject,
					topics: updatedTopics,
				};

				setSubject(updatedSubject);
				if (editedSubject) {
					setEditedSubject(updatedSubject);
				}
			}
		}, 800);
	};

	if (loading) {
		return (
			<div className="p-6 sm:p-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
					<span className="ml-3 text-lg text-gray-700">
						{t("subjectDetail.loading")}
					</span>
				</div>
			</div>
		);
	}

	if (!subject) {
		return (
			<div className="p-6 sm:p-8">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-700">
						{t("subjectDetail.subjectNotFound")}
					</h2>
					<Link
						href="/manager/subjects"
						className="mt-4 inline-block text-blue-600 hover:underline"
					>
						{t("subjectDetail.backToSubjects")}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 sm:p-8">
			{/* Breadcrumbs y título */}
			<div className="mb-6">
				<div className="flex items-center text-sm text-gray-500 mb-2">
					<Link
						href="/manager/subjects"
						className="hover:text-gray-700"
					>
						{t("navigation.subjects")}
					</Link>
					<span className="mx-2">&gt;</span>
					<Link
						href={`/manager/subjects/${id}`}
						className="hover:text-gray-700"
					>
						{subject.title}
					</Link>
				</div>

				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold flex items-center">
						{subject.title}
						<button
							onClick={handleCopySubjectUrl}
							className="ml-2 focus:outline-none"
							title={
								copied
									? t("subjectDetail.copied")
									: t("subjectDetail.copyLink")
							}
						>
							<svg
								className={`w-6 h-6 ${
									copied
										? "text-green-500"
										: "text-gray-500 hover:text-gray-700"
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
						</button>
					</h1>
				</div>

				<p className="text-gray-700 mt-2">
					{subject.description.length > 150
						? subject.description.substring(0, 150) + "..."
						: subject.description}
				</p>
			</div>

			{/* Tabs de navegación */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => handleTabChange("topics")}
						className={`py-4 px-1 ${
							activeTab === "topics"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("subjectDetail.topics")}
					</button>
					<button
						onClick={() => handleTabChange("professors")}
						className={`py-4 px-1 ${
							activeTab === "professors"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("subjectDetail.professors")}
					</button>
					<button
						onClick={() => handleTabChange("settings")}
						className={`py-4 px-1 ${
							activeTab === "settings"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("subjectDetail.settings")}
					</button>
				</nav>
			</div>

			{/* Contenido de las tabs */}
			<div className="mt-6">
				{activeTab === "topics" && (
					<TopicsTab
						subjectId={subject.id}
						topics={subject.topics}
						handleAddTopic={handleAddTopic}
					/>
				)}

				{activeTab === "professors" && (
					<>
						<button
							className="mb-6 bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
							onClick={() => setShowInviteModal(true)}
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
									d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
								/>
							</svg>
							{t("subjectDetail.inviteProfessor")}
						</button>

						<ProfessorsTab
							professors={subject.professors}
							onRemoveProfessor={handleRemoveProfessor}
						/>

						{showInviteModal && (
							<InviteModal
								onClose={() => setShowInviteModal(false)}
								onInvite={handleAddProfessor}
							/>
						)}
					</>
				)}

				{activeTab === "settings" && (
					<SettingsTab
						subject={subject}
						editMode={editMode}
						editedSubject={editedSubject!}
						onEditToggle={handleEditToggle}
						onInputChange={handleInputChange}
						onSaveChanges={handleSaveChanges}
						onEditTopic={handleEditTopic}
					/>
				)}

				{/* Modales */}
				{editingTopic && (
					<EditTopicModal
						topic={editingTopic}
						onClose={() => setEditingTopic(null)}
						onSave={handleEditTopic}
					/>
				)}
			</div>
		</div>
	);
}
