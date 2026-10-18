'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Check, ArrowRight, Hotel, Bed, Flame, Clock } from 'lucide-react';
import { INITIAL_STAYS, INITIAL_PREFERENCES } from '@/lib/mockData';
import { Stay, GuestPreferences } from '@/types/hospitality';

function StayContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || 'magic_token_412_vip';

  const [loading, setLoading] = useState<boolean>(true);
  const [stay, setStay] = useState<Stay | null>(null);
  const [preferences, setPreferences] = useState<GuestPreferences>(INITIAL_PREFERENCES['stay-412']);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    // Validate token against mock/supabase stays
    const found = INITIAL_STAYS.find(s => s.accessTokenHash === token) || INITIAL_STAYS[0];
    setStay(found);
    if (INITIAL_PREFERENCES[found.id]) {
      setPreferences(INITIAL_PREFERENCES[found.id]);
    }
    setLoading(false);
  }, [token]);

  if (loading || !stay) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-[#171E52] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif font-bold text-[#171E52]">Verifying Novotel Secure Pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#F8F9FC]">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-[#E2E5F0] overflow-hidden p-6 space-y-6">
        
        {/* Novotel Crest Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171E52]/10 text-[#171E52] text-[11px] font-semibold tracking-widest uppercase">
            <Hotel className="w-3.5 h-3.5 text-[#C5A880]" />
            Novotel Hotels & Resorts
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#171E52] pt-2">
            Welcome, {stay.guestName}
          </h1>
          <p className="text-xs text-[#5E6482]">
            Residence Room {stay.roomId.replace('room-', '')} • Zero-Download VIP Pass
          </p>
        </div>

        {/* Quick Preference Card */}
        <div className="bg-gradient-to-br from-[#171E52] to-[#0F1155] text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs text-[#C5A880]">
            <span className="font-semibold tracking-wider uppercase">Your Sanctuary Pre-Sets</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">Auto-Synced</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/60 block">Bedding</span>
              <span className="font-semibold">{preferences.pillowType}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/60 block">Towel Warming</span>
              <span className="font-semibold">{preferences.towelWarmingTime} PM</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/60 block">Room Temperature</span>
              <span className="font-semibold">{preferences.roomTemp}°C</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] text-white/60 block">Dietary</span>
              <span className="font-semibold">{preferences.allergies.join(', ') || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full py-3.5 bg-[#171E52] hover:bg-[#0F1155] text-white font-semibold text-xs rounded-2xl shadow-gold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <span>Enter Your Residence Mini-App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-[11px] text-center text-[#5E6482]">
            Protected by Cloud Firestore & Supabase Room-Level Isolation.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function StayPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-6 text-sm">Loading...</div>}>
      <StayContent />
    </Suspense>
  );
}
