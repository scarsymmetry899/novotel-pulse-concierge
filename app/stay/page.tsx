'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, ShieldCheck, Check, ArrowRight, Hotel, Bed, Flame, Clock,
  Wind, Music, Thermometer, Droplets, UtensilsCrossed, Wine, ChevronRight,
  ChevronLeft, Sparkle, Sliders, CheckCircle2, User, Volume2, ArrowUpRight
} from 'lucide-react';
import { INITIAL_STAYS, INITIAL_PREFERENCES, LUXURY_PERSONAS } from '@/lib/mockData';
import { Stay, GuestPreferences, LuxuryPersona } from '@/types/hospitality';
import { supabase } from '@/lib/supabase';

function StayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || 'magic_token_412_vip';

  const [loading, setLoading] = useState<boolean>(true);
  const [stay, setStay] = useState<Stay | null>(null);
  const [preferences, setPreferences] = useState<GuestPreferences>(INITIAL_PREFERENCES['stay-412']);
  
  // Onboarding View Mode: 'choice' | 'guided' | 'persona' | 'activated'
  const [viewMode, setViewMode] = useState<'choice' | 'guided' | 'persona' | 'activated'>('choice');
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [selectedPersona, setSelectedPersona] = useState<LuxuryPersona>(LUXURY_PERSONAS[0]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Web Audio 528Hz Solfeggio Harmonic Chime
  const playLuxuryChime = (freq: number = 528) => {
    if (typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  useEffect(() => {
    const found = INITIAL_STAYS.find(s => s.accessTokenHash === token) || INITIAL_STAYS[0];
    setStay(found);
    if (INITIAL_PREFERENCES[found.id]) {
      setPreferences(INITIAL_PREFERENCES[found.id]);
    }
    const matched = LUXURY_PERSONAS.find(p => p.guestName === found.guestName) || LUXURY_PERSONAS[0];
    setSelectedPersona(matched);
    setLoading(false);
  }, [token]);

  // Update a single preference
  const updatePref = (key: keyof GuestPreferences, val: any) => {
    setPreferences(prev => ({ ...prev, [key]: val }));
  };

  // 1-Tap Apply Persona
  const applyPersonaBlueprint = async (p: LuxuryPersona) => {
    setSelectedPersona(p);
    const updated: GuestPreferences = {
      stayId: stay?.id || 'stay-412',
      personaId: p.id,
      personaName: p.title,
      wellnessInterests: p.preferences.wellnessInterests || ['Heated Pool Access', '24/7 Gym Pass'],
      tennisSlot: p.preferences.tennisSlot || '17:00',
      pillowType: (p.sensoryProfile.pillow as any) || 'Hungarian Goose Down',
      towelWarmingTime: p.preferences.towelWarmingTime || '21:00',
      roomTemp: p.sensoryProfile.roomTemp,
      aromatherapy: p.sensoryProfile.aromatherapy,
      soundscape: p.sensoryProfile.soundscape,
      lightingMood: p.sensoryProfile.lighting,
      bathRitual: p.sensoryProfile.bathRitual,
      breakfastStyle: p.refreshments.breakfast,
      minibarItems: p.refreshments.beverages,
      allergies: p.refreshments.dietaryFlags,
      customNotes: p.preferences.customNotes || '',
    };
    setPreferences(updated);
    playLuxuryChime(528);
    setViewMode('activated');

    try {
      await supabase
        .from('preferences')
        .update({
          persona_id: p.id,
          persona_name: p.title,
          wellness_interests: updated.wellnessInterests,
          tennis_slot: updated.tennisSlot,
          pillow_type: updated.pillowType,
          towel_warming_time: updated.towelWarmingTime,
          room_temp: updated.roomTemp,
          aromatherapy: updated.aromatherapy,
          soundscape: updated.soundscape,
          lighting_mood: updated.lightingMood,
          bath_ritual: updated.bathRitual,
          breakfast_style: updated.breakfastStyle,
          minibar_items: updated.minibarItems,
          allergies: updated.allergies,
          updated_at: new Date().toISOString()
        })
        .eq('stay_id', stay?.id || 'stay-412');
    } catch (e) {}
  };

  // Complete Guided Onboarding
  const completeGuidedCalibration = async () => {
    setIsSaving(true);
    playLuxuryChime(528);
    setViewMode('activated');

    try {
      await supabase
        .from('preferences')
        .update({
          wellness_interests: preferences.wellnessInterests,
          tennis_slot: preferences.tennisSlot,
          pillow_type: preferences.pillowType,
          towel_warming_time: preferences.towelWarmingTime,
          room_temp: preferences.roomTemp,
          aromatherapy: preferences.aromatherapy,
          soundscape: preferences.soundscape,
          lighting_mood: preferences.lightingMood,
          bath_ritual: preferences.bathRitual,
          breakfast_style: preferences.breakfastStyle,
          minibar_items: preferences.minibarItems,
          allergies: preferences.allergies,
          updated_at: new Date().toISOString()
        })
        .eq('stay_id', stay?.id || 'stay-412');
    } catch (e) {}
    setIsSaving(false);
  };

  if (loading || !stay) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-[#171E52] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-serif font-bold text-[#171E52]">Verifying Novotel Secure Token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-3 sm:p-5 md:p-8 bg-[#F8F9FC] min-h-[100dvh]">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-8 z-50 bg-[#171E52] text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl border border-[#C5A880]/50 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          {toastMsg}
        </div>
      )}

      {/* Main Sanctuary Card Container (393px phone viewport standard) */}
      <div className="w-full max-w-[420px] bg-white rounded-[36px] shadow-2xl border border-[#E2E5F0] overflow-hidden flex flex-col min-h-[820px] relative card-luxury">
        
        {/* Top Status Bar & Accor Brand Pill */}
        <div className="bg-[#171E52] px-6 pt-3.5 pb-2.5 text-white/80 flex items-center justify-between text-xs font-medium select-none">
          <span>9:41</span>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-[#C5A880]">
            <span>NOVOTEL PULSE</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span>5G • 100%</span>
        </div>

        {/* Brand Header */}
        <div className="bg-gradient-to-b from-[#171E52] to-[#0F1155] text-white px-6 pt-4 pb-5 rounded-b-[28px] shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase block">
                Digital Concierge Entry
              </span>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                Welcome, {stay.guestName.split(' ')[0]}
              </h1>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-semibold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              SUITE 412
            </div>
          </div>
          <p className="text-xs text-white/70 mt-1">
            Executive Residence • Accor ALL Platinum VIP
          </p>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: CHOICE ARCHITECTURE (Guided vs 1-Tap Persona)          */}
        {/* ============================================================== */}
        {viewMode === 'choice' && (
          <div className="flex-1 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-center space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                  Frictionless Personalization
                </span>
                <h2 className="text-lg font-serif font-bold text-[#171E52]">
                  How would you like to prepare your stay?
                </h2>
                <p className="text-xs text-[#5E6482]">
                  Select your arrival mode. Both take under 30 seconds.
                </p>
              </div>

              {/* Option A: Guided 30-Second Sensory Calibration */}
              <div 
                onClick={() => setViewMode('guided')}
                className="p-4 rounded-2xl border-2 border-[#171E52]/10 hover:border-[#1E22AA] bg-[#F8F9FC] hover:bg-white transition-all cursor-pointer shadow-sm group space-y-2 clickable-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#171E52] text-white flex items-center justify-center">
                      <Sliders className="w-4 h-4 text-[#C5A880]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#171E52] group-hover:text-[#1E22AA] transition-colors">
                        Guided 30s Calibration
                      </h3>
                      <span className="text-[11px] text-[#5E6482]">Tailor each sensory parameter</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E22AA]">
                    3 Steps
                  </span>
                </div>
                <p className="text-xs text-[#5E6482] pl-11">
                  Fine-tune climate temperature, pillow firmness, bath towel warming, and breakfast cloche.
                </p>
              </div>

              {/* Option B: 1-Tap Curated Luxury Persona Blueprint */}
              <div 
                onClick={() => setViewMode('persona')}
                className="p-4 rounded-2xl border-2 border-[#C5A880]/30 hover:border-[#C5A880] bg-gradient-to-br from-[#171E52] to-[#0F1155] text-white transition-all cursor-pointer shadow-md group space-y-2 clickable-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#C5A880]/20 text-[#C5A880] flex items-center justify-center border border-[#C5A880]/40">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-serif font-bold text-white group-hover:text-[#C5A880] transition-colors">
                        1-Tap Curated Personas
                      </h3>
                      <span className="text-[11px] text-white/70">10 Instant VIP Blueprints</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C5A880] text-[#171E52]">
                    1 Tap
                  </span>
                </div>
                <p className="text-xs text-white/80 pl-11">
                  Choose from 10 signature guest profiles (Jet Lag Reset, Athlete, Wine Epicurean, Romance, HNW Privacy).
                </p>
              </div>

              {/* Suggested Persona Shortcut */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#171E52] flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                    Recommended For Your Arrival
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold">ALL VIP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#171E52] block">{selectedPersona.title}</span>
                    <span className="text-[11px] text-[#5E6482]">19°C • Goose Down • 06:15 Double Ristretto</span>
                  </div>
                  <button
                    onClick={() => applyPersonaBlueprint(selectedPersona)}
                    className="px-3 py-1.5 bg-[#171E52] text-white text-xs font-semibold rounded-xl hover:bg-[#0F1155]"
                  >
                    Quick Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] text-[#5E6482] block">
                Protected by Google Cloud KMS & Cloud Firestore Isolation.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: 3-STEP GUIDED SENSORY CALIBRATION                      */}
        {/* ============================================================== */}
        {viewMode === 'guided' && (
          <div className="flex-1 p-4 space-y-4 flex flex-col justify-between overflow-y-auto pb-6">
            
            {/* Header & Step Dots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">
                    Step {guidedStep} of 3
                  </span>
                  <h2 className="text-base font-serif font-bold text-[#171E52]">
                    {guidedStep === 1 && 'Ambient Sensory & Climate'}
                    {guidedStep === 2 && 'Restorative Sleep & Bath Warmth'}
                    {guidedStep === 3 && 'Artisanal Gastronomy & Barista'}
                  </h2>
                </div>
                <button
                  onClick={() => setViewMode('choice')}
                  className="text-xs text-[#5E6482] hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Progress bar */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className={`h-1.5 rounded-full transition-all ${guidedStep >= 1 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${guidedStep >= 2 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${guidedStep >= 3 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* STEP 1: Ambient Sensory & Climate */}
            {guidedStep === 1 && (
              <div className="space-y-3.5">
                {/* Aromatherapy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Ultrasonic Diffuser Essence
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { name: 'French Lavender & Roman Chamomile', notes: 'Top: Bergamot • Heart: Lavender • Base: Cedar' },
                      { name: 'Mediterranean Bergamot & Sweet Orange', notes: 'Top: Bitter Orange • Heart: Neroli • Base: Vetiver' },
                      { name: 'Mysore Sandalwood & Ambergris', notes: 'Top: Cardamom • Heart: Sandalwood • Base: Amber' },
                      { name: 'Organic Atlas Cedarwood & Mint', notes: 'Top: Peppermint • Heart: Cedar • Base: Pine' },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => updatePref('aromatherapy', item.name)}
                        className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between clickable-card ${
                          preferences.aromatherapy === item.name
                            ? 'border-[#171E52] bg-blue-50/50 text-[#171E52] font-medium'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block text-[#171E52]">{item.name}</span>
                          <span className="text-[10px] text-[#5E6482]">{item.notes}</span>
                        </div>
                        {preferences.aromatherapy === item.name && <Check className="w-4 h-4 text-[#1E22AA]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soundscapes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Neuro-Acoustic Resonance
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Delta-Wave Binaural (432Hz)', sub: 'Deep REM sleep' },
                      { name: 'Alpine Rain on French Oak', sub: 'Soothing rain' },
                      { name: 'Coastal Solitude', sub: 'Gentle surf' },
                      { name: 'Absolute Pure Silence', sub: 'Zero audio' },
                    ].map((s) => (
                      <button
                        key={s.name}
                        onClick={() => updatePref('soundscape', s.name)}
                        className={`p-2 rounded-xl text-left border transition-all clickable-card ${
                          preferences.soundscape === s.name
                            ? 'border-[#171E52] bg-blue-50/50 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#171E52]">{s.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-[#5E6482]">{s.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Climate Slider */}
                <div className="p-3 bg-white border border-[#E2E5F0] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#171E52] flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-[#1E22AA]" />
                      Target Residence Climate
                    </span>
                    <span className="text-xs font-bold text-[#1E22AA] bg-blue-50 px-2 py-0.5 rounded-md">
                      {preferences.roomTemp}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18.0"
                    max="23.0"
                    step="0.5"
                    value={preferences.roomTemp}
                    onChange={(e) => updatePref('roomTemp', parseFloat(e.target.value))}
                    className="w-full accent-[#171E52]"
                  />
                  <div className="flex justify-between text-[10px] text-[#5E6482]">
                    <span>18.0°C (Deep Sleep)</span>
                    <span>20.5°C (Temperate)</span>
                    <span>23.0°C (Warm)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Sleep & Bath Warmth */}
            {guidedStep === 2 && (
              <div className="space-y-3.5">
                {/* Pillows */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Pillow Sommelier Selection
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Hungarian Goose Down', fill: '800-fill power cloud loft with sateen shell' },
                      { name: 'Ergonomic Memory Foam', fill: 'Contoured orthopedic cervical spine alignment' },
                      { name: 'Organic Buckwheat', fill: 'Therapeutic cooling support with buckwheat hulls' },
                      { name: 'Cooling Bamboo Silk', fill: 'Breathable thermo-regulating spun bamboo' },
                    ].map((p) => (
                      <button
                        key={p.name}
                        onClick={() => updatePref('pillowType', p.name)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between clickable-card ${
                          preferences.pillowType === p.name
                            ? 'border-[#171E52] bg-blue-50/50 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block text-[#171E52]">{p.name}</span>
                          <span className="text-[10px] text-[#5E6482]">{p.fill}</span>
                        </div>
                        {preferences.pillowType === p.name && <Check className="w-4 h-4 text-[#1E22AA]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-warm bath towels */}
                <div className="p-3 bg-white border border-[#E2E5F0] rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#171E52] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Pre-Warm Bath Sheets
                    </span>
                    <span className="text-[10px] text-[#5E6482]">Target evening warming</span>
                  </div>
                  <select
                    value={preferences.towelWarmingTime}
                    onChange={(e) => updatePref('towelWarmingTime', e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-[#171E52] rounded-xl border border-blue-200"
                  >
                    <option value="19:30">19:30 PM</option>
                    <option value="20:00">20:00 PM</option>
                    <option value="20:30">20:30 PM</option>
                    <option value="21:00">21:00 PM</option>
                    <option value="21:30">21:30 PM</option>
                    <option value="22:30">22:30 PM</option>
                  </select>
                </div>

                {/* Bath Soaks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                    In-Residence Bath Soak Ritual
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Magnesium Flakes & Epsom', sub: 'Sleep trigger' },
                      { name: 'Peppermint Foot Recovery', sub: 'Post-run relief' },
                      { name: 'Rose Petal Mineral Bath', sub: 'Romantic soak' },
                      { name: 'Seaweed Botanical Soak', sub: 'Skin detox' },
                    ].map((soak) => (
                      <button
                        key={soak.name}
                        onClick={() => updatePref('bathRitual', soak.name)}
                        className={`p-2 rounded-xl text-left border transition-all clickable-card ${
                          preferences.bathRitual === soak.name
                            ? 'border-[#171E52] bg-blue-50/50 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                        }`}
                      >
                        <span className="text-xs font-bold block text-[#171E52]">{soak.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-[#5E6482]">{soak.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Gastronomy & Barista */}
            {guidedStep === 3 && (
              <div className="space-y-3.5">
                {/* Breakfast */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Breakfast Experience
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { title: 'In-Room Continental Silver Tray', sub: 'Delivered to your door under cloche' },
                      { title: 'The Square Signature Buffet', sub: 'Live chef stations & French bakery' },
                      { title: 'High-Protein Recovery Scramble', sub: '35g+ protein with avocado & greens' },
                      { title: 'Plant-Based Wellness Bowl', sub: 'Chia seed pudding & organic berries' },
                    ].map((b) => (
                      <button
                        key={b.title}
                        onClick={() => updatePref('breakfastStyle', b.title)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between clickable-card ${
                          preferences.breakfastStyle === b.title
                            ? 'border-[#171E52] bg-blue-50/50 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block text-[#171E52]">{b.title}</span>
                          <span className="text-[10px] text-[#5E6482]">{b.sub}</span>
                        </div>
                        {preferences.breakfastStyle === b.title && <Check className="w-4 h-4 text-[#1E22AA]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Allergens */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52]">
                    Dietary Requirements & Kitchen Alerts
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Gluten-Free', 'Nut Allergy', 'Lactose-Free', 'Vegan', 'Allium-Free', 'High-Protein'].map((diet) => {
                      const isSelected = preferences.allergies.includes(diet);
                      return (
                        <button
                          key={diet}
                          onClick={() => {
                            const next = isSelected
                              ? preferences.allergies.filter(d => d !== diet)
                              : [...preferences.allergies, diet];
                            updatePref('allergies', next);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all clickable-card ${
                            isSelected
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                              : 'bg-white text-[#5E6482] border border-[#E2E5F0]'
                          }`}
                        >
                          {isSelected ? `✓ ${diet}` : `+ ${diet}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minibar */}
                <div className="p-3 bg-white border border-[#E2E5F0] rounded-2xl space-y-1 text-xs text-[#5E6482]">
                  <span className="font-bold text-[#171E52] block">Complimentary Cellar & Minibar Inclusions</span>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span>San Pellegrino Sparkling Glass</span>
                    <span className="text-emerald-600 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Artisanal Nespresso Lungo Pods</span>
                    <span className="text-emerald-600 font-semibold">Included</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              {guidedStep > 1 ? (
                <button
                  onClick={() => setGuidedStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E5F0] text-xs font-semibold text-[#5E6482] clickable-card"
                >
                  Back
                </button>
              ) : <div />}

              {guidedStep < 3 ? (
                <button
                  onClick={() => setGuidedStep(s => s + 1)}
                  className="flex-1 py-2.5 bg-[#171E52] hover:bg-[#0F1155] text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5 clickable-card"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={completeGuidedCalibration}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#1E22AA] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 clickable-card"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  <span>{isSaving ? 'Activating Sanctuary...' : 'Activate Residence Sanctuary'}</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: 1-TAP LUXURY PERSONAS SELECTOR                         */}
        {/* ============================================================== */}
        {viewMode === 'persona' && (
          <div className="flex-1 p-4 space-y-3.5 flex flex-col justify-between overflow-y-auto pb-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A880] block">
                    Accor VIP Blueprints
                  </span>
                  <h2 className="text-base font-serif font-bold text-[#171E52]">
                    Select Your Luxury Persona
                  </h2>
                </div>
                <button
                  onClick={() => setViewMode('choice')}
                  className="text-xs text-[#5E6482] hover:underline"
                >
                  Back
                </button>
              </div>
              <p className="text-xs text-[#5E6482]">
                1 tap applies complete sensory climate, sleep ergonomics, and staff dispatch.
              </p>
            </div>

            {/* Scrollable list of 10 Personas */}
            <div className="space-y-2.5 pr-1">
              {LUXURY_PERSONAS.map((p) => {
                const isSelected = selectedPersona.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => applyPersonaBlueprint(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer clickable-card ${
                      isSelected
                        ? 'border-[#C5A880] bg-[#171E52] text-white shadow-md'
                        : 'border-[#E2E5F0] bg-white hover:border-slate-300 text-[#171E52]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-serif font-bold text-sm ${isSelected ? 'text-white' : 'text-[#171E52]'}`}>
                            {p.title}
                          </span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#C5A880] text-[#171E52]' : 'bg-slate-100 text-[#5E6482]'
                          }`}>
                            {p.category}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-[#C5A880]' : 'text-[#1E22AA]'}`}>
                          {p.subtitle}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-[#C5A880]' : 'text-[#171E52]'}`}>
                        Apply →
                      </span>
                    </div>

                    <p className={`text-[11px] italic mt-1.5 ${isSelected ? 'text-white/80' : 'text-[#5E6482]'}`}>
                      "{p.tagline}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-slate-100/20 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-white/10 font-medium">
                        ❄️ {p.sensoryProfile.roomTemp}°C
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 font-medium">
                        🛏️ {p.sensoryProfile.pillow.split(' ')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 font-medium">
                        ☕ {p.refreshments.coffeeRoast.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: ACTIVATED SANCTUARY CONFIRMATION & HANDOFF             */}
        {/* ============================================================== */}
        {viewMode === 'activated' && (
          <div className="flex-1 p-6 space-y-6 flex flex-col items-center justify-center text-center animate-modal">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center animate-pulse">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] block">
                Sanctuary Calibrated & Active
              </span>
              <h2 className="text-2xl font-serif font-bold text-[#171E52]">
                Suite 412 is Ready
              </h2>
              <p className="text-xs text-[#5E6482] max-w-xs mx-auto">
                Your sensory preferences have been synchronized directly to the Floor Butler & Housekeeping tablets.
              </p>
            </div>

            {/* Applied Summary Card */}
            <div className="w-full bg-[#171E52] text-white p-4 rounded-2xl text-left space-y-2.5 shadow-lg border border-[#C5A880]/40">
              <div className="flex items-center justify-between text-xs text-[#C5A880] border-b border-white/10 pb-2">
                <span className="font-bold">✦ {preferences.personaName || 'Custom Sanctuary'}</span>
                <span>Active</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-white/80">
                <div>
                  <span className="text-white/50 block text-[10px]">Climate</span>
                  <span className="font-semibold">{preferences.roomTemp}°C</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Pillow</span>
                  <span className="font-semibold truncate block">{preferences.pillowType}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Towel Heating</span>
                  <span className="font-semibold">{preferences.towelWarmingTime} PM</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px]">Breakfast</span>
                  <span className="font-semibold truncate block">{preferences.breakfastStyle.split('(')[0]}</span>
                </div>
              </div>
            </div>

            {/* Action Handoff to Concierge Hub */}
            <div className="w-full space-y-2.5 pt-2">
              <Link
                href="/"
                className="w-full py-3.5 bg-[#171E52] hover:bg-[#0F1155] text-white font-bold text-xs rounded-2xl shadow-gold flex items-center justify-center gap-2 transition-all clickable-card"
              >
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>Enter Your Concierge Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-[10px] text-[#5E6482] block">
                Access 1-Tap Butler Dispatch, Digital Keycard & Facility Status.
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function StayPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-6 text-sm">Loading Sanctuary Pass...</div>}>
      <StayContent />
    </Suspense>
  );
}
