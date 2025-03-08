import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true,
        unique: true,
    },
    subjects: {
        type: [
            {
                subjectName: {
                    type: String,
                    required: true,
                },
                subjectModel: {
                    type: String,
                    required: false,
                },
                ABC_Testing: {
                    type: Boolean,
                    required: true,
                    default: false,
                },
                survey: {
                    type: Boolean,
                    required: false,
                    default: false,
                },
                md5Prompt: {
                    type: String,
                    required: false,
                },
                prompt: {
                    type: String,
                    required: false,
                },
            },
        ],
        default: [], // Valor por defecto como array vacío para evitar problemas
    }
}, { timestamps: true }); // Habilitamos `createdAt` y `updatedAt`

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
