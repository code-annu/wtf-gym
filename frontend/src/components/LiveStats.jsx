import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveStats = ({ gym }) => {
  if (!gym) return null;

  const occupancyPct = Math.round((gym.live_occupancy / gym.capacity) * 100);
  const occupancyColor = occupancyPct >= 90 ? 'text-red-500' : occupancyPct >= 75 ? 'text-yellow-500' : 'text-accent-teal';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Live Occupancy Card */}
      <div className="bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between h-52">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-navy rounded-xl">
            <Users className="text-accent-teal" size={24} />
          </div>
          <span className={`text-sm font-bold px-2 py-1 bg-navy rounded-lg ${occupancyColor}`}>
            {occupancyPct}%
          </span>
        </div>
        <div>
          <span className="text-4xl font-extrabold tracking-tight">{gym.live_occupancy}</span>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-semibold">Live Occupancy</p>
        </div>
        <div className="w-full bg-navy h-2 rounded-full overflow-hidden mt-4">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${occupancyPct >= 90 ? 'bg-red-500' : occupancyPct >= 75 ? 'bg-yellow-500' : 'bg-accent-teal'}`}
            style={{ width: `${Math.min(100, occupancyPct)}%` }}
          ></div>
        </div>
      </div>

      {/* Today's Revenue Card */}
      <div className="bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between h-52">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-navy rounded-xl">
            <DollarSign className="text-accent-teal" size={24} />
          </div>
          <div className="flex items-center space-x-1 text-green-500 text-xs font-bold">
            <TrendingUp size={14} />
            <span>+12.5%</span>
          </div>
        </div>
        <div>
          <span className="text-4xl font-extrabold tracking-tight">₹{(gym.today_revenue || 0).toLocaleString()}</span>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-wider font-semibold">Today's Revenue</p>
        </div>
        <div className="mt-4 flex space-x-2">
            <div className="flex-1 h-1 bg-navy rounded-full overflow-hidden">
                <div className="bg-accent-teal h-full w-[60%]"></div>
            </div>
            <div className="flex-1 h-1 bg-navy rounded-full overflow-hidden">
                <div className="bg-accent-teal h-full w-[40%]opacity-50"></div>
            </div>
        </div>
      </div>

      {/* Placeholder for small charts or secondary KPIs */}
      <div className="md:col-span-2 bg-card-navy p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Occupancy Trend (Last 6h)</h3>
          <Calendar className="text-gray-500" size={18} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4C8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00D4C8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D4A" vertical={false} />
              <XAxis dataKey="time" stroke="#666" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', borderColor: '#2D2D4A', borderRadius: '8px' }}
                itemStyle={{ color: '#00D4C8' }}
              />
              <Area type="monotone" dataKey="value" stroke="#00D4C8" strokeWidth={3} fillOpacity={1} fill="url(#colorOcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const mockChartData = [
  { time: '10 AM', value: 120 },
  { time: '11 AM', value: 180 },
  { time: '12 PM', value: 250 },
  { time: '1 PM', value: 210 },
  { time: '2 PM', value: 160 },
  { time: '3 PM', value: 220 },
  { time: '4 PM', value: 340 },
];

export default LiveStats;
