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
import { useSubject } from "./SubjectContext";

// Definimos las interfaces necesarias
export interface ContentSection {
	id: string;
	title: string;
	content: string;
	order: number;
}

export interface Question {
	id: string;
	text: string;
	type: string;
	difficulty: string;
	createdAt: string;
	verified?: boolean;
	rejected?: boolean;
	choices?: {
		text: string;
		isCorrect: boolean;
	}[];
}

export interface Subtopic {
	id?: string;
	_id?: string;
	title: string;
	description: string;
	content?: string;
	createdAt?: string;
	updatedAt?: string;
	topicId?: string;
	topicTitle?: string;
	subjectId?: string;
	subjectTitle?: string;
	contentSections?: ContentSection[];
	questions?: Question[];
	topic?: {
		_id: string;
		title: string;
	};
}

// Definimos la interfaz para el contexto
export interface SubtopicContextType {
	subtopic: Subtopic | null;
	loading: boolean;
	setSubtopic: Dispatch<SetStateAction<Subtopic | null>>;
	refetchSubtopic: () => Promise<any>;
}

// Creamos el contexto con valores por defecto seguros
export const SubtopicContext = createContext<SubtopicContextType>({
	subtopic: null,
	loading: true,
	setSubtopic: () => {},
	refetchSubtopic: async () => null,
});

// Hook personalizado para usar el contexto
export const useSubtopic = () => useContext(SubtopicContext);

// Componente Provider
interface SubtopicProviderProps {
	children: ReactNode;
}

export const SubtopicProvider = ({ children }: SubtopicProviderProps) => {
	const params = useParams();
	const id = params.id as string;
	const topicId = params.topicId as string;
	const subtopicId = params.subtopicId as string;

	const [subtopic, setSubtopic] = useState<Subtopic | null>(null);
	
	// Acceso al contexto de Subject para refrescar la sidebar
	const { refetchSubject } = useSubject();

	// Única llamada a la API que será compartida
	const { data, loading, error, makeRequest } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}/subtopics/${subtopicId}`,
		"GET",
		null,
		true
	);

	// Función para recargar los datos del subtema
	const refetchSubtopic = async () => {
		const refreshedData = await makeRequest();
		if (refreshedData) {
			setSubtopic(refreshedData);
			// También refrescar el contexto de Subject para actualizar la sidebar
			if (refetchSubject) {
				await refetchSubject();
			}
			return refreshedData;
		}
		return null;
	};

	// Actualizar el estado local cuando los datos cambian
	useEffect(() => {
		if (data) {
			setSubtopic(data);
		}
	}, [data]);

	return (
		<SubtopicContext.Provider
			value={{ subtopic, loading, setSubtopic, refetchSubtopic }}
		>
			{children}
		</SubtopicContext.Provider>
	);
};
