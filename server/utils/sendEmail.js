// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail", // default to Gmail
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail app password
      },
    });

    const mailOptions = {
      from: `"TPMS Support" <${process.env.EMAIL_USER}>`, // sender
      to,                                                 // recipient
      subject,                                            // subject line
      text,                                               // plain text version
      html,                                               // optional: HTML version
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(" Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error(" Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
