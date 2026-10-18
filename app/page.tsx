'use client';

import React, { useState, useEffect } from 'react';
import { 
  Waves, Dumbbell, Sparkles, Flame, Bed, Coffee, 
  Check, Clock, ShieldCheck, ChevronRight, Bell, 
  Thermometer, Wine, UtensilsCrossed, Calendar, Key,
  HeartHandshake, ChevronLeft, Volume2, ArrowRight,
  Sliders, User, Moon, Sun, Wind, Droplets, Leaf,
  Briefcase, Heart, Baby, Eye, X, CheckCircle2, ChevronDown,
  Sparkle, Award, Compass, Music, FlameKindling, Radio, ChevronUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_FACILITIES, INITIAL_REQUESTS, INITIAL_PREFERENCES, LUXURY_PERSONAS } from '@/lib/mockData';
import { GuestPreferences, ServiceRequest, Facility, LuxuryPersona } from '@/types/hospitality';

export default function GuestMiniApp() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'hub' | 'sanctuary' | 'facilities' | 'keycard'>('hub');
  
  // Active Persona & Guest State (Default Suite 412 - Arthur Hastings)
  const [currentPersona, setCurrentPersona] = useState<LuxuryPersona>(LUXURY_PERSONAS[0]);
  const [preferences, setPreferences] = useState<GuestPreferences>(INITIAL_PREFERENCES['stay-412']);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [saveStatus, setSaveStatus] = useState<string>('Synced');
  const [nfcUnlocked, setNfcUnlocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPersonaDrawer, setShowPersonaDrawer] = useState<boolean>(false);

  // Web Audio Harmonic Chime Synthesis (Emil Kowalski Physical Sound)
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

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Mobile Haptic Feedback
  const triggerHaptic = (ms: number = 25) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  };

  // Sync with Supabase Realtime
  useEffect(() => {
    async function loadData() {
      try {
        const { data: prefData } = await supabase
          .from('preferences')
          .select('*')
          .eq('stay_id', 'stay-412')
          .single();
        if (prefData) {
          setPreferences({
            stayId: prefData.stay_id,
            personaId: prefData.persona_id || 'jet-lag-exec',
            personaName: prefData.persona_name || 'The Jet-Lagged Global Executive',
            wellnessInterests: prefData.wellness_interests || ['Heated Pool Access', '24/7 Gym Pass'],
            tennisSlot: prefData.tennis_slot,
            pillowType: prefData.pillow_type || 'Hungarian Goose Down',
            towelWarmingTime: prefData.towel_warming_time || '21:30',
            roomTemp: Number(prefData.room_temp) || 19.0,
            aromatherapy: prefData.aromatherapy || 'French Lavender & Roman Chamomile',
            soundscape: prefData.soundscape || 'Delta-Wave Binaural (432Hz)',
            lightingMood: prefData.lighting_mood || 'Deep Twilight (1800K)',
            bathRitual: prefData.bath_ritual || 'Magnesium Flakes & Epsom Bath Soak',
            breakfastStyle: prefData.breakfast_style || 'In-Room Continental Silver Tray',
            minibarItems: prefData.minibar_items || ['San Pellegrino Sparkling'],
            allergies: prefData.allergies || ['Gluten-Free', 'Nut Allergy'],
            customNotes: prefData.custom_notes || '',
          });

          const matched = LUXURY_PERSONAS.find(p => p.id === prefData.persona_id);
          if (matched) setCurrentPersona(matched);
        }

        const { data: reqData } = await supabase
          .from('service_requests')
          .select('*')
          .eq('stay_id', 'stay-412')
          .order('created_at', { ascending: false });
        if (reqData && reqData.length > 0) {
          setRequests(reqData.map(r => ({
            id: r.id,
            stayId: r.stay_id,
            roomId: r.room_id,
            department: r.department,
            serviceType: r.service_type,
            details: r.details,
            scheduledTime: r.scheduled_time,
            status: r.status,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          })));
        }
      } catch (e) {
        console.log('Using offline mock fallback state');
      }
    }
    loadData();

    // Supabase Realtime Listener
    const channel = supabase
      .channel('service_requests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, (payload) => {
        if (payload.new) {
          const updated = payload.new as any;
          setRequests(prev => {
            const index = prev.findIndex(r => r.id === updated.id);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = {
                id: updated.id,
                stayId: updated.stay_id,
                roomId: updated.room_id,
                department: updated.department,
                serviceType: updated.service_type,
                details: updated.details,
                scheduledTime: updated.scheduled_time,
                status: updated.status,
                createdAt: updated.created_at,
                updatedAt: updated.updated_at,
              };
              return copy;
            }
            return [updated, ...prev];
          });
          playLuxuryChime(660);
          showToast(`Butler Update: ${updated.service_type} is now ${updated.status.toUpperCase()}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update Single Preference
  const updatePreference = async (key: keyof GuestPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaveStatus('Saving...');
    triggerHaptic(15);

    try {
      await supabase
        .from('preferences')
        .update({
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
        .eq('stay_id', 'stay-412');
      setSaveStatus('Synced to cloud');
    } catch (e) {
      setSaveStatus('Saved locally');
    }
  };

  // 1-Tap Apply Persona from Bottom Drawer
  const applyPersona = async (persona: LuxuryPersona) => {
    setCurrentPersona(persona);
    const updatedPref: GuestPreferences = {
      stayId: 'stay-412',
      personaId: persona.id,
      personaName: persona.title,
      wellnessInterests: persona.preferences.wellnessInterests || ['Heated Pool Access', '24/7 Gym Pass'],
      tennisSlot: persona.preferences.tennisSlot || '17:00',
      pillowType: (persona.sensoryProfile.pillow as any) || 'Hungarian Goose Down',
      towelWarmingTime: persona.preferences.towelWarmingTime || '21:00',
      roomTemp: persona.sensoryProfile.roomTemp,
      aromatherapy: persona.sensoryProfile.aromatherapy,
      soundscape: persona.sensoryProfile.soundscape,
      lightingMood: persona.sensoryProfile.lighting,
      bathRitual: persona.sensoryProfile.bathRitual,
      breakfastStyle: persona.refreshments.breakfast,
      minibarItems: persona.refreshments.beverages,
      allergies: persona.refreshments.dietaryFlags,
      customNotes: persona.preferences.customNotes || '',
    };

    setPreferences(updatedPref);
    setShowPersonaDrawer(false);
    playLuxuryChime(528);
    triggerHaptic(30);
    showToast(`✓ Sanctuary Applied: ${persona.title}. Staff notified.`);

    try {
      await supabase
        .from('preferences')
        .update({
          persona_id: persona.id,
          persona_name: persona.title,
          wellness_interests: updatedPref.wellnessInterests,
          tennis_slot: updatedPref.tennisSlot,
          pillow_type: updatedPref.pillowType,
          towel_warming_time: updatedPref.towelWarmingTime,
          room_temp: updatedPref.roomTemp,
          aromatherapy: updatedPref.aromatherapy,
          soundscape: updatedPref.soundscape,
          lighting_mood: updatedPref.lightingMood,
          bath_ritual: updatedPref.bathRitual,
          breakfast_style: updatedPref.breakfastStyle,
          minibar_items: updatedPref.minibarItems,
          allergies: updatedPref.allergies,
          custom_notes: updatedPref.customNotes,
          updated_at: new Date().toISOString()
        })
        .eq('stay_id', 'stay-412');
    } catch (e) {}
  };

  // Instant Dispatch Request
  const createServiceRequest = async (serviceType: string, department: 'housekeeping' | 'wellness' | 'fnb', details: string, scheduledTime?: string) => {
    const newReq: ServiceRequest = {
      id: 'req-' + Date.now(),
      stayId: 'stay-412',
      roomId: 'room-412',
      department,
      serviceType,
      details,
      scheduledTime: scheduledTime || 'Immediate',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests(prev => [newReq, ...prev]);
    playLuxuryChime(440);
    triggerHaptic(20);
    showToast(`✓ Request Dispatched: ${serviceType}`);

    try {
      await supabase.from('service_requests').insert({
        id: newReq.id,
        stay_id: newReq.stayId,
        room_id: newReq.roomId,
        department: newReq.department,
        service_type: newReq.serviceType,
        details: newReq.details,
        scheduled_time: newReq.scheduledTime,
        status: newReq.status,
      });
    } catch (e) {}
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 bg-[#F8F9FC] min-h-[100dvh]">
      {/* Toast Notification (Sonner Style Stack) */}
      {toastMessage && (
        <div className="fixed top-12 z-50 bg-[#171E52] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-2xl border border-[#C5A880]/50 flex items-center gap-2 animate-modal">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Device Frame Container (393px width iOS standard) */}
      <div className="w-full max-w-[420px] bg-white rounded-[36px] shadow-2xl border border-[#E2E5F0] overflow-hidden flex flex-col min-h-[850px] relative card-luxury">
        
        {/* Device Notch & Status Bar */}
        <div className="bg-[#171E52] px-6 pt-3.5 pb-2 text-white/80 flex items-center justify-between text-xs font-medium select-none">
          <span>9:41</span>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-[#C5A880]">
            <span>NOVOTEL PULSE</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span>5G • 100%</span>
        </div>

        {/* Top Header Card (Accor Luxury Dark Mode) */}
        <div className="bg-gradient-to-b from-[#171E52] to-[#0F1155] text-white px-5 pt-3.5 pb-4 rounded-b-[28px] shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase">
                Executive Residence
              </span>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                Suite 412
              </h1>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-semibold tracking-wider">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              ALL PLATINUM
            </div>
          </div>

          {/* Active Persona Banner & Quick Drawer Trigger */}
          <div 
            onClick={() => {
              triggerHaptic(20);
              setShowPersonaDrawer(true);
            }}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-[#C5A880]/40 rounded-2xl p-2.5 mt-2 transition-all flex items-center justify-between group clickable-card"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
                <Sparkle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[9px] text-[#C5A880] font-bold uppercase tracking-wider block">
                  Active Persona Blueprint
                </span>
                <span className="text-xs font-semibold text-white truncate max-w-[210px] block">
                  {currentPersona.title}
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-white/15 text-[10px] font-semibold text-[#C5A880] flex items-center gap-1 group-hover:bg-[#C5A880] group-hover:text-[#171E52] transition-colors">
              <span>Change</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/70 pt-2.5 border-t border-white/10 mt-2.5">
            <span>{currentPersona.guestName}</span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium">Digital Key Active</span>
              <button 
                onClick={() => setActiveTab('keycard')}
                className="text-[11px] text-[#C5A880] underline font-medium"
              >
                Pass
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Chips (Origin-aware tactile tabs) */}
        <div className="px-4 py-2.5 bg-[#F8F9FC] border-b border-[#E2E5F0] grid grid-cols-4 gap-1 text-xs font-medium">
          <button
            onClick={() => { setActiveTab('hub'); triggerHaptic(10); }}
            className={`py-1.5 rounded-xl text-center transition-all clickable-card ${activeTab === 'hub' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Hub
          </button>
          <button
            onClick={() => { setActiveTab('sanctuary'); triggerHaptic(10); }}
            className={`py-1.5 rounded-xl text-center transition-all clickable-card ${activeTab === 'sanctuary' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => { setActiveTab('facilities'); triggerHaptic(10); }}
            className={`py-1.5 rounded-xl text-center transition-all clickable-card ${activeTab === 'facilities' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Facilities
          </button>
          <button
            onClick={() => { setActiveTab('keycard'); triggerHaptic(10); }}
            className={`py-1.5 rounded-xl text-center transition-all clickable-card ${activeTab === 'keycard' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Key Pass
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: IN-STAY CONCIERGE HUB & LIVE DISPATCH                   */}
        {/* ============================================================== */}
        {activeTab === 'hub' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            
            {/* Live Facility Status Deck (Horizontal Snap Carousel) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5E6482]">
                  Live Facility Telemetry
                </h3>
                <span className="text-[11px] text-[#1E22AA] font-medium">Swipe for more</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1 snap-x">
                {/* Pool Card */}
                <div className="min-w-[240px] bg-gradient-to-br from-[#0F1155] to-[#171E52] text-white p-3.5 rounded-2xl shadow-sm border border-white/10 snap-start flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                      <Waves className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      28.5°C • Calm
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm">Heated Infinity Pool</h4>
                    <p className="text-[11px] text-white/70">6:00 - 22:00 • Adults Lap 06:30</p>
                  </div>
                  <button 
                    onClick={() => createServiceRequest('Poolside Cabana Reservation', 'wellness', 'Cabana #4 reserved with chilled water')}
                    className="mt-3 w-full py-1.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-[11px] font-semibold rounded-xl transition-all shadow-sm clickable-card"
                  >
                    1-Tap Reserve Cabana
                  </button>
                </div>

                {/* Fitness Card */}
                <div className="min-w-[240px] bg-white border border-[#E2E5F0] p-3.5 rounded-2xl shadow-sm snap-start flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-[#171E52]/10 text-[#171E52]">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E22AA]">
                      24/7 Access
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm text-[#171E52]">InBalance Fitness</h4>
                    <p className="text-[11px] text-[#5E6482]">Trainer on Duty • Peak 18:00</p>
                  </div>
                  <button 
                    onClick={() => showToast('Fitness locker pass added to room NFC keycard')}
                    className="mt-3 w-full py-1.5 bg-[#F8F9FC] hover:bg-slate-200 text-[#171E52] text-[11px] font-semibold rounded-xl border border-[#E2E5F0] transition-all clickable-card"
                  >
                    Instant Locker Pass
                  </button>
                </div>

                {/* Tennis Card */}
                <div className="min-w-[240px] bg-white border border-[#E2E5F0] p-3.5 rounded-2xl shadow-sm snap-start flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Court 1 Open
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm text-[#171E52]">Tennis & Padel</h4>
                    <p className="text-[11px] text-[#5E6482]">Next Slot: 17:00 • Clay Court</p>
                  </div>
                  <button 
                    onClick={() => createServiceRequest('Tennis Court Rental', 'wellness', 'Court 1 at 17:00')}
                    className="mt-3 w-full py-1.5 bg-[#171E52] hover:bg-[#0F1155] text-white text-[11px] font-semibold rounded-xl transition-all clickable-card"
                  >
                    Book 17:00 Slot
                  </button>
                </div>
              </div>
            </div>

            {/* Instant Butler & Housekeeping Quick-Dispatch Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5E6482]">
                  Instant Butler & Housekeeping
                </h3>
                <span className="text-[10px] text-emerald-600 font-medium">Avg dispatch: 6 mins</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => createServiceRequest('Pre-Warm Egyptian Bath Sheets', 'housekeeping', 'Pre-warm 2x 800gsm Egyptian cotton sheets', preferences.towelWarmingTime || '21:30')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group clickable-card"
                >
                  <div className="flex items-center justify-between text-[#1E22AA]">
                    <Flame className="w-4 h-4" />
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded">
                      {preferences.towelWarmingTime || '21:30'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Warm Bath Sheets</span>
                    <span className="text-[10px] text-[#5E6482]">Egyptian 800gsm warmed</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Magnesium Sleep Bath Setup', 'wellness', 'Stage pure magnesium flakes and chamomile soak')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group clickable-card"
                >
                  <div className="flex items-center justify-between text-[#171E52]">
                    <Droplets className="w-4 h-4 text-cyan-600" />
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 font-semibold px-1.5 py-0.5 rounded">Soak</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Magnesium Soak</span>
                    <span className="text-[10px] text-[#5E6482]">Deep sleep bath kit</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Double Ristretto & Sparkling', 'fnb', 'Double-shot Italian ristretto with chilled San Pellegrino')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group clickable-card"
                >
                  <div className="flex items-center justify-between text-[#C5A880]">
                    <Coffee className="w-4 h-4" />
                    <span className="text-[10px] bg-slate-100 text-[#5E6482] font-semibold px-1.5 py-0.5 rounded">06:15</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Double Ristretto</span>
                    <span className="text-[10px] text-[#5E6482]">Wake barista delivery</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Rose Petal Turndown', 'housekeeping', 'Evening turndown with rose petals & sleep mist')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group clickable-card"
                >
                  <div className="flex items-center justify-between text-[#171E52]">
                    <Bed className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-1.5 py-0.5 rounded">Turndown</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Rose Turndown</span>
                    <span className="text-[10px] text-[#5E6482]">Pillows fluffed & mist</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 4-Stage Live Dispatch Pipeline (Emil Kowalski Animated Fluid Tracker) */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1E22AA] animate-ping" />
                  <span className="text-xs font-bold text-[#171E52] uppercase tracking-wide">
                    Live Dispatch Pipeline
                  </span>
                </div>
                <span className="text-[10px] text-[#5E6482]">Suite 412 Live</span>
              </div>

              {requests.slice(0, 2).map((req) => (
                <div key={req.id} className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#171E52]">{req.serviceType}</span>
                    <span className="text-[11px] text-[#1E22AA] font-bold">{req.scheduledTime || 'In Progress'}</span>
                  </div>

                  {/* Progressive Connecting Fill Track */}
                  <div className="flex items-center justify-between relative px-2 mt-2">
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 rounded-full" />
                    
                    {/* Stage 1: Received */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-6 h-6 rounded-full bg-[#171E52] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                        ✓
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1 font-medium">Received</span>
                    </div>

                    {/* Stage 2: Assigned */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                        req.status === 'in_progress' || req.status === 'completed'
                          ? 'bg-[#1E22AA] text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'in_progress' || req.status === 'completed' ? '✓' : '2'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1 font-medium">Assigned</span>
                    </div>

                    {/* Stage 3: En Route */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                        req.status === 'in_progress'
                          ? 'bg-amber-500 text-white animate-pulse ring-2 ring-amber-300'
                          : req.status === 'completed'
                          ? 'bg-[#1E22AA] text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'completed' ? '✓' : '3'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1 font-medium">En Route</span>
                    </div>

                    {/* Stage 4: Delivered */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                        req.status === 'completed'
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'completed' ? '✓' : '4'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1 font-medium">Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Climate Dial */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#171E52] block">Sanctuary Climate Control</span>
                <span className="text-[11px] text-[#5E6482]">Target Room Temp: {preferences.roomTemp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePreference('roomTemp', Math.max(18.0, Number((preferences.roomTemp - 0.5).toFixed(1))))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171E52] font-bold flex items-center justify-center text-sm clickable-card"
                >
                  -
                </button>
                <span className="text-sm font-bold text-[#171E52] min-w-[42px] text-center">
                  {preferences.roomTemp}°C
                </span>
                <button
                  onClick={() => updatePreference('roomTemp', Math.min(24.0, Number((preferences.roomTemp + 0.5).toFixed(1))))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171E52] font-bold flex items-center justify-center text-sm clickable-card"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LIVE SANCTUARY AMBIENT TUNING                          */}
        {/* ============================================================== */}
        {activeTab === 'sanctuary' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-[#171E52]">
                  Residence Sanctuary Tuning
                </h2>
                <p className="text-[11px] text-[#5E6482]">Active ambient settings auto-saved to cloud.</p>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                {saveStatus}
              </span>
            </div>

            {/* Aromatherapy */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#1E22AA]" />
                Ultrasonic Aromatherapy Diffuser
              </label>
              <div className="space-y-1.5">
                {[
                  { name: 'French Lavender & Roman Chamomile', tag: 'Circadian Sleep Reset' },
                  { name: 'Mediterranean Bergamot & Sweet Orange', tag: 'Mental Clarity' },
                  { name: 'Mysore Sandalwood & Ambergris', tag: 'Warmth & Opulence' },
                  { name: 'Organic Atlas Cedarwood & Mint', tag: 'Respiratory Focus' },
                ].map((a) => (
                  <button
                    key={a.name}
                    onClick={() => updatePreference('aromatherapy', a.name)}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between clickable-card ${
                      preferences.aromatherapy === a.name
                        ? 'border-[#171E52] bg-blue-50/50 text-[#171E52] font-semibold'
                        : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block text-[#171E52]">{a.name}</span>
                      <span className="text-[10px] text-[#5E6482]">{a.tag}</span>
                    </div>
                    {preferences.aromatherapy === a.name && <Check className="w-4 h-4 text-[#1E22AA]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pillows */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-[#1E22AA]" />
                Pillow Sommelier Choice
              </label>
              <div className="space-y-1.5">
                {[
                  'Hungarian Goose Down',
                  'Ergonomic Memory Foam',
                  'Organic Buckwheat',
                  'Cooling Bamboo Silk'
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => updatePreference('pillowType', p)}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between clickable-card ${
                      preferences.pillowType === p
                        ? 'border-[#171E52] bg-blue-50/50 text-[#171E52] font-semibold'
                        : 'border-[#E2E5F0] bg-white text-[#5E6482]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#171E52]">{p}</span>
                    {preferences.pillowType === p && <Check className="w-4 h-4 text-[#1E22AA]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Towel Warming */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#171E52] block flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Pre-Warm Bath Sheets
                </span>
                <span className="text-[10px] text-[#5E6482]">Target evening heating cycle</span>
              </div>
              <select
                value={preferences.towelWarmingTime}
                onChange={(e) => updatePreference('towelWarmingTime', e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-[#171E52] rounded-xl border border-blue-200 outline-none"
              >
                <option value="19:30">19:30 PM</option>
                <option value="20:00">20:00 PM</option>
                <option value="20:30">20:30 PM</option>
                <option value="21:00">21:00 PM</option>
                <option value="21:30">21:30 PM</option>
                <option value="22:30">22:30 PM</option>
              </select>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HOTEL FACILITIES & SLOTS                               */}
        {/* ============================================================== */}
        {activeTab === 'facilities' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            <div>
              <h2 className="text-base font-serif font-bold text-[#171E52]">
                Property Facilities & Wellness
              </h2>
              <p className="text-[11px] text-[#5E6482]">Live schedules, temperatures, and 1-tap slot reservations.</p>
            </div>

            <div className="space-y-3">
              {facilities.map((facility) => (
                <div key={facility.id} className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#171E52]">{facility.name}</h3>
                      <p className="text-[11px] text-[#5E6482]">{facility.hours}</p>
                    </div>
                    {facility.temperature && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E22AA] border border-blue-200">
                        {facility.temperature}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#5E6482] bg-[#F8F9FC] p-2.5 rounded-xl border border-slate-100">
                    {facility.rules}
                  </p>

                  <div>
                    <span className="text-[10px] font-bold text-[#171E52] uppercase tracking-wider block mb-1.5">
                      Available Slots Today
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {facility.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            createServiceRequest(`${facility.name} Booking`, 'wellness', `Slot confirmed for ${slot}`, slot);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-[#171E52] hover:text-white transition-colors clickable-card"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: 3D DIGITAL RFID NFC KEY PASS                           */}
        {/* ============================================================== */}
        {activeTab === 'keycard' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 flex flex-col items-center justify-between text-center">
            <div className="space-y-1 w-full">
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase">
                Zero-Download NFC Keycard
              </span>
              <h2 className="text-lg font-serif font-bold text-[#171E52]">
                Residence Suite 412
              </h2>
              <p className="text-xs text-[#5E6482]">Hold phone near room lock reader to unlock.</p>
            </div>

            {/* Skeuomorphic 3D Luxury RFID Keycard */}
            <div 
              onClick={() => {
                setNfcUnlocked(true);
                playLuxuryChime(880);
                triggerHaptic(50);
                setTimeout(() => setNfcUnlocked(false), 3000);
              }}
              className="w-full max-w-[280px] h-[390px] bg-gradient-to-tr from-[#0F1155] via-[#171E52] to-[#1E22AA] rounded-[24px] shadow-2xl p-6 flex flex-col justify-between text-white border border-[#C5A880]/50 relative overflow-hidden cursor-pointer group transition-transform active:scale-95 clickable-card"
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A880_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="flex items-center justify-between z-10">
                <span className="font-serif font-bold tracking-widest text-sm text-[#C5A880]">
                  NOVOTEL
                </span>
                <span className="text-[10px] tracking-wider text-white/60">ALL PLATINUM</span>
              </div>

              {/* NFC Sensor Pulse Area */}
              <div className="flex flex-col items-center justify-center z-10 space-y-3">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                  nfcUnlocked
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-110'
                    : 'bg-white/10 border-white/20 text-[#C5A880] group-hover:scale-105'
                }`}>
                  <Key className={`w-8 h-8 ${nfcUnlocked ? 'animate-bounce text-emerald-300' : 'text-[#C5A880]'}`} />
                </div>
                <span className="text-xs font-semibold tracking-wide">
                  {nfcUnlocked ? 'DOOR UNLOCKED • WELCOME' : 'TAP TO TRANSMIT NFC'}
                </span>
              </div>

              <div className="flex items-end justify-between z-10 border-t border-white/10 pt-3">
                <div className="text-left">
                  <span className="text-[9px] text-white/50 block">SUITE</span>
                  <span className="font-serif font-bold text-lg text-white">412</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/50 block">GUEST</span>
                  <span className="text-xs font-semibold text-white/90">Arthur Hastings</span>
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={() => {
                  setNfcUnlocked(true);
                  playLuxuryChime(880);
                  triggerHaptic(50);
                  setTimeout(() => setNfcUnlocked(false), 3000);
                }}
                className="w-full py-3 bg-[#171E52] hover:bg-[#0F1155] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 clickable-card"
              >
                <Key className="w-4 h-4 text-[#C5A880]" />
                <span>Simulate NFC Door Tap</span>
              </button>

              <span className="text-[10px] text-[#5E6482] block">
                Encrypted via Google Cloud KMS Token (Valid through Check-Out)
              </span>
            </div>
          </div>
        )}

        {/* Bottom Global Status Bar */}
        <div className="bg-[#171E52] text-white/70 px-4 py-2 text-[10px] flex items-center justify-between border-t border-white/10 select-none pb-safe">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Concierge Online • Floor 4 Butler
          </span>
          <span className="text-[#C5A880]">Novotel Pulse v2.0</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* EMIL KOWALSKI iOS-STYLE BOTTOM SHEET DRAWER (10 Personas)       */}
      {/* ============================================================== */}
      {showPersonaDrawer && (
        <div className="fixed inset-0 z-50 bg-[#0F1155]/70 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#171E52] to-[#0A0D30] text-white rounded-t-[32px] p-5 shadow-2xl border-t border-[#C5A880]/50 max-h-[85vh] flex flex-col animate-drawer relative">
            
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1 rounded-full bg-white/30 mx-auto mb-3" />

            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase block">
                  10 Curated Luxury Blueprints
                </span>
                <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                  Select Guest Persona
                </h3>
              </div>
              <button
                onClick={() => setShowPersonaDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors clickable-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Personas List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 pr-1">
              {LUXURY_PERSONAS.map((p) => {
                const isSelected = currentPersona.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => applyPersona(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer clickable-card ${
                      isSelected
                        ? 'bg-white/15 border-[#C5A880] ring-1 ring-[#C5A880]/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-white">
                            {p.title}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#C5A880] text-[#171E52]">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#C5A880] font-medium mt-0.5">
                          {p.subtitle}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#C5A880]">
                        {isSelected ? 'Applied' : 'Apply →'}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/70 italic mt-1">
                      "{p.tagline}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-white/10 text-[10px] text-white/80">
                      <span className="px-2 py-0.5 rounded bg-white/10">❄️ {p.sensoryProfile.roomTemp}°C</span>
                      <span className="px-2 py-0.5 rounded bg-white/10">🛏️ {p.sensoryProfile.pillow.split(' ')[0]}</span>
                      <span className="px-2 py-0.5 rounded bg-white/10">☕ {p.refreshments.coffeeRoast.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span>Automatically updates Housekeeping & Butler tablets.</span>
              <button
                onClick={() => setShowPersonaDrawer(false)}
                className="px-4 py-1.5 bg-white/15 hover:bg-white/20 text-white rounded-xl font-semibold clickable-card"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
