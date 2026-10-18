'use client';

import React, { useState } from 'react';
import { useBranch } from '@/context/BranchContext';
import { Building2, ChevronDown, Check, MapPin, Sparkles } from 'lucide-react';

export default function BranchSelector() {
  const { activeBranch, setBranchById, branches } = useBranch();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all clickable-card"
        title="Switch Novotel Property Branch"
      >
        <MapPin className="w-3 h-3 text-[#C5A880]" />
        <span className="truncate max-w-[140px] sm:max-w-[200px]">
          {activeBranch.name.replace('Novotel ', '')}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-[#171E52] text-white rounded-2xl p-2 shadow-2xl border border-[#C5A880]/40 animate-modal">
            <div className="px-3 py-1.5 border-b border-white/10 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">
                Select Novotel Property
              </span>
              <span className="text-[11px] text-white/60">
                Customizes live services, dining & facilities
              </span>
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {branches.map((b) => {
                const isSelected = activeBranch.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBranchById(b.id);
                      setOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between clickable-card ${
                      isSelected 
                        ? 'bg-[#1E22AA] text-white font-semibold' 
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{b.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 font-mono text-[#C5A880]">
                          {b.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/60 block mt-0.5">
                        {b.city}, {b.country}
                      </span>
                      <span className="text-[9px] text-[#C5A880] block mt-0.5">
                        {b.services.hasPool ? '🏊 Pool' : '🏨 City'} • {b.services.hasGym ? '💪 24/7 Gym' : ''} • {b.services.hasTennisOrPadel ? '🎾 Tennis' : '🍽️ Gourmet Bar'}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
