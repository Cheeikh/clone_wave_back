const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    utilisateur: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true }
}, {
    timestamps: true,
});

module.exports = mongoose.model('OTP', otpSchema);
