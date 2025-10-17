const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

module.exports = function(io) {

// @route   POST api/appointments
// @desc    Book an appointment
// @access  Private
router.post('/', [auth, [
  check('doctorId', 'Doctor ID is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { doctorId } = req.body;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    const newAppointment = new Appointment({
      client: req.user.id,
      doctor: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
    });

    const appointment = await newAppointment.save();
    io.to(doctor.id).emit('new_appointment', appointment);
    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/appointments
// @desc    Get all appointments for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let appointments;
    if (user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user.id }).populate('client', 'name').sort({ date: -1 });
    } else {
      appointments = await Appointment.find({ client: req.user.id }).sort({ date: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/appointments/:id
// @desc    Update appointment status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Make sure user is a doctor and is the assigned doctor
    const user = await User.findById(req.user.id);
    if (user.role !== 'doctor' || appointment.doctor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

return router;
}
