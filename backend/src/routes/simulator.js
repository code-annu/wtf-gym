import express from 'express';
import { startSimulator, stopSimulator, resetSimulator, getSimulatorStatus } from '../services/simulatorService.js';

const router = express.Router();

// POST /api/simulator/start
router.post('/start', (req, res) => {
  try {
    const speed = req.body.speed || 1;
    if (![1, 5, 10].includes(speed)) {
      return res.status(400).json({ error: 'Speed must be 1, 5, or 10' });
    }
    const result = startSimulator(speed);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulator/stop
router.post('/stop', (req, res) => {
  try {
    const result = stopSimulator();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulator/reset
router.post('/reset', async (req, res) => {
  try {
    const result = await resetSimulator();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/simulator/status
router.get('/status', (req, res) => {
  res.json(getSimulatorStatus());
});

export default router;
