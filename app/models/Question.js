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
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    subTopic: {
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
    correct: {
        type: Boolean,
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