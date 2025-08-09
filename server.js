import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; 

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/', (req, res) => {
  res.send('TPMS Backend API is running...');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});