import React, { createContext, useContext } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Player, Injury, Evaluation, GPSData, Statistics } from '@/types';

interface DataContextType {
  // Data
  players: Player[];
  injuries: Injury[];
  evaluations: Evaluation[];
  gpsData: GPSData[];
  statistics: Statistics[];
  lastUpdate: string | null;
  
  // Player methods
  addPlayer: (player: Player) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  getPlayerById: (id: string) => Player | undefined;
  getPlayerByName: (name: string) => Player | undefined;
  
  // Injury methods
  addInjury: (injury: Injury) => void;
  updateInjury: (id: string, injury: Partial<Injury>) => void;
  removeInjury: (id: string) => void;
  getInjuriesByPlayer: (playerId: string) => Injury[];
  getActiveInjuries: () => Injury[];
  
  // Evaluation methods
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void;
  removeEvaluation: (id: string) => void;
  getEvaluationsByPlayer: (playerId: string) => Evaluation[];
  getLatestEvaluationByPlayer: (playerId: string) => Evaluation | undefined;
  
  // GPS methods
  addGPSData: (gpsData: GPSData) => void;
  updateGPSData: (id: string, gpsData: Partial<GPSData>) => void;
  removeGPSData: (id: string) => void;
  getGPSDataByPlayer: (playerId: string) => GPSData[];
  
  // Statistics methods
  addStatistics: (statistics: Statistics) => void;
  updateStatistics: (id: string, statistics: Partial<Statistics>) => void;
  removeStatistics: (id: string) => void;
  getStatisticsByPlayer: (playerId: string) => Statistics | undefined;
  
  // Utility methods
  clearAllData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    players,
    injuries,
    evaluations,
    gpsData,
    statistics,
    lastUpdate,
    addPlayer,
    updatePlayer,
    removePlayer,
    addInjury,
    updateInjury,
    removeInjury,
    addEvaluation,
    updateEvaluation,
    removeEvaluation,
    addGPSData,
    updateGPSData,
    removeGPSData,
    addStatistics,
    updateStatistics,
    removeStatistics,
    clearAllData,
  } = useDataStore();

  // Player utility methods
  const getPlayerById = (id: string): Player | undefined => {
    return players.find(p => p.id === id);
  };

  const getPlayerByName = (name: string): Player | undefined => {
    return players.find(p => p.nome.toLowerCase() === name.toLowerCase());
  };

  // Injury utility methods
  const getInjuriesByPlayer = (playerId: string): Injury[] => {
    return injuries.filter(i => i.id_atleta === playerId || i.nome === playerId);
  };

  const getActiveInjuries = (): Injury[] => {
    return injuries.filter(i => i.status === 'Ativo');
  };

  // Evaluation utility methods
  const getEvaluationsByPlayer = (playerId: string): Evaluation[] => {
    return evaluations.filter(e => e.id_atleta === playerId || e.nome === playerId);
  };

  const getLatestEvaluationByPlayer = (playerId: string): Evaluation | undefined => {
    const playerEvaluations = getEvaluationsByPlayer(playerId);
    if (playerEvaluations.length === 0) return undefined;
    
    return playerEvaluations.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
  };

  // GPS utility methods
  const getGPSDataByPlayer = (playerId: string): GPSData[] => {
    return gpsData.filter(g => g.id_atleta === playerId || g.nome === playerId);
  };

  // Statistics utility methods
  const getStatisticsByPlayer = (playerId: string): Statistics | undefined => {
    return statistics.find(s => s.id_atleta === playerId || s.nome === playerId);
  };

  const value: DataContextType = {
    // Data
    players,
    injuries,
    evaluations,
    gpsData,
    statistics,
    lastUpdate,
    
    // Player methods
    addPlayer,
    updatePlayer,
    removePlayer,
    getPlayerById,
    getPlayerByName,
    
    // Injury methods
    addInjury,
    updateInjury,
    removeInjury,
    getInjuriesByPlayer,
    getActiveInjuries,
    
    // Evaluation methods
    addEvaluation,
    updateEvaluation,
    removeEvaluation,
    getEvaluationsByPlayer,
    getLatestEvaluationByPlayer,
    
    // GPS methods
    addGPSData,
    updateGPSData,
    removeGPSData,
    getGPSDataByPlayer,
    
    // Statistics methods
    addStatistics,
    updateStatistics,
    removeStatistics,
    getStatisticsByPlayer,
    
    // Utility methods
    clearAllData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 