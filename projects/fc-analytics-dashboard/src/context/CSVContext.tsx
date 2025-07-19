import React, { createContext, useContext } from 'react';
import { useCSVStore } from '@/store/useCSVStore';
import { useDataStore } from '@/store/useDataStore';
import { CSVEntry, Player, Injury, Evaluation, GPSData, Statistics } from '@/types';

interface CSVContextType {
  csvFiles: CSVEntry[];
  addCSV: (csv: CSVEntry) => void;
  updateCSV: (id: string, csv: CSVEntry) => void;
  getCSVByName: (name: string) => CSVEntry | undefined;
  getCSVById: (id: string) => CSVEntry | undefined;
  processCSVData: (file: File, type: string) => Promise<CSVEntry>;
  removeFromHistory: (type: string, index: number) => void;
}

const CSVContext = createContext<CSVContextType | null>(null);

export const useCSV = () => {
  const context = useContext(CSVContext);
  if (!context) {
    throw new Error('useCSV must be used within a CSVProvider');
  }
  return context;
};

export const CSVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { csvFiles, setCSVFiles, addCSVFile } = useCSVStore();
  const dataStore = useDataStore();

  const addCSV = (csv: CSVEntry) => {
    addCSVFile(csv);
    
    // Processar os dados e adicionar ao store de dados
    processDataToStore(csv);
  };

  const processDataToStore = (csv: CSVEntry) => {
    const { content, name } = csv;
    
    switch (name) {
      case 'players':
        const players: Player[] = content.map(item => ({
          id: item.id || Date.now().toString() + Math.random(),
          nome: item.nome || '',
          posicao: item.posicao || 'Não especificada',
          data_nascimento: item.data_nascimento,
          numero: item.numero ? parseInt(item.numero) : undefined,
          idade: item.idade ? parseInt(item.idade) : undefined,
        }));
        dataStore.setPlayers(players);
        break;
        
      case 'injuries':
        console.log('🩹 Processando lesões - primeiro item do CSV:', content[0]);
        console.log('🩹 Valor bruto do campo "mecanismo":', content[0]?.mecanismo);
        console.log('🩹 Valor bruto do campo "local2":', content[0]?.local2);
        console.log('🩹 Valor direto do "mecanismo_direto":', content[0]?.mecanismo_direto);
        console.log('🩹 Valor direto do "local2_direto":', content[0]?.local2_direto);
        const injuries: Injury[] = content.map(item => {
          // Prioriza o valor pelo header, usa o índice fixo só se vier vazio
          const mecanismo = item.mecanismo || item.mecanismo_direto || '';
          const local2 = item.local2 || item.local2_direto || '';
          return {
            id: item.id || Date.now().toString() + Math.random(),
            id_atleta: item.id_atleta || '',
            nome: item.nome || '',
            posicao: item.posicao || 'Não especificada',
            data: item.data || item.entrada || '',
            tipo: item.tipo || item.diagnostico_queixa || 'Não especificado',
            mecanismo,
            status: item.saida ? 'Recuperado' : 'Ativo',
            diasDM: item.dias_dm ? parseInt(item.dias_dm) : 0,
            regiao: item.regiao,
            local: item.local,
            local2,
            lado: item.lado,
            membro: item.membro,
            grau: item.grau,
            lesao_previa: item.lesao_previa,
          };
        });
        dataStore.setInjuries(injuries);
        break;
        
      case 'evaluations':
        const evaluations: Evaluation[] = content.map(item => ({
          id: item.id || Date.now().toString() + Math.random(),
          id_atleta: item.id_atleta || '',
          nome: item.nome || item.atleta || '',
          posicao: item.posicao || 'Não especificada',
          data: item.data || '',
          peso: parseFloat(item.peso || item.peso_kg || '0'),
          altura: parseFloat(item.altura || item.altura_cm || '0') / 100,
          gordura: parseFloat(item.gordura || item.pct || '0'),
          cmj: parseFloat(item.cmj || '0'),
          sj: parseFloat(item.sj || '0'),
        }));
        dataStore.setEvaluations(evaluations);
        break;
        
      case 'gps':
        const gpsData: GPSData[] = content.map(item => ({
          id: item.id || Date.now().toString() + Math.random(),
          id_atleta: item.id_atleta || '',
          nome: item.nome || '',
          posicao: item.posicao || 'Não especificada',
          data: item.data || '',
          sessao: item.sessao || 'Não especificada',
          playerLoad: parseFloat(item.playerLoad || item.player_load || '0'),
          distancia: parseFloat(item.distancia || '0'),
          sprints: parseInt(item.sprints || '0'),
        }));
        dataStore.setGPSData(gpsData);
        break;
        
      case 'statistics':
        const statistics: Statistics[] = content.map(item => ({
          id: item.id || Date.now().toString() + Math.random(),
          id_atleta: item.id_atleta || '',
          nome: item.nome || '',
          posicao: item.posicao || 'Não especificada',
          numero: item.numero ? parseInt(item.numero) : undefined,
          idade: item.idade ? parseInt(item.idade) : undefined,
          jogos: parseInt(item.jogos || '0'),
          minutos: parseInt(item.minutos || item.minutos_jogo || item.min_jogados || '0'),
          gols: parseInt(item.gols || '0'),
          disponibilidade: item.disponibilidade ? parseFloat(item.disponibilidade) : undefined,
          participacao_em_jogos: item.participacao_em_jogos ? parseFloat(item.participacao_em_jogos) : undefined,
        }));
        dataStore.setStatistics(statistics);
        break;
    }
  };

  const updateCSV = (id: string, csv: CSVEntry) => {
    const newFiles = csvFiles.map(c => c.id === id ? csv : c);
    setCSVFiles(newFiles);
  };

  const getCSVByName = (name: string) => {
    return csvFiles.find(csv => csv.name === name);
  };

  const getCSVById = (id: string) => {
    return csvFiles.find(csv => csv.id === id);
  };

  const removeFromHistory = (type: string, index: number) => {
    const newFiles = csvFiles.filter(file => file.name !== type);
    setCSVFiles(newFiles);
    
    // Limpar os dados do store baseado no tipo
    switch (type) {
      case 'players':
        dataStore.setPlayers([]);
        break;
      case 'injuries':
        dataStore.setInjuries([]);
        break;
      case 'evaluations':
        dataStore.setEvaluations([]);
        break;
      case 'gps':
        dataStore.setGPSData([]);
        break;
      case 'statistics':
        dataStore.setStatistics([]);
        break;
    }
  };

  // Helper to detect delimiter based on first line (comma, tab, semicolon, pipe)
  const detectDelimiter = (line: string): string => {
    const delimiters = [',', '\t', ';', '|'];
    let maxCount = 0;
    let selected = ',';
    delimiters.forEach(d => {
      const count = line.split(d).length - 1;
      if (count > maxCount) {
        maxCount = count;
        selected = d;
      }
    });
    return selected;
  };

  // Parse CSV line with proper quote handling
  const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  // Função utilitária para calcular idade padronizada
  function calcularIdadePadronizada(idade: string | number | undefined): string {
    const idadeNum = typeof idade === 'string' ? parseInt(idade) : idade;
    if (!idadeNum || isNaN(idadeNum)) return 'Não informado';
    if (idadeNum >= 16 && idadeNum <= 21) return '16-21 anos';
    if (idadeNum >= 22 && idadeNum <= 30) return '22-30 anos';
    if (idadeNum > 30) return '> 30 anos';
    return 'Não informado';
  }

  const processCSVData = async (file: File, type: string): Promise<CSVEntry> => {
    console.log('Processando arquivo CSV:', file.name, 'tipo:', type);
    try {
      const text = await file.text();
      
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error("O arquivo CSV está vazio");
      }
      
      const firstLineRaw = lines[0].startsWith('\uFEFF') ? lines[0].slice(1) : lines[0];
      const delimiter = detectDelimiter(firstLineRaw);
      
      const headers = parseCSVLine(firstLineRaw, delimiter).map(header =>
        header.replace(/^['"\s]+|['"\s]+$/g, '').toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
      );
      
      console.log('🔧 Headers originais do CSV:', parseCSVLine(firstLineRaw, delimiter));
      console.log('🔧 Headers normalizados:', headers);
      
      if (headers.length === 0) {
        throw new Error("Não foi possível identificar os cabeçalhos no arquivo CSV");
      }
      
      const data = lines.slice(1).map(line => {
        if (!line.trim()) return null;
        const values = parseCSVLine(line, delimiter);
        const obj: any = {};
        // Garante que cada valor, mesmo vazio, é associado ao header correto
        headers.forEach((header, index) => {
          // Não pula colunas vazias!
          const value = index < values.length ? values[index] : '';
          obj[header] = value === '' || value === 'NA' || value === 'N/A' || value === '-' ? null : value;
        });
        // Mapeamento direto por posição para campos críticos (baseado no CSV padrão)
        if (values.length >= 19) {
          obj['mecanismo_direto'] = values[17] || null; // Coluna 18 (índice 17)
          obj['local2_direto'] = values[18] || null; // Coluna 19 (índice 18)
        }
        // Adiciona idade padronizada se houver campo idade
        if ('idade' in obj && !('idade_padronizada' in obj)) {
          obj['idade_padronizada'] = calcularIdadePadronizada(obj['idade']);
        }
        return obj;
      }).filter(Boolean);
      
      if (data.length === 0) {
        throw new Error("Não foram encontrados dados válidos no arquivo CSV");
      }

      const newCSV: CSVEntry = {
        id: Date.now().toString(),
        name: type,
        lastUpdate: new Date().toISOString(),
        content: data,
        history: [{
          date: new Date().toISOString(),
          action: 'initial',
          fileName: file.name
        }]
      };

      console.log('CSV processado com sucesso. Registros:', data.length);
      return newCSV;
    } catch (error) {
      console.error("Erro ao processar CSV:", error);
      throw error;
    }
  };

  const value = {
    csvFiles,
    addCSV,
    updateCSV,
    getCSVByName,
    getCSVById,
    processCSVData,
    removeFromHistory
  };

  return (
    <CSVContext.Provider value={value}>
      {children}
    </CSVContext.Provider>
  );
}; 