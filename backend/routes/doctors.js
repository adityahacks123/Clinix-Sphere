const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET api/doctors
// @desc    Get all available doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isAvailable: true }).select('-password');
    res.json(doctors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
