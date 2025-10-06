// /app/manager/components/subject/SubjectTags.tsx
import React from "react";

interface SubjectTagsProps {
	tags: string[];
	category: string;
}

/**
 * Componente para mostrar etiquetas de una asignatura
 */
const SubjectTags: React.FC<SubjectTagsProps> = ({ tags, category }) => {
	/**
	 * Renderiza una etiqueta individual
	 */
	const renderTag = (tag: string, index: number): JSX.Element => {
		return (
			<span
				key={index}
				className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
			>
				{tag}
			</span>
		);
	};

	return (
		<div className="mb-3">
			<span className="font-bold mr-2">{category}:</span>
			<div className="flex flex-wrap gap-2 mt-1">
				{(tags || []).map((tag, index) => renderTag(tag, index))}
			</div>
		</div>
	);
};

export default SubjectTags;
