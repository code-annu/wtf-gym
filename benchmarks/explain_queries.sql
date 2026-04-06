-- Q1: Live Occupancy for a gym
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT COUNT(*) FROM checkins WHERE gym_id = 'YOUR_GYM_ID' AND checked_out IS NULL;

-- Q2: Today's Revenue for a gym
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT SUM(amount) FROM payments WHERE gym_id = 'YOUR_GYM_ID' AND paid_at >= CURRENT_DATE;

-- Q3: Churn Risk Members
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, last_checkin_at FROM members WHERE status='active' AND last_checkin_at < NOW() - INTERVAL '45 days';

-- Q4: Heatmap Analysis from Materialized View
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM gym_hourly_stats WHERE gym_id = 'YOUR_GYM_ID';

-- Q5: Cross-Gym Revenue Ranking
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT gym_id, SUM(amount) FROM payments WHERE paid_at >= NOW() - INTERVAL '30 days' GROUP BY gym_id ORDER BY SUM DESC;

-- Q6: Active Anomalies
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM anomalies WHERE resolved = FALSE ORDER BY detected_at DESC;
