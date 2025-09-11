// app/manager/subjects/[id]/topics/[topicId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useManagerTranslation } from "../../../../hooks/useManagerTranslation";
import {
	useTopic,
	TopicProvider,
	Subtopic,
} from "../../../../contexts/TopicContext";
import useApiRequest from "../../../../hooks/useApiRequest";
import { ConfirmationModal } from "../../../../components/common/index";

// Importamos los componentes actualizados
import SubtopicsTab from "../../../../components/topic/SubtopicsTab";
import QuestionnaireTab from "../../../../components/topic/QuestionnarieTab";
import QuestionsTab from "../../../../components/topic/QuestionsTab";
import SettingsTab from "../../../../components/topic/SettingsTab";
import AddSubtopicModal from "../../../../components/topic/AddSubtopicModal";
import EditSubtopicModal from "../../../../components/topic/EditSubtopicModal";

// Componente interno para la funcionalidad una vez cargado el contexto
const TopicDetailContent = () => {
	const params = useParams();
	const id = params.id as string;
	const topicId = params.topicId as string;

	const router = useRouter();
	const { t } = useManagerTranslation();
	const { topic, loading, setTopic, refetchTopic } = useTopic();

	// Estados para UI
	const [activeTab, setActiveTab] = useState("subtopics");
	const [showDeleteSubtopicModal, setShowDeleteSubtopicModal] =
		useState(false);
	const [subtopicToDelete, setSubtopicToDelete] = useState<string>("");
	const [deletingSubtopicId, setDeletingSubtopicId] = useState<string>("");
	const [showAddSubtopicModal, setShowAddSubtopicModal] = useState(false);
	const [editingSubtopic, setEditingSubtopic] = useState<Subtopic | null>(
		null
	);

	// API para modificaciones de tema 
	const { makeRequest: updateTopic, loading: updatingTopic } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}`,
		"PUT",
		null,
		false
	);

	// API para subtemas
	const { makeRequest: addSubtopic, loading: addingSubtopic } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}/subtopics`,
		"POST",
		null,
		false
	);

	const { makeRequest: editSubtopic, loading: editingSubtopicLoading } =
		useApiRequest("", "PUT", null, false);

	const { makeRequest: deleteSubtopic, loading: deletingSubtopic } =
		useApiRequest("", "DELETE", null, false);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	// Manejar actualización del tema
	const handleUpdateTopic = async (title: string, description: string) => {
		if (!topic) return;

		try {
			const response = await updateTopic({ title, description });
			if (response.success) {
				await refetchTopic();
			}
		} catch (error) {
			console.error("Error al actualizar el tema:", error);
		}
	};

	// Manejadores para subtemas
	const handleAddSubtopicRequest = () => {
		setShowAddSubtopicModal(true);
	};

	const handleAddSubtopic = async (title: string, description: string) => {
		if (!topic) return;

		try {
			const response = await addSubtopic({ title, description });

			if (response.success) {
				await refetchTopic();
				setShowAddSubtopicModal(false);
			}
		} catch (error) {
			console.error("Error al añadir subtema:", error);
		}
	};

	const handleEditSubtopicRequest = (subtopic: Subtopic) => {
		setEditingSubtopic(subtopic);
	};

	const handleSaveSubtopic = async (
		subtopicId: string,
		title: string,
		description: string
	) => {
		if (!topic) return;

		try {
			const response = await editSubtopic(
				{ title, description },
				false,
				`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}`
			);

			if (response.success) {
				await refetchTopic();
				setEditingSubtopic(null);
			}
		} catch (error) {
			console.error("Error al editar subtema:", error);
		}
	};

	const handleConfirmDeleteSubtopic = (subtopicId: string) => {
		setSubtopicToDelete(subtopicId);
		setShowDeleteSubtopicModal(true);
	};

	const handleDeleteSubtopic = async () => {
		if (!topic || !subtopicToDelete) return;

		try {
			setDeletingSubtopicId(subtopicToDelete);

			const response = await deleteSubtopic(
				null,
				false,
				`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicToDelete}`
			);

			if (response.success) {
				await refetchTopic();
				setShowDeleteSubtopicModal(false);
				setSubtopicToDelete("");
			}
		} catch (error) {
			console.error("Error al eliminar subtema:", error);
		} finally {
			setDeletingSubtopicId("");
		}
	};

	if (loading) {
		return (
			<div className="p-6 sm:p-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
					<span className="ml-3 text-lg text-gray-700">
						{t("topicDetail.loading") || "Cargando..."}
					</span>
				</div>
			</div>
		);
	}

	if (!topic) {
		return (
			<div className="p-6 sm:p-8">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-700">
						{t("topicDetail.topicNotFound") || "Tema no encontrado"}
					</h2>
					<Link
						href={`/manager/subjects/${id}`}
						className="mt-4 inline-block text-blue-600 hover:underline"
					>
						{t("topicDetail.backToSubject") ||
							"Volver a la asignatura"}
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
						{t("navigation.subjects") || "Asignaturas"}
					</Link>
					<span className="mx-2">&gt;</span>
					<Link
						href={`/manager/subjects/${id}`}
						className="hover:text-gray-700"
					>
						{topic.subject?.title || "Asignatura"}
					</Link>
					<span className="mx-2">&gt;</span>
					<span className="text-gray-900">{topic.title}</span>
				</div>

				<h1 className="text-3xl font-bold">{topic.title}</h1>
				<p className="text-gray-700 mt-2">{topic.description}</p>
			</div>

			{/* Tabs de navegación */}
			<div className="border-b border-gray-200 mb-6">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => handleTabChange("subtopics")}
						className={`py-4 px-1 ${
							activeTab === "subtopics"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("topicDetail.subtopics") || "Subtemas"}
					</button>
					<button
						onClick={() => handleTabChange("questionnaires")}
						className={`py-4 px-1 ${
							activeTab === "questionnaires"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("topicDetail.questionnaires") || "Cuestionarios"}
					</button>
					<button
						onClick={() => handleTabChange("questions")}
						className={`py-4 px-1 ${
							activeTab === "questions"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("topicDetail.questions") || "Preguntas"}
					</button>
					<button
						onClick={() => handleTabChange("settings")}
						className={`py-4 px-1 ${
							activeTab === "settings"
								? "border-b-2 border-indigo-500 font-medium text-indigo-600"
								: "border-b-2 border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
						}`}
					>
						{t("topicDetail.settings") || "Ajustes"}
					</button>
				</nav>
			</div>

			{/* Contenido de las tabs */}
			<div className="mt-6">
				{activeTab === "subtopics" && topic && (
					<SubtopicsTab
						topicId={topicId}
						subjectId={id}
						subtopics={topic.subtopics}
						handleAddSubtopic={handleAddSubtopicRequest}
						isLoading={addingSubtopic}
					/>
				)}

				{activeTab === "questionnaires" && (
					<QuestionnaireTab topicId={topicId} subjectId={id} />
				)}

				{activeTab === "questions" && (
					<QuestionsTab topicId={topicId} subjectId={id} />
				)}

				{activeTab === "settings" && topic && (
					<SettingsTab
						topic={topic}
						onUpdateTopic={handleUpdateTopic}
						onDeleteSubtopic={handleConfirmDeleteSubtopic}
						isLoading={updatingTopic || deletingSubtopic}
					/>
				)}
			</div>

			{/* Modales para gestión de subtemas */}
			{showAddSubtopicModal && (
				<AddSubtopicModal
					onClose={() => setShowAddSubtopicModal(false)}
					onAdd={handleAddSubtopic}
					isLoading={addingSubtopic}
				/>
			)}

			{editingSubtopic && (
				<EditSubtopicModal
					subtopic={editingSubtopic}
					onClose={() => setEditingSubtopic(null)}
					onSave={handleSaveSubtopic}
					isLoading={editingSubtopicLoading}
				/>
			)}

			{/* Modal de confirmación para eliminar subtema */}
			<ConfirmationModal
				isOpen={showDeleteSubtopicModal}
				title={
					t("confirmation.deleteSubtopic.title") || "Eliminar subtema"
				}
				message={
					t("confirmation.deleteSubtopic.message") ||
					"¿Estás seguro de que deseas eliminar este subtema? Esta acción no se puede deshacer."
				}
				confirmButtonText={t("common.delete") || "Eliminar"}
				onConfirm={handleDeleteSubtopic}
				onCancel={() => setShowDeleteSubtopicModal(false)}
				isLoading={deletingSubtopic}
				isDanger={true}
			/>
		</div>
	);
};

// Componente principal con el provider del contexto
export default function TopicDetailPage() {
	return (
		<TopicProvider>
			<TopicDetailContent />
		</TopicProvider>
	);
}
