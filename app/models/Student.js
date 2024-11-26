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
                    required: true,
                },
                ABC_Testing: {
                    type: Boolean,
                    required: true,
                    default: false,
                },
            },
        ],
        default: [], // Valor por defecto como array vacío para evitar problemas
    }
}, { timestamps: true }); // Habilitamos `createdAt` y `updatedAt`

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
