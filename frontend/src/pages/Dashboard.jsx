import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useRealtimeGym } from '../hooks/useRealtimeGym';
import Sidebar from '../components/Sidebar';
import GymTabs from '../components/GymTabs';
import LiveStats from '../components/LiveStats';
import ActivityFeed from '../components/ActivityFeed';
import SummaryBar from '../components/SummaryBar';
import AnomalyToasts from '../components/AnomalyToasts';
import SimulatorControls from '../components/SimulatorControls';

const Dashboard = () => {
  const { gyms, setGyms, selectedGymId, setSelectedGym, connectionStatus } = useStore();
  const [loading, setLoading] = useState(true);

  useRealtimeGym();

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gyms`);
        const data = await res.json();
        setGyms(data);
        if (data.length > 0 && !selectedGymId) {
          setSelectedGym(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch gyms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGyms();
  }, []);

  const selectedGym = gyms.find(g => g.id === selectedGymId);

  return (
    <div className="flex bg-background-navy min-h-screen text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gym LivePulse</h1>
            <p className="text-gray-400 mt-1">Real-time gym intelligence dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 pulse-green' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">{connectionStatus.toUpperCase()}</span>
            <SimulatorControls />
          </div>
        </div>

        <SummaryBar />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 h-64 bg-card-navy rounded-xl"></div>
            <div className="h-64 bg-card-navy rounded-xl"></div>
          </div>
        ) : (
          <>
            <GymTabs />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <LiveStats gym={selectedGym} />
              </div>
              <div className="space-y-6">
                <ActivityFeed />
              </div>
            </div>
          </>
        )}
      </main>
      <AnomalyToasts />
    </div>
  );
};

export default Dashboard;
