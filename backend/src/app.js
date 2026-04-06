import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gymRoutes from './routes/gyms.js';
import anomalyRoutes from './routes/anomalies.js';
import analyticsRoutes from './routes/analytics.js';
import simulatorRoutes from './routes/simulator.js';
import { runAnomalyDetector } from './jobs/anomalyDetector.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/gyms', gymRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/simulator', simulatorRoutes);

const PORT = process.env.PORT || 5000;

// Start background jobs
setInterval(runAnomalyDetector, 30000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}/api/`);
  });
}

export default app;
