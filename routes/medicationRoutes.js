const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Medication = require('../models/Medication');
const sendSMS = require('../utils/sendSMS');
const cron = require('node-cron');
const authMiddleware = require('../middleware/authMiddleware'); 

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidIndianNumber = (number) => /^[6-9]\d{9}$/.test(number);


router.post('/', authMiddleware, async (req, res) => {
  try {
    const { medication_name, dosage, reminder_times, user_phone, start_date, end_date } = req.body;
    const user_id = req.user.id; 

    if (!isValidIndianNumber(user_phone)) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }

    const medication = new Medication({
      user_id,
      medication_name,
      dosage,
      reminder_times,
      user_phone,
      start_date,
      end_date,
    });
    await medication.save();

    res.status(201).json({ message: 'Medication added successfully!', medication });
  } catch (error) {
    console.error('Error saving medication:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// **Get All Medications for Logged-in User**
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const medications = await Medication.find({ user_id });
    res.status(200).json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// **Delete a Medication by ID (Only Owner)**
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid medication ID format.' });
    }

    const deletedMed = await Medication.findOneAndDelete({ _id: id, user_id });
    if (!deletedMed) {
      return res.status(404).json({ message: 'Medication not found or does not belong to this user.' });
    }

    res.status(200).json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error });
  }
});

// **Schedule SMS reminders**
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  try {
    const medications = await Medication.find({ reminder_times: currentTime });
    medications.forEach((medication) => {
      sendSMS(
        medication.user_phone,
          `📢 Hello! It's time to take your medication 💊: ${medication.medication_name}. Dosage:  ${medication.dosage}. Your health matters! Please confirm once you've taken it. Stay well! 😊`

        
      );
    });

  } catch (error) {
    console.error('Error sending SMS reminders:', error);
  }
});

module.exports = router;
