const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedOffers')
    .populate('claimedOffers');
  
  res.json({
    savedOffers: user.savedOffers,
    claimedOffers: user.claimedOffers
  });
});

module.exports = router;