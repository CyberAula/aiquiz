import { NextResponse } from "next/server";
import Topic from "../../manager/models/Topic";
import Subtopic from "../../manager/models/Subtopic";
import Subject from "../../manager/models/Subject";


import dbConnect from "../../utils/dbconnect.js";

await dbConnect();

// 🔹 Endpoint POST
export async function POST(request) {
    try {
        const { subjectId } = await request.json();
        console.log("Received subjectId:", subjectId);

        // Llamamos a la función auxiliar
        const topics = await getTopics(subjectId);
        // console.log("Fetched topics:", topics);

        // Ahora obtenemos los subtemas para cada tema
        const subTopics = await getSubtopics(topics);
        // console.log("Fetched subtopics:", subTopics);


        if (!topics) {
            return NextResponse.json(
                { success: false, message: "Asignatura no encontrada" },
                { status: 404 }
            );
        }

        // Devolver solo el objeto json con los Temas y subtemas correspondientes
        return NextResponse.json({ topics, subTopics }, { status: 200 });


    } catch (error) {
        console.error("Error durante la solicitud /getTopicsAndSubtopics:", error.message);
        return NextResponse.json(
            { message: "Error durante la solicitud", error: error.message },
            { status: 500 }
        );
    }
}

async function getTopics(subjectId) {
    // Verificar que la asignatura existe
    const subject = await Subject.findById(subjectId);
    if (!subject) return null;

    // Buscar y devolver los temas
    const topics = await Topic.find({ subject: subjectId })
        .sort({ order: 1 })
        .populate("subject", "title acronym");

    return topics; // Devuelve el array
}


async function getSubtopics(topics) {
    const ids = topics.map(t => t.id || t._id?.toString());

    const allSubtopics = [];

    for (const topicId of ids) {
        const subs = await Subtopic.find({ topic: topicId })
            .sort({ order: 1 })
            .populate("topic", "title");
        allSubtopics.push(...subs);
    }
    console.log("All subtopics fetched:", allSubtopics);
    return allSubtopics; // Devuelve el array
}
