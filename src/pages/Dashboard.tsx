import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { calculateOptimalFeeders } from '../utils/algorithm';
import { generateWhatsAppMessage, openWhatsAppWeb, sendWhatsAppViaApi } from '../utils/whatsapp';
import { WhatsAppPreview } from '../components/WhatsAppPreview';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Feeder } from '../types';
import { toBengaliNumeral } from '../utils/bnUtils';
import { Zap, ShieldCheck, Activity, Clock, CheckCircle2, AlertOctagon, Edit3, Check, X, Power, RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { feeders, history, settings, updateFeederLoad, restoreFeeder, addLoadSheddingRecord } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  // Local States
  const [allocatedLoad, setAllocatedLoad] = useState<number>(history.length > 0 ? history[0].allocatedLoad : 3.5);
  const [isEditingAllocated, setIsEditingAllocated] = useState<boolean>(false);
  const [tempAllocatedInput, setTempAllocatedInput] = useState<string>(allocatedLoad.toString());

  const [durationMinutes, setDurationMinutes] = useState<number>(settings.defaultDurationMinutes);
  const [selectedFeederIds, setSelectedFeederIds] = useState<string[]>([]);
  
  const [editingFeederId, setEditingFeederId] = useState<string | null>(null);
  const [tempLoadValue, setTempLoadValue] = useState<string>('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Dynamic Live Calculations
  const calculatedDemand = Number(
    feeders
      .filter(f => f.isActive)
      .reduce((sum, f) => sum + f.currentLoad, 0)
      .toFixed(settings.decimalPrecision)
  );

  const requiredShedding = Math.max(0, Number((calculatedDemand - allocatedLoad).toFixed(settings.decimalPrecision)));

  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const calculateRestoreTime = (time: string, duration: number) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const expectedRestoreTimeStr = calculateRestoreTime(currentTimeStr, durationMinutes);

  // Auto feeder optimization on load/demand changes
  useEffect(() => {
    if (requiredShedding > 0) {
      const opt = calculateOptimalFeeders(feeders, requiredShedding);
      setSelectedFeederIds(opt.recommendedFeeders.map(f => f.id));
    } else {
      setSelectedFeederIds([]);
    }
  }, [calculatedDemand, allocatedLoad, feeders]);

  const selectedTotalLoad = Number(
    feeders
      .filter(f => selectedFeederIds.includes(f.id))
      .reduce((sum, f) => sum + f.currentLoad, 0)
      .toFixed(settings.decimalPrecision)
  );

  const difference = Number((selectedTotalLoad - requiredShedding).toFixed(settings.decimalPrecision));

  useEffect(() => {
    if (allocatedLoad > calculatedDemand) {
      setWarningMessage('বরাদ্দকৃত লোড চাহিদার চেয়ে বেশি।');
    } else if (difference > 0.05) {
      setWarningMessage(`⚠ Selected Load is ${useBn ? toBengaliNumeral(difference) : difference} MW higher than required.`);
    } else if (difference < -0.05 && requiredShedding > 0) {
      setWarningMessage(`⚠ Selected Load is ${useBn ? toBengaliNumeral(Math.abs(difference)) : Math.abs(difference)} MW lower than required.`);
    } else {
      setWarningMessage(null);
    }
  }, [difference, allocatedLoad, calculatedDemand]);

  const activeFeeders = feeders.filter(f => f.isActive);
  const protectedFeeders = feeders.filter(f => f.isProtected);
  const currentlyShedFeeders = feeders.filter(f => f.isCurrentlyShed);
  const totalCapacityMW = Number(feeders.reduce((acc, f) => acc + f.currentLoad, 0).toFixed(settings.decimalPrecision));

  // Feeder load edit functions
  const handleStartEdit = (id: string, currentLoad: number) => {
    setEditingFeederId(id);
    setTempLoadValue(currentLoad.toString());
  };

  const handleSaveLoad = (id: string) => {
    const val = parseFloat(tempLoadValue);
    if (!isNaN(val) && val >= 0) {
      updateFeederLoad(id, Number(val.toFixed(settings.decimalPrecision)));
    }
    setEditingFeederId(null);
  };

  // Allocated load save function
  const handleSaveAllocated = () => {
    const val = parseFloat(tempAllocatedInput);
    if (!isNaN(val) && val >= 0) {
      setAllocatedLoad(Number(val.toFixed(settings.decimalPrecision)));
    }
    setIsEditingAllocated(false);
  };

  // Toggle Feeder Selection for Shedding
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
      demand: calculatedDemand,
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
      demand: calculatedDemand,
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
    alert('Load Shedding Confirmed!');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ড্যাশবোর্ড ও কন্ট্রোল সেন্টার</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">লাইভ লোড ইনপুট, বরাদ্দকরণ ও লোডশেডিং ব্যবস্থাপনা</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>সর্বশেষ আপডেট: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary Cards with Editable Allocated Load */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Current Demand"
          value={useBn ? toBengaliNumeral(calculatedDemand) : calculatedDemand.toFixed(2)}
          unit="MW"
          icon={Zap}
          colorClass="bg-amber-500"
          subtitle="বর্তমান মোট চাহিদা (Live)"
        />

        {/* Editable Allocated Load Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Allocated Load</p>
            {isEditingAllocated ? (
              <div className="flex items-center space-x-1 mt-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  value={tempAllocatedInput}
                  onChange={(e) => setTempAllocatedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveAllocated();
                    if (e.key === 'Escape') setIsEditingAllocated(false);
                  }}
                  className="w-24 px-2 py-1 text-lg font-black border border-emerald-500 rounded-lg bg-emerald-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
                <button onClick={handleSaveAllocated} className="p-1 text-emerald-600">
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline mt-2 space-x-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {useBn ? toBengaliNumeral(allocatedLoad) : allocatedLoad.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-slate-500">MW</span>
                <button
                  onClick={() => {
                    setTempAllocatedInput(allocatedLoad.toString());
                    setIsEditingAllocated(true);
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  title="বরাদ্দকৃত লোড পরিবর্তন করুন"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">বরাদ্দকৃত লোড (ক্লিক করে সেট করুন)</p>
          </div>
          <div className="p-3 rounded-xl text-white bg-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <SummaryCard
          title="Required Shedding"
          value={useBn ? toBengaliNumeral(requiredShedding) : requiredShedding.toFixed(2)}
          unit="MW"
          icon={AlertOctagon}
          colorClass="bg-rose-500"
          subtitle="প্রয়োজনীয় শেডিং"
        />
        <SummaryCard
          title="Active Feeders"
          value={useBn ? toBengaliNumeral(activeFeeders.length, 0) : activeFeeders.length.toString()}
          unit={`/ ${useBn ? toBengaliNumeral(feeders.length, 0) : feeders.length}`}
          icon={Activity}
          colorClass="bg-blue-500"
          subtitle="সক্রিয় ফিডার"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Feeder Selection & Live Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">ফিডার স্ট্যাটাস ও লোডশেডিং নির্বাচন</h3>
                <p className="text-xs text-slate-500">লোড ইনপুট দিন এবং প্রয়োজনে শেডিংয়ের জন্য টিক দিন</p>
              </div>
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

            {/* Feeder List */}
            <div className="space-y-2">
              {feeders.map((f) => {
                const isSelectedForShed = selectedFeederIds.includes(f.id);
                const isEditing = editingFeederId === f.id;

                let statusBg = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                if (f.isProtected) statusBg = 'bg-slate-100 dark:bg-slate-900 border-slate-200 opacity-70';
                else if (isSelectedForShed) statusBg = 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-sm';
                else if (f.isCurrentlyShed) statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200';

                return (
                  <div key={f.id} className={`p-3.5 rounded-xl border ${statusBg} flex items-center justify-between transition`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelectedForShed}
                        disabled={f.isProtected}
                        onChange={() => toggleFeederSelection(f)}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{f.name}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">({f.code})</span>
                        {f.isProtected && (
                          <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            PROTECTED
                          </span>
                        )}
                        {f.isCurrentlyShed && (
                          <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                            SHEDDING ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline Load Input & Actions */}
                    <div className="flex items-center space-x-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            autoFocus
                            value={tempLoadValue}
                            onChange={(e) => setTempLoadValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLoad(f.id);
                              if (e.key === 'Escape') setEditingFeederId(null);
                            }}
                            className="w-16 px-2 py-1 text-xs font-mono font-bold border border-amber-500 rounded bg-amber-50 text-slate-900 outline-none"
                          />
                          <button onClick={() => handleSaveLoad(f.id)} className="p-1 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400">
                            {useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(2)} MW
                          </span>
                          <button
                            onClick={() => handleStartEdit(f.id, f.currentLoad)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded"
                            title="Edit Load"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {f.isCurrentlyShed && (
                        <button
                          onClick={() => restoreFeeder(f.id)}
                          className="flex items-center space-x-1 px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition"
                        >
                          <Power className="w-3 h-3" />
                          <span>চালু করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Selected Shed Load Summary & Action Button */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
              <span>Selected Shed Load:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 text-lg">
                {useBn ? toBengaliNumeral(selectedTotalLoad) : selectedTotalLoad.toFixed(2)} MW
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">শেডিং সময়কাল</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm font-medium outline-none"
                >
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>৬০ মিনিট (১ ঘণ্টা)</option>
                  <option value={90}>৯০ মিনিট</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={selectedFeederIds.length === 0}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Load Shedding</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: WhatsApp Preview & Status Lists */}
        <div className="space-y-6">
          <WhatsAppPreview
            message={generatedMessage}
            onCopy={handleCopy}
            onSendApi={settings.whatsAppPhoneNumberId ? handleSendApi : undefined}
            onOpenWeb={() => openWhatsAppWeb(generatedMessage, settings.defaultContactGroup)}
            copied={copied}
            statusText={apiStatus}
          />

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
                      <div key={f.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(2)} MW
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">বর্তমানে বন্ধ আছে (Shed Feeders)</h3>
            {currentlyShedFeeders.length === 0 ? (
              <p className="text-xs text-slate-500 italic">কোনো ফিডার বন্ধ নেই</p>
            ) : (
              <div className="space-y-2">
                {currentlyShedFeeders.map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                    <div>
                      <span className="text-sm font-semibold text-rose-900 dark:text-rose-200 block">{f.name}</span>
                      <span className="text-xs font-mono text-rose-600 dark:text-rose-400">
                        {useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(2)} MW
                      </span>
                    </div>
                    <button
                      onClick={() => restoreFeeder(f.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                    >
                      চালু করুন
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
