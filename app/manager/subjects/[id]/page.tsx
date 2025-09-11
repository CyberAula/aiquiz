// /app/manager/subjects/[id]/page.tsx (actualizado)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";
import useApiRequest from "../../hooks/useApiRequest";
import { useClipboard } from "../../hooks/useClipboard";
import { Topic, useSubject } from "../../contexts/SubjectContext";

// Importamos los componentes
import TopicsTab from "../../components/subject/TopicsTab";
import ProfessorsTab from "../../components/subject/ProfessorsTab";
import SettingsTab from "../../components/subject/SettingsTab";
import InviteModal from "../../components/subject/InviteModal";
import EditTopicModal from "../../components/subject/EditTopicModal";
import AddTopicModal from "../../components/subject/AddTopicModal";
import SubjectDetailSidebar from "../../components/common/SubjectDetailSidebar";
import ConfirmationModal from "../../components/common/ConfirmationModal"; // Importación del nuevo componente

export default function SubjectDetailPage() {
	const { id } = useParams();
	const router = useRouter();
	const { t } = useManagerTranslation();
	const { copied, copyToClipboard } = useClipboard();

	// Usar el hook useSubject en lugar del contexto directo
	const { subject, loading, setSubject, refetchSubject } = useSubject();

	// Obtener información del usuario actual del localStorage
	const getCurrentUser = () => {
		try {
			const token = localStorage.getItem('jwt_token');
			if (!token) return null;
			
			// Decodificar el JWT básico (sin verificación, solo para obtener la info)
			const payload = JSON.parse(atob(token.split('.')[1]));
			return {
				id: payload.userId,
				role: payload.role || 'professor'
			};
		} catch (error) {
			console.error('Error obteniendo usuario actual:', error);
			return null;
		}
	};

	// Estados para UI
	const [activeTab, setActiveTab] = useState("topics");
	const [editMode, setEditMode] = useState(false);
	const [editedSubject, setEditedSubject] = useState(subject);
	const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showAddTopicModal, setShowAddTopicModal] = useState(false);
	const [deletingTopicId, setDeletingTopicId] = useState<string>("");

	// Estados para modales de confirmación
	const [showDeleteSubjectModal, setShowDeleteSubjectModal] = useState(false);
	const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
	const [showDeleteProfessorModal, setShowDeleteProfessorModal] =
		useState(false);
	const [itemToDelete, setItemToDelete] = useState<string>("");

	// Sincronizar estado local cuando cambia el subject en el contexto
	useEffect(() => {
		if (subject) {
			setEditedSubject(subject);
		}
	}, [subject]);

	// API para añadir profesor
	const { makeRequest: addProfessor, loading: addingProfessor } =
		useApiRequest(`/api/manager/subjects/${id}/professors`, "POST", null, false);

	// API para eliminar profesor
	const { makeRequest: removeProfessor, loading: removingProfessor } =
		useApiRequest("", "DELETE", null, false);

	// API para añadir tema
	const { makeRequest: addTopic, loading: addingTopic } = useApiRequest(
		`/api/manager/subjects/${id}/topics`,
		"POST",
		null,
		false
	);

	// API para editar tema
	const { makeRequest: editTopic, loading: editingTopicLoading } =
		useApiRequest("", "PATCH", null, false);

	// API para eliminar tema
	const { makeRequest: deleteTopic, loading: deletingTopic } = useApiRequest(
		`/api/manager/subjects/${id}/topics`,
		"DELETE",
		null,
		false
	);

	// API para guardar cambios de la asignatura
	const { makeRequest: saveSubject, loading: savingSubject } = useApiRequest(
		`/api/manager/subjects/${id}`,
		"PUT",
		null,
		false
	);

	// API para eliminar la asignatura
	const { makeRequest: deleteSubjectRequest, loading: deletingSubject } =
		useApiRequest(`/api/manager/subjects/${id}`, "DELETE", null, false);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
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

	const handleSaveChanges = async () => {
		if (!editedSubject) return;

		try {
			const response = await saveSubject(editedSubject);
			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setEditMode(false);
			}
		} catch (error) {
			console.error("Error al actualizar la asignatura:", error);
		}
	};

	const handleAddProfessor = async (name: string, email: string) => {
		if (!subject) return;

		try {
			const response = await addProfessor({ name, email });
			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setShowInviteModal(false);
			}
		} catch (error) {
			console.error("Error al añadir profesor:", error);
		}
	};

	// Confirmar eliminación de profesor
	const handleConfirmDeleteProfessor = (professorId: string) => {
		setItemToDelete(professorId);
		setShowDeleteProfessorModal(true);
	};

	const handleRemoveProfessor = async () => {
		if (!subject || !itemToDelete) return;

		try {
			const response = await removeProfessor(
				null,
				false,
				`/api/manager/subjects/${id}/professors/${itemToDelete}`
			);
			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setShowDeleteProfessorModal(false);
				setItemToDelete("");
			}
		} catch (error) {
			console.error("Error al eliminar profesor:", error);
		}
	};

	const handleAddTopicRequest = () => {
		setShowAddTopicModal(true);
	};

	const handleAddTopicConfirm = async (title: string, description: string) => {
		if (!subject) return;

		try {
			const newTopic = {
				title: title.trim(),
				description: description?.trim() || "",
			};

			const response = await addTopic(newTopic, true); // Forzar nueva llamada
			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setShowAddTopicModal(false);
			}
		} catch (error) {
			console.error("Error al añadir tema:", error);
		}
	};

	const handleEditTopicRequest = async (
		topicId: string,
		newTitle: string
	) => {
		if (!subject) return;

		try {
			const response = await editTopic(
				{ title: newTitle },
				false,
				`/api/manager/subjects/${id}/topics/${topicId}`
			);

			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setEditingTopic(null);
			}
		} catch (error) {
			console.error("Error al actualizar tema:", error);
		}
	};

	// Confirmar eliminación de tema
	const handleConfirmDeleteTopic = (topicId: string) => {
		setItemToDelete(topicId);
		setShowDeleteTopicModal(true);
	};

	const handleDeleteTopicRequest = async () => {
		if (!subject || !itemToDelete) return;

		try {
			setDeletingTopicId(itemToDelete);
			const response = await deleteTopic(
				null,
				false,
				`/api/manager/subjects/${id}/topics/${itemToDelete}`
			);

			if (response.success) {
				refetchSubject(); // Usar refetchSubject del contexto
				setShowDeleteTopicModal(false);
				setItemToDelete("");
			}
		} catch (error) {
			console.error("Error al eliminar tema:", error);
		} finally {
			setDeletingTopicId("");
		}
	};

	// Confirmar eliminación de asignatura
	const handleConfirmDeleteSubject = () => {
		setShowDeleteSubjectModal(true);
	};

	const handleDeleteSubject = async () => {
		try {
			const response = await deleteSubjectRequest();
			if (response.success) {
				router.push("/manager/subjects");
			}
		} catch (error) {
			console.error("Error al eliminar asignatura:", error);
		}
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
		<>
			{/* Sidebar fijo en el lado izquierdo */}
			<div className="fixed top-16 left-0 bottom-0 w-64 z-40">
				<SubjectDetailSidebar
					subjectId={subject.id}
					subjectTitle={subject.title}
					topics={subject.topics}
				/>
			</div>

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
							handleAddTopic={handleAddTopicRequest}
							handleDeleteTopic={handleConfirmDeleteTopic} // Cambiado para usar la confirmación
							isLoading={addingTopic}
							deletingTopicId={deletingTopicId}
						/>
					)}

					{activeTab === "professors" && (
						<>
							<button
								className="mb-6 bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
								onClick={() => setShowInviteModal(true)}
								disabled={addingProfessor}
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
								administrators={subject.administrators || []}
								currentUser={getCurrentUser()}
								onRemoveProfessor={handleConfirmDeleteProfessor} // Cambiado para usar la confirmación
								isLoading={removingProfessor}
							/>

							{showInviteModal && (
								<InviteModal
									onClose={() => setShowInviteModal(false)}
									onInvite={handleAddProfessor}
									isLoading={addingProfessor}
								/>
							)}
						</>
					)}

					{activeTab === "settings" && editedSubject && (
						<SettingsTab
							subject={subject}
							editMode={editMode}
							editedSubject={editedSubject}
							onEditToggle={handleEditToggle}
							onInputChange={handleInputChange}
							onSaveChanges={handleSaveChanges}
							onEditTopic={handleEditTopicRequest}
							onDeleteTopic={handleConfirmDeleteTopic} // Cambiado para usar la confirmación
							onDeleteSubject={handleConfirmDeleteSubject} // Cambiado para usar la confirmación
							isLoading={savingSubject || deletingSubject}
							isDeletingTopic={Boolean(deletingTopicId)}
						/>
					)}

					{/* Modales */}
					{editingTopic && (
						<EditTopicModal
							topic={editingTopic}
							onClose={() => setEditingTopic(null)}
							onSave={handleEditTopicRequest}
							isLoading={editingTopicLoading}
						/>
					)}

					{showAddTopicModal && (
						<AddTopicModal
							onClose={() => setShowAddTopicModal(false)}
							onAdd={handleAddTopicConfirm}
							isLoading={addingTopic}
						/>
					)}

					{/* Modales de confirmación */}
					<ConfirmationModal
						isOpen={showDeleteSubjectModal}
						title={t("confirmation.deleteSubject.title")}
						message={t("confirmation.deleteSubject.message")}
						confirmButtonText={t("common.delete")}
						onConfirm={handleDeleteSubject}
						onCancel={() => setShowDeleteSubjectModal(false)}
						isLoading={deletingSubject}
						isDanger={true}
					/>

					<ConfirmationModal
						isOpen={showDeleteTopicModal}
						title={t("confirmation.deleteTopic.title")}
						message={t("confirmation.deleteTopic.message")}
						confirmButtonText={t("common.delete")}
						onConfirm={handleDeleteTopicRequest}
						onCancel={() => setShowDeleteTopicModal(false)}
						isLoading={deletingTopic}
						isDanger={true}
					/>

					<ConfirmationModal
						isOpen={showDeleteProfessorModal}
						title={t("confirmation.deleteProfessor.title")}
						message={t("confirmation.deleteProfessor.message")}
						confirmButtonText={t("common.delete")}
						onConfirm={handleRemoveProfessor}
						onCancel={() => setShowDeleteProfessorModal(false)}
						isLoading={removingProfessor}
						isDanger={true}
					/>
				</div>
			</div>
		</>
	);
}
