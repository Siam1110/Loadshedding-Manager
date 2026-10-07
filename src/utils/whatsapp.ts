import { LoadSheddingRecord, Settings, Feeder } from '../types';
import { toBengaliNumeral } from './bnUtils';

export const generateWhatsAppMessage = (
  record: Partial<LoadSheddingRecord>,
  feedersList: Feeder[],
  settings: Settings
): string => {
  const useBn = settings.bengaliNumberFormatting;
  
  const time = useBn ? toBengaliNumeral(record.time || '') : record.time || '';
  const restoreTime = useBn ? toBengaliNumeral(record.expectedRestoreTime || '') : record.expectedRestoreTime || '';
  const demand = useBn ? toBengaliNumeral(record.demand || 0) : (record.demand || 0).toFixed(settings.decimalPrecision);
  const allocated = useBn ? toBengaliNumeral(record.allocatedLoad || 0) : (record.allocatedLoad || 0).toFixed(settings.decimalPrecision);

  const selectedFeeders = feedersList.filter(f => record.selectedFeederIds?.includes(f.id));
  
  let feedersText = '';
  if (selectedFeeders.length === 1) {
    const f = selectedFeeders[0];
    const loadStr = useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(settings.decimalPrecision);
    feedersText = `${f.name} (${loadStr} MW)`;
  } else {
    feedersText = selectedFeeders
      .map(f => {
        const loadStr = useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(settings.decimalPrecision);
        return `${f.name} (${loadStr} MW)`;
      })
      .join('\n');
  }

  let template = settings.messageTemplate;
  
  if (selectedFeeders.length === 1 && template.includes('লোডশেডিংকৃত ফিডার:-\n{feeders}')) {
    template = template.replace('লোডশেডিংকৃত ফিডার:-\n{feeders}', 'লোডশেডিংকৃত ফিডার:- {feeders}');
  }

  return template
    .replace('{time}', time)
    .replace('{demand}', demand)
    .replace('{allocated}', allocated)
    .replace('{feeders}', feedersText)
    .replace('{restoreTime}', restoreTime);
};

export const sendWhatsAppViaApi = async (
  message: string,
  recipient: string,
  settings: Settings
): Promise<boolean> => {
  if (!settings.whatsAppPhoneNumberId || !settings.whatsAppAccessToken) {
    console.warn('Meta WhatsApp API credentials are missing.');
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${settings.whatsAppPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.whatsAppAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to send WhatsApp message via API:', error);
    return false;
  }
};

export const openWhatsAppWeb = (message: string, phone?: string) => {
  const encodedMsg = encodeURIComponent(message);
  const targetPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const url = targetPhone 
    ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;
  
  window.open(url, '_blank');
};
    
