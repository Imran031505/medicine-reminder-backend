const mongoose = require('mongoose');

// Medication Schema
const medicationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medication_name: { type: String, required: true },
  dosage: { type: String, required: true },
  reminder_times: {
    type: [String],
    required: true,
    validate: {
      validator: (times) => times.every((time) => /^\d{2}:\d{2}$/.test(time)),
      message: 'Invalid reminder time format. Use HH:mm (e.g., 08:00, 14:30).',
    },
  },
  user_phone: {
    type: String,
    required: true,
    validate: {
      validator: (phone) => /^[6-9]\d{9}$/.test(phone),
      message: 'Invalid phone number format. Must be a 10-digit Indian number.',
    },
  },
  start_date: { 
    type: Date, 
    required: true 
  },
  end_date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value) {
        return value >= this.start_date;
      },
      message: 'End date must be after start date.',
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
