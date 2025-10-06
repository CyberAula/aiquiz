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
export interface Subtopic {
	id?: string;
	_id?: string;
	title: string;
	description: string;
	content?: string;
	order?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface Topic {
	id?: string;
	_id?: string;
	title: string;
	description: string;
	subject?: {
		_id: string;
		title: string;
		acronym: string;
	};
	subjectId?: string;
	subjectTitle?: string;
	subtopics: Subtopic[];
	order?: number;
	createdAt?: string;
	updatedAt?: string;
}

// Definimos la interfaz para el contexto
export interface TopicContextType {
	topic: Topic | null;
	loading: boolean;
	setTopic: Dispatch<SetStateAction<Topic | null>>;
	refetchTopic: () => Promise<any>;
}

// Creamos el contexto con valores por defecto seguros
export const TopicContext = createContext<TopicContextType>({
	topic: null,
	loading: true,
	setTopic: () => {},
	refetchTopic: async () => null,
});

// Hook personalizado para usar el contexto
export const useTopic = () => useContext(TopicContext);

// Componente Provider
interface TopicProviderProps {
	children: ReactNode;
}

export const TopicProvider = ({ children }: TopicProviderProps) => {
	const params = useParams();
	const id = params.id as string;
	const topicId = params.topicId as string; // Usa el parámetro correcto

	const [topic, setTopic] = useState<Topic | null>(null);
	
	// Acceso al contexto de Subject para refrescar la sidebar
	const { refetchSubject } = useSubject();

	// Única llamada a la API que será compartida
	const { data, loading, error, makeRequest } = useApiRequest(
		`/api/manager/subjects/${id}/topics/${topicId}`,
		"GET",
		null,
		true
	);

	// Función para recargar los datos del tema
	const refetchTopic = async () => {
		const refreshedData = await makeRequest();
		if (refreshedData) {
			setTopic(refreshedData);
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
			setTopic(data);
		}
	}, [data]);

	return (
		<TopicContext.Provider
			value={{ topic, loading, setTopic, refetchTopic }}
		>
			{children}
		</TopicContext.Provider>
	);
};
