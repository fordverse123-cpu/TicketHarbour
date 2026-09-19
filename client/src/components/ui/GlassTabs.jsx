import React from 'react';

export default function GlassTabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-harbour-dark/90 border border-white/10 rounded-2xl backdrop-blur-md overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer
              ${isActive
                ? 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-lg shadow-cyanAccent-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
