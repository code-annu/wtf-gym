import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import GymTabs from '../components/GymTabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingDown, Users, PieChart as PieChartIcon, Calendar } from 'lucide-react';

const Analytics = () => {
  const { selectedGymId, gyms } = useStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedGymId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/gyms/${selectedGymId}/analytics`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedGymId]);

  const selectedGym = gyms.find(g => g.id === selectedGymId);

  return (
    <div className="flex bg-background-navy min-h-screen text-white overflow-hidden">
      <Sidebar activeTab="Analytics" />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Engine</h1>
            <p className="text-gray-400 mt-1">Deep insights for {selectedGym?.name || 'Loading...'}</p>
          </div>
        </div>

        <GymTabs />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="h-80 bg-card-navy rounded-xl"></div>
            <div className="h-80 bg-card-navy rounded-xl"></div>
            <div className="h-80 bg-card-navy rounded-xl"></div>
            <div className="h-80 bg-card-navy rounded-xl"></div>
          </div>
        ) : data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heatmap Placeholder (using BarChart for now as per simple Recharts logic) */}
            <div className="bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-accent-teal" />
                Hourly Traffic Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatHeatmap(data.heatmap)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D2D4A" vertical={false} />
                    <XAxis dataKey="hour" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2D2D4A' }} />
                    <Bar dataKey="checkins" fill="#00D4C8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue By Plan */}
            <div className="bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <PieChartIcon size={18} className="text-accent-teal" />
                Revenue Breakdown (30d)
              </h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatRevenue(data.revenueByPlan)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {formatRevenue(data.revenueByPlan).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2D2D4A' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Churn Risk Table */}
            <div className="lg:col-span-2 bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-red-500">
                <TrendingDown size={18} />
                High Churn Risk (Inactive {'>'} 45 Days)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-800">
                      <th className="pb-3">Member Name</th>
                      <th className="pb-3">Last Check-in</th>
                      <th className="pb-3 text-right">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {data.churnRisk.length === 0 ? (
                      <tr><td colSpan="3" className="py-8 text-center text-gray-500">No high risk members found.</td></tr>
                    ) : (
                      data.churnRisk.slice(0, 10).map((member) => (
                        <tr key={member.id} className="border-b border-gray-800 hover:bg-navy/20 cursor-pointer transition-all">
                          <td className="py-4">{member.name}</td>
                          <td className="py-4">{new Date(member.last_checkin_at).toLocaleDateString()}</td>
                          <td className="py-4 text-right">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                               getRiskLevel(member.last_checkin_at) === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                             }`}>
                               {getRiskLevel(member.last_checkin_at)}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const COLORS = ['#00D4C8', '#00BFA5', '#009688'];

const formatHeatmap = (heatmap) => {
  // Aggregate by hour for a simpler display
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, checkins: 0 }));
  heatmap.forEach(h => {
    hours[h.hour_of_day].checkins += parseInt(h.checkin_count);
  });
  return hours;
};

const formatRevenue = (rev) => {
  return Object.entries(rev).map(([name, value]) => ({ name: name.toUpperCase(), value }));
};

const getRiskLevel = (date) => {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 60 ? 'CRITICAL' : 'HIGH';
};

export default Analytics;
