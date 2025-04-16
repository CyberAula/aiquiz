// /app/manager/components/SubjectCard.tsx
import Link from "next/link";
import { useTranslation } from "react-i18next";
import SubjectTags from "./SubjectTags";

export interface SubjectCardProps {
	id: string;
	title: string;
	description: string;
	administrator: string;
	topics: string[];
}

const SubjectCard = ({
	id,
	title,
	description,
	administrator,
	topics,
}: SubjectCardProps) => {
	const { t } = useTranslation();

	return (
		<div className="bg-gray-100 rounded-md p-6">
			<h2 className="text-xl font-bold mb-2">{title}</h2>

			<p className="text-gray-700 mb-2">
				{description.length > 150
					? `${description.substring(0, 150)}(...)`
					: description}
			</p>

			<Link
				href={`/manager/subjects/${id}`}
				className="text-blue-600 hover:underline mb-4 inline-block"
			>
				{t("subjects.viewMore")}
			</Link>

			<div className="mt-3">
				<p className="mb-1">
					<span className="font-bold mr-2">
						{t("subjects.administrator")}:
					</span>
					{administrator}
				</p>

				<SubjectTags tags={topics} category={t("subjects.topics")} />
			</div>
		</div>
	);
};

export default SubjectCard;
