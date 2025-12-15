const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// --- PUBLIC / USER ROUTES ---

// Get All Offers
router.get('/', protect, async (req, res) => {
  // If user has claimed an offer, we can technically filter it out or flag it here
  // But for now, we send all, frontend filters visually
  const offers = await Offer.find({}).sort({ createdAt: -1 });
  
  // We attach a flag 'isClaimedByUser' for the frontend
  const user = req.user;
  const offersWithStatus = offers.map(offer => {
    const isClaimed = user.claimedOffers.includes(offer._id);
    const isLiked = offer.likes.includes(user._id);
    // User can't use "Use Now" if inactive OR already claimed
    return { 
      ...offer._doc, 
      isClaimed,
      isLiked
    };
  });

  res.json(offersWithStatus);
});

// Like an Offer
router.put('/:id/like', protect, async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: 'Offer not found' });

  // Toggle Like
  if (offer.likes.includes(req.user._id)) {
    offer.likes = offer.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    offer.likes.push(req.user._id);
  }
  
  await offer.save();
  res.json(offer);
});

// CLAIM OFFER (Record My Saving)
router.post('/:id/claim', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const offer = await Offer.findById(req.params.id);

  if (!offer) return res.status(404).json({ message: 'Offer not found' });
  if (!offer.isActive) return res.status(400).json({ message: 'Offer is inactive' });

  // Check if already claimed
  if (user.claimedOffers.includes(offer._id)) {
    return res.status(400).json({ message: 'You have already used this offer' });
  }

  // Update User
  user.claimedOffers.push(offer._id);
  await user.save();

  // Update Offer Stats
  offer.claimsCount += 1;
  await offer.save();

  res.json({ message: 'Offer claimed successfully' });
});

// Save/Unsave Offer
router.put('/:id/save', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const offerId = req.params.id;

  if (user.savedOffers.includes(offerId)) {
    user.savedOffers = user.savedOffers.filter(id => id.toString() !== offerId);
  } else {
    user.savedOffers.push(offerId);
  }
  
  await user.save();
  res.json(user.savedOffers);
});

// --- ADMIN ROUTES ---

// Create Offer
router.post('/', protect, admin, async (req, res) => {
  const { title, restaurantName, location, validDays, description, phoneNumber } = req.body;
  
  const offer = new Offer({
    title, restaurantName, location, validDays, description, phoneNumber
  });

  const createdOffer = await offer.save();
  res.status(201).json(createdOffer);
});

// Update Offer
router.put('/:id', protect, admin, async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (offer) {
    offer.title = req.body.title || offer.title;
    offer.restaurantName = req.body.restaurantName || offer.restaurantName;
    offer.location = req.body.location || offer.location;
    offer.validDays = req.body.validDays || offer.validDays;
    offer.description = req.body.description || offer.description;
    offer.phoneNumber = req.body.phoneNumber || offer.phoneNumber;
    // Toggle active status can be sent here too
    if (req.body.isActive !== undefined) offer.isActive = req.body.isActive;

    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } else {
    res.status(404).json({ message: 'Offer not found' });
  }
});

// Delete Offer
router.delete('/:id', protect, admin, async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (offer) {
    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } else {
    res.status(404).json({ message: 'Offer not found' });
  }
});

module.exports = router;