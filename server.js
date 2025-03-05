require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');


const authRoutes = require('./routes/auth');
const medicationRoutes = require('./routes/medicationRoutes');
// Initialize Express App
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Function to send SMS


// Example: Call sendSMS
app.post("/api/send-sms", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ message: "Phone and message are required" });
  }

  try {
    await sendSMS(phone, message);
    res.status(200).json({ message: "SMS sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send SMS", error: error.message });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

  app.use('/api/auth', authRoutes);
  app.use('/api/medications', medicationRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
