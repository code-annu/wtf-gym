import crypto from 'node:crypto';
import { supabase } from '../supabaseClient.js';

const gymsData = [
  { name: 'WTF Gyms — Lajpat Nagar', city: 'New Delhi', capacity: 2200, opens_at: '05:30', closes_at: '22:30' },
  { name: 'WTF Gyms — Connaught Place', city: 'New Delhi', capacity: 1800, opens_at: '06:00', closes_at: '22:00' },
  { name: 'WTF Gyms — Bandra West', city: 'Mumbai', capacity: 3000, opens_at: '05:00', closes_at: '23:00' },
  { name: 'WTF Gyms — Powai', city: 'Mumbai', capacity: 2500, opens_at: '05:30', closes_at: '22:30' },
  { name: 'WTF Gyms — Indiranagar', city: 'Bengaluru', capacity: 2000, opens_at: '05:30', closes_at: '22:00' },
  { name: 'WTF Gyms — Koramangala', city: 'Bengaluru', capacity: 1800, opens_at: '06:00', closes_at: '22:00' },
  { name: 'WTF Gyms — Banjara Hills', city: 'Hyderabad', capacity: 1600, opens_at: '06:00', closes_at: '22:00' },
  { name: 'WTF Gyms — Sector 18 Noida', city: 'Noida', capacity: 1400, opens_at: '06:00', closes_at: '21:30' },
  { name: 'WTF Gyms — Salt Lake', city: 'Kolkata', capacity: 1200, opens_at: '06:00', closes_at: '21:00' },
  { name: 'WTF Gyms — Velachery', city: 'Chennai', capacity: 1100, opens_at: '06:00', closes_at: '21:00' }
];

const gymDistribution = {
  'WTF Gyms — Lajpat Nagar': { count: 650, monthly: 50, quarterly: 30, annual: 20, active: 88 },
  'WTF Gyms — Connaught Place': { count: 550, monthly: 40, quarterly: 40, annual: 20, active: 85 },
  'WTF Gyms — Bandra West': { count: 750, monthly: 40, quarterly: 40, annual: 20, active: 90 },
  'WTF Gyms — Powai': { count: 600, monthly: 40, quarterly: 40, annual: 20, active: 87 },
  'WTF Gyms — Indiranagar': { count: 550, monthly: 40, quarterly: 40, annual: 20, active: 89 },
  'WTF Gyms — Koramangala': { count: 500, monthly: 40, quarterly: 40, annual: 20, active: 86 },
  'WTF Gyms — Banjara Hills': { count: 450, monthly: 50, quarterly: 30, annual: 20, active: 84 },
  'WTF Gyms — Sector 18 Noida': { count: 400, monthly: 60, quarterly: 25, annual: 15, active: 82 },
  'WTF Gyms — Salt Lake': { count: 300, monthly: 60, quarterly: 30, annual: 10, active: 80 },
  'WTF Gyms — Velachery': { count: 250, monthly: 60, quarterly: 30, annual: 10, active: 78 }
};

const planPrices = { monthly: 1499, quarterly: 3999, annual: 11999 };
const indianNames = ["Aarav", "Aanya", "Vivaan", "Diya", "Aditya", "Isha", "Arjun", "Kavya", "Sai", "Neha", "Rohan", "Riya", "Krishna", "Sneha", "Rahul", "Pooja", "Amit", "Anjali", "Karan", "Shruti", "Aryan", "Meera", "Kartik", "Tanvi", "Vishal", "Swati", "Siddharth", "Nidhi", "Manish", "Priya"];

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

