import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Home } from "lucide-react";
import { useCSV } from '@/context/CSVContext';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CSVHistoryEntry } from '@/types';

const CSVTypeConfig = {
  players: {
    title: "Jogadores",
    description: "Lista de jogadores do time",
    example: "players.csv"
  },
  injuries: {
    title: "Lesões",
    description: "Registro de lesões dos atletas",
    example: "injuries.csv"
  },
  evaluations: {
    title: "Avaliações Físicas",
    description: "Avaliações físicas dos atletas",
    example: "evaluations.csv"
  },
  gps: {
    title: "Dados GPS",
    description: "Dados de GPS e carga de treinamento",
    example: "gps_data.csv"
  },
  statistics: {
    title: "Estatísticas",
    description: "Estatísticas de jogo dos atletas",
    example: "statistics.csv"
  }
};

interface SimplestCSVUploaderProps {
  type: string;
  onUpload: (file: File, type: string) => void;
}

// Componente super simples para upload de CSV
const SimplestCSVUploader: React.FC<SimplestCSVUploaderProps> = ({ type, onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { csvFiles } = useCSV();
  const csvData = csvFiles.find(csv => csv.name === type);

  const handleUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv')) {
        onUpload(file, type);
      } else {
        alert('Por favor, selecione apenas arquivos CSV.');
      }
      // Reset o campo para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        {csvData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-green-600 mb-2">
              <FileText className="h-5 w-5 mr-2" />
              <span className="font-medium">Arquivo carregado</span>
            </div>
            <p className="text-sm"><strong>Arquivo:</strong> {csvData.history[csvData.history.length - 1]?.fileName}</p>
            <p className="text-sm"><strong>Registros:</strong> {csvData.content.length}</p>
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date(csvData.lastUpdate).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum arquivo carregado</p>
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        onClick={handleUploadClick}
        className="w-full p-8 border-dashed border-2 hover:bg-accent hover:border-primary transition-colors"
      >
        <Upload className="h-6 w-6 mr-2" />
        {csvData ? 'Atualizar arquivo CSV' : 'Clique para selecionar CSV'}
      </Button>
      
      <input
        type="file"
        accept=".csv"
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

interface CSVHistoryProps {
  history: CSVHistoryEntry[] | undefined;
  type: string;
  onRemove: (type: string, index: number) => void;
}

// Componente de visualização de histórico
const CSVHistory: React.FC<CSVHistoryProps> = ({ history, type, onRemove }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2 text-sm">Histórico de Importações</h4>
      <div className="space-y-2">
        {history.map((entry: CSVHistoryEntry, i: number) => (
          <div key={i} className="flex justify-between items-center bg-muted p-2 rounded-md text-sm">
            <div className="flex-1">
              <span className="font-medium">{entry.fileName}</span>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.date).toLocaleString()}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(type, i)}
              className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
              title="Remover do histórico"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CSVManager: React.FC = () => {
  const { addCSV, processCSVData, csvFiles, removeFromHistory } = useCSV();
  const { toast } = useToast();

  // Função simplificada para upload
  const handleFileUpload = async (file: File, type: string) => {
    console.log("Iniciando upload do arquivo:", file.name, "tipo:", type);
    try {
      const newCSV = await processCSVData(file, type);
      console.log("CSV processado:", newCSV);
      addCSV(newCSV);
      toast({
        title: "Upload concluído",
        description: `${file.name} importado com sucesso. ${newCSV.content.length} registros processados.`,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao processar o arquivo CSV.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromHistory = (type: string, index: number) => {
    removeFromHistory(type, index);
    toast({
      title: "Item removido",
      description: "Arquivo removido com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-foreground">
              Gerenciador de Arquivos CSV
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Importe seus arquivos CSV para gerenciar dados dos atletas. 
            Os dados serão processados e armazenados localmente.
          </p>
        </div>

        {/* Summary */}
        {csvFiles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Resumo dos Dados Carregados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {csvFiles.reduce((acc, file) => acc + file.content.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de registros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {csvFiles.find(f => f.name === 'players')?.content.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Jogadores</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {csvFiles.find(f => f.name === 'injuries')?.content.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lesões</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {csvFiles.find(f => f.name === 'evaluations')?.content.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avaliações</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {csvFiles.find(f => f.name === 'gps')?.content.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">GPS</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CSV Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(CSVTypeConfig).map(([type, config]) => (
            <Card key={type} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  {config.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{config.description}</p>
                <p className="text-xs text-muted-foreground">
                  Exemplo: {config.example}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                <SimplestCSVUploader 
                  type={type} 
                  onUpload={handleFileUpload} 
                />
                
                {csvFiles.find(csv => csv.name === type) && (
                  <CSVHistory 
                    history={csvFiles.find(csv => csv.name === type)?.history}
                    type={type}
                    onRemove={handleRemoveFromHistory}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instruções de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground mb-4">
                Para obter os melhores resultados, seus arquivos CSV devem conter as seguintes colunas:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">📊 Jogadores (players.csv)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• id, nome, posicao</li>
                    <li>• data_nascimento, numero, idade</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">🏥 Lesões (injuries.csv)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• id_atleta, nome, posicao</li>
                    <li>• data, tipo, mecanismo, status</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">📏 Avaliações (evaluations.csv)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• id_atleta, nome, data</li>
                    <li>• peso, altura, gordura, cmj, sj</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">📍 GPS (gps.csv)</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• id_atleta, nome, data</li>
                    <li>• playerLoad, distancia, sprints</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CSVManager; 