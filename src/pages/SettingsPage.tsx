import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useApp();

  const [systemName, setSystemName] = useState(settings.systemName);
  const [defaultDuration, setDefaultDuration] = useState(settings.defaultDurationMinutes);
  const [template, setTemplate] = useState(settings.messageTemplate);
  const [phoneNumberId, setPhoneNumberId] = useState(settings.whatsAppPhoneNumberId);
  const [accessToken, setAccessToken] = useState(settings.whatsAppAccessToken);
  const [defaultGroup, setDefaultGroup] = useState(settings.defaultContactGroup);
  const [bengaliFormat, setBengaliFormat] = useState(settings.bengaliNumberFormatting);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      systemName,
      defaultDurationMinutes: defaultDuration,
      messageTemplate: template,
      whatsAppPhoneNumberId: phoneNumberId,
      whatsAppAccessToken: accessToken,
      defaultContactGroup: defaultGroup,
      bengaliNumberFormatting: bengaliFormat
    });
    alert('Settings Saved Successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">সিস্টেম সেটিংস</h2>
        <p className="text-sm text-slate-500">WhatsApp API, টেমপ্লেট এবং বাংলা ফরম্যাটিং কনফিগারেশন</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">সাধারণ সেটিংস (General Settings)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">সিস্টেমের নাম</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ডিফল্ট শেডিং সময়কাল (মিনিট)</label>
              <input
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={bengaliFormat}
                onChange={(e) => setBengaliFormat(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span>বাংলা সংখ্যা ফরম্যাটিং চালু রাখুন (Bengali Numerals Formatting)</span>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">WhatsApp Message Template</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              মেসেজ ফরম্যাট ({'{time}'}, {'{demand}'}, {'{allocated}'}, {'{feeders}'}, {'{restoreTime}'} ট্যাগ সমর্থিত)
            </label>
            <textarea
              rows={6}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3">Official Meta WhatsApp API Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Ex: 10982374981234"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Phone Number / Group</label>
              <input
                type="text"
                value={defaultGroup}
                onChange={(e) => setDefaultGroup(e.target.value)}
                placeholder="Ex: 8801700000000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">System Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAG..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all settings and data to default demo state?')) resetToDefaults();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
          
