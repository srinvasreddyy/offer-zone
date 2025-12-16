const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  title: { type: String, required: true },
  restaurantName: { type: String, required: true },
  location: { type: String, required: true },
  validDays: [{ type: String }],
  description: { type: String },
  phoneNumber: { type: String, required: true },
  
  // NEW FIELDS
  startTime: { type: String }, // e.g., "09:00"
  endTime: { type: String },   // e.g., "17:00"
  importantNote: { type: String }, // Special note/warning

  image: { type: String, required: true }, // URL from Cloudinary
  imageId: { type: String }, // Public ID for deletion

  isActive: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  claimsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);