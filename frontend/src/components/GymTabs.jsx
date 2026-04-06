import { useStore } from '../store/useStore';

const GymTabs = () => {
  const { gyms, selectedGymId, setSelectedGym } = useStore();

  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 custom-scrollbar">
      {gyms.map((gym) => (
        <button
          key={gym.id}
          onClick={() => setSelectedGym(gym.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            selectedGymId === gym.id
              ? 'bg-accent-teal text-navy'
              : 'bg-card-navy text-gray-400 border border-gray-800 hover:border-accent-teal hover:text-white'
          }`}
        >
          {gym.name.split(' — ')[1] || gym.name}
        </button>
      ))}
    </div>
  );
};

export default GymTabs;
