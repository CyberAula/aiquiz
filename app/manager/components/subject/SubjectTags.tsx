// /app/manager/components/SubjectTags.tsx
import React from "react";

interface SubjectTagsProps {
	tags: string[];
	category: string;
}

const SubjectTags = ({ tags, category }: SubjectTagsProps) => {
	return (
		<div className="mb-3">
			<span className="font-bold mr-2">{category}:</span>
			<div className="flex flex-wrap gap-2 mt-1">
				{tags.map((tag, index) => (
					<span
						key={index}
						className="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-md"
					>
						{tag}
					</span>
				))}
			</div>
		</div>
	);
};

export default SubjectTags;
