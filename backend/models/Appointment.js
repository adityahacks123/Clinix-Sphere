const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  doctorName: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('appointment', AppointmentSchema);
