import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculateOptimalFeeders } from '../utils/algorithm';
import { generateWhatsAppMessage, openWhatsAppWeb, sendWhatsAppViaApi } from '../utils/whatsapp';
import { WhatsAppPreview } from '../components/WhatsAppPreview';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Feeder } from '../types';
import { toBengaliNumeral } from '../utils/bnUtils';
import { AlertCircle, CheckCircle, RefreshCw, Zap } from 'lucide-react';

export const CreateLoadShedding: React.FC = () => {
  const { feeders, settings, addLoadSheddingRecord } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  const [demand, setDemand] = useState<number>(4.4);
  const [allocatedLoad, setAllocatedLoad] = useState<number>(3.5);
  const [durationMinutes, setDurationMinutes] = useState<number>(settings.defaultDurationMinutes);
  const [selectedFeederIds, setSelectedFeederIds] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const requiredShedding = Math.max(0, Number((demand - allocatedLoad).toFixed(settings.decimalPrecision)));

  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const calculateRestoreTime = (time: string, duration: number) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const expectedRestoreTimeStr = calculateRestoreTime(currentTimeStr, durationMinutes);

  useEffect(() => {
    if (requiredShedding > 0) {
      const opt = calculateOptimalFeeders(feeders, requiredShedding);
      setSelectedFeederIds(opt.recommendedFeeders.map(f => f.id));
    } else {
      setSelectedFeederIds([]);
    }
  }, [demand, allocatedLoad, feeders]);

  const selectedTotalLoad = Number(
    feeders
      .filter(f => selectedFeederIds.includes(f.id))
      .reduce((sum, f) => sum + f.currentLoad, 0)
      .toFixed(settings.decimalPrecision)
  );

  const difference = Number((selectedTotalLoad - requiredShedding).toFixed(settings.decimalPrecision));

  useEffect(() => {
    if (allocatedLoad > demand) {
      setWarningMessage('বরাদ্দকৃত লোড চাহিদার চেয়ে বেশি।');
    } else if (difference > 0.05) {
      setWarningMessage(`⚠ Selected Load is ${useBn ? toBengaliNumeral(difference) : difference} MW higher than required.`);
    } else if (difference < -0.05 && requiredShedding > 0) {
      setWarningMessage(`⚠ Selected Load is ${useBn ? toBengaliNumeral(Math.abs(difference)) : Math.abs(difference)} MW lower than required.`);
    } else {
      setWarningMessage(null);
    }
  }, [difference, allocatedLoad, demand]);

  const toggleFeederSelection = (feeder: Feeder) => {
    if (feeder.isProtected) {
      alert('Protected feeders cannot be selected for load shedding.');
      return;
    }

    if (selectedFeederIds.includes(feeder.id)) {
      setSelectedFeederIds(prev => prev.filter(id => id !== feeder.id));
    } else {
      setSelectedFeederIds(prev => [...prev, feeder.id]);
    }
  };

  const autoOptimize = () => {
    const opt = calculateOptimalFeeders(feeders, requiredShedding);
    setSelectedFeederIds(opt.recommendedFeeders.map(f => f.id));
  };

  const generatedMessage = generateWhatsAppMessage(
    {
      time: currentTimeStr,
      demand,
      allocatedLoad,
      selectedFeederIds,
      expectedRestoreTime: expectedRestoreTimeStr
    },
    feeders,
    settings
  );

  const handleConfirmShedding = async () => {
    const selectedNames = feeders.filter(f => selectedFeederIds.includes(f.id)).map(f => f.name);

    let finalStatus: 'SENT' | 'FAILED' | 'MANUAL' = 'MANUAL';
    if (settings.whatsAppPhoneNumberId && settings.whatsAppAccessToken) {
      const success = await sendWhatsAppViaApi(generatedMessage, settings.defaultContactGroup, settings);
      finalStatus = success ? 'SENT' : 'FAILED';
    }

    await addLoadSheddingRecord({
      date: new Date().toISOString().split('T')[0],
      time: currentTimeStr,
      demand,
      allocatedLoad,
      requiredShedding,
      selectedFeederIds,
      selectedFeederNames: selectedNames,
      totalShedLoad: selectedTotalLoad,
      expectedRestoreTime: expectedRestoreTimeStr,
      whatsAppStatus: finalStatus,
      createdBy: 'Operator'
    });

    setIsConfirmModalOpen(false);
    alert('Load Shedding Confirmed & Saved to History!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendApi = async () => {
    setApiStatus('Sending...');
    const ok = await sendWhatsAppViaApi(generatedMessage, settings.defaultContactGroup, settings);
    if (ok) {
      setApiStatus('✓ Message Sent via API');
    } else {
      setApiStatus('✕ Failed to send API');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">নতুন লোডশেডিং নির্ধারণ</h2>
        <p className="text-sm text-slate-500">চাহিদা ও বরাদ্দের ভিত্তিতে সঠিক ফিডার নির্বাচন করুন</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">ইনপুট প্যারামিটার</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মোট Demand (MW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={demand}
                  onChange={(e) => setDemand(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  মোট Allocated Load (MW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={allocatedLoad}
                  onChange={(e) => setAllocatedLoad(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  শেডিং সময়কাল (Duration)
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>৬০ মিনিট (১ ঘণ্টা)</option>
                  <option value={90}>৯০ মিনিট</option>
                  <option value={120}>১২০ মিনিট (২ ঘণ্টা)</option>
                </select>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Required Shedding</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {useBn ? toBengaliNumeral(requiredShedding) : requiredShedding.toFixed(2)} MW
                  </div>
                </div>
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ফিডার নির্বাচন (Selection Override)</h3>
              <button
                onClick={autoOptimize}
                className="flex items-center space-x-1 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto Optimize</span>
              </button>
            </div>

            {warningMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{warningMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              {feeders.map((f) => {
                const isSelected = selectedFeederIds.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleFeederSelection(f)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      f.isProtected
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 dark:border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={f.isProtected}
                        onChange={() => {}}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">({f.code})</span>
                        {f.isProtected && (
                          <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            PROTECTED
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">
                      {useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(2)} MW
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
              <span>Selected Total Load:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 text-lg">
                {useBn ? toBengaliNumeral(selectedTotalLoad) : selectedTotalLoad.toFixed(2)} MW
              </span>
            </div>

            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={selectedFeederIds.length === 0}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Confirm Load Shedding</span>
            </button>
          </div>
        </div>

        <div>
          <WhatsAppPreview
            message={generatedMessage}
            onCopy={handleCopy}
            onSendApi={settings.whatsAppPhoneNumberId ? handleSendApi : undefined}
            onOpenWeb={() => openWhatsAppWeb(generatedMessage, settings.defaultContactGroup)}
            copied={copied}
            statusText={apiStatus}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        title="Load Shedding Confirmation"
        message={
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300">আপনি কি নিশ্চিতভাবে এই লোডশেডিং কনফার্ম করতে চান?</p>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg space-y-1 font-mono">
              <div>Demand: {demand} MW</div>
              <div>Allocated: {allocatedLoad} MW</div>
              <div>Required: {requiredShedding} MW</div>
              <div>Selected: {selectedTotalLoad} MW</div>
              <div>
                Feeders:{' '}
                {feeders
                  .filter(f => selectedFeederIds.includes(f.id))
                  .map(f => f.name)
                  .join(', ')}
              </div>
            </div>
          </div>
        }
        onConfirm={handleConfirmShedding}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
        
