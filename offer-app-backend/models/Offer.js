const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  title: { type: String, required: true },
  restaurantName: { type: String, required: true },
  location: { type: String, required: true },
  validDays: [{ type: String }],
  description: { type: String },
  phoneNumber: { type: String, required: true },
  
  // NEW FIELDS
  image: { type: String, required: true }, // URL from Cloudinary
  imageId: { type: String }, // Public ID for deletion (optional but recommended)

  isActive: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  claimsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);