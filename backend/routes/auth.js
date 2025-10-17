const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

module.exports = function(io) {
  // @route   GET api/auth/me
  // @desc    Get logged in user
  // @access  Private
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

  // @route   POST api/auth/signup
  // @desc    Register a user
  // @access  Public
  router.post(
    '/signup',
    [
      check('name', 'Please add name').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
        'password',
        'Please enter a password with 6 or more characters'
      ).isLength({ min: 6 }),
      check('role', 'Role is required').not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, role, specialty } = req.body;

      try {
        let user = await User.findOne({ email });

        if (user) {
          return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
          name,
          email,
          password,
          role,
          specialty,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 360000 },
          (err, token) => {
            if (err) throw err;
            res.json({ token });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );

  // @route   POST api/auth/signin
  // @desc    Sign In a user
  // @access  Public
  router.post(
    '/signin',
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });

        if (!user) {
          return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: 360000 },
          async (err, token) => {
            if (err) throw err;
            if (user.role === 'doctor') {
              user.isAvailable = true;
              await user.save();
              io.emit('doctor_online', user);
            }
            res.json({ token, role: user.role });
          }
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
      }
    }
  );

  // @route   POST api/auth/logout
  // @desc    Log out a user and set doctor to unavailable
  // @access  Private
  router.post('/logout', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user && user.role === 'doctor') {
        user.isAvailable = false;
        await user.save();
        io.emit('doctor_offline', user.id);
      }
      res.json({ msg: 'Logged out successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  return router;
};
