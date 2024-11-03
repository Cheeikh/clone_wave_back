const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  bgClass: String,
  iconClass: String,
  description: String,
  isEnabled: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  codeMarchand: {
    type: String,
    sparse: true
  }
});

serviceSchema.index({ codeMarchand: 1 }, { sparse: true });

module.exports = mongoose.model('Service', serviceSchema); 