const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  savedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }],
  claimedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }], // Tracks usage
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);