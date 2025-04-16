// /app/manager/components/subject/TopicsTab.tsx
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import SearchBar from "./SearchBar";

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

interface TopicsTabProps {
	subjectId: string;
	topics: Topic[];
	handleAddTopic: () => void;
}

const TopicsTab = ({ subjectId, topics, handleAddTopic }: TopicsTabProps) => {
	const { t } = useTranslation();
	const [filteredTopics, setFilteredTopics] = useState(topics);

	const handleSearch = (query: string) => {
		if (!query) {
			setFilteredTopics(topics);
			return;
		}

		const filtered = topics.filter(
			(topic) =>
				topic.title.toLowerCase().includes(query.toLowerCase()) ||
				topic.description.toLowerCase().includes(query.toLowerCase()) ||
				topic.subtopics.some((subtopic) =>
					subtopic.title.toLowerCase().includes(query.toLowerCase())
				)
		);
		setFilteredTopics(filtered);
	};

	return (
		<div>
			<div className="flex items-center mb-4">
				<SearchBar
					placeholder={t("subjectDetail.searchPlaceholder")}
					onSearch={handleSearch}
				/>

				<button
					onClick={handleAddTopic}
					className="ml-4 bg-gray-800 text-white py-2 px-4 rounded-md flex items-center"
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
							d="M12 4v16m8-8H4"
						/>
					</svg>
					{t("subjectDetail.newTopic")}
				</button>
			</div>

			{filteredTopics.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					<p>{t("subjectDetail.noTopicsFound")}</p>
				</div>
			) : (
				filteredTopics.map((topic) => (
					<div
						key={topic.id}
						className="mb-8 bg-gray-50 p-6 rounded-md"
					>
						<div className="flex justify-between mb-2">
							<h3 className="text-xl font-bold flex items-center">
								{topic.title}
								<Link
									href={`/manager/subjects/${subjectId}/topics/${topic.id}`}
									className="ml-2"
								>
									<svg
										className="w-5 h-5 text-gray-700"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</Link>
							</h3>
						</div>

						<p className="text-gray-700 mb-4">
							{topic.description}
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{topic.subtopics.map((subtopic) => (
								<div
									key={subtopic.id}
									className="bg-gray-200 py-2 px-4 rounded"
								>
									{subtopic.title}
								</div>
							))}
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default TopicsTab;
