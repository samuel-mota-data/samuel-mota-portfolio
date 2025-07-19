import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useCSV } from '@/context/CSVContext';
import { Link } from 'react-router-dom';
import { Upload, Users, Activity, MapPin, TrendingUp, Calendar } from 'lucide-react';

const Index = () => {
  const { players, injuries, evaluations, gpsData, statistics } = useData();
  const { csvFiles } = useCSV();

  // Calcular estatísticas rápidas
  const activeInjuries = injuries.filter(i => i.status === 'Ativo');
  const recentEvaluations = evaluations.filter(e => {
    const evalDate = new Date(e.data);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return evalDate > thirtyDaysAgo;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Dashboard Futebol ⚽
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema de análise de performance para atletas de futebol
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jogadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de atletas cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lesões Ativas</CardTitle>
              <Activity className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {activeInjuries.length}
              </div>
              <p className="text-xs text-muted-foreground">
                De {injuries.length} lesões registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
              <p className="text-xs text-muted-foreground">
                {recentEvaluations.length} recentes (30 dias)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dados GPS</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gpsData.length}</div>
              <p className="text-xs text-muted-foreground">
                Sessões de treinamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.length}</div>
              <p className="text-xs text-muted-foreground">
                Perfis de jogadores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players Overview */}
          {players.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Jogadores Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{player.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.posicao} {player.numero && `• #${player.numero}`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.idade && `${player.idade} anos`}
                      </div>
                    </div>
                  ))}
                  {players.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... e mais {players.length - 5} jogadores
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSV Files Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status dos Arquivos CSV</CardTitle>
            </CardHeader>
            <CardContent>
              {csvFiles.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum arquivo CSV carregado ainda
                  </p>
                  <Link to="/csv">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Carregar Arquivos CSV
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {csvFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.content.length} registros
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Atualizado: {new Date(file.lastUpdate).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Carregado
                      </div>
                    </div>
                  ))}
                  <Link to="/csv">
                    <Button variant="outline" className="w-full">
                      Gerenciar Arquivos CSV
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Injuries */}
          {activeInjuries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Activity className="mr-2 h-5 w-5" />
                  Lesões Ativas ({activeInjuries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeInjuries.slice(0, 5).map((injury) => (
                    <div key={injury.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                        <p className="font-medium">{injury.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {injury.tipo} • {injury.posicao}
                        </p>
                      </div>
                      <div className="text-sm text-destructive font-medium">
                        {injury.diasDM} dias
                      </div>
                    </div>
                  ))}
                  {activeInjuries.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... e mais {activeInjuries.length - 5} lesões ativas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/csv">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="mr-2 h-4 w-4" />
                      Carregar dados CSV
                    </Button>
                  </Link>
                  
                  <Link to="/dashboard">
                    <Button variant="default" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Dashboard Avançado
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Users className="mr-2 h-4 w-4" />
                    Visualizar jogadores
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Activity className="mr-2 h-4 w-4" />
                    Dashboard de lesões
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Análise de performance
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <MapPin className="mr-2 h-4 w-4" />
                    Dados GPS
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> {csvFiles.length === 0 
                      ? 'Comece carregando os arquivos CSV para visualizar os dados dos atletas.'
                      : 'Dados carregados com sucesso! Explore as diferentes seções do dashboard.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index; 