async function seed() {
  console.log("Starting seed process...");

  // 1. Seed Gyms
  let { data: gyms, error: gymErr } = await supabase.from('gyms').select('*');
  if (gymErr) {
    console.error("Error fetching gyms:", gymErr.message);
    process.exit(1);
  }

  if (!gyms || gyms.length === 0) {
    const { data: newGyms, error: insErr } = await supabase.from('gyms').insert(gymsData).select();
    if (insErr) {
        console.error("Error inserting gyms:", insErr.message);
        process.exit(1);
    }
    gyms = newGyms;
    console.log("Inserted 10 gyms");
  } else {
    console.log("Gyms already seeded.");
  }

  // Check Members
  let { count: memberCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
  if (memberCount >= 5000) {
    console.log("Members already seeded. Trying to seed payments and checkins if missing...");
  } else {
    console.log("Seeding members...");
    let newMembers = [];
    let paymentsToInsert = [];
    
    for (const gym of gyms) {
      const dist = gymDistribution[gym.name];
      for (let i = 0; i < dist.count; i++) {
        // distribute plans
        const randPlan = Math.random() * 100;
        let plan_type = 'monthly';
        if (randPlan > dist.monthly && randPlan <= dist.monthly + dist.quarterly) plan_type = 'quarterly';
        else if (randPlan > dist.monthly + dist.quarterly) plan_type = 'annual';

        const status = Math.random() * 100 <= dist.active ? 'active' : 'inactive';
        let member_type = Math.random() <= 0.8 ? 'new' : 'renewal';
        
        let last_checkin_days = Math.floor(Math.random() * 30);
        if (status === 'active' && Math.random() < 0.06) last_checkin_days = 45 + Math.random() * 15; // 45-60
        if (status === 'active' && Math.random() < 0.03) last_checkin_days = 61 + Math.random() * 20; // >60

        const joinedDaysAgo = last_checkin_days + Math.floor(Math.random() * 60) + 30;
        
        const joined_at = generateDate(joinedDaysAgo);
        const last_checkin_at = generateDate(last_checkin_days);
        const plan_expires_at = generateDate(joinedDaysAgo - (plan_type === 'monthly' ? 30 : plan_type === 'quarterly' ? 90 : 365));

        const memberId = crypto.randomUUID();
        
        newMembers.push({
          id: memberId,
          gym_id: gym.id,
          name: randomChoice(indianNames) + ' ' + randomChoice(indianNames),
          plan_type,
          member_type,
          status,
          joined_at,
          plan_expires_at,
          last_checkin_at
        });

        const paymentJoinedAtDate = new Date(joined_at);
        paymentJoinedAtDate.setMinutes(paymentJoinedAtDate.getMinutes() + 5);
        paymentsToInsert.push({
          member_id: memberId,
          gym_id: gym.id,
          amount: planPrices[plan_type],
          plan_type,
          payment_type: 'new',
          paid_at: paymentJoinedAtDate.toISOString()
        });

        if (member_type === 'renewal') {
          const renewalDate = new Date(joined_at);
          renewalDate.setDate(renewalDate.getDate() + 30);
          paymentsToInsert.push({
            member_id: memberId,
            gym_id: gym.id,
            amount: planPrices[plan_type],
            plan_type,
            payment_type: 'renewal',
            paid_at: renewalDate.toISOString()
          });
        }
      }
    }

    const saltLake = gyms.find(g => g.name.includes('Salt Lake'));
    if (saltLake) {
        const membersSl = newMembers.filter(m => m.gym_id === saltLake.id);
        if(membersSl.length > 10){
          let sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          for(let k=0; k<10; k++){
            paymentsToInsert.push({
              member_id: membersSl[k].id,
              gym_id: saltLake.id,
              amount: 1500,
              plan_type: 'monthly',
              payment_type: 'renewal',
              paid_at: sevenDaysAgo.toISOString()
            });
          }
        }
    }

    for (let i = 0; i < newMembers.length; i += 1000) {
      await supabase.from('members').insert(newMembers.slice(i, i + 1000));
    }
    console.log("Inserted Members");

    for (let i = 0; i < paymentsToInsert.length; i += 1000) {
      await supabase.from('payments').insert(paymentsToInsert.slice(i, i + 1000));
    }
    console.log("Inserted Payments");
  }

  // Check Check-ins
  let { count: chkCount } = await supabase.from('checkins').select('*', { count: 'exact', head: true });
  if (chkCount >= 200000) {
    console.log("Checkins already exist.");
    return;
  }

  console.log("Generating 90 days of checkins...");
  const { data: members, error: memErr } = await supabase.from('members').select('id, gym_id').limit(10000);
  if (memErr || !members) {
      console.error("Failed to fetch members for checkin generation:", memErr?.message);
      process.exit(1);
  }
  
  let batch = [];
  const DAYS = 90;
  const now = new Date();

  function getMultiplier(hour, dow) {
    let t_mult = 1.0;
    if (hour >= 0 && hour < 5.5) t_mult = 0.0;
    else if (hour >= 5.5 && hour < 7) t_mult = 0.6;
    else if (hour >= 7 && hour < 10) t_mult = 1.0;
    else if (hour >= 10 && hour < 12) t_mult = 0.4;
    else if (hour >= 12 && hour < 14) t_mult = 0.3;
    else if (hour >= 14 && hour < 17) t_mult = 0.2;
    else if (hour >= 17 && hour < 21) t_mult = 0.9;
    else if (hour >= 21) t_mult = 0.35;
    
    let d_mult = 1.0;
    if (dow===2) d_mult = 0.95;
    if (dow===3) d_mult = 0.9;
    if (dow===4) d_mult = 0.95;
    if (dow===5) d_mult = 0.85;
    if (dow===6) d_mult = 0.7;
    if (dow===0) d_mult = 0.45;
    
    return t_mult * d_mult;
  }

  const gymConfigs = {
    'WTF Gyms — Bandra West': { openTarget: 285 },
    'WTF Gyms — Powai': { openTarget: 30 },
    'WTF Gyms — Lajpat Nagar': { openTarget: 20 },
    'WTF Gyms — Connaught Place': { openTarget: 20 },
    'WTF Gyms — Indiranagar': { openTarget: 20 },
    'WTF Gyms — Koramangala': { openTarget: 20 },
    'WTF Gyms — Banjara Hills': { openTarget: 10 },
    'WTF Gyms — Sector 18 Noida': { openTarget: 10 },
    'WTF Gyms — Salt Lake': { openTarget: 10 },
    'WTF Gyms — Velachery': { openTarget: 0 }
  };

  const gymMap = {};
  gyms.forEach(g => { gymMap[g.id] = {...g, ...gymConfigs[g.name]}; });

  let insertedCount = 0;
  for (let d = DAYS; d >= 0; d--) {
    const curDate = new Date();
    curDate.setDate(curDate.getDate() - d);
    const dow = curDate.getDay();

    for (let h = 0; h < 24; h++) {
      const mult = getMultiplier(h, dow);
      const hrCheckins = Math.floor(150 * mult);
      
      for(let i=0; i<hrCheckins; i++){
        const member = randomChoice(members);
        const checkinTime = new Date(curDate);
        checkinTime.setHours(h, Math.floor(Math.random()*60), 0);
        
        let isForcedOpen = false;
        if (d === 0 && h >= now.getHours() - 1 && h <= now.getHours() && gymMap[member.gym_id].openTarget > 0) {
             const randM = Math.random();
             if (randM < 0.2) {
                isForcedOpen = true;
                gymMap[member.gym_id].openTarget--;
             }
        }

        let checkoutTime = null;
        if (!isForcedOpen) {
          checkoutTime = new Date(checkinTime);
          checkoutTime.setMinutes(checkoutTime.getMinutes() + 45 + Math.floor(Math.random() * 45));
          if (checkoutTime > now && d === 0) checkoutTime = null;
        }

        if (gymMap[member.gym_id].name.includes('Velachery') && d === 0) {
             if (checkinTime > new Date(now.getTime() - 2.5 * 60 * 60 * 1000)) continue;
        }

        batch.push({
          member_id: member.id,
          gym_id: member.gym_id,
          checked_in: checkinTime.toISOString(),
          checked_out: checkoutTime ? checkoutTime.toISOString() : null
        });

        if (batch.length >= 1000) {
             await supabase.from('checkins').insert(batch);
             insertedCount += batch.length;
             batch = [];
        }
      }
    }
  }

  console.log("Seeding required open checkins...");
  for(const g_id of Object.keys(gymMap)){
     let rem = gymMap[g_id].openTarget;
     if(rem > 0 && !gymMap[g_id].name.includes('Velachery')){
         const gMembers = members.filter(m => m.gym_id === g_id);
         for(let i=0; i<rem; i++){
             const checkinTime = new Date();
             checkinTime.setMinutes(checkinTime.getMinutes() - Math.floor(Math.random()*60));
             const member = randomChoice(gMembers);
             if (!member) continue; // skip if no members for this gym
             batch.push({
               member_id: member.id,
               gym_id: g_id,
               checked_in: checkinTime.toISOString(),
               checked_out: null
             });
         }
     }
  }

  if (batch.length > 0) {
     await supabase.from('checkins').insert(batch);
     insertedCount += batch.length;
  }
  
  console.log(`Seeding complete! Inserted ${insertedCount} checkins.`);
}

seed().catch(err => console.error(err));
