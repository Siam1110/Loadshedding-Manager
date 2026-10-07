export interface Feeder {
  id: string;
  name: string;
  code: string;
  currentLoad: number; // MW
  priority: 1 | 2 | 3;
  isProtected: boolean;
  isActive: boolean;
  isCurrentlyShed: boolean;
}

export interface LoadSheddingRecord {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  demand: number;
  allocatedLoad: number;
  requiredShedding: number;
  selectedFeederIds: string[];
  selectedFeederNames: string[];
  totalShedLoad: number;
  expectedRestoreTime: string;
  whatsAppStatus: 'SENT' | 'FAILED' | 'PENDING' | 'MANUAL';
  createdBy: string;
  isDeleted?: boolean;
}

export interface Settings {
  systemName: string;
  defaultDurationMinutes: number;
  decimalPrecision: number;
  messageTemplate: string;
  whatsAppPhoneNumberId: string;
  whatsAppAccessToken: string;
  defaultContactGroup: string;
  bengaliNumberFormatting: boolean;
  darkMode: boolean;
}

