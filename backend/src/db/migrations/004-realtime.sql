-- Migration 004 — Enable Supabase Realtime
-- Enable realtime on the three tables the frontend subscribes to
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE anomalies;
