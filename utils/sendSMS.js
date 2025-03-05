const twilio = require('twilio');

// Environment variables for Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Function to send an SMS
 * @param {string} to - 
 * @param {string} message - 
 */
const sendSMS = (to, message) => {

  const formatPhoneNumber = (number) => {
    if (!number.startsWith('+91')) {
      number = `+91${number}`;
    }
    return number.replace(/\s+/g, '');
  };

  const formattedTo = formatPhoneNumber(to);

  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo,
    })
    .then((message) => {
      console.log(`SMS sent successfully: ${message.sid}`);
    })
    .catch((error) => {
      console.error('Failed to send SMS:', error);
    });
};


module.exports = sendSMS;
