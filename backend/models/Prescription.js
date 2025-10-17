const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'appointment',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  symptoms: {
    type: String,
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  medicines: [
    {
      name: String,
      dosage: String,
      duration: String,
    },
  ],
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('prescription', PrescriptionSchema);