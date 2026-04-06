import { create } from 'zustand';

export const useStore = create((set, get) => ({
  gyms: [],
  selectedGymId: null,
  liveActivities: [],
  activeAnomalies: [],
  simulator: { running: false, speed: 1 },
  connectionStatus: 'disconnected',

  setGyms: (gyms) => set({ gyms }),
  setSelectedGym: (id) => set({ selectedGymId: id }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updateGymOccupancy: (gymId, change) => set((state) => ({
    gyms: state.gyms.map(g => g.id === gymId ? { ...g, live_occupancy: Math.max(0, g.live_occupancy + change) } : g)
  })),

  updateGymRevenue: (gymId, amount) => set((state) => ({
    gyms: state.gyms.map(g => g.id === gymId ? { ...g, today_revenue: (g.today_revenue || 0) + Number(amount) } : g)
  })),

  addActivity: (activity) => set((state) => ({
    liveActivities: [activity, ...state.liveActivities].slice(0, 50)
  })),

  setAnomalies: (anomalies) => set({ activeAnomalies: anomalies }),
  
  handleAnomalyEvent: (anomaly) => set((state) => {
    if (anomaly.resolved || anomaly.dismissed) {
      return { activeAnomalies: state.activeAnomalies.filter(a => a.id !== anomaly.id) };
    }
    const exists = state.activeAnomalies.find(a => a.id === anomaly.id);
    if (exists) {
      return { activeAnomalies: state.activeAnomalies.map(a => a.id === anomaly.id ? anomaly : a) };
    }
    return { activeAnomalies: [anomaly, ...state.activeAnomalies] };
  }),

  setSimulator: (simulator) => set({ simulator }),
}));
