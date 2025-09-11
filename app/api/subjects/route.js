import { NextResponse } from "next/server";
import dbConnect from "../../utils/dbconnect";
import Subject from "../../manager/models/Subject";
import Topic from "../../manager/models/Topic";
import Subtopic from "../../manager/models/Subtopic";

export async function GET() {
    try {
        await dbConnect();
        
        const subjects = await Subject.find({})
            .populate({
                path: 'topics',
                populate: {
                    path: 'subtopics'
                }
            })
            .lean();

        console.log('Found subjects:', subjects.length);
        if (subjects.length > 0) {
            console.log('First subject structure:', JSON.stringify(subjects[0], null, 2));
        }

        // Transformar los datos para que coincidan con el formato esperado por la aplicación principal
        const transformedSubjects = subjects.map(subject => ({
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
        }));

        return NextResponse.json({
            success: true,
            subjects: transformedSubjects
        });

    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json({
            success: false,
            error: "Error fetching subjects"
        }, { status: 500 });
    }
}