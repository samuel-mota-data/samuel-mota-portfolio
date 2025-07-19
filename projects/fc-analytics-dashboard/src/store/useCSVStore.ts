import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CSVEntry } from '@/types';

interface CSVState {
  csvFiles: CSVEntry[];
  setCSVFiles: (files: CSVEntry[]) => void;
  addCSVFile: (file: CSVEntry) => void;
  updateCSVFile: (id: string, file: CSVEntry) => void;
  removeCSVFile: (id: string) => void;
  getCSVByName: (name: string) => CSVEntry | undefined;
}

export const useCSVStore = create<CSVState>()(
  persist(
    (set, get) => ({
      csvFiles: [],
      
      setCSVFiles: (files) => set({ csvFiles: files }),
      
      addCSVFile: (file) => set((state) => {
        const existingIndex = state.csvFiles.findIndex(f => f.name === file.name);
        if (existingIndex >= 0) {
          const updatedFiles = [...state.csvFiles];
          updatedFiles[existingIndex] = file;
          return { csvFiles: updatedFiles };
        }
        return { csvFiles: [...state.csvFiles, file] };
      }),
      
      updateCSVFile: (id, file) => set((state) => ({
        csvFiles: state.csvFiles.map(f => f.id === id ? file : f)
      })),
      
      removeCSVFile: (id) => set((state) => ({
        csvFiles: state.csvFiles.filter(f => f.id !== id)
      })),
      
      getCSVByName: (name) => {
        return get().csvFiles.find(f => f.name === name);
      }
    }),
    {
      name: 'csv-files-store',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Função de migração para futuras versões
        if (version === 0) {
          // Migração da versão 0 para 1 (se necessário)
          return persistedState;
        }
        return persistedState;
      },
    }
  )
); 