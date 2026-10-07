import React, { createContext, useContext, useState, useEffect } from 'react';
import { Feeder, LoadSheddingRecord, Settings } from '../types';
import { 
  getStoredFeeders, saveStoredFeeders, 
  getStoredHistory, saveStoredHistory, 
  getStoredSettings, saveStoredSettings 
} from '../utils/storage';

interface AppContextType {
  feeders: Feeder[];
  history: LoadSheddingRecord[];
  settings: Settings;
  addFeeder: (feeder: Omit<Feeder, 'id' | 'isCurrentlyShed'>) => void;
  updateFeeder: (id: string, feeder: Partial<Feeder>) => void;
  updateFeederLoad: (id: string, newLoad: number) => void;
  deleteFeeder: (id: string) => void;
  toggleFeederProtection: (id: string) => void;
  toggleFeederStatus: (id: string) => void;
  addLoadSheddingRecord: (record: Omit<LoadSheddingRecord, 'id' | 'timestamp'>) => Promise<string>;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeders, setFeeders] = useState<Feeder[]>(getStoredFeeders);
  const [history, setHistory] = useState<LoadSheddingRecord[]>(getStoredHistory);
  const [settings, setSettings] = useState<Settings>(getStoredSettings);

  useEffect(() => {
    saveStoredFeeders(feeders);
  }, [feeders]);

  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  useEffect(() => {
    saveStoredSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const addFeeder = (feederData: Omit<Feeder, 'id' | 'isCurrentlyShed'>) => {
    const newFeeder: Feeder = {
      ...feederData,
      id: Date.now().toString(),
      isCurrentlyShed: false
    };
    setFeeders(prev => [...prev, newFeeder]);
  };

  const updateFeeder = (id: string, updated: Partial<Feeder>) => {
    setFeeders(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
  };

  const updateFeederLoad = (id: string, newLoad: number) => {
    setFeeders(prev => prev.map(f => f.id === id ? { ...f, currentLoad: newLoad } : f));
  };

  const deleteFeeder = (id: string) => {
    setFeeders(prev => prev.filter(f => f.id !== id));
  };

  const toggleFeederProtection = (id: string) => {
    setFeeders(prev => prev.map(f => f.id === id ? { ...f, isProtected: !f.isProtected } : f));
  };

  const toggleFeederStatus = (id: string) => {
    setFeeders(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));
  };

  const addLoadSheddingRecord = async (recordData: Omit<LoadSheddingRecord, 'id' | 'timestamp'>): Promise<string> => {
    const id = Date.now().toString();
    const newRecord: LoadSheddingRecord = {
      ...recordData,
      id,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [newRecord, ...prev]);

    setFeeders(prev => prev.map(f => {
      if (recordData.selectedFeederIds.includes(f.id)) {
        return { ...f, isCurrentlyShed: true };
      }
      return f;
    }));

    return id;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      feeders,
      history,
      settings,
      addFeeder,
      updateFeeder,
      updateFeederLoad,
      deleteFeeder,
      toggleFeederProtection,
      toggleFeederStatus,
      addLoadSheddingRecord,
      updateSettings,
      resetToDefaults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
