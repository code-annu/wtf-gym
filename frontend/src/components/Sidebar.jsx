import { Activity, BarChart, AlertTriangle, Settings, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const { activeAnomalies } = useStore();
  const alertCount = activeAnomalies.length;

  return (
    <aside className="w-64 bg-card-navy border-r border-gray-800 flex flex-col p-6 space-y-8 min-h-screen">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-accent-teal rounded-lg flex items-center justify-center">
          <Activity className="text-navy font-bold" />
        </div>
        <span className="text-xl font-extrabold text-accent-teal uppercase tracking-tighter">WTF PULSE</span>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem to="/" icon={<Activity size={20} />} label="Dashboard" />
        <NavItem to="/analytics" icon={<BarChart size={20} />} label="Analytics" />
        <NavItem to="/anomalies" icon={<AlertTriangle size={20} />} label="Anomalies" badge={alertCount > 0 ? alertCount : null} />
        <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
      </nav>

      <div className="mt-auto space-y-4 pt-8 border-t border-gray-800">
        <div className="p-3 bg-navy/30 rounded-xl border border-gray-800 flex items-center gap-3 cursor-help hover:border-gray-600 transition-all">
          <HelpCircle size={20} className="text-gray-500" />
          <span className="text-xs font-semibold text-gray-500">Live Documentation</span>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center justify-between p-3 rounded-xl transition-all duration-300
      ${isActive ? 'bg-accent-teal text-navy shadow-lg shadow-accent-teal/10' : 'text-gray-400 hover:bg-navy hover:text-white'}
    `}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className="font-bold tracking-tight">{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
        {badge}
      </span>
    )}
  </NavLink>
);

export default Sidebar;
