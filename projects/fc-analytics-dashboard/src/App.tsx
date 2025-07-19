import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSVProvider } from "@/context/CSVContext";
import { DataProvider } from "@/context/DataContext";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdvancedDashboard from "./pages/AdvancedDashboard";
import CSVManager from "./components/CSVManager";
// Importe os stores
import { useDataStore } from "@/store/useDataStore";
import { useCSVStore } from "@/store/useCSVStore";
import { useUIStore } from "@/store/useUIStore";

// Componente para inicializar e garantir que os dados são carregados do localStorage
const StoreInitializer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitialized) return;
    
    try {
      console.log('[StoreInitializer] Iniciando carregamento dos stores...');
      
      // Carregar dados do localStorage
      const loadStores = () => {
        try {
          // Acessar os stores força sua inicialização
          const uiStore = useUIStore.getState();
          const dataStore = useDataStore.getState();
          const csvStore = useCSVStore.getState();
          
          // Debug - verificar se dados foram carregados
          console.log('[StoreInitializer] Stores carregados:');
          console.log('UI Store:', {
            theme: uiStore.theme,
            isLoading: uiStore.isLoading
          });
          console.log('Data Store:', {
            playersCount: dataStore.players.length,
            injuriesCount: dataStore.injuries.length,
            evaluationsCount: dataStore.evaluations.length,
            gpsDataCount: dataStore.gpsData.length,
            lastUpdate: dataStore.lastUpdate
          });
          console.log('CSV Store:', {
            filesCount: csvStore.csvFiles.length,
            files: csvStore.csvFiles.map(f => ({ 
              name: f.name, 
              records: f.content.length,
              lastUpdate: f.lastUpdate
            }))
          });
          
          return true;
        } catch (error) {
          console.error('[StoreInitializer] Erro ao carregar stores:', error);
          setError('Erro ao carregar dados. Por favor, recarregue a página.');
          return false;
        }
      };

      // Carregar dados
      const success = loadStores();
      
      // Marcar como inicializado apenas se carregou com sucesso
      setIsInitialized(success);
      
      console.log('[StoreInitializer] Inicialização concluída:', success ? 'sucesso' : 'falha');
    } catch (error) {
      console.error('[StoreInitializer] Erro fatal na inicialização:', error);
      setError('Erro fatal ao inicializar. Por favor, recarregue a página.');
    }
  }, [isInitialized]);
  
  // Renderiza mensagem de erro se houver
  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: 'red', 
        textAlign: 'center',
        backgroundColor: '#fff3f3',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        margin: '20px'
      }}>
        {error}
      </div>
    );
  }
  
  // Não renderiza nada se inicializado com sucesso
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CSVProvider>
      <DataProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              {/* Inicializador de Stores */}
              <StoreInitializer />
              
              <Routes>
                <Route path="/" element={<AdvancedDashboard />} />
                <Route path="/csv" element={<CSVManager />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </CSVProvider>
  </QueryClientProvider>
);

export default App; 