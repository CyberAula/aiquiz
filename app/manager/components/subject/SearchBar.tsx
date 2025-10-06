// /app/manager/components/subject/SearchBar.tsx
import { useState, useCallback } from "react";
import { useManagerTranslation } from "../../hooks/useManagerTranslation";

interface SearchBarProps {
	placeholder: string;
	onSearch: (query: string) => void;
}

/**
 * Componente de barra de búsqueda reutilizable
 */
const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
	const [query, setQuery] = useState<string>("");
	const { t } = useManagerTranslation();

	/**
	 * Maneja el cambio en el campo de búsqueda
	 */
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setQuery(value);
			onSearch(value);
		},
		[onSearch]
	);

	/**
	 * Limpia el campo de búsqueda
	 */
	const handleClear = useCallback(() => {
		setQuery("");
		onSearch("");
	}, [onSearch]);

	return (
		<div className="relative w-full max-w-md">
			<input
				type="text"
				placeholder={placeholder}
				value={query}
				onChange={handleChange}
				className="w-full p-2 pl-10 border rounded-md"
				aria-label="Campo de búsqueda"
			/>
			<div className="absolute inset-y-0 left-0 flex items-center pl-3">
				<svg
					className="w-5 h-5 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			{query && (
				<button
					onClick={handleClear}
					className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
					aria-label="Limpiar búsqueda"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			)}
		</div>
	);
};

export default SearchBar;
