const permissionSchema = new Schema({
    nom: { type: String, required: true },
    description: { type: String },
});

module.exports = mongoose.model('Permission', permissionSchema);
