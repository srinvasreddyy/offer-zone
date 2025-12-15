const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to check admin
const checkRole = (email) => {
  const admins = process.env.ADMIN_EMAILS.split(',');
  return admins.includes(email) ? 'admin' : 'user';
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP
  await Otp.create({ email, otp });

  // Send Email (Configure your transporter)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Login OTP',
    text: `Your OTP is ${otp}`,
  });

  res.json({ message: 'OTP sent' });
});

// 2. Login with OTP
router.post('/login-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  const validOtp = await Otp.findOne({ email, otp });
  if (!validOtp) return res.status(400).json({ message: 'Invalid OTP' });

  // Check if user exists, else create
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      role: checkRole(email)
    });
  }

  // Clear OTPs
  await Otp.deleteMany({ email });

  res.json({
    _id: user._id,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// 3. Google Login
router.post('/google', async (req, res) => {
  const { token } = req.body; // Token from frontend Google Button
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        role: checkRole(email)
      });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: 'Google Auth Failed' });
  }
});

module.exports = router;