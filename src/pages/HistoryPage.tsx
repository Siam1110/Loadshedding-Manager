import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Calendar, FileText } from 'lucide-react';
import { toBengaliNumeral } from '../utils/bnUtils';

export const HistoryPage: React.FC = () => {
  const { history, settings } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('ALL');

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.selectedFeederNames.some(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || item.date.includes(searchTerm);

    if (!matchesSearch) return false;

    if (filterPeriod === 'TODAY') {
      const today = new Date().toISOString().split('T')[0];
      return item.date === today;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">লোডশেডিং হিস্ট্রি (History Log)</h2>
        <p className="text-sm text-slate-500">পূর্ববর্তী সকল লোডশেডিং রেকর্ড ও বিস্তারিত অডিট লগ</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="ফিডার নাম বা তারিখ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilterPeriod('ALL')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border ${
              filterPeriod === 'ALL'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            সকল (All)
          </button>
          <button
            onClick={() => setFilterPeriod('TODAY')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border ${
              filterPeriod === 'TODAY'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            আজকের (Today)
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Demand</th>
                  <th className="px-6 py-4">Allocated</th>
                  <th className="px-6 py-4">Req. Shedding</th>
                  <th className="px-6 py-4">Selected Feeders</th>
                  <th className="px-6 py-4">Shed Load</th>
                  <th className="px-6 py-4">Restore Time</th>
                  <th className="px-6 py-4">WhatsApp Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.time}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">{useBn ? toBengaliNumeral(item.demand) : item.demand} MW</td>
                    <td className="px-6 py-4 font-mono">{useBn ? toBengaliNumeral(item.allocatedLoad) : item.allocatedLoad} MW</td>
                    <td className="px-6 py-4 font-mono font-semibold text-rose-600">
                      {useBn ? toBengaliNumeral(item.requiredShedding) : item.requiredShedding} MW
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.selectedFeederNames.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-bold rounded text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">
                      {useBn ? toBengaliNumeral(item.totalShedLoad) : item.totalShedLoad} MW
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{item.expectedRestoreTime}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.whatsAppStatus === 'SENT' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : item.whatsAppStatus === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.whatsAppStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
          
