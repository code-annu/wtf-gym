import express from 'express';
import { supabase } from '../db/supabaseClient.js';

const router = express.Router();

// GET /api/gyms - All gyms with live occupancy + today's revenue
router.get('/', async (req, res) => {
  try {
    const { data: gyms, error: gymErr } = await supabase.from('gyms').select('*');
    if (gymErr) throw gymErr;

    // Use raw query logic equivalent since Supabase JS client doesn't directly support these complex joins easily and efficiently in one go
    // We fetch open checkins and today's revenue
    
    // Live Occupancy (Q1)
    const { data: checkins, error: chkErr } = await supabase
      .from('checkins')
      .select('gym_id')
      .is('checked_out', null);
      
    if (chkErr) throw chkErr;

    const occupancyMap = {};
    checkins.forEach(c => {
      occupancyMap[c.gym_id] = (occupancyMap[c.gym_id] || 0) + 1;
    });

    // Today's Revenue (Q2)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: payments, error: payErr } = await supabase
      .from('payments')
      .select('gym_id, amount')
      .gte('paid_at', today.toISOString());

    if (payErr) throw payErr;

    const revenueMap = {};
    payments.forEach(p => {
      revenueMap[p.gym_id] = (revenueMap[p.gym_id] || 0) + Number(p.amount);
    });

    const enrichedGyms = gyms.map(g => ({
      ...g,
      live_occupancy: occupancyMap[g.id] || 0,
      today_revenue: revenueMap[g.id] || 0
    }));

    res.json(enrichedGyms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gyms/:id/live - Single gym snapshot < 5ms
router.get('/:id/live', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', req.params.id)
      .is('checked_out', null);

    if (error) throw error;
    res.json({ live_occupancy: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gyms/:id/analytics - Heatmap, revenue breakdown, churn, new/renewal ratio
router.get('/:id/analytics', async (req, res) => {
  try {
    const gymId = req.params.id;

    // 1. Heatmap (Q4)
    const { data: heatmapData, error: htErr } = await supabase
      .from('gym_hourly_stats')
      .select('*')
      .eq('gym_id', gymId);

    // 2. Churn Risk (Q3) - Last 45 days
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    const { data: churnRiskData, error: chErr } = await supabase
      .from('members')
      .select('id, name, last_checkin_at')
      .eq('status', 'active')
      .lt('last_checkin_at', fortyFiveDaysAgo.toISOString())
      .eq('gym_id', gymId);

    // 3. Revenue Breakdown by Plan - Last 30 Days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: paymentsData, error: payErr } = await supabase
      .from('payments')
      .select('plan_type, amount')
      .eq('gym_id', gymId)
      .gte('paid_at', thirtyDaysAgo.toISOString());

    const revenueByPlan = paymentsData?.reduce((acc, p) => {
      acc[p.plan_type] = (acc[p.plan_type] || 0) + Number(p.amount);
      return acc;
    }, {}) || {};

    // 4. New / Renewal Ratio
    const { data: membersData, error: memErr } = await supabase
      .from('members')
      .select('member_type')
      .eq('gym_id', gymId);

    const ratio = membersData?.reduce((acc, m) => {
      acc[m.member_type] = (acc[m.member_type] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      heatmap: heatmapData || [],
      churnRisk: churnRiskData || [],
      revenueByPlan,
      memberRatio: ratio
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
