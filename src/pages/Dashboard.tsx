import React from 'react';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { Zap, ShieldCheck, Activity, Clock, CheckCircle2, AlertOctagon } from 'lucide-react';
import { toBengaliNumeral } from '../utils/bnUtils';

export const Dashboard: React.FC = () => {
  const { feeders, history, settings } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  const totalDemand = history.length > 0 ? history[0].demand : 0;
  const totalAllocated = history.length > 0 ? history[0].allocatedLoad : 0;
  const requiredShedding = history.length > 0 ? history[0].requiredShedding : 0;

  const activeFeeders = feeders.filter(f => f.isActive);
  const protectedFeeders = feeders.filter(f => f.isProtected);
  const currentlyShedFeeders = feeders.filter(f => f.isCurrentlyShed);

  const totalCapacityMW = feeders.reduce((acc, f) => acc + f.currentLoad, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ড্যাশবোর্ড ওভারভিউ</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">রিয়েল-টাইম বিদ্যুৎ বিতরণ ও লোডশেডিং পর্যবেক্ষণ</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>সর্বশেষ আপডেট: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Current Demand"
          value={useBn ? toBengaliNumeral(totalDemand) : totalDemand.toFixed(2)}
          unit="MW"
          icon={Zap}
          colorClass="bg-amber-500"
          subtitle="বর্তমান চাহিদা"
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
            <span>ফিডারসমূহের বর্তমান অবস্থা</span>
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
                badgeText = 'লোডশেডিং চলছে';
              } else if (feeder.isProtected) {
                statusBg = 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50';
                badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                badgeText = 'Protected';
              }

              return (
                <div key={feeder.id} className={`p-4 rounded-xl border ${statusBg} flex items-center justify-between`}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">{feeder.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({feeder.code})</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      লোড: <span className="font-semibold">{useBn ? toBengaliNumeral(feeder.currentLoad) : feeder.currentLoad.toFixed(2)} MW</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>সুরক্ষিত ফিডার (Protected)</span>
            </h3>
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
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">বর্তমানে বন্ধ আছে</h3>
            {currentlyShedFeeders.length === 0 ? (
              <p className="text-xs text-slate-500 italic">কোনো ফিডার বন্ধ নেই</p>
            ) : (
              <div className="space-y-2">
                {currentlyShedFeeders.map((f) => (
                  <div key={f.id} className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                    <span className="text-sm font-semibold text-rose-900 dark:text-rose-200">{f.name}</span>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {useBn ? toBengaliNumeral(f.currentLoad) : f.currentLoad.toFixed(2)} MW
                    </span>
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
            
