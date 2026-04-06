-- Migration 002 — Indexes
-- Members
CREATE INDEX idx_members_churn_risk ON members (last_checkin_at) WHERE status = 'active';
CREATE INDEX idx_members_gym_id ON members (gym_id);

-- Checkins
CREATE INDEX idx_checkins_time_brin ON checkins USING BRIN (checked_in);
CREATE INDEX idx_checkins_live_occupancy ON checkins (gym_id, checked_out) WHERE checked_out IS NULL;
CREATE INDEX idx_checkins_member ON checkins (member_id, checked_in DESC);

-- Payments
CREATE INDEX idx_payments_gym_date ON payments (gym_id, paid_at DESC);
CREATE INDEX idx_payments_date ON payments (paid_at DESC);

-- Anomalies
CREATE INDEX idx_anomalies_active ON anomalies (gym_id, detected_at DESC) WHERE resolved = FALSE;
