// app/manager/contexts/SubjectContext.tsx
"use client";

import {
	createContext,
	Dispatch,
	SetStateAction,
	useState,
	useEffect,
	ReactNode,
	useContext,
} from "react";
import { useParams } from "next/navigation";
import useApiRequest from "../hooks/useApiRequest";

// Definimos las interfaces necesarias
export interface SubTopic {
	id?: string;
	_id?: string;
	title: string;
	description?: string;
	content?: string;
	order?: number;
}

export interface Topic {
	id?: string;
	_id?: string;
	title: string;
	description: string;
	subtopics: SubTopic[];
	order?: number;
}

export interface Professor {
	id: string;
	name: string;
	email: string;
}

export interface Subject {
	id?: string;
	_id?: string;
	title: string;
	acronym: string;
	description: string;
	topics: Topic[];
	professors: Professor[];
}

// Definimos la interfaz para el contexto
export interface SubjectContextType {
	subject: Subject | null;
	loading: boolean;
	setSubject: Dispatch<SetStateAction<Subject | null>>;
	refetchSubject: () => Promise<any>;
}

// Creamos el contexto con valores por defecto seguros
export const SubjectContext = createContext<SubjectContextType>({
	subject: null,
	loading: true,
	setSubject: () => {},
	refetchSubject: async () => null,
});

// Hook personalizado para usar el contexto
export const useSubject = () => useContext(SubjectContext);

// Componente Provider
interface SubjectProviderProps {
	children: ReactNode;
}

export const SubjectProvider = ({ children }: SubjectProviderProps) => {
	const { id } = useParams();
	const [subject, setSubject] = useState<Subject | null>(null);

	// Única llamada a la API que será compartida
	const { data, loading, error, makeRequest } = useApiRequest(
		`/api/manager/subjects/${id}`,
		"GET",
		null,
		true
	);

	// Función para recargar los datos de la asignatura
	const refetchSubject = async () => {
		const refreshedData = await makeRequest();
		if (refreshedData) {
			setSubject(refreshedData);
			return refreshedData;
		}
		return null;
	};

	// Actualizar el estado local cuando los datos cambian
	useEffect(() => {
		if (data) {
			setSubject(data);
		}
	}, [data]);

	return (
		<SubjectContext.Provider
			value={{ subject, loading, setSubject, refetchSubject }}
		>
			{children}
		</SubjectContext.Provider>
	);
};
