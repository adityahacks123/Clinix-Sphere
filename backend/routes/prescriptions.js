const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @route   POST api/prescriptions
// @desc    Create a prescription
// @access  Private
router.post('/', [auth, [
  check('appointmentId', 'Appointment ID is required').not().isEmpty(),
  check('symptoms', 'Symptoms are required').not().isEmpty(),
  check('diagnosis', 'Diagnosis is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { appointmentId, symptoms, diagnosis, medicines, notes } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Make sure user is a doctor and is the assigned doctor
    const user = await User.findById(req.user.id);
    if (user.role !== 'doctor' || appointment.doctor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newPrescription = new Prescription({
      appointment: appointmentId,
      client: appointment.client,
      doctor: req.user.id,
      symptoms,
      diagnosis,
      medicines,
      notes,
    });

    const prescription = await newPrescription.save();
    res.json(prescription);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/prescriptions
// @desc    Get all prescriptions for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let prescriptions;
    if (user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctor: req.user.id }).populate('client', 'name').sort({ date: -1 });
    } else {
      prescriptions = await Prescription.find({ client: req.user.id }).populate('doctor', 'name').sort({ date: -1 });
    }
    res.json(prescriptions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
