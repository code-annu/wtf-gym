import { Play, Pause, RotateCw, FastForward } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

const SimulatorControls = () => {
  const { simulator, setSimulator } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Poll simulator status on mount
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/simulator/status`);
      const data = await res.json();
      setSimulator({ running: data.running, speed: data.speed });
    } catch (err) {
      console.error('Failed to fetch simulator status:', err);
    }
  };

  const startSimulator = async (speed) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/simulator/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed }),
      });
      const data = await res.json();
      setSimulator({ running: true, speed: data.speed });
    } catch (err) {
      console.error('Failed to start simulator:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopSimulator = async () => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/simulator/stop`, { method: 'POST' });
      setSimulator({ ...simulator, running: false });
    } catch (err) {
      console.error('Failed to stop simulator:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetSimulator = async () => {
    setLoading(true);
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/simulator/reset`, { method: 'POST' });
      setSimulator({ running: false, speed: 1 });
      // Reload page or reset occupancy locally if needed
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset simulator:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center bg-card-navy border border-gray-800 rounded-xl p-1.5 space-x-1 shadow-inner">
      {!simulator.running ? (
        <>
          <SpeedButton 
            icon={<Play size={14} />} 
            label="1x" 
            onClick={() => startSimulator(1)} 
            disabled={loading} 
            active={simulator.speed === 1}
          />
          <SpeedButton 
            icon={<FastForward size={14} />} 
            label="5x" 
            onClick={() => startSimulator(5)} 
            disabled={loading} 
            active={simulator.speed === 5}
          />
          <SpeedButton 
            icon={<FastForward size={14} className="scale-125" />} 
            label="10x" 
            onClick={() => startSimulator(10)} 
            disabled={loading} 
            active={simulator.speed === 10}
          />
        </>
      ) : (
        <button 
          onClick={stopSimulator}
          disabled={loading}
          className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
          title="Stop Simulator"
        >
          <Pause size={16} />
        </button>
      )}
      
      <div className="w-px h-6 bg-gray-800 mx-1"></div>
      
      <button 
        onClick={resetSimulator}
        disabled={loading}
        className="p-2 text-gray-500 hover:bg-navy hover:text-white rounded-lg transition-all"
        title="Reset Simulator"
      >
        <RotateCw size={16} />
      </button>
    </div>
  );
};

const SpeedButton = ({ icon, label, onClick, disabled, active }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-2 flex flex-col items-center justify-center rounded-lg transition-all min-w-[40px] ${
      active ? 'bg-accent-teal text-navy' : 'text-gray-400 hover:bg-navy hover:text-white'
    }`}
    title={`Start at ${label}`}
  >
    {icon}
    <span className="text-[8px] font-bold mt-0.5">{label}</span>
  </button>
);

export default SimulatorControls;
