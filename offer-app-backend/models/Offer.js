const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  title: { type: String, required: true }, // e.g., "25% OFF"
  restaurantName: { type: String, required: true },
  location: { type: String, required: true },
  validDays: [{ type: String }], // ["Monday", "Sunday"]
  description: { type: String }, // Stores text with emojis
  phoneNumber: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  
  // Analytics
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs to prevent double likes
  claimsCount: { type: Number, default: 0 } // Total times claimed
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);