import { Feeder, LoadSheddingRecord, Settings } from '../types';

const FEEDERS_KEY = 'lsms_feeders';
const HISTORY_KEY = 'lsms_history';
const SETTINGS_KEY = 'lsms_settings';

export const INITIAL_FEEDERS: Feeder[] = [
  { id: '1', name: '1A', code: 'FDR-1A', currentLoad: 0.90, priority: 1, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '2', name: '1B', code: 'FDR-1B', currentLoad: 0.70, priority: 2, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '3', name: '2A', code: 'FDR-2A', currentLoad: 0.50, priority: 1, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '4', name: '2B', code: 'FDR-2B', currentLoad: 0.80, priority: 2, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '5', name: '3A', code: 'FDR-3A', currentLoad: 0.60, priority: 3, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '6', name: '3B', code: 'FDR-3B', currentLoad: 0.40, priority: 3, isProtected: false, isActive: true, isCurrentlyShed: false },
  { id: '7', name: 'VIP', code: 'FDR-VIP', currentLoad: 0.40, priority: 1, isProtected: true, isActive: true, isCurrentlyShed: false },
  { id: '8', name: 'Hospital', code: 'FDR-HOSP', currentLoad: 0.50, priority: 1, isProtected: true, isActive: true, isCurrentlyShed: false },
  { id: '9', name: 'Industrial', code: 'FDR-IND', currentLoad: 0.70, priority: 2, isProtected: false, isActive: true, isCurrentlyShed: false },
];

export const DEFAULT_SETTINGS: Settings = {
  systemName: 'Load Shedding Management System',
  defaultDurationMinutes: 60,
  decimalPrecision: 2,
  messageTemplate: `⚡ *লোডশেডিং আপডেট*⚡\nসময়:- {time}\nচাহিদা:- {demand} MW\nবরাদ্দ লোড:- {allocated} MW\nলোডশেডিংকৃত ফিডার:-\n{feeders}\nসম্ভাব্য চালুর সময়:- {restoreTime}`,
  whatsAppPhoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
  whatsAppAccessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || '',
  defaultContactGroup: '8801700000000',
  bengaliNumberFormatting: true,
  darkMode: false,
};

export const getStoredFeeders = (): Feeder[] => {
  const data = localStorage.getItem(FEEDERS_KEY);
  return data ? JSON.parse(data) : INITIAL_FEEDERS;
};

export const saveStoredFeeders = (feeders: Feeder[]) => {
  localStorage.setItem(FEEDERS_KEY, JSON.stringify(feeders));
};

export const getStoredHistory = (): LoadSheddingRecord[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStoredHistory = (history: LoadSheddingRecord[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getStoredSettings = (): Settings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};

export const saveStoredSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
                           
