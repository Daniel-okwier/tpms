import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import adherenceRoutes from './routes/adherenceRoutes.js';
import diagnosisRoutes from './routes/diagnosisRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import labTestRoutes from './routes/labTestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import screeningRoutes from './routes/screeningRoutes.js';
import treatmentRoutes from './routes/treatmentRoutes.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);

app.get('/', (req, res) => {
  res.send('TPMS Backend API is running...');
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler 
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
