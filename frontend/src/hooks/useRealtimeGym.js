import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useStore } from '../store/useStore';

export function useRealtimeGym() {
  const { 
    updateGymOccupancy, 
    updateGymRevenue, 
    addActivity, 
    handleAnomalyEvent, 
    setConnectionStatus 
  } = useStore();

  useEffect(() => {
    const channel = supabase
      .channel('gym-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'checkins' }, (payload) => {
        const checkin = payload.new;
        if (!checkin.checked_out) {
          updateGymOccupancy(checkin.gym_id, 1);
          addActivity({ id: `checkin-${checkin.id}`, type: 'CHECKIN', gym_id: checkin.gym_id, time: checkin.checked_in });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'checkins' }, (payload) => {
        const checkin = payload.new;
        const oldCheckin = payload.old;
        if (checkin.checked_out && !oldCheckin.checked_out) {
          updateGymOccupancy(checkin.gym_id, -1);
          addActivity({ id: `checkout-${checkin.id}`, type: 'CHECKOUT', gym_id: checkin.gym_id, time: checkin.checked_out });
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, (payload) => {
        const payment = payload.new;
        updateGymRevenue(payment.gym_id, payment.amount);
        addActivity({ id: `payment-${payment.id}`, type: 'PAYMENT', gym_id: payment.gym_id, amount: payment.amount, time: payment.paid_at });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, (payload) => {
        handleAnomalyEvent(payload.new);
      })
      .subscribe((status) => {
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
