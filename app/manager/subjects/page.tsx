// /app/manager/subjects/page.tsx
"use client";

import { useManagerTranslation } from "../hooks/useManagerTranslation";
import Link from "next/link";
import SubjectCard, {
	SubjectCardProps,
} from "../components/subject/SubjectCard";
import useApiRequest from "../hooks/useApiRequest";
import { LoadingSpinner, FadeIn } from "../components/common/AnimatedComponents";

interface Subject extends SubjectCardProps {}

export default function SubjectsPage() {
	const { t } = useManagerTranslation();

	// Usar el hook personalizado para gestionar la petición
	const {
		data: subjects = [],
		loading: isLoading,
		error,
	} = useApiRequest("/api/manager/subjects", "GET", [], true);


	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">
					{t("subjects.mySubjects")}
				</h1>
				<Link
					href="/manager/subjects/new"
					className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="mr-2"
					>
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
					{t("subjects.newSubject")}
				</Link>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<LoadingSpinner size="xl" />
				</div>
			) : error ? (
				<div className="text-center py-8 text-red-500">
					<p>{t("errors.loadSubjects")}</p>
				</div>
			) : (
				<FadeIn>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{subjects.map((subject, index) => (
							<FadeIn key={subject.id} delay={index * 100}>
								<SubjectCard
									id={subject.id}
									title={subject.title}
									description={subject.description}
									administrator={subject.administrator}
									topics={subject.topics}
								/>
							</FadeIn>
						))}
					</div>
				</FadeIn>
			)}
		</div>
	);
}
