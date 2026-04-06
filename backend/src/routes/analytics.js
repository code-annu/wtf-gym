import express from 'express';
import { supabase } from '../db/supabaseClient.js';

const router = express.Router();

// GET /api/analytics/cross-gym - All gyms by 30d revenue
router.get('/cross-gym', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: payments, error: ptErr } = await supabase
      .from('payments')
      .select('gym_id, amount')
      .gte('paid_at', thirtyDaysAgo.toISOString());

    if (ptErr) throw ptErr;

    const gymRevenue = payments.reduce((acc, p) => {
      acc[p.gym_id] = (acc[p.gym_id] || 0) + Number(p.amount);
      return acc;
    }, {});

    const { data: gyms, error: gyErr } = await supabase.from('gyms').select('id, name');
    if (gyErr) throw gyErr;

    const ranking = gyms.map(g => ({
      gym_id: g.id,
      name: g.name,
      revenue_30d: gymRevenue[g.id] || 0
    })).sort((a, b) => b.revenue_30d - a.revenue_30d);

    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
