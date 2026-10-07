import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Feeder } from '../types';
import { Plus, Edit2, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import { toBengaliNumeral } from '../utils/bnUtils';

export const FeedersPage: React.FC = () => {
  const { feeders, addFeeder, updateFeeder, deleteFeeder, toggleFeederProtection, settings } = useApp();
  const useBn = settings.bengaliNumberFormatting;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeeder, setEditingFeeder] = useState<Feeder | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currentLoad, setCurrentLoad] = useState(0.5);
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [isProtected, setIsProtected] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingFeeder(null);
    setName('');
    setCode('');
    setCurrentLoad(0.5);
    setPriority(1);
    setIsProtected(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (feeder: Feeder) => {
    setEditingFeeder(feeder);
    setName(feeder.name);
    setCode(feeder.code);
    setCurrentLoad(feeder.currentLoad);
    setPriority(feeder.priority);
    setIsProtected(feeder.isProtected);
    setIsActive(feeder.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFeeder) {
      updateFeeder(editingFeeder.id, {
        name,
        code,
        currentLoad,
        priority,
        isProtected,
        isActive
      });
    } else {
      addFeeder({
        name,
        code,
        currentLoad,
        priority,
        isProtected,
        isActive
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">ফিডার ব্যবস্থাপনা (Feeder Management)</h2>
          <p className="text-sm text-slate-500">সকল ফিডারের তালিকা, অগ্রাধিকার ও প্রোটেকশন স্ট্যাটাস সেট করুন</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>নতুন ফিডার যুক্ত করুন</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Feeder Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Load (MW)</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Protected</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {feeders.map((feeder) => (
                <tr key={feeder.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{feeder.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{feeder.code}</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {useBn ? toBengaliNumeral(feeder.currentLoad) : feeder.currentLoad.toFixed(2)} MW
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
                      Priority {feeder.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      feeder.isActive 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {feeder.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleFeederProtection(feeder.id)}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                        feeder.isProtected
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {feeder.isProtected ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      <span>{feeder.isProtected ? 'YES' : 'NO'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(feeder)}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete feeder ${feeder.name}?`)) deleteFeeder(feeder.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingFeeder ? 'ফিডার এডিট করুন' : 'নতুন ফিডার যুক্ত করুন'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Feeder Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Feeder Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Load (MW)</label>
              <input
                type="number"
                step="0.01"
                required
                value={currentLoad}
                onChange={(e) => setCurrentLoad(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              >
                <option value={1}>Priority 1 (Highest)</option>
                <option value={2}>Priority 2 (Medium)</option>
                <option value={3}>Priority 3 (Lowest)</option>
              </select>
            </div>

            <div className="flex space-x-6 pt-2">
              <label className="flex items-center space-x-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Protected Feeder</span>
              </label>

              <label className="flex items-center space-x-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md"
              >
                Save Feeder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
      
