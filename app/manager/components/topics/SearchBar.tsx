// /app/manager/components/subject/SearchBar.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
	placeholder: string;
	onSearch: (query: string) => void;
}

const SearchBar = ({ placeholder, onSearch }: SearchBarProps) => {
	const [query, setQuery] = useState("");
	const { t } = useTranslation();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		onSearch(value);
	};

	return (
		<div className="relative w-full max-w-md">
			<input
				type="text"
				placeholder={placeholder}
				value={query}
				onChange={handleChange}
				className="w-full p-2 pl-10 border rounded-md"
			/>
			<div className="absolute inset-y-0 left-0 flex items-center pl-3">
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
		</div>
	);
};

export default SearchBar;
