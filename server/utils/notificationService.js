// utils/notificationService.js

// Existing function you might already have
export const generateToken = (userId) => {
  // your existing JWT token logic
  return 'your-generated-token'; // example placeholder
};

// -------------------- Adherence reminder functions --------------------

// Send SMS reminder (stub, replace with Twilio later)
export const sendSmsReminder = async (phone, message) => {
  console.log(`SMS to ${phone}: ${message}`);
  return { success: true, provider: 'stub' };
};

// Send Email reminder (stub, replace with Nodemailer later)
export const sendEmailReminder = async (email, subject, body) => {
  console.log(`Email to ${email}: ${subject} / ${body}`);
  return { success: true, provider: 'stub' };
};
