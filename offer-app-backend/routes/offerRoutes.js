const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');

// --- PUBLIC / USER ROUTES ---

// Get All Offers (With User Context)
router.get('/', protect, async (req, res) => {
  try {
    // Sort by newest first
    const offers = await Offer.find({}).sort({ createdAt: -1 });
    const user = req.user; // User attached by protect middleware

    // Map offers to include user-specific status flags
    const offersWithStatus = offers.map(offer => {
      const isClaimed = user.claimedOffers.includes(offer._id);
      const isLiked = offer.likes.includes(user._id);
      const isSaved = user.savedOffers.includes(offer._id);

      return {
        ...offer._doc, // Spread original mongoose document
        isClaimed,
        isLiked,
        isSaved
      };
    });

    res.json(offersWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching offers' });
  }
});

// Like an Offer
router.put('/:id/like', protect, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error liking offer' });
  }
});

// Save/Unsave Offer
router.put('/:id/save', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const offerId = req.params.id;

    if (user.savedOffers.includes(offerId)) {
      user.savedOffers = user.savedOffers.filter(id => id.toString() !== offerId);
    } else {
      user.savedOffers.push(offerId);
    }

    await user.save();
    res.json(user.savedOffers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error saving offer' });
  }
});

// CLAIM OFFER (Record My Saving)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const offer = await Offer.findById(req.params.id);

    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    if (!offer.isActive) return res.status(400).json({ message: 'Offer is inactive' });

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
  } catch (error) {
    res.status(500).json({ message: 'Server Error claiming offer' });
  }
});

// --- ADMIN ROUTES ---

// Create Offer (With Image Upload)
// Note: upload.single('image') processes the file BEFORE the controller runs
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { title, restaurantName, location, validDays, description, phoneNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const offer = new Offer({
      title,
      restaurantName,
      location,
      description,
      phoneNumber,
      // FormData sends arrays as comma-separated strings
      validDays: validDays ? validDays.split(',') : [],
      image: req.file.path,      // Cloudinary URL
      imageId: req.file.filename // Cloudinary Public ID
    });

    const createdOffer = await offer.save();
    res.status(201).json(createdOffer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ message: 'Server Error creating offer' });
  }
});

// Update Offer
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (offer) {
      offer.title = req.body.title || offer.title;
      offer.restaurantName = req.body.restaurantName || offer.restaurantName;
      offer.location = req.body.location || offer.location;
      offer.description = req.body.description || offer.description;
      offer.phoneNumber = req.body.phoneNumber || offer.phoneNumber;
      
      if (req.body.validDays) {
        // Handle array update
        offer.validDays = req.body.validDays;
      }

      if (req.body.isActive !== undefined) {
        offer.isActive = req.body.isActive;
      }

      const updatedOffer = await offer.save();
      res.json(updatedOffer);
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating offer' });
  }
});

// Delete Offer (Clean up Cloudinary)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (offer) {
      // Remove image from Cloudinary if it exists using its Public ID
      if (offer.imageId) {
        await cloudinary.uploader.destroy(offer.imageId);
      }
      
      await offer.deleteOne();
      res.json({ message: 'Offer removed' });
    } else {
      res.status(404).json({ message: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting offer' });
  }
});

module.exports = router;