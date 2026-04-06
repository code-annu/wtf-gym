import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import toast, { Toaster } from 'react-hot-toast';
import { AlertTriangle, X } from 'lucide-react';

const AnomalyToasts = () => {
  const { activeAnomalies, gyms } = useStore();

  useEffect(() => {
    // Show toast for new anomalies
    const fetchAnomalies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/anomalies`);
        const data = await res.json();
        useStore.getState().setAnomalies(data);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
      }
    };
    fetchAnomalies();
    
    // Auto-poll existing anomalies every 10s if needed, or rely on realtime
    const interval = setInterval(fetchAnomalies, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to changes in anomalies to show toasts
  useEffect(() => {
    if (activeAnomalies.length > 0) {
      const latest = activeAnomalies[0];
      // Only toast if it was detected recently (within last 30s)
      const detectedAt = new Date(latest.detected_at).getTime();
      const now = Date.now();
      if (now - detectedAt < 30000) {
        showAnomalyToast(latest);
      }
    }
  }, [activeAnomalies]);

  const showAnomalyToast = (anomaly) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-card-navy shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-500/50`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className={`p-2 rounded-lg ${anomaly.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                {anomaly.severity} ANOMALY DETECTED
              </p>
              <p className="mt-1 text-sm text-gray-400">
                {anomaly.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-800">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-right' });
  };

  return <Toaster />;
};

export default AnomalyToasts;
