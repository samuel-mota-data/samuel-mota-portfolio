import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectTrigger } from '@/components/ui/select';
import RSIAnalysis from '@/components/sections/RSIAnalysis';
import PerformanceRadar from '@/components/sections/PerformanceRadar';
import CargaTreinamento from '@/components/sections/CargaTreinamento';
import LesoesDashboard from '@/components/sections/LesoesDashboard';
import CSVManager from '@/components/CSVManager';
import { useData } from '@/context/DataContext';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  AlertTriangle,
  BarChart3,
  Radar,
  Timer,
  Heart,
  User
} from 'lucide-react';

type DashboardTab = 'overview' | 'rsi' | 'performance' | 'training' | 'injuries';

const AdvancedDashboard = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const { players } = useData();

  const tabs = [
    {
      id: 'overview' as DashboardTab,
      name: 'Visão Geral',
      icon: BarChart3,
      description: 'Dashboard principal com métricas consolidadas'
    },
    {
      id: 'rsi' as DashboardTab,
      name: 'Análise RSI',
      icon: TrendingUp,
      description: 'Rate of Strain Index - Análise temporal de estresse'
    },
    {
      id: 'performance' as DashboardTab,
      name: 'Performance Radar',
      icon: Target,
      description: 'Comparação de performance vs mediana do time'
    },
    {
      id: 'training' as DashboardTab,
      name: 'Carga de Treinamento',
      icon: Timer,
      description: 'Monitoramento de velocidades e desacelerações'
    },
    {
      id: 'injuries' as DashboardTab,
      name: 'Dashboard de Lesões',
      icon: AlertTriangle,
      description: 'Análise e monitoramento de lesões'
    }
  ];

  const selectedPlayer = players.find(p => p.id.toString() === selectedAthlete);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rsi':
        return <RSIAnalysis selectedAthlete={selectedAthlete} />;
      case 'performance':
        return <PerformanceRadar selectedAthlete={selectedAthlete} />;
      case 'training':
        return <CargaTreinamento selectedAthlete={selectedAthlete} />;
      case 'injuries':
        return <LesoesDashboard selectedAthlete={selectedAthlete} />;
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Upload de CSVs */}
            <CSVManager />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Navigation and Athlete Selection */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard Avançado ⚽</h1>
          
          {/* Navigation tabs and Athlete Selector */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </Button>
                );
              })}
            </div>

            {/* Athlete Selector */}
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <div className="min-w-0 flex-1 lg:min-w-[280px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atleta Selecionado
                </label>
                <SelectTrigger 
                  className="w-full"
                  value={selectedAthlete}
                  onChange={(e) => setSelectedAthlete(e.target.value)}
                >
                  <option value="">Todos os atletas</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id.toString()}>
                      {player.nome} - {player.posicao} {player.numero && `#${player.numero}`}
                    </option>
                  ))}
                </SelectTrigger>
              </div>
            </div>
          </div>

          {/* Selected Athlete Info */}
          {selectedPlayer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedPlayer.nome.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">
                    {selectedPlayer.nome}
                  </h3>
                  <p className="text-blue-700">
                    {selectedPlayer.posicao} 
                    {selectedPlayer.numero && ` • #${selectedPlayer.numero}`}
                    {selectedPlayer.idade && ` • ${selectedPlayer.idade} anos`}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAthlete('')}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdvancedDashboard; 