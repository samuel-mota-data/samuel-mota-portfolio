import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '@/context/DataContext';

interface RSIData {
  date: string;
  rsiScore: number;
  propulsiveForce: number;
  zScore: number;
  playerLoad?: number;
  distancia?: number;
  sprints?: number;
}

interface RSIAnalysisProps {
  selectedAthlete: string;
}

const RSIAnalysis: React.FC<RSIAnalysisProps> = ({ selectedAthlete }) => {
  const { players, gpsData } = useData();

  // Gerar dados RSI simulados baseados nos dados GPS
  const rsiData = useMemo(() => {
    if (!selectedAthlete) return [];
    const athleteGPSData = gpsData.filter(g => g.id_atleta.toString() === selectedAthlete);
    return athleteGPSData.map((data) => {
      const baseRSI = Math.random() * 2 - 1; // -1 a 1
      const propulsiveForce = data.playerLoad || 200 + Math.random() * 30;
      return {
        date: new Date(data.data).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        rsiScore: baseRSI,
        propulsiveForce: propulsiveForce,
        zScore: baseRSI,
        playerLoad: data.playerLoad,
        distancia: data.distancia,
        sprints: data.sprints
      };
    }).slice(0, 8);
  }, [selectedAthlete, gpsData]);

  // Função para determinar cor baseada na força propulsiva
  const getBarColor = (propulsiveForce: number) => {
    if (propulsiveForce < 200) return '#dc2626'; // Vermelho
    if (propulsiveForce < 210) return '#ea580c'; // Laranja
    if (propulsiveForce < 220) return '#facc15'; // Amarelo
    if (propulsiveForce < 230) return '#65a30d'; // Verde claro
    return '#16a34a'; // Verde escuro
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Data: ${label || '-'}`}</p>
          <p className="text-blue-600">
            {`RSI (Z-Score): ${data.rsiScore !== undefined ? data.rsiScore.toFixed(2) : '-'}`}
          </p>
          <p className="text-gray-600">
            {`Força Propulsiva: ${data.propulsiveForce !== undefined ? data.propulsiveForce.toFixed(1) : '-'}`}
          </p>
          <p className="text-gray-600">
            {`Player Load: ${data.playerLoad !== undefined ? data.playerLoad : '-'}`}
          </p>
          <p className="text-gray-600">
            {`Distância: ${data.distancia !== undefined ? data.distancia + 'm' : '-'}`}
          </p>
          <p className="text-gray-600">
            {`Sprints: ${data.sprints !== undefined ? data.sprints : '-'}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const selectedPlayer = players.find(p => p.id.toString() === selectedAthlete);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            RSI (Z-Score) do Atleta ao Longo do Tempo (Cores: Força Propulsiva)
            {selectedPlayer && (
              <span className="text-base font-normal text-gray-600 ml-4">
                - {selectedPlayer.nome}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedAthlete ? (
            <div className="space-y-4">
              {/* Legenda de cores */}
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  <span>{'< 200'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  <span>200-210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>210-220</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>220-230</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span>{'> 230'}</span>
                </div>
              </div>

              {/* Gráfico */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={rsiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[-1.5, 2.5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'RSI Diário (Z-Score)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rsiScore" radius={[4, 4, 0, 0]}>
                    {rsiData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.propulsiveForce)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Estatísticas resumidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {rsiData.length}
                  </p>
                  <p className="text-sm text-gray-600">Sessões Analisadas</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {rsiData.filter(d => d.rsiScore > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">RSI Positivo</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {rsiData.length > 0 ? (rsiData.reduce((acc, d) => acc + (d.propulsiveForce || 0), 0) / rsiData.length).toFixed(1) : '-'}
                  </p>
                  <p className="text-sm text-gray-600">Força Média</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {rsiData.length > 0 ? (rsiData.reduce((acc, d) => acc + (d.rsiScore || 0), 0) / rsiData.length).toFixed(2) : '-'}
                  </p>
                  <p className="text-sm text-gray-600">RSI Médio</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Selecione um atleta no topo para visualizar a análise RSI
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RSIAnalysis; 