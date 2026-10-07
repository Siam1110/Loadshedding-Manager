import React from 'react';
import { LayoutDashboard, Zap, ListFilter, History, Settings, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { settings, updateSettings } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
    { id: 'loadshedding', label: 'লোডশেডিং (Load Shedding)', icon: Zap },
    { id: 'feeders', label: 'ফিডারসমূহ (Feeders)', icon: ListFilter },
    { id: 'history', label: 'হিস্ট্রি (History)', icon: History },
    { id: 'settings', label: 'সেটিংস (Settings)', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {settings.systemName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Power Distribution Load Shedding Control</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            title="Toggle Theme"
          >
            {settings.darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 bg-slate-50 dark:bg-slate-900">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg text-xs ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
      
