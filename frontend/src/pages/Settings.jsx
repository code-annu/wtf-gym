import Sidebar from '../components/Sidebar';
import { Settings as SettingsIcon, Save, Bell, Shield, Database } from 'lucide-react';

const Settings = () => {
  return (
    <div className="flex bg-background-navy min-h-screen text-white overflow-hidden text-sm">
      <Sidebar activeTab="Settings" />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Platform Settings</h1>
          <p className="text-gray-400">Configure global gym intelligence parameters and system notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card-navy p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Bell className="text-accent-teal" size={20} />
                  Notification Thresholds
                </h3>
              </div>
              
              <div className="space-y-6">
                <ThresholdItem label="Capacity Breach Alert (%)" value="90" min="50" max="100" />
                <ThresholdItem label="Revenue Drop Alert (%)" value="50" min="10" max="90" />
                <ThresholdItem label="Inactivity Alert (Days)" value="45" min="7" max="365" />
              </div>
            </section>

            <section className="bg-card-navy p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
               <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Shield className="text-accent-teal" size={20} />
                  Access Control
                </h3>
              </div>
              <p className="text-gray-500 italic">User management is handled through Supabase Auth dashboard.</p>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-accent-teal/10 p-6 rounded-3xl border border-accent-teal/20 space-y-4">
              <h4 className="font-bold text-accent-teal flex items-center gap-2">
                <Database size={18} />
                System Status
              </h4>
              <div className="space-y-2">
                <StatusItem label="Supabase DB" status="Operational" />
                <StatusItem label="Realtime Engine" status="Operational" />
                <StatusItem label="Anomaly Cron" status="Active" />
              </div>
              <button className="w-full bg-accent-teal text-navy font-bold py-3 rounded-xl mt-4 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ThresholdItem = ({ label, value, min, max }) => (
  <div className="flex flex-col space-y-2">
    <div className="flex justify-between items-center">
      <span className="font-semibold text-gray-300">{label}</span>
      <span className="text-accent-teal font-extrabold">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      defaultValue={value}
      className="w-full h-1 bg-navy rounded-lg appearance-none cursor-pointer accent-accent-teal"
    />
  </div>
);

const StatusItem = ({ label, status }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-gray-400">{label}</span>
    <span className="text-green-500 font-bold">{status}</span>
  </div>
);

export default Settings;
