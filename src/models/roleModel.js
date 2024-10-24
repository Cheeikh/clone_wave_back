const roleSchema = new Schema({
    nom: { type: String, required: true },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
});

module.exports = mongoose.model('Role', roleSchema);
