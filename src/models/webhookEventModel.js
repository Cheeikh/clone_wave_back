const webhookEventSchema = new Schema({
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    recuLe: { type: Date, default: Date.now },
    traite: { type: Boolean, default: false },
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
