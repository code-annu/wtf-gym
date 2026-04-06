import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import GymTabs from '../components/GymTabs';
import { useRealtimeGym } from '../hooks/useRealtimeGym';
import { AlertTriangle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

const Anomalies = () => {
  const { activeAnomalies, gyms, setAnomalies } = useStore();
  const [loading, setLoading] = useState(true);

  useRealtimeGym();

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/anomalies`);
        const data = await res.json();
        setAnomalies(data);
      } catch (err) {
        console.error('Failed to fetch anomalies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, []);

  const dismissAnomaly = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/anomalies/${id}/dismiss`, {
        method: 'PATCH'
      });
      if (res.ok) {
        // Real-time will handle the update, but we can optimistically update
        useStore.getState().handleAnomalyEvent({ id, dismissed: true, resolved: false });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to dismiss');
      }
    } catch (err) {
      console.error('Failed to dismiss anomaly:', err);
    }
  };

  return (
    <div className="flex bg-background-navy min-h-screen text-white overflow-hidden">
      <Sidebar activeTab="Anomalies" />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Anomalies</h1>
            <p className="text-gray-400 mt-1">Review and manage active system critical events</p>
          </div>
          <div className="flex items-center space-x-2 bg-card-navy border border-gray-800 p-2 rounded-lg cursor-pointer hover:bg-navy transition-all">
            <Filter size={18} className="text-gray-400" />
            <span className="text-sm font-medium">Filter</span>
          </div>
        </div>

        <GymTabs />

        <div className="bg-card-navy rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-20 space-y-4 animate-pulse">
              <div className="h-12 bg-navy/50 rounded-lg w-full"></div>
              <div className="h-12 bg-navy/50 rounded-lg w-full"></div>
              <div className="h-12 bg-navy/50 rounded-lg w-full"></div>
            </div>
          ) : activeAnomalies.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">All Systems Normal</h3>
                <p className="text-gray-500">No active anomalies detected across the network.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-800 bg-navy/20">
                    <th className="p-4">Gym Location</th>
                    <th className="p-4">Anomaly Type</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Time Detected</th>
                    <th className="p-4">Message</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {activeAnomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="border-b border-gray-800 hover:bg-navy/10 transition-all group">
                      <td className="p-4 font-bold">{anomaly.gyms?.name || 'Unknown'}</td>
                      <td className="p-4">
                        <span className="bg-navy px-2 py-1 rounded text-xs border border-gray-800">
                          {anomaly.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 ${
                          anomaly.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          <AlertTriangle size={14} />
                          {anomaly.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {new Date(anomaly.detected_at).toLocaleString()}
                      </td>
                      <td className="p-4 max-w-xs truncate text-gray-300">
                        {anomaly.message}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => dismissAnomaly(anomaly.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            anomaly.severity === 'critical' 
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                              : 'bg-navy text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                          disabled={anomaly.severity === 'critical'}
                        >
                          Dismiss
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Anomalies;
