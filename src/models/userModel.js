import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true, unique: true },
 //   pinCode: { type: String, required: true },
    solde: { type: Number, default: 0 },
    roles: [{ type: String, enum: ['utilisateur', 'agent', 'admin'], default: 'utilisateur' }],
    isTelephoneVerifie: { type: Boolean, default: false },
    tokens: [{ type: String }], // Pour stocker les JWT actifs
    creeLe: { type: Date, default: Date.now },
    modifieLe: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema); // Utilise export default ici
