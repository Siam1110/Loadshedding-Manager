import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { Zap, ShieldCheck, Activity, Clock, CheckCircle2, AlertOctagon, Edit3, Check, X, Power } from 'lucide-react';
import { toBengaliNumeral } from '../utils/bnUtils';

export const Dashboard: React.FC = () => {
  const { feeders, history, settings, updateFeederLoad, restoreFeeder } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  const [editingFeederId, setEditingFeederId] = useState<string | null>(null);
  const [tempLoadValue, setTempLoadValue] = useState<string>('');

  const calculatedDemand = Number(
    feeders
      .filter(f => f.isActive)
      .reduce((sum, f) => sum + f.currentLoad, 0)
      .toFixed(settings.decimalPrecision)
  );

  const totalAllocated = history.length > 0 ? history[0].allocatedLoad : 0;
  const requiredShedding = Math.max(0, Number((calculatedDemand - totalAllocated).toFixed(settings.decimalPrecision)));

  const activeFeeders = feeders.filter(f => f.isActive);
  const protectedFeeders = feeders.filter(f => f.isProtected);
  const currentlyShedFeeders = feeders.filter(f => f.isCurrentlyShed);

  const totalCapacityMW = Number(feeders.reduce((acc, f) => acc + f.currentLoad, 0).toFixed(settings.decimalPrecision));

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

  const handleCancelEdit = () => {
    setEditingFeederId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ড্যাশবোর্ড ওভারভিউ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">রিয়েল-টাইম বিদ্যুৎ বিতরণ ও ফিডার লোড কন্ট্রোল</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>সর্বশেষ আপডেট: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Current Demand"
          value={useBn ? toBengaliNumeral(calculatedDemand) : calculatedDemand.toFixed(2)}
          unit="MW"
          icon={Zap}
          colorClass="bg-amber-500"
          subtitle="বর্তমান মোট চাহিদা (Live)"
        />
        <SummaryCard
          title="Allocated Load"
          value={useBn ? toBengaliNumeral(totalAllocated) : totalAllocated.toFixed(2)}
          unit="MW"
          icon={CheckCircle2}
          colorClass="bg-emerald-500"
          subtitle="বরাদ্দকৃত লোড"
        />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>লাইভ ফিডার স্ট্যাটাস ও লোড ইনপুট</span>
            <span className="text-xs font-normal text-slate-500">মোট লোড: {useBn ? toBengaliNumeral(totalCapacityMW) : totalCapacityMW.toFixed(2)} MW</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {feeders.map((feeder) => {
              let statusBg = 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800';
              let badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
              let badgeText = 'চালু আছে';

              if (feeder.isCurrentlyShed) {
                statusBg = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50';
                badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
                badgeText = 'শেডিং চলছে';
              } else if (feeder.isProtected) {
                statusBg = 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50';
                badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                badgeText = 'Protected';
              }

              const isEditing = editingFeederId === feeder.id;

              return (
                <div key={feeder.id} className={`p-4 rounded-xl border ${statusBg} flex flex-col justify-between space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{feeder.name}</span>
                      <span className="text-xs text-slate-500 font-mono ml-1.5">({feeder.code})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${badgeBg}`}>
                        {badgeText}
                      </span>
                      {feeder.isCurrentlyShed && (
                        <button
                          onClick={() => restoreFeeder(feeder.id)}
                          className="flex items-center space-x-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow transition"
                        >
                          <Power className="w-3 h-3" />
                          <span>চালু করুন</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">বর্তমান লোড:</span>
                    
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
                            if (e.key === 'Enter') handleSaveLoad(feeder.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold border border-amber-500 rounded bg-amber-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-500">MW</span>
                        <button
                          onClick={() => handleSaveLoad(feeder.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400">
                          {useBn ? toBengaliNumeral(feeder.currentLoad) : feeder.currentLoad.toFixed(2)} MW
                        </span>
                        <button
                          onClick={() => handleStartEdit(feeder.id, feeder.currentLoad)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">সুরক্ষিত ফিডার (Protected)</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">এই ফিডারগুলোতে কোনো অবস্থাতেই শেডিং দেওয়া হবে না</p>
            <div className="space-y-2">
              {protectedFeeders.map((f) => (
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
