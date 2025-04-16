// /app/manager/components/SubjectDetailSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

interface SubjectDetailSidebarProps {
	subjectId: string;
	subjectTitle: string;
	topics: Topic[];
}

const SubjectDetailSidebar: React.FC<SubjectDetailSidebarProps> = ({
	subjectId,
	subjectTitle,
	topics,
}) => {
	const pathname = usePathname();
	const [expandedTopics, setExpandedTopics] = useState<
		Record<string, boolean>
	>({});

	// Inicializar expandiendo el tema activo si estamos en una ruta de subtema
	useEffect(() => {
		if (pathname.includes("/topics/")) {
			const pathParts = pathname.split("/");
			const topicId = pathParts[pathParts.length - 1];

			const initialExpandedState: Record<string, boolean> = {};
			topics.forEach((topic) => {
				initialExpandedState[topic.id] = topic.id === topicId;
			});

			setExpandedTopics(initialExpandedState);
		}
	}, [pathname, topics]);

	const toggleTopic = (topicId: string) => {
		setExpandedTopics((prev) => ({
			...prev,
			[topicId]: !prev[topicId],
		}));
	};

	return (
		<div className="bg-white border-r border-gray-200 h-full overflow-y-auto">
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-xl font-bold">{subjectTitle}</h2>
			</div>

			<nav className="pt-4 pb-16">
				{topics.map((topic) => (
					<div key={topic.id} className="mb-2">
						<button
							onClick={() => toggleTopic(topic.id)}
							className={`flex items-center w-full py-2 px-6 text-left hover:bg-gray-100 ${
								pathname.includes(`/topics/${topic.id}`)
									? "font-bold"
									: ""
							}`}
						>
							<span>{topic.title}</span>
							{topic.subtopics && topic.subtopics.length > 0 && (
								<svg
									className={`ml-auto h-5 w-5 transform ${
										expandedTopics[topic.id]
											? "rotate-90"
											: ""
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
							)}
						</button>

						{expandedTopics[topic.id] && topic.subtopics && (
							<div className="ml-6 border-l border-gray-200 pl-4">
								{topic.subtopics.map((subtopic) => (
									<Link
										key={subtopic.id}
										href={`/manager/subjects/${subjectId}/topics/${topic.id}/subtopics/${subtopic.id}`}
										className={`block py-2 px-4 hover:bg-gray-100 ${
											pathname.includes(
												`/subtopics/${subtopic.id}`
											)
												? "font-bold"
												: ""
										}`}
									>
										{subtopic.title}
									</Link>
								))}
							</div>
						)}
					</div>
				))}
			</nav>
		</div>
	);
};

export default SubjectDetailSidebar;
