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

app.use(cors());
app.use(express.json());

// Global error handler (after all routes)
app.use(errorHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/labTest', labTestRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);

app.get('/', (req, res) => {
  res.send('TPMS Backend API is running...');
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
