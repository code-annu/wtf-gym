import { useStore } from '../store/useStore';
import { Users, DollarSign, AlertTriangle, Zap } from 'lucide-react';

const SummaryBar = () => {
  const { gyms, activeAnomalies } = useStore();

  const totalOccupancy = gyms.reduce((sum, gym) => sum + (gym.live_occupancy || 0), 0);
  const totalCapacity = gyms.reduce((sum, gym) => sum + (gym.capacity || 0), 0);
  const totalRevenue = gyms.reduce((sum, gym) => sum + (gym.today_revenue || 0), 0);
  
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard 
        icon={<Users size={16} className="text-accent-teal" />}
        label="Ntwk Occupancy"
        value={totalOccupancy.toLocaleString()}
        subValue={`${occupancyPct}% of capacity`}
      />
      <SummaryCard 
        icon={<DollarSign size={16} className="text-accent-teal" />}
        label="Ntwk Revenue (Today)"
        value={`₹${totalRevenue.toLocaleString()}`}
        subValue="Live updates tracking"
      />
      <SummaryCard 
        icon={<AlertTriangle size={16} className={activeAnomalies.length > 0 ? "text-red-500" : "text-green-500"} />}
        label="Active Anomalies"
        value={activeAnomalies.length.toString()}
        subValue={activeAnomalies.length > 0 ? "Requires attention" : "System normal"}
      />
      <SummaryCard 
        icon={<Zap size={16} className="text-accent-teal" />}
        label="Active Gyms"
        value={gyms.filter(g => g.status === 'active').length.toString()}
        subValue="All nodes reporting"
      />
    </div>
  );
};

const SummaryCard = ({ icon, label, value, subValue }) => (
  <div className="bg-card-navy/50 border border-gray-800 p-4 rounded-xl flex items-center space-x-4">
    <div className="bg-navy p-2.5 rounded-lg border border-gray-800">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5">{label}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-xl font-bold tracking-tight text-white">{value}</span>
        <span className="text-[10px] text-gray-400 truncate">{subValue}</span>
      </div>
    </div>
  </div>
);

export default SummaryBar;
