import { supabase } from '../db/supabaseClient.js';

/**
 * Anomaly Detection Logic — runs every 30 seconds.
 * Checks 3 types: zero_checkins, capacity_breach, revenue_drop.
 * Uses upsert with partial unique index on (gym_id, type) WHERE resolved = FALSE.
 */

async function checkZeroCheckins(gyms) {
  const anomalies = [];
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  for (const gym of gyms) {
    // Check if gym should be open now
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (currentTime < gym.opens_at || currentTime > gym.closes_at) continue;

    // Count recent checkins
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gym.id)
      .gte('checked_in', twoHoursAgo);

    if (error) { console.error('Zero checkin check error:', error.message); continue; }

    if (count === 0) {
      anomalies.push({
        gym_id: gym.id,
        type: 'zero_checkins',
        severity: 'critical',
        message: `${gym.name} has had zero check-ins in the past 2 hours during operating hours.`
      });
    }
  }
  return anomalies;
}

async function checkCapacityBreach(gyms) {
  const anomalies = [];

  for (const gym of gyms) {
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gym.id)
      .is('checked_out', null);

    if (error) { console.error('Capacity check error:', error.message); continue; }

    const pct = (count / gym.capacity) * 100;
    if (pct >= 90) {
      anomalies.push({
        gym_id: gym.id,
        type: 'capacity_breach',
        severity: pct >= 100 ? 'critical' : 'warning',
        message: `${gym.name} is at ${pct.toFixed(0)}% capacity (${count}/${gym.capacity}).`
      });
    }
  }
  return anomalies;
}

async function checkRevenueDrop(gyms) {
  const anomalies = [];

  const today = new Date();
  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(todayStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setHours(23, 59, 59, 999);

  for (const gym of gyms) {
    // Today's revenue
    const { data: todayPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('gym_id', gym.id)
      .gte('paid_at', todayStart.toISOString())
      .lte('paid_at', today.toISOString());

    const todayRev = (todayPayments || []).reduce((s, p) => s + Number(p.amount), 0);

    // Same day last week revenue
    const { data: lastWeekPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('gym_id', gym.id)
      .gte('paid_at', lastWeekStart.toISOString())
      .lte('paid_at', lastWeekEnd.toISOString());

    const lastWeekRev = (lastWeekPayments || []).reduce((s, p) => s + Number(p.amount), 0);

    if (lastWeekRev > 0) {
      const dropPct = ((lastWeekRev - todayRev) / lastWeekRev) * 100;
      if (dropPct >= 50) {
        anomalies.push({
          gym_id: gym.id,
          type: 'revenue_drop',
          severity: dropPct >= 80 ? 'critical' : 'warning',
          message: `${gym.name} revenue dropped ${dropPct.toFixed(0)}% vs same day last week (₹${todayRev} vs ₹${lastWeekRev}).`
        });
      }
    }
  }
  return anomalies;
}

async function autoResolveAnomalies(gyms, detectedTypes) {
  // Get all currently active anomalies
  const { data: activeAnomalies, error } = await supabase
    .from('anomalies')
    .select('*')
    .eq('resolved', false);

  if (error || !activeAnomalies) return;

  for (const anomaly of activeAnomalies) {
    const key = `${anomaly.gym_id}:${anomaly.type}`;
    if (!detectedTypes.has(key)) {
      // Condition cleared - auto resolve
      await supabase
        .from('anomalies')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', anomaly.id);
      console.log(`Auto-resolved anomaly: ${anomaly.type} for gym ${anomaly.gym_id}`);
    }
  }
}

export async function runAnomalyDetector() {
  try {
    const { data: gyms, error } = await supabase.from('gyms').select('*').eq('status', 'active');
    if (error || !gyms) return;

    const [zeroCheckins, capacityBreaches, revenueDrops] = await Promise.all([
      checkZeroCheckins(gyms),
      checkCapacityBreach(gyms),
      checkRevenueDrop(gyms),
    ]);

    const allAnomalies = [...zeroCheckins, ...capacityBreaches, ...revenueDrops];
    const detectedTypes = new Set(allAnomalies.map(a => `${a.gym_id}:${a.type}`));

    // Upsert new/continuing anomalies
    for (const anomaly of allAnomalies) {
      const { error: upsertErr } = await supabase
        .from('anomalies')
        .upsert(
          { ...anomaly, resolved: false, detected_at: new Date().toISOString() },
          { onConflict: 'gym_id,type', ignoreDuplicates: false }
        );

      if (upsertErr) console.error('Anomaly upsert error:', upsertErr.message);
    }

    // Auto-resolve cleared anomalies
    await autoResolveAnomalies(gyms, detectedTypes);

  } catch (err) {
    console.error('Anomaly detector error:', err.message);
  }
}

// Export individual checks for unit testing
export { checkZeroCheckins, checkCapacityBreach, checkRevenueDrop };
