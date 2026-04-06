import express from 'express';
import { supabase } from '../db/supabaseClient.js';

const router = express.Router();

// GET /api/anomalies - Active anomalies
router.get('/', async (req, res) => {
  try {
    const { gym_id, severity } = req.query;

    let query = supabase
      .from('anomalies')
      .select('*, gyms(name)')
      .eq('resolved', false)
      .order('detected_at', { ascending: false });

    if (gym_id) query = query.eq('gym_id', gym_id);
    if (severity) query = query.eq('severity', severity);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/anomalies/:id/dismiss - Dismiss anomaly (403 if critical)
router.patch('/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: anomaly, error: fetchErr } = await supabase
      .from('anomalies')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!anomaly) return res.status(404).json({ error: 'Anomaly not found' });

    if (anomaly.severity === 'critical') {
      return res.status(403).json({ error: 'Cannot dismiss critical anomalies' });
    }

    const { data, error: updateErr } = await supabase
      .from('anomalies')
      .update({ dismissed: true })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json({ message: 'Dismissed', anomaly: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
