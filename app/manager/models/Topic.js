// models/Topic.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TopicSchema = new Schema(
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
		subject: {
			type: Schema.Types.ObjectId,
			ref: "Subject",
			required: [true, "La asignatura es obligatoria"],
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

// Virtual para obtener los subtemas de un tema
TopicSchema.virtual("subtopics", {
	ref: "Subtopic",
	localField: "_id",
	foreignField: "topic",
});

// Virtual para obtener las preguntas de un tema
TopicSchema.virtual("questions", {
	ref: "Question",
	localField: "_id",
	foreignField: "topic",
});

// Virtual para obtener los cuestionarios de un tema
TopicSchema.virtual("questionnaires", {
	ref: "Questionnaire",
	localField: "_id",
	foreignField: "topic",
});

// Método para actualizar el orden de los temas
TopicSchema.statics.updateOrder = async function (subjectId, topicsOrder) {
	const bulkOps = topicsOrder.map((item) => ({
		updateOne: {
			filter: { _id: item.id, subject: subjectId },
			update: { $set: { order: item.order } },
		},
	}));

	return this.bulkWrite(bulkOps);
};

// Índices para optimizar búsquedas
TopicSchema.index({ subject: 1, order: 1 });
TopicSchema.index({ title: "text", description: "text" });

// Export the model, avoiding OverwriteModelError during development
const Topic = mongoose.models.Topic || mongoose.model("Topic", TopicSchema);

module.exports = Topic;
