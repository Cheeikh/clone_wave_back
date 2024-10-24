const qrCodeTransactionSchema = new Schema({
    utilisateur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    montant: { type: Number, required: true },
    qrCodeData: { type: String, required: true },
    status: { type: String, enum: ['en_attente', 'terminee', 'echouee'], default: 'en_attente' },
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QRCodeTransaction', qrCodeTransactionSchema);
