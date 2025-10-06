// models/Subject.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubjectSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "El título es obligatorio"],
			trim: true,
		},
		acronym: {
			type: String,
			required: [true, "Las siglas son obligatorias"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		administrators: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
		professors: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual para obtener los temas de una asignatura
SubjectSchema.virtual("topics", {
	ref: "Topic",
	localField: "_id",
	foreignField: "subject",
});

// Método para añadir profesor
SubjectSchema.methods.addProfessor = async function (professorId) {
	if (!this.professors.includes(professorId)) {
		this.professors.push(professorId);
		await this.save();
	}
	return this;
};

// Método para eliminar profesor
SubjectSchema.methods.removeProfessor = async function (professorId) {
	this.professors = this.professors.filter(
		(id) => id.toString() !== professorId.toString()
	);
	await this.save();
	return this;
};

// Índices para optimizar búsquedas
SubjectSchema.index({ title: "text", acronym: "text", description: "text" });

// Export the model, avoiding OverwriteModelError during development
const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

module.exports = Subject;
