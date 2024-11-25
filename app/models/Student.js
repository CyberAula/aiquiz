import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true,
        unique: true,
    },
    subjects: [
        {
            subjectName: {
                type: String,
                required: true,
            },
            subjectModel: {
                type: String,
                required: true,
            },
            ABC_Testing: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
    ],
}, { timestamps: true }); // Habilitamos `createdAt` y `updatedAt`

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
