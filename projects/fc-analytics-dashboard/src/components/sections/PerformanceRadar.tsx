import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '@/context/DataContext';

interface PerformanceData {
  metric: string;
  teamMedian: number;
  athlete: number;
  fullMark: number;
}

interface PerformanceRadarProps {
  selectedAthlete: string;
}

const PerformanceRadar: React.FC<PerformanceRadarProps> = ({ selectedAthlete }) => {
  const { players, gpsData, evaluations } = useData();

  // Gerar dados de performance baseados nos dados reais
  const performanceData = useMemo(() => {
    if (!selectedAthlete) return [];

    const athleteGPS = gpsData.filter(g => g.id_atleta.toString() === selectedAthlete);
    const athleteEvals = evaluations.filter(e => e.id_atleta.toString() === selectedAthlete);
    
    // Calcular médias dos dados do atleta
    const avgPlayerLoad = athleteGPS.length > 0 
      ? athleteGPS.reduce((acc, g) => acc + (g.playerLoad || 0), 0) / athleteGPS.length 
      : 0;
    
    const avgDistance = athleteGPS.length > 0
      ? athleteGPS.reduce((acc, g) => acc + (g.distancia || 0), 0) / athleteGPS.length
      : 0;
    
    const avgSprints = athleteGPS.length > 0
      ? athleteGPS.reduce((acc, g) => acc + (g.sprints || 0), 0) / athleteGPS.length
      : 0;

    const latestEval = athleteEvals.length > 0 ? athleteEvals[athleteEvals.length - 1] : null;
    
    // Simular métricas do time (mediana)
    const teamMetrics = {
      faseDescompressao: 65,
      forcaPropulsivaMedia: 70,
      faseFrenagem: 60,
      fasePropulsao: 75,
      rsi: 55
    };

    // Converter dados do atleta para percentis
    const athleteMetrics = {
      faseDescompressao: Math.min(95, Math.max(5, (avgPlayerLoad / 600) * 100)),
      forcaPropulsivaMedia: Math.min(95, Math.max(5, (avgDistance / 5000) * 100)),
      faseFrenagem: Math.min(95, Math.max(5, (avgSprints / 15) * 100)),
      fasePropulsao: Math.min(95, Math.max(5, latestEval?.cmj ? (latestEval.cmj / 50) * 100 : 60)),
      rsi: Math.min(95, Math.max(5, latestEval?.sj ? (latestEval.sj / 45) * 100 : 50))
    };

    return [
      {
        metric: 'Fase de Descompressão',
        teamMedian: teamMetrics.faseDescompressao,
        athlete: athleteMetrics.faseDescompressao,
        fullMark: 100
      },
      {
        metric: 'Força Propulsiva Média',
        teamMedian: teamMetrics.forcaPropulsivaMedia,
        athlete: athleteMetrics.forcaPropulsivaMedia,
        fullMark: 100
      },
      {
        metric: 'Fase de Frenagem',
        teamMedian: teamMetrics.faseFrenagem,
        athlete: athleteMetrics.faseFrenagem,
        fullMark: 100
      },
      {
        metric: 'Fase de Propulsão',
        teamMedian: teamMetrics.fasePropulsao,
        athlete: athleteMetrics.fasePropulsao,
        fullMark: 100
      },
      {
        metric: 'RSI',
        teamMedian: teamMetrics.rsi,
        athlete: athleteMetrics.rsi,
        fullMark: 100
      }
    ];
  }, [selectedAthlete, gpsData, evaluations]);

  const selectedPlayer = players.find(p => p.id.toString() === selectedAthlete);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.metric}</p>
          <p className="text-orange-600">
            Mediana do Time: {data.teamMedian.toFixed(1)}%
          </p>
          <p className="text-blue-600">
            Atleta: {data.athlete.toFixed(1)}%
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
          <CardTitle>
            Radar de Performance (Percentis) vs. Mediana do Time
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
              {/* Info do atleta selecionado */}
              {selectedPlayer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg">{selectedPlayer.nome}</h3>
                  <p className="text-gray-600">
                    {selectedPlayer.posicao} {selectedPlayer.numero && `• #${selectedPlayer.numero}`}
                  </p>
                </div>
              )}

              {/* Legenda */}
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span>Mediana do Time (50º Percentil)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Atleta {selectedPlayer?.nome}</span>
                </div>
              </div>

              {/* Gráfico Radar */}
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                  <PolarGrid stroke="#e0e7ff" />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    className="text-xs"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                  />
                  <Radar
                    name="Mediana do Time (50º Percentil)"
                    dataKey="teamMedian"
                    stroke="#fb923c"
                    fill="#fb923c"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name={`Atleta ${selectedPlayer?.nome || ''}`}
                    dataKey="athlete"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Análise detalhada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Pontos Fortes</h4>
                  {performanceData
                    .filter(d => d.athlete > d.teamMedian)
                    .map((metric, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800">{metric.metric}</p>
                        <p className="text-sm text-green-600">
                          {metric.athlete.toFixed(1)}% vs {metric.teamMedian.toFixed(1)}% (mediana)
                        </p>
                        <p className="text-xs text-green-500">
                          +{(metric.athlete - metric.teamMedian).toFixed(1)} pontos acima da mediana
                        </p>
                      </div>
                    ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Áreas de Melhoria</h4>
                  {performanceData
                    .filter(d => d.athlete <= d.teamMedian)
                    .map((metric, index) => (
                      <div key={index} className="bg-orange-50 p-3 rounded-lg">
                        <p className="font-medium text-orange-800">{metric.metric}</p>
                        <p className="text-sm text-orange-600">
                          {metric.athlete.toFixed(1)}% vs {metric.teamMedian.toFixed(1)}% (mediana)
                        </p>
                        <p className="text-xs text-orange-500">
                          {(metric.athlete - metric.teamMedian).toFixed(1)} pontos da mediana
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Estatísticas gerais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {performanceData.length > 0 
                      ? (performanceData.reduce((acc, d) => acc + d.athlete, 0) / performanceData.length).toFixed(1) 
                      : '0'}%
                  </p>
                  <p className="text-sm text-gray-600">Performance Média</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {performanceData.filter(d => d.athlete > d.teamMedian).length}
                  </p>
                  <p className="text-sm text-gray-600">Acima da Mediana</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {performanceData.filter(d => d.athlete <= d.teamMedian).length}
                  </p>
                  <p className="text-sm text-gray-600">Abaixo da Mediana</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Selecione um atleta no header para visualizar a análise de performance
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceRadar; 