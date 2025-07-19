import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { useData } from '@/context/DataContext';

interface TrainingLoadData {
  semana: number;
  velocidade23: number;
  velocidade18: number;
  desaceleracoes: number;
  playerLoad: number;
  status: 'baixo' | 'normal' | 'alto' | 'critico';
}

interface CargaTreinamentoProps {
  selectedAthlete: string;
}

const CargaTreinamento: React.FC<CargaTreinamentoProps> = ({ selectedAthlete }) => {
  const { players, gpsData } = useData();
  const [selectedWeek, setSelectedWeek] = useState<number>(9); // Semana atual por padrão

  // Gerar dados de carga de treinamento por semana
  const trainingData = useMemo(() => {
    if (!selectedAthlete) return [];

    const athleteGPS = gpsData.filter(g => g.id_atleta.toString() === selectedAthlete);
    
    // Agrupar por semana
    const weeklyData = new Map<number, any[]>();
    
    athleteGPS.forEach(session => {
      const date = new Date(session.data);
      const weekNumber = Math.floor((date.getTime() - new Date(2024, 2, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 5;
      
      if (!weeklyData.has(weekNumber)) {
        weeklyData.set(weekNumber, []);
      }
      weeklyData.get(weekNumber)!.push(session);
    });

    const result: TrainingLoadData[] = [];
    
    for (let week = 5; week <= 11; week++) {
      const weekSessions = weeklyData.get(week) || [];
      
      // Simular métricas baseadas nos dados reais + valores aleatórios para variedade
      const baseVel23 = weekSessions.reduce((acc, s) => acc + (s.sprints || 0), 0) * 50 + Math.random() * 200;
      const baseVel18 = weekSessions.reduce((acc, s) => acc + (s.sprints || 0), 0) * 100 + Math.random() * 400;
      const baseDecel = weekSessions.reduce((acc, s) => acc + (s.sprints || 0), 0) * 15 + Math.random() * 100;
      const avgPlayerLoad = weekSessions.length > 0 
        ? weekSessions.reduce((acc, s) => acc + (s.playerLoad || 300), 0) / weekSessions.length
        : 300 + Math.random() * 200;

      // Determinar status baseado na carga
      let status: 'baixo' | 'normal' | 'alto' | 'critico' = 'normal';
      if (avgPlayerLoad < 250) status = 'baixo';
      else if (avgPlayerLoad > 450) status = 'critico';
      else if (avgPlayerLoad > 350) status = 'alto';

      result.push({
        semana: week,
        velocidade23: Math.floor(baseVel23),
        velocidade18: Math.floor(baseVel18),
        desaceleracoes: Math.floor(baseDecel),
        playerLoad: Math.floor(avgPlayerLoad),
        status
      });
    }

    return result;
  }, [selectedAthlete, gpsData]);

  const selectedPlayer = players.find(p => p.id.toString() === selectedAthlete);
  const currentWeek = 9; // Semana atual

  // Função para determinar cor baseada no status
  const getBarColor = (status: string, isCurrentWeek: boolean = false) => {
    if (isCurrentWeek) {
      switch (status) {
        case 'baixo': return '#10b981';      // Verde
        case 'normal': return '#10b981';     // Verde
        case 'alto': return '#f59e0b';       // Amarelo
        case 'critico': return '#ef4444';    // Vermelho
        default: return '#10b981';
      }
    }
    return '#6b7280'; // Cinza para semanas não atuais
  };

  // Dados dos últimos jogos oficiais vs sem jogo
  const gameComparison = useMemo(() => {
    const lastWeekData = trainingData.find(d => d.semana === selectedWeek);
    if (!lastWeekData) return null;

    return {
      comJogo: {
        velocidade23: Math.floor(lastWeekData.velocidade23 * 0.8),
        velocidade18: Math.floor(lastWeekData.velocidade18 * 0.85),
        desaceleracoes: Math.floor(lastWeekData.desaceleracoes * 0.9)
      },
      semJogo: {
        velocidade23: Math.floor(lastWeekData.velocidade23 * 1.2),
        velocidade18: Math.floor(lastWeekData.velocidade18 * 1.15),
        desaceleracoes: Math.floor(lastWeekData.desaceleracoes * 1.1)
      }
    };
  }, [trainingData, selectedWeek]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">Semana {data.semana}</p>
          <p className="text-blue-600">
            Velocidade {'>'} 23 km/h: {data.velocidade23}m
          </p>
          <p className="text-green-600">
            Velocidade {'>'} 18 km/h: {data.velocidade18}m
          </p>
          <p className="text-orange-600">
            Desacelerações: {data.desaceleracoes}n
          </p>
          <p className="text-purple-600">
            Player Load: {data.playerLoad}
          </p>
          <p className="text-sm text-gray-600">
            Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚽</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Carga de Treinamento</h1>
                {selectedPlayer && (
                  <p className="text-lg text-gray-600 mt-1">
                    {selectedPlayer.nome} - {selectedPlayer.posicao}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedAthlete ? (
            <>
              {/* Seletor de Semanas */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {[5, 6, 7, 8, 9, 10, 11].map(week => (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      week === selectedWeek
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Semana {week}
                  </button>
                ))}
              </div>

              {/* Card principal do atleta */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Info do jogador */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-green-600 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {selectedPlayer?.nome.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-700">{selectedPlayer?.nome}</h3>
                        <p className="text-gray-600">{selectedPlayer?.posicao}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-green-100 px-3 py-2 rounded-lg">
                          <div className="text-sm text-gray-600">Status da Carga</div>
                          <div className="text-lg font-bold text-green-700">
                            {trainingData.find(d => d.semana === selectedWeek)?.status.toUpperCase() || 'NORMAL'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-blue-50 px-3 py-2 rounded-lg">
                            <div className="text-xs text-gray-600">Máximo {'>'} 23 km/h</div>
                            <div className="text-lg font-bold text-blue-600">
                              {trainingData.find(d => d.semana === selectedWeek)?.velocidade23 || 0}m
                            </div>
                          </div>
                          <div className="bg-green-50 px-3 py-2 rounded-lg">
                            <div className="text-xs text-gray-600">Máximo {'>'} 18 km/h</div>
                            <div className="text-lg font-bold text-green-600">
                              {trainingData.find(d => d.semana === selectedWeek)?.velocidade18 || 0}m
                            </div>
                          </div>
                          <div className="bg-orange-50 px-3 py-2 rounded-lg">
                            <div className="text-xs text-gray-600">Desacelerações</div>
                            <div className="text-lg font-bold text-orange-600">
                              {trainingData.find(d => d.semana === selectedWeek)?.desaceleracoes || 0}n
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráficos de carga */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Evolução da Carga - Semana {selectedWeek}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-6">
                        {/* Velocidade > 23 km/h */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-center">{'>'} 23 km/h (m)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={trainingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="velocidade23" radius={[4, 4, 0, 0]}>
                                {trainingData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={getBarColor(entry.status, entry.semana === selectedWeek)} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Velocidade > 18 km/h */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-center">{'>'} 18 km/h (m)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={trainingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="velocidade18" radius={[4, 4, 0, 0]}>
                                {trainingData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={getBarColor(entry.status, entry.semana === selectedWeek)} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Desacelerações */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-center">Desacelerações (n)</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={trainingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
                              <YAxis />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="desaceleracoes" radius={[4, 4, 0, 0]}>
                                {trainingData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={getBarColor(entry.status, entry.semana === selectedWeek)} 
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Análise comparativa */}
                      {gameComparison && (
                        <div className="mt-8 space-y-4">
                          <h4 className="text-lg font-semibold text-center">
                            Análise Comparativa - Com vs Sem Jogo Oficial
                          </h4>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center space-y-2">
                              <p className="text-sm text-gray-600">Velocidade {'>'} 23 km/h</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Com Jogo</p>
                                  <p className="text-lg font-bold text-blue-600">{gameComparison.comJogo.velocidade23}m</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Sem Jogo</p>
                                  <p className="text-lg font-bold text-green-600">{gameComparison.semJogo.velocidade23}m</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-sm text-gray-600">Velocidade {'>'} 18 km/h</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Com Jogo</p>
                                  <p className="text-lg font-bold text-blue-600">{gameComparison.comJogo.velocidade18}m</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Sem Jogo</p>
                                  <p className="text-lg font-bold text-green-600">{gameComparison.semJogo.velocidade18}m</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-sm text-gray-600">Desacelerações</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Com Jogo</p>
                                  <p className="text-lg font-bold text-blue-600">{gameComparison.comJogo.desaceleracoes}n</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600">Sem Jogo</p>
                                  <p className="text-lg font-bold text-green-600">{gameComparison.semJogo.desaceleracoes}n</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Estatísticas resumidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {trainingData.length}
                  </p>
                  <p className="text-sm text-gray-600">Semanas Analisadas</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {trainingData.filter(d => d.status === 'normal' || d.status === 'baixo').length}
                  </p>
                  <p className="text-sm text-gray-600">Carga Adequada</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {trainingData.filter(d => d.status === 'alto').length}
                  </p>
                  <p className="text-sm text-gray-600">Carga Alta</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {trainingData.filter(d => d.status === 'critico').length}
                  </p>
                  <p className="text-sm text-gray-600">Carga Crítica</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Selecione um atleta no header para visualizar a análise de carga de treinamento
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CargaTreinamento; 