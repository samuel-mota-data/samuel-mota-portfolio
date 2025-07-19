export interface Player {
  id: string;
  nome: string;
  posicao: string;
  data_nascimento?: string;
  numero?: number;
  idade?: number;
}

export interface Injury {
  id: string;
  id_atleta: string;
  nome: string;
  posicao: string;
  data: string;
  tipo: string;
  mecanismo: string;
  status: 'Ativo' | 'Recuperado';
  diasDM: number;
  regiao?: string;
  local?: string;
  local2?: string;
  lado?: string;
  membro?: string;
  grau?: string;
  lesao_previa?: string;
}

export interface Evaluation {
  id: string;
  id_atleta: string;
  nome: string;
  posicao: string;
  data: string;
  peso: number;
  altura: number;
  gordura: number;
  cmj: number;
  sj: number;
}

export interface GPSData {
  id: string;
  id_atleta: string;
  nome: string;
  posicao: string;
  data: string;
  sessao: string;
  playerLoad: number;
  distancia: number;
  sprints: number;
}

export interface Statistics {
  id: string;
  id_atleta: string;
  nome: string;
  posicao: string;
  numero?: number;
  idade?: number;
  jogos: number;
  minutos: number;
  gols: number;
  disponibilidade?: number;
  participacao_em_jogos?: number;
}

export interface CSVEntry {
  id: string;
  name: string;
  lastUpdate: string;
  content: any[];
  history: CSVHistoryEntry[];
}

export interface CSVHistoryEntry {
  date: string;
  action: 'initial' | 'update';
  fileName: string;
}

export type DatasetType = 'players' | 'injuries' | 'evaluations' | 'gps' | 'statistics';

export interface UploadedData {
  dataset: DatasetType;
  [key: string]: any;
} 