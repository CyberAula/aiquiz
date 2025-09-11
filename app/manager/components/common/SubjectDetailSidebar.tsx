// /app/manager/components/common/SubjectDetailSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Topic } from "../../contexts/SubjectContext";

interface SubjectDetailSidebarProps {
	subjectId: string;
	subjectTitle: string;
	topics: Topic[];
}

/**
 * Barra lateral para la navegación detallada de una asignatura
 */
const SubjectDetailSidebar: React.FC<SubjectDetailSidebarProps> = ({
	subjectId,
	subjectTitle,
	topics = [], // Valor predeterminado seguro
}) => {
	const pathname = usePathname();
	const [expandedTopics, setExpandedTopics] = useState<
		Record<string, boolean>
	>({});

	/**
	 * Inicializa los temas expandidos al cargar el componente
	 */
	useEffect(() => {
		// Skip if topics not available
		if (!topics || topics.length === 0) return;

		const initialExpanded: Record<string, boolean> = {};

		// Start with all topics collapsed by default
		topics.forEach((topic) => {
			const topicId = topic.id || topic._id;
			initialExpanded[topicId] = false; // Todos empiezan colapsados
		});

		setExpandedTopics(initialExpanded);
	}, [topics]);

	/**
	 * Mantiene expandido el tema activo cuando cambia la ruta
	 */
	useEffect(() => {
		if (!pathname) return;

		// Check if we're on a topic or subtopic page
		if (pathname?.includes("/topics/")) {
			const pathParts = pathname.split("/");
			const topicIndex = pathParts.findIndex((part) => part === "topics");
			const topicId =
				topicIndex >= 0 && pathParts.length > topicIndex + 1
					? pathParts[topicIndex + 1]
					: null;

			// Auto-expand the active topic (especially useful for subtopic pages)
			if (topicId && expandedTopics[topicId] === false) {
				setExpandedTopics((prev) => ({
					...prev,
					[topicId]: true,
				}));
			}
		}
	}, [pathname, expandedTopics]);

	/**
	 * Alterna la expansión de un tema
	 * @param topicId ID del tema a expandir/contraer
	 */
	const toggleTopic = (topicId: string): void => {
		setExpandedTopics((prev) => ({
			...prev,
			[topicId]: !prev[topicId],
		}));
	};

	/**
	 * Verifica si la ruta actual corresponde a un tema específico
	 * @param topicId ID del tema a verificar
	 */
	const isTopicActive = (topicId: string): boolean => {
		return pathname?.includes(`/topics/${topicId}`) || false;
	};

	/**
	 * Verifica si la ruta actual corresponde a un subtema específico
	 * @param subtopicId ID del subtema a verificar
	 */
	const isSubtopicActive = (subtopicId: string): boolean => {
		return pathname?.includes(`/subtopics/${subtopicId}`) || false;
	};

	// Renderizar mensaje si no hay temas
	if (!topics || topics.length === 0) {
		return (
			<div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-bold">
						{subjectTitle || "Asignatura"}
					</h2>
				</div>
				<div className="p-6 text-gray-500 italic">
					No hay temas disponibles
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-xl font-bold">{subjectTitle}</h2>
			</div>

			<nav className="pt-4 pb-16">
				{(topics || []).map((topic) => (
					<div key={topic.id || topic._id} className="mb-1">
						{/* Cabecera del tema con botón desplegable */}
						<button 
							className={`flex items-center w-full py-3 px-4 hover:bg-gray-50 transition-colors text-left ${
								isTopicActive(topic.id || topic._id) ? "bg-blue-50 border-r-2 border-blue-500" : ""
							}`}
							onClick={() => {
								const topicId = topic.id || topic._id;
								toggleTopic(topicId);
							}}
							type="button"
						>
							{/* Icono de desplegable */}
							<svg
								className={`h-4 w-4 mr-3 transform transition-transform text-gray-500 ${
									expandedTopics[topic.id || topic._id] ? "rotate-90" : ""
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
							
							{/* Título del tema */}
							<span className={`flex-1 font-medium text-sm ${
								isTopicActive(topic.id || topic._id) ? "text-blue-700" : "text-gray-900"
							}`}>
								{topic.title}
							</span>
							
							{/* Badge con número de subtemas */}
							{topic.subtopics && topic.subtopics.length > 0 && (
								<span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
									{topic.subtopics.length}
								</span>
							)}
						</button>

						{/* Lista de subtemas desplegable */}
						{expandedTopics[topic.id || topic._id] && topic.subtopics && topic.subtopics.length > 0 && (
							<div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
								{topic.subtopics.map((subtopic, index) => (
									<Link
										key={subtopic.id || subtopic._id}
										href={`/manager/subjects/${subjectId}/topics/${topic.id || topic._id}/subtopics/${subtopic.id || subtopic._id}`}
										className={`flex items-center py-2 px-6 text-sm hover:bg-gray-100 transition-colors ${
											isSubtopicActive(subtopic.id || subtopic._id)
												? "bg-blue-100 text-blue-800 font-medium border-r-2 border-blue-500"
												: "text-gray-700"
										}`}
									>
										{/* Línea conectora visual */}
										<div className="flex items-center mr-3">
											<div className={`w-3 h-0.5 bg-gray-300 ${
												index === topic.subtopics.length - 1 ? "" : ""
											}`}></div>
											<div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
										</div>
										
										<span className="truncate">
											{subtopic.title}
										</span>
									</Link>
								))}
							</div>
						)}

						{/* Enlace directo al tema (siempre visible) */}
						<div className="ml-8">
							<Link
								href={`/manager/subjects/${subjectId}/topics/${topic.id || topic._id}`}
								className={`block py-2 px-4 text-xs hover:bg-gray-100 transition-colors ${
									isTopicActive(topic.id || topic._id) ? "text-blue-600 font-medium" : "text-gray-500"
								}`}
							>
								Ver tema completo →
							</Link>
						</div>
					</div>
				))}
			</nav>
		</div>
	);
};

export default SubjectDetailSidebar;
