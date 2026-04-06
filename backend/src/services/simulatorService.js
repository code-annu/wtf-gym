import { supabase } from '../db/supabaseClient.js';

let simulatorInterval = null;
let simulatorRunning = false;
let simulatorSpeed = 1;

// Cache gyms to pick randomly
let cachedGyms = [];

async function getGyms() {
  if (cachedGyms.length) return cachedGyms;
  const { data, error } = await supabase.from('gyms').select('id, name');
  if (error) throw error;
  cachedGyms = data;
  return data;
}

async function getRandomMember() {
  const gyms = await getGyms();
  const gym = gyms[Math.floor(Math.random() * gyms.length)];
  
  // Pick a random member from this specific gym
  const { data, error } = await supabase
    .from('members')
    .select('id, gym_id, name')
    .eq('gym_id', gym.id)
    .eq('status', 'active')
    .limit(10); // fetch a small pool

  if (error || !data?.length) return null;
  return data[Math.floor(Math.random() * data.length)];
}

async function generateCheckinEvent() {
  const member = await getRandomMember();
  if (!member) return;

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      member_id: member.id,
      gym_id: member.gym_id,
      checked_in: new Date().toISOString(),
      checked_out: null
    })
    .select()
    .single();

  if (error) console.error('Checkin sim error:', error.message);
  return data;
}

async function generateCheckoutEvent() {
  // Find a random open checkin across any gym
  // To avoid bias, we fetch a larger sample and pick randomly
  const { data: openCheckins, error: fetchErr } = await supabase
    .from('checkins')
    .select('id, checked_in')
    .is('checked_out', null)
    .limit(1000);

  if (fetchErr || !openCheckins?.length) return;

  const checkin = openCheckins[Math.floor(Math.random() * openCheckins.length)];
  const checkedIn = new Date(checkin.checked_in);
  // Ensure checkout is after checkin
  const checkoutTime = new Date();
  if (checkoutTime <= checkedIn) {
      checkoutTime.setMinutes(checkedIn.getMinutes() + 1);
  }

  const { data, error } = await supabase
    .from('checkins')
    .update({ checked_out: checkoutTime.toISOString() })
    .eq('id', checkin.id)
    .select()
    .single();

  if (error) console.error('Checkout sim error:', error.message);
  return data;
}

async function generatePaymentEvent() {
  const member = await getRandomMember();
  if (!member) return;

  const plans = ['monthly', 'quarterly', 'annual'];
  const prices = { monthly: 1499, quarterly: 3999, annual: 11999 };
  const plan = plans[Math.floor(Math.random() * plans.length)];

  const { data, error } = await supabase
    .from('payments')
    .insert({
      member_id: member.id,
      gym_id: member.gym_id,
      amount: prices[plan],
      plan_type: plan,
      payment_type: Math.random() > 0.7 ? 'renewal' : 'new',
      paid_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) console.error('Payment sim error:', error.message);
  return data;
}

async function tick() {
  try {
    const rand = Math.random();
    if (rand < 0.5) {
      await generateCheckinEvent();
    } else if (rand < 0.8) {
      await generateCheckoutEvent();
    } else {
      await generatePaymentEvent();
    }
  } catch (err) {
    console.error('Simulator tick error:', err.message);
  }
}

export function startSimulator(speed = 1) {
  if (simulatorRunning) {
      // If speed changed, restart
      if (simulatorSpeed !== speed) {
          stopSimulator();
      } else {
          return { status: 'already_running', speed: simulatorSpeed };
      }
  }

  simulatorSpeed = speed;
  simulatorRunning = true;
  const interval = Math.max(200, Math.floor(2000 / speed));

  simulatorInterval = setInterval(tick, interval);
  console.log(`Simulator started at ${speed}x (${interval}ms interval)`);
  return { status: 'started', speed };
}

export function stopSimulator() {
  if (!simulatorRunning) return { status: 'already_stopped' };
  clearInterval(simulatorInterval);
  simulatorInterval = null;
  simulatorRunning = false;
  console.log('Simulator stopped');
  return { status: 'stopped' };
}

export async function resetSimulator() {
  stopSimulator();
  const { error } = await supabase
    .from('checkins')
    .update({ checked_out: new Date().toISOString() })
    .is('checked_out', null);

  if (error) throw error;
  console.log('Simulator reset: all open checkins closed');
  return { status: 'reset' };
}

export function getSimulatorStatus() {
  return { running: simulatorRunning, speed: simulatorSpeed };
}
