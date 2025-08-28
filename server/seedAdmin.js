import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
import generateToken from "./utils/generateToken.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (adminExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "Admin123!", 
      role: "admin",
    });

    console.log("Admin user created:");
    console.log({
      email: admin.email,
      password: "Admin123!", 
      role: admin.role,
      token: generateToken(admin._id, admin.role),
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdminUser();
