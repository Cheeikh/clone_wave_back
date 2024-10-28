const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agentSchema = new Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: {type: String, required: true, unique: true,},
    pinCode: {type: String, required: true,},
    solde: { type: Number, default: 0 },
    commissionsAccumulees: { type: Number, default: 0 },
    roles: [{ type: String, enum: ['agent'] }],
    isTelephoneVerifie: { type: Boolean, default: false }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Agent', agentSchema);
