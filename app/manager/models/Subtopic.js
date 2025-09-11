// models/Subtopic.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubtopicSchema = new Schema(
	{
		title: {
			type: String,
			required: [true, "El título es obligatorio"],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		content: {
			type: String,
			default: "",
		},
		topic: {
			type: Schema.Types.ObjectId,
			ref: "Topic",
			required: [true, "El tema es obligatorio"],
		},
		order: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual para obtener los archivos de un subtema
SubtopicSchema.virtual("files", {
	ref: "File",
	localField: "_id",
	foreignField: "subtopic",
});

// Virtual para obtener las preguntas de un subtema
SubtopicSchema.virtual("questions", {
	ref: "Question",
	localField: "_id",
	foreignField: "subtopic",
});

// Método para actualizar el orden de los subtemas
SubtopicSchema.statics.updateOrder = async function (topicId, subtopicsOrder) {
	const bulkOps = subtopicsOrder.map((item) => ({
		updateOne: {
			filter: { _id: item.id, topic: topicId },
			update: { $set: { order: item.order } },
		},
	}));

	return this.bulkWrite(bulkOps);
};

// Índices para optimizar búsquedas
SubtopicSchema.index({ topic: 1, order: 1 });
SubtopicSchema.index({ title: "text", description: "text", content: "text" });

// Export the model, avoiding OverwriteModelError during development
const Subtopic = mongoose.models.Subtopic || mongoose.model("Subtopic", SubtopicSchema);

module.exports = Subtopic;
