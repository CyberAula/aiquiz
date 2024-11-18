import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true,
        unique: true,
    },
    assignedModel: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
