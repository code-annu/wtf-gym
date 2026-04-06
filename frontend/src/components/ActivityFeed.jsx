import { useStore } from '../store/useStore';
import { LogIn, LogOut, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  const { liveActivities, gyms } = useStore();

  const getGymName = (id) => {
    const gym = gyms.find((g) => g.id === id);
    return gym ? gym.name.split(' — ')[1] || gym.name : 'Gym';
  };

  return (
    <div className="bg-card-navy rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col h-[524px]">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-navy/20">
        <h3 className="font-extrabold text-lg flex items-center gap-2">
          <ActivityIcon />
          Live Activity Feed
        </h3>
        <span className="text-xs font-bold text-accent-teal uppercase bg-accent-teal/10 px-2 py-1 rounded">Real-time</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {liveActivities.length === 0 ? (
          <div className="text-center py-20 text-gray-500 italic">
            Waiting for activity...
          </div>
        ) : (
          liveActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <IconWrapper type={activity.type} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold truncate text-white">
                    {getMessage(activity, getGymName(activity.gym_id))}
                  </p>
                  <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(activity.time)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{getGymName(activity.gym_id)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-teal">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const IconWrapper = ({ type }) => {
  const colors = {
    CHECKIN: 'bg-green-500/10 text-green-500',
    CHECKOUT: 'bg-orange-500/10 text-orange-500',
    PAYMENT: 'bg-accent-teal/10 text-accent-teal',
  };

  const icons = {
    CHECKIN: <LogIn size={16} />,
    CHECKOUT: <LogOut size={16} />,
    PAYMENT: <CreditCard size={16} />,
  };

  return (
    <div className={`p-2 rounded-lg ${colors[type]}`}>
      {icons[type]}
    </div>
  );
};

const getMessage = (activity, gymName) => {
  switch (activity.type) {
    case 'CHECKIN':
      return `Member checked in`;
    case 'CHECKOUT':
      return `Member checked out`;
    case 'PAYMENT':
      return `Payment received: ₹${Number(activity.amount).toLocaleString()}`;
    default:
      return 'Activity detected';
  }
};

const formatTime = (time) => {
  try {
    const d = new Date(time);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return '00:00:00';
  }
};

export default ActivityFeed;
