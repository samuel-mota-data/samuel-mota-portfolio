import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingDown, Clock, MapPin } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface LesoesDashboardProps {
  selectedAthlete: string;
}

const LesoesDashboard: React.FC<LesoesDashboardProps> = ({ selectedAthlete }) => {
  const { players, injuries } = useData();

  // Visão geral: usar todos os dados
  const lesoesGerais = injuries;

  // Destaque do atleta selecionado
  const lesoesAtleta = selectedAthlete
    ? injuries.filter(lesao => lesao.id_atleta.toString() === selectedAthlete)
    : [];

  // Estatísticas gerais
  const totalLesoes = lesoesGerais.length;
  const lesoesAtivas = lesoesGerais.filter(l => (l.status?.toLowerCase() || '').includes('ativ') || (l.status?.toLowerCase() || '').includes('tratamento')).length;
  const lesoesRecuperadas = lesoesGerais.filter(l => (l.status?.toLowerCase() || '').includes('recuperado') || (l.status?.toLowerCase() || '').includes('alta') || (l.status?.toLowerCase() || '').includes('curado')).length;
  const diasTotaisFora = lesoesGerais.reduce((acc, l) => acc + (parseInt(l.diasDM?.toString()) || 0), 0);

  // Lesões por tipo
  const lesoesPorTipo = lesoesGerais.reduce((acc, lesao) => {
    const tipo = lesao.tipo || 'Não especificado';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dadosTipo = Object.entries(lesoesPorTipo).map(([tipo, value]) => ({ name: tipo, value })).sort((a, b) => (b.value as number) - (a.value as number));

  // Função para padronizar nomes de posição
  const padronizarPosicao = (posicao: string | undefined): string => {
    if (!posicao || typeof posicao !== 'string' || posicao.trim() === '') return 'Não informado';
    const p = posicao.trim().toLowerCase();
    if (['gk', 'gol', 'goleiro'].includes(p)) return 'Goleiro';
    if (['zagueiro', 'zaga', 'def', 'defensor'].includes(p)) return 'Zagueiro';
    if (['lat', 'lateral', 'ld', 'le'].includes(p)) return 'Lateral';
    if (['vol', 'volante', 'mdf', 'meio-campista defensivo'].includes(p)) return 'Volante';
    if (['mc', 'meio-campista', 'meia', 'meiocampista'].includes(p)) return 'Meio-campista';
    if (['me', 'meia-esquerda', 'meia esquerda'].includes(p)) return 'Meia Esquerda';
    if (['md', 'meia-direita', 'meia direita'].includes(p)) return 'Meia Direita';
    if (['atacante', 'ata', 'atac', 'avançado', 'centroavante', 'ca'].includes(p)) return 'Atacante';
    if (['ponta', 'extremo', 'ex', 'pe', 'pd'].includes(p)) return 'Ponta';
    return posicao.charAt(0).toUpperCase() + posicao.slice(1);
  };

  // Lesões por posição
  const lesoesPorPosicao = lesoesGerais.reduce((acc, lesao) => {
    let posicao = lesao.posicao;
    // Se posicao for vazia, numérica ou inválida, buscar no cadastro de jogadores
    if (!posicao || typeof posicao !== 'string' || posicao.trim() === '' || !isNaN(Number(posicao))) {
      const atleta = players.find(p => p.id.toString() === lesao.id_atleta?.toString());
      posicao = atleta?.posicao || '';
    }
    const posicaoPadrao = padronizarPosicao(posicao);
    acc[posicaoPadrao] = (acc[posicaoPadrao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dadosPosicao = Object.entries(lesoesPorPosicao).map(([posicao, count]) => ({ posicao, count })).sort((a, b) => (b.count as number) - (a.count as number));

  // Lesões por contexto (contagem direta do local2, sem padronização)
  const lesoesPorContexto = lesoesGerais.reduce((acc, lesao) => {
    const local2 = lesao.local2 ? lesao.local2.toString().trim() : '';
    if (local2 !== '') {
      acc[local2] = (acc[local2] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const dadosContexto = Object.entries(lesoesPorContexto)
    .map(([contexto, count]) => ({ contexto, count }))
    .sort((a, b) => (b.count as number) - (a.count as number));

  // Lesões por mecanismo (contagem direta do mecanismo, sem padronização)
  const lesoesPorMecanismo = lesoesGerais.reduce((acc, lesao) => {
    const mecanismo = lesao.mecanismo ? lesao.mecanismo.toString().trim() : '';
    if (mecanismo !== '') {
      acc[mecanismo] = (acc[mecanismo] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const dadosMecanismo = Object.entries(lesoesPorMecanismo)
    .map(([mecanismo, count]) => ({ mecanismo, count }))
    .sort((a, b) => (b.count as number) - (a.count as number));

  // Lesões ao longo do tempo (por mês)
  const lesoesPorMes = lesoesGerais.reduce((acc, lesao) => {
    const data = new Date(lesao.data);
    const mes = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}`;
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dadosMes = Object.entries(lesoesPorMes).map(([mes, count]) => ({ mes, count })).sort((a, b) => a.mes.localeCompare(b.mes));

  // Destaque do atleta selecionado
  const selectedPlayer = players.find(p => p.id.toString() === selectedAthlete);
  const totalLesoesAtleta = lesoesAtleta.length;
  const diasAfastadoAtleta = lesoesAtleta.reduce((acc, l) => acc + (parseInt(l.diasDM?.toString()) || 0), 0);
  const tipoMaisRecorrente = lesoesAtleta.length > 0
    ? Object.entries(
        lesoesAtleta.reduce((acc, l) => {
          const tipo = l.tipo || 'Não informado';
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0][0]
    : '-';
  const ultimasLesoes = lesoesAtleta.slice(-3).reverse();

  const cores = {
    'Queda': '#3B82F6',    // Azul
    'Overuse': '#10B981',  // Verde
    'Trauma': '#F59E0B',   // Laranja
    'Chute': '#EF4444',    // Vermelho
    'Não informado': '#94A3B8' // Cinza
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard de Lesões</h2>
      
      {/* Botão para forçar limpeza de dados */}
      <div className="mb-4">
        <button 
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          🗑️ Limpar Dados e Recarregar
        </button>
      </div>
      
      {/* Destaque do atleta selecionado */}
      {selectedPlayer && (
        <Card className="p-6 mb-4 bg-blue-50">
          <h3 className="text-lg font-semibold mb-2">Destaque: {selectedPlayer.nome} ({selectedPlayer.posicao})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500">Total de Lesões</div>
              <div className="text-2xl font-bold text-blue-700">{totalLesoesAtleta}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Dias Afastado</div>
              <div className="text-2xl font-bold text-orange-600">{diasAfastadoAtleta}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tipo Mais Recorrente</div>
              <div className="text-lg font-bold text-green-700">{tipoMaisRecorrente}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Últimas Lesões</div>
              <ul className="text-xs text-gray-700 list-disc ml-4">
                {ultimasLesoes.length > 0 ? ultimasLesoes.map((l, i) => (
                  <li key={i}>{l.tipo} - {new Date(l.data).toLocaleDateString('pt-BR')}</li>
                )) : <li>Nenhuma</li>}
              </ul>
            </div>
        </div>
      </Card>
      )}
      
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-red-600">{lesoesAtivas}</p>
          <p className="text-sm text-gray-600">Lesões Ativas</p>
        </Card>
        <Card className="p-6 text-center">
          <TrendingDown className="mx-auto text-green-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-green-600">{lesoesRecuperadas}</p>
          <p className="text-sm text-gray-600">Recuperados</p>
        </Card>
        <Card className="p-6 text-center">
          <Clock className="mx-auto text-orange-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-orange-600">{diasTotaisFora}</p>
          <p className="text-sm text-gray-600">Dias Totais Perdidos</p>
        </Card>
        <Card className="p-6 text-center">
          <MapPin className="mx-auto text-purple-500 mb-2" size={24} />
          <p className="text-2xl font-bold text-purple-600">{totalLesoes}</p>
          <p className="text-sm text-gray-600">Total de Lesões</p>
        </Card>
      </div>

      {/* Gráficos gerais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesões por Contexto (Local2) */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lesões por Local/Contexto</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosContexto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="contexto" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lesões por Mecanismo */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Incidência por Mecanismo</h3>
          {dadosMecanismo.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMecanismo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mecanismo" />
                <YAxis />
                <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado para exibir
            </div>
          )}
        </Card>
      </div>

      {/* Lesões por Posição e ao longo do tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lesões por Posição */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Distribuição por Posição</h3>
          {dadosPosicao.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosPosicao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="posicao" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado para exibir
            </div>
          )}
      </Card>
        {/* Lesões ao longo do tempo */}
      <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Lesões ao Longo do Tempo</h3>
          {dadosMes.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
              </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum dado para exibir
            </div>
          )}
        </Card>
        </div>
    </div>
  );
};

export default LesoesDashboard;
