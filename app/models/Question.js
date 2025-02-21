import mongoose from "mongoose";


//I add an id field to save a question id randomly generated to check if the question exists in the database (and not check it by the query)
const questionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    choices: {
        type: Array,
        required: true,
    },
    answer: {
        type: Number,
        required: true,
    },
    explanation: {
        type: String,
        required: true,
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentAnswer: {
        type: Number,
        required: true,
    },
    studentReport: {
        type: Boolean,
        required: true,
    },
    llmModel: {
        type: String,
        required: true,
    },
    ABC_Testing: {
        type: Boolean,
        required: true,
    },
    md5Prompt: {
        type: String,
        required: false,
    },
    prompt: {
        type: String,
        required: true,
    },

}, { timestamps: true }); // Habilitamos `createdAt` y `updatedAt`

export default mongoose.models.Question || mongoose.model('Question', questionSchema);



/* example data:

{
    "_id": ObjectId("5f3f8e3e3e3e3e3e3e3e3e3e"),
    "id": 394823782738,
    "language": "JavaScript",
    "difficulty": "intermedio",
    "topic": "asincronía",
    "query": "¿Qué método se utiliza para ejecutar una función después de cierto tiempo en JavaScript?",
    "choices": [
        "setTimeout()",
        "wait()",
        "delay()",
        "executeAfter()"
    ],
    "answer": 0,
    "explanation": "El método setTimeout() se utiliza en JavaScript para ejecutar una función después de cierto tiempo, permitiendo así la programación asíncrona y el manejo de tareas diferidas en el tiempo.",
    "studentEmail": "pepe@alumnos.upm.es",
    "studentAnswer": 0,
    "studentReport": false
}


*/