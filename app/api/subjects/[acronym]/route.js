import { NextResponse } from "next/server";
import dbConnect from "../../../utils/dbconnect";
import Subject from "../../../manager/models/Subject";
import Topic from "../../../manager/models/Topic";
import Subtopic from "../../../manager/models/Subtopic";

export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const { acronym } = params;
        
        const subject = await Subject.findOne({ acronym: acronym.toUpperCase() })
            .populate({
                path: 'topics',
                populate: {
                    path: 'subtopics'
                }
            })
            .lean();

        if (!subject) {
            return NextResponse.json({
                success: false,
                error: "Subject not found"
            }, { status: 404 });
        }

        // Transformar los datos para compatibilidad con la aplicación principal
        const transformedSubject = {
            _id: subject._id,
            name: subject.title || '',
            acronym: subject.acronym || '',
            description: subject.description || '',
            topics: (subject.topics || []).map(topic => ({
                _id: topic._id,
                value: (topic.title || '').toLowerCase().replace(/\s+/g, '_'),
                label: topic.title || '',
                subtopics: (topic.subtopics || []).map(subtopic => ({
                    _id: subtopic._id,
                    title: subtopic.title || '',
                    comment: subtopic.description || '',
                    files: [] // Por ahora vacío, se puede llenar con archivos relacionados
                }))
            }))
        };

        // También crear un formato compatible con el sistema legacy (language y topics)
        const languageData = {};
        const topicsData = {};

        (subject.topics || []).forEach(topic => {
            const topicKey = (topic.title || '').toLowerCase().replace(/\s+/g, '_');
            
            // Para language[subject]
            if (!languageData[subject.acronym]) {
                languageData[subject.acronym] = [];
            }
            languageData[subject.acronym].push({
                value: topicKey,
                label: topic.title || ''
            });

            // Para topics[language]
            topicsData[topicKey] = (topic.subtopics || []).map(subtopic => subtopic.title || '');
        });

        return NextResponse.json({
            success: true,
            subject: transformedSubject,
            // Datos de compatibilidad para el sistema legacy
            language: languageData,
            topics: topicsData
        });

    } catch (error) {
        console.error("Error fetching subject:", error);
        return NextResponse.json({
            success: false,
            error: "Error fetching subject"
        }, { status: 500 });
    }
}