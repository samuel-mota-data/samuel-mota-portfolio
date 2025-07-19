import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Injury, Evaluation, GPSData, Statistics } from '@/types';

interface DataState {
  players: Player[];
  injuries: Injury[];
  evaluations: Evaluation[];
  gpsData: GPSData[];
  statistics: Statistics[];
  lastUpdate: string | null;
  
  // Players
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  
  // Injuries
  setInjuries: (injuries: Injury[]) => void;
  addInjury: (injury: Injury) => void;
  updateInjury: (id: string, injury: Partial<Injury>) => void;
  removeInjury: (id: string) => void;
  
  // Evaluations
  setEvaluations: (evaluations: Evaluation[]) => void;
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void;
  removeEvaluation: (id: string) => void;
  
  // GPS Data
  setGPSData: (gpsData: GPSData[]) => void;
  addGPSData: (gpsData: GPSData) => void;
  updateGPSData: (id: string, gpsData: Partial<GPSData>) => void;
  removeGPSData: (id: string) => void;
  
  // Statistics
  setStatistics: (statistics: Statistics[]) => void;
  addStatistics: (statistics: Statistics) => void;
  updateStatistics: (id: string, statistics: Partial<Statistics>) => void;
  removeStatistics: (id: string) => void;
  
  // Utility methods
  clearAllData: () => void;
  updateLastUpdate: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      players: [],
      injuries: [],
      evaluations: [],
      gpsData: [],
      statistics: [],
      lastUpdate: null,
      
      // Players
      setPlayers: (players) => set({ players, lastUpdate: new Date().toISOString() }),
      addPlayer: (player) => set((state) => ({
        players: [...state.players, player],
        lastUpdate: new Date().toISOString()
      })),
      updatePlayer: (id, playerUpdate) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...playerUpdate } : p),
        lastUpdate: new Date().toISOString()
      })),
      removePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id),
        lastUpdate: new Date().toISOString()
      })),
      
      // Injuries
      setInjuries: (injuries) => set({ injuries, lastUpdate: new Date().toISOString() }),
      addInjury: (injury) => set((state) => ({
        injuries: [...state.injuries, injury],
        lastUpdate: new Date().toISOString()
      })),
      updateInjury: (id, injuryUpdate) => set((state) => ({
        injuries: state.injuries.map(i => i.id === id ? { ...i, ...injuryUpdate } : i),
        lastUpdate: new Date().toISOString()
      })),
      removeInjury: (id) => set((state) => ({
        injuries: state.injuries.filter(i => i.id !== id),
        lastUpdate: new Date().toISOString()
      })),
      
      // Evaluations
      setEvaluations: (evaluations) => set({ evaluations, lastUpdate: new Date().toISOString() }),
      addEvaluation: (evaluation) => set((state) => ({
        evaluations: [...state.evaluations, evaluation],
        lastUpdate: new Date().toISOString()
      })),
      updateEvaluation: (id, evaluationUpdate) => set((state) => ({
        evaluations: state.evaluations.map(e => e.id === id ? { ...e, ...evaluationUpdate } : e),
        lastUpdate: new Date().toISOString()
      })),
      removeEvaluation: (id) => set((state) => ({
        evaluations: state.evaluations.filter(e => e.id !== id),
        lastUpdate: new Date().toISOString()
      })),
      
      // GPS Data
      setGPSData: (gpsData) => set({ gpsData, lastUpdate: new Date().toISOString() }),
      addGPSData: (gpsData) => set((state) => ({
        gpsData: [...state.gpsData, gpsData],
        lastUpdate: new Date().toISOString()
      })),
      updateGPSData: (id, gpsDataUpdate) => set((state) => ({
        gpsData: state.gpsData.map(g => g.id === id ? { ...g, ...gpsDataUpdate } : g),
        lastUpdate: new Date().toISOString()
      })),
      removeGPSData: (id) => set((state) => ({
        gpsData: state.gpsData.filter(g => g.id !== id),
        lastUpdate: new Date().toISOString()
      })),
      
      // Statistics
      setStatistics: (statistics) => set({ statistics, lastUpdate: new Date().toISOString() }),
      addStatistics: (statistics) => set((state) => ({
        statistics: [...state.statistics, statistics],
        lastUpdate: new Date().toISOString()
      })),
      updateStatistics: (id, statisticsUpdate) => set((state) => ({
        statistics: state.statistics.map(s => s.id === id ? { ...s, ...statisticsUpdate } : s),
        lastUpdate: new Date().toISOString()
      })),
      removeStatistics: (id) => set((state) => ({
        statistics: state.statistics.filter(s => s.id !== id),
        lastUpdate: new Date().toISOString()
      })),
      
      // Utility methods
      clearAllData: () => set({
        players: [],
        injuries: [],
        evaluations: [],
        gpsData: [],
        statistics: [],
        lastUpdate: new Date().toISOString()
      }),
      updateLastUpdate: () => set({ lastUpdate: new Date().toISOString() })
    }),
    {
      name: 'football-data-store',
      version: 1,
    }
  )
); 