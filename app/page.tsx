'use client';

import React, { useState, useEffect } from 'react';
import { 
  Waves, Dumbbell, Sparkles, Flame, Bed, Coffee, 
  Check, Clock, ShieldCheck, ChevronRight, Bell, 
  Thermometer, Wine, UtensilsCrossed, Calendar, Key,
  HeartHandshake, ChevronLeft, Volume2, ArrowRight,
  Sliders, User, Moon, Sun, Wind, Droplets, Leaf,
  Briefcase, Heart, Baby, Eye, X, CheckCircle2, ChevronDown,
  Sparkle, Award, Compass, Music, FlameKindling
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_FACILITIES, INITIAL_REQUESTS, INITIAL_PREFERENCES, LUXURY_PERSONAS } from '@/lib/mockData';
import { GuestPreferences, ServiceRequest, Facility, LuxuryPersona } from '@/types/hospitality';

export default function GuestMiniApp() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'hub' | 'onboarding' | 'facilities' | 'keycard'>('hub');
  
  // Onboarding Stepper (1 to 3)
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Active Persona & Guest State (Default Room 412 - Arthur Hastings)
  const [currentPersona, setCurrentPersona] = useState<LuxuryPersona>(LUXURY_PERSONAS[0]);
  const [preferences, setPreferences] = useState<GuestPreferences>(INITIAL_PREFERENCES['stay-412']);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [saveStatus, setSaveStatus] = useState<string>('Saved to cloud');
  const [selectedSlotModal, setSelectedSlotModal] = useState<string | null>(null);
  const [nfcUnlocked, setNfcUnlocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPersonaModal, setShowPersonaModal] = useState<boolean>(false);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sound chime via Web Audio API
  const playLuxuryChime = (frequency: number = 528) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Sync with Supabase on load
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
            wellnessInterests: prefData.wellness_interests || ['Heated Pool Access', '24/7 Gym Pass', 'Hydrotherapy & Spa'],
            tennisSlot: prefData.tennis_slot,
            pillowType: prefData.pillow_type || 'Hungarian Goose Down',
            towelWarmingTime: prefData.towel_warming_time || '21:30',
            roomTemp: Number(prefData.room_temp) || 19.0,
            aromatherapy: prefData.aromatherapy || 'French Lavender & Roman Chamomile',
            soundscape: prefData.soundscape || 'Delta-Wave Binaural (432Hz)',
            lightingMood: prefData.lighting_mood || 'Deep Twilight (1800K)',
            bathRitual: prefData.bath_ritual || 'Magnesium Flakes & Epsom Bath Soak',
            breakfastStyle: prefData.breakfast_style || 'In-Room Continental Silver Tray',
            minibarItems: prefData.minibar_items || ['San Pellegrino Sparkling', 'Alkaline Electrolyte Water'],
            allergies: prefData.allergies || ['Gluten-Free', 'Nut Allergy'],
            customNotes: prefData.custom_notes || '',
          });

          // Match persona if found
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

    // Supabase Realtime Listener for instant butler dispatch updates
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

  // Auto-Save Preference Change
  const updatePreference = async (key: keyof GuestPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaveStatus('Saving changes...');

    try {
      await supabase
        .from('preferences')
        .update({
          persona_id: updated.personaId,
          persona_name: updated.personaName,
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
      setSaveStatus('Preferences synced (Cloud Firestore & Supabase)');
    } catch (e) {
      setSaveStatus('Saved locally (Offline Mode)');
    }
  };

  // Apply 1 of 10 Curated Luxury Personas
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
    setShowPersonaModal(false);
    playLuxuryChime(528);
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
    } catch (e) {
      console.log('Saved persona locally');
    }
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
    showToast(`✓ Butler Request Dispatched: ${serviceType}`);

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
    } catch (e) {
      console.log('Saved request locally');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 bg-[#F8F9FC]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 z-50 bg-[#171E52] text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-xl border border-[#C5A880]/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          {toastMessage}
        </div>
      )}

      {/* Mobile Device Frame Container (393px width for authentic iOS Safari / WhatsApp Viewport) */}
      <div className="w-full max-w-[420px] bg-white rounded-[36px] shadow-2xl border border-[#E2E5F0] overflow-hidden flex flex-col min-h-[850px] relative">
        
        {/* Device Notch & Status Bar */}
        <div className="bg-[#171E52] px-6 pt-3 pb-2 text-white/80 flex items-center justify-between text-xs font-medium select-none">
          <span>9:41</span>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-[#C5A880]">
            <span>NOVOTEL PULSE</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span>5G • 100%</span>
        </div>

        {/* Top Header Card */}
        <div className="bg-gradient-to-b from-[#171E52] to-[#0F1155] text-white px-5 pt-4 pb-4 rounded-b-[28px] shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase">
                Executive Residence
              </span>
              <h1 className="text-xl font-serif font-bold text-white tracking-wide">
                Suite 412
              </h1>
            </div>

            {/* Accor Platinum VIP Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-semibold tracking-wider">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              ALL PLATINUM
            </div>
          </div>

          {/* Active Persona Banner & Quick Switcher */}
          <div 
            onClick={() => setShowPersonaModal(true)}
            className="cursor-pointer bg-white/10 hover:bg-white/15 border border-[#C5A880]/40 rounded-2xl p-2.5 mt-2 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
                <Sparkle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[#C5A880] font-semibold uppercase tracking-wider block">
                  Active Persona Blueprint
                </span>
                <span className="text-xs font-semibold text-white truncate max-w-[210px] block">
                  {currentPersona.title}
                </span>
              </div>
            </div>
            <div className="px-2 py-1 rounded-lg bg-white/15 text-[10px] font-semibold text-[#C5A880] flex items-center gap-1 group-hover:bg-[#C5A880] group-hover:text-[#171E52] transition-colors">
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
                View Pass
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher Chips */}
        <div className="px-4 py-2.5 bg-[#F8F9FC] border-b border-[#E2E5F0] grid grid-cols-4 gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('hub')}
            className={`py-1.5 rounded-xl text-center transition-all ${activeTab === 'hub' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Hub
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`py-1.5 rounded-xl text-center transition-all ${activeTab === 'onboarding' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`py-1.5 rounded-xl text-center transition-all ${activeTab === 'facilities' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Facilities
          </button>
          <button
            onClick={() => setActiveTab('keycard')}
            className={`py-1.5 rounded-xl text-center transition-all ${activeTab === 'keycard' ? 'bg-[#171E52] text-white shadow-sm font-semibold' : 'bg-white text-[#5E6482] hover:bg-slate-100'}`}
          >
            Key Pass
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: IN-STAY CONCIERGE HUB & LIVE DISPATCH                   */}
        {/* ============================================================== */}
        {activeTab === 'hub' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            
            {/* Persona Sensory Overview Card */}
            <div className="bg-gradient-to-br from-[#171E52] to-[#0F1155] text-white rounded-2xl p-4 shadow-sm border border-[#C5A880]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#C5A880] tracking-widest uppercase">
                  Residence Sensory Calibration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  Calibrated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-300" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Climate Target</span>
                    <span className="font-semibold text-white">{preferences.roomTemp}°C Sanctuary</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-purple-300" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Aromatherapy</span>
                    <span className="font-semibold text-white truncate max-w-[110px] block">
                      {preferences.aromatherapy?.split('&')[0] || 'Lavender'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                  <Music className="w-4 h-4 text-amber-300" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Acoustics</span>
                    <span className="font-semibold text-white truncate max-w-[110px] block">
                      {preferences.soundscape?.split('(')[0] || 'Delta-Wave'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/10 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-300" />
                  <div>
                    <span className="text-[10px] text-white/60 block">Pillow Menu</span>
                    <span className="font-semibold text-white truncate max-w-[110px] block">
                      {preferences.pillowType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                    className="mt-3 w-full py-1.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-[11px] font-semibold rounded-xl transition-all shadow-sm"
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
                    className="mt-3 w-full py-1.5 bg-[#F8F9FC] hover:bg-slate-200 text-[#171E52] text-[11px] font-semibold rounded-xl border border-[#E2E5F0] transition-all"
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
                    className="mt-3 w-full py-1.5 bg-[#171E52] hover:bg-[#0F1155] text-white text-[11px] font-semibold rounded-xl transition-all"
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
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group"
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
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group"
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
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group"
                >
                  <div className="flex items-center justify-between text-[#C5A880]">
                    <Coffee className="w-4 h-4" />
                    <span className="text-[10px] bg-slate-100 text-[#5E6482] font-semibold px-1.5 py-0.5 rounded">06:15 Prompt</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Double Ristretto</span>
                    <span className="text-[10px] text-[#5E6482]">Wake barista delivery</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Rose Petal Turndown', 'housekeeping', 'Evening turndown with rose petals & sleep mist')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[88px] group"
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

            {/* Live Dispatch Tracking Timeline */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1E22AA] animate-ping" />
                  <span className="text-xs font-bold text-[#171E52] uppercase tracking-wide">
                    Live Dispatch Tracker
                  </span>
                </div>
                <span className="text-[10px] text-[#5E6482]">Suite 412 Pipeline</span>
              </div>

              {requests.slice(0, 2).map((req) => (
                <div key={req.id} className="mb-3 pb-3 border-b border-slate-100 last:border-b-0 last:mb-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#171E52]">{req.serviceType}</span>
                    <span className="text-[11px] text-[#1E22AA] font-medium">{req.scheduledTime || 'In Progress'}</span>
                  </div>

                  {/* 4-Stage Connected Dot Stepper */}
                  <div className="flex items-center justify-between relative px-2 mt-1">
                    <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0" />
                    
                    {/* Stage 1: Requested */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-5 h-5 rounded-full bg-[#171E52] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">Received</span>
                    </div>

                    {/* Stage 2: Prepared */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        req.status === 'in_progress' || req.status === 'completed'
                          ? 'bg-[#1E22AA] text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'in_progress' || req.status === 'completed' ? '✓' : '2'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">Assigned</span>
                    </div>

                    {/* Stage 3: En Route */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        req.status === 'in_progress'
                          ? 'bg-amber-500 text-white animate-pulse'
                          : req.status === 'completed'
                          ? 'bg-[#1E22AA] text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'completed' ? '✓' : '3'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">En Route</span>
                    </div>

                    {/* Stage 4: Delivered */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        req.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {req.status === 'completed' ? '✓' : '4'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Climate & Lighting Remote Control */}
            <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#171E52] block">Climate Sanctuary</span>
                <span className="text-[11px] text-[#5E6482]">Target Room Temp: {preferences.roomTemp}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updatePreference('roomTemp', Math.max(18.0, Number((preferences.roomTemp - 0.5).toFixed(1))))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171E52] font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="text-sm font-bold text-[#171E52] min-w-[42px] text-center">
                  {preferences.roomTemp}°C
                </span>
                <button
                  onClick={() => updatePreference('roomTemp', Math.min(24.0, Number((preferences.roomTemp + 0.5).toFixed(1))))}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#171E52] font-bold flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 30-SECOND CURATED SANCTUARY ONBOARDING (Screen 1)        */}
        {/* ============================================================== */}
        {activeTab === 'onboarding' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            
            {/* Header & Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif font-bold text-[#171E52]">
                    30s Sanctuary Calibration
                  </h2>
                  <p className="text-[11px] text-[#5E6482]">
                    {onboardingStep === 1 && 'Step 1 of 3: Ambient Sensory & Circadian Climate'}
                    {onboardingStep === 2 && 'Step 2 of 3: Restorative Sleep & Bath Warmth'}
                    {onboardingStep === 3 && 'Step 3 of 3: Artisanal Gastronomy & Barista'}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                  {saveStatus}
                </span>
              </div>

              {/* Step Indicator Progress Bar */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 1 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 2 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 3 ? 'bg-[#171E52]' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* STEP 1: Ambient Sensory & Circadian Sanctuary */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                {/* Aromatherapy Diffuser Selection */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Ultrasonic Aromatherapy Diffuser
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'French Lavender & Roman Chamomile', tag: 'Circadian Sleep Reset' },
                      { name: 'Mediterranean Bergamot & Sweet Orange', tag: 'Mental Clarity & Uplift' },
                      { name: 'Mysore Sandalwood & Ambergris', tag: 'Opulent Sanctuary Warmth' },
                      { name: 'Organic Atlas Cedarwood & Mint', tag: 'Respiratory & Focus' },
                    ].map((aroma) => (
                      <button
                        key={aroma.name}
                        onClick={() => updatePreference('aromatherapy', aroma.name)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                          preferences.aromatherapy === aroma.name
                            ? 'border-[#171E52] bg-blue-50/40 text-[#171E52] shadow-sm'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482] hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold block text-[#171E52]">{aroma.name}</span>
                          <span className="text-[10px] text-[#5E6482]">{aroma.tag}</span>
                        </div>
                        {preferences.aromatherapy === aroma.name && (
                          <Check className="w-4 h-4 text-[#1E22AA]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soundscapes */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Neuro-Acoustic Soundscapes
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Delta-Wave Binaural (432Hz)', icon: '🌙' },
                      { name: 'Alpine Rain on French Oak', icon: '🌧️' },
                      { name: 'Coastal Solitude', icon: '🌊' },
                      { name: 'Absolute Pure Silence', icon: '🤫' },
                    ].map((sound) => (
                      <button
                        key={sound.name}
                        onClick={() => updatePreference('soundscape', sound.name)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          preferences.soundscape === sound.name
                            ? 'border-[#171E52] bg-blue-50/40 text-[#171E52] shadow-sm'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482] hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base block mb-1">{sound.icon}</span>
                        <span className="text-xs font-semibold block text-[#171E52]">{sound.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Circadian Temperature Slider */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-[#1E22AA]" />
                      Target Residence Climate
                    </label>
                    <span className="text-xs font-bold text-[#1E22AA] bg-blue-50 px-2 py-0.5 rounded-lg">
                      {preferences.roomTemp}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18.0"
                    max="23.0"
                    step="0.5"
                    value={preferences.roomTemp}
                    onChange={(e) => updatePreference('roomTemp', parseFloat(e.target.value))}
                    className="w-full accent-[#171E52] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#5E6482]">
                    <span>18.0°C (REM Deep Sleep)</span>
                    <span>20.5°C (Temperate)</span>
                    <span>23.0°C (Cozy)</span>
                  </div>
                </div>

                {/* Wellness & Facilities Passes */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Priority Facility Access Passes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'Heated Pool Access', label: 'Heated Pool (28.5°C)' },
                      { id: '24/7 Gym Pass', label: '24/7 InBalance Gym' },
                      { id: 'Tennis Court Rental', label: 'Tennis Court Rental' },
                      { id: 'Hydrotherapy & Spa', label: 'Hydrotherapy & Spa' },
                    ].map((amenity) => {
                      const isSelected = preferences.wellnessInterests.includes(amenity.id) || preferences.wellnessInterests.includes(amenity.label);
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => {
                            const next = isSelected
                              ? preferences.wellnessInterests.filter(a => a !== amenity.id && a !== amenity.label)
                              : [...preferences.wellnessInterests, amenity.id];
                            updatePreference('wellnessInterests', next);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#171E52] text-white border border-[#1E22AA] shadow-sm'
                              : 'bg-white text-[#5E6482] border border-[#E2E5F0] hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C5A880]" />}
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Restorative Sleep & Bath Warmth */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                {/* Signature Pillow Menu */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Pillow Sommelier Menu
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'Hungarian Goose Down', desc: '800-fill power ultra-soft cloud loft in sateen casing' },
                      { name: 'Ergonomic Memory Foam', desc: 'Contoured orthopedic cervical spine alignment' },
                      { name: 'Organic Buckwheat', desc: 'Therapeutic cooling support with natural organic hull' },
                      { name: 'Cooling Bamboo Silk', desc: 'Thermo-regulating breathable spun bamboo fiber' },
                      { name: 'Anti-Allergen Cotton', desc: 'Hypoallergenic micro-cluster fiber for sensitive skin' }
                    ].map((pillow) => (
                      <button
                        key={pillow.name}
                        onClick={() => updatePreference('pillowType', pillow.name)}
                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                          preferences.pillowType === pillow.name
                            ? 'border-[#171E52] bg-blue-50/40 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482] hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold block text-[#171E52]">{pillow.name}</span>
                          <span className="text-[10px] text-[#5E6482]">{pillow.desc}</span>
                        </div>
                        {preferences.pillowType === pillow.name && (
                          <Check className="w-4 h-4 text-[#1E22AA]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-warm bath towels */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#171E52] block flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Pre-Warm Egyptian Bath Sheets
                    </span>
                    <span className="text-[11px] text-[#5E6482]">Target evening heating cycle</span>
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

                {/* Bath Sanctuary Soaks */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                    In-Residence Bath Sanctuary Ritual
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'Magnesium Flakes & Epsom Bath Soak', desc: 'Neurological muscle recovery and deep sleep trigger' },
                      { name: 'Peppermint Foot Recovery Bath', desc: 'Invigorating menthol crystals for post-run revitalization' },
                      { name: 'Rose Petal & Dead Sea Mineral Bath', desc: 'Fresh garden rose petals with restorative mineral salts' },
                      { name: 'Biodegradable Seaweed & Botanical Soak', desc: 'Organic wild seaweed soak with essential fatty acids' },
                    ].map((soak) => (
                      <button
                        key={soak.name}
                        onClick={() => updatePreference('bathRitual', soak.name)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                          preferences.bathRitual === soak.name
                            ? 'border-[#171E52] bg-blue-50/40 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482] hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold block text-[#171E52]">{soak.name}</span>
                          <span className="text-[10px] text-[#5E6482]">{soak.desc}</span>
                        </div>
                        {preferences.bathRitual === soak.name && (
                          <Check className="w-4 h-4 text-[#1E22AA]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Artisanal Gastronomy & Barista */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                {/* Breakfast Style */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#1E22AA]" />
                    Breakfast Experience
                  </label>
                  <div className="space-y-2">
                    {[
                      { title: 'In-Room Continental Silver Tray', desc: 'Silver cloche tray delivered to your door at your desired hour' },
                      { title: 'The Square Signature Buffet', desc: 'Live artisan stations, cold-pressed juices & French bakery' },
                      { title: 'High-Protein Recovery Scramble', desc: '6-egg-white scramble with avocado, spinach, and smoked salmon' },
                      { title: 'Plant-Based Wellness Bowl', desc: 'Chia seed pudding, dragon fruit, organic granola & almond nectar' }
                    ].map((style) => (
                      <button
                        key={style.title}
                        onClick={() => updatePreference('breakfastStyle', style.title)}
                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                          preferences.breakfastStyle === style.title
                            ? 'border-[#171E52] bg-blue-50/40 text-[#171E52]'
                            : 'border-[#E2E5F0] bg-white text-[#5E6482] hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold block text-[#171E52]">{style.title}</span>
                          <span className="text-[10px] text-[#5E6482]">{style.desc}</span>
                        </div>
                        {preferences.breakfastStyle === style.title && (
                          <Check className="w-4 h-4 text-[#1E22AA]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Allergens & Macros */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Dietary Requirements & Kitchen Directives
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Gluten-Free', 'Nut Allergy', 'Lactose-Free', 
                      '100% Plant-Based / Vegan', 'Allium-Free (No Garlic/Onion)', 
                      'High-Protein (35g+)', 'Halal'
                    ].map((diet) => {
                      const isSelected = preferences.allergies.includes(diet);
                      return (
                        <button
                          key={diet}
                          onClick={() => {
                            const next = isSelected
                              ? preferences.allergies.filter(d => d !== diet)
                              : [...preferences.allergies, diet];
                            updatePreference('allergies', next);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold'
                              : 'bg-white text-[#5E6482] border border-[#E2E5F0] hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? `✓ ${diet}` : `+ ${diet}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Minibar & Cellar Inclusions */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2 flex items-center gap-1.5">
                    <Wine className="w-3.5 h-3.5 text-[#C5A880]" />
                    In-Residence Cellar & Minibar
                  </label>
                  <div className="space-y-1.5 text-xs text-[#5E6482]">
                    <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                      <span>San Pellegrino Sparkling Glass Bottles</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                      <span>Artisanal Nespresso Espresso & Lungo Pods</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                      <span>Alkaline Electrolyte & Fiji Waters</span>
                      <span className="font-semibold text-emerald-600">Included</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {onboardingStep > 1 ? (
                <button
                  onClick={() => setOnboardingStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2E5F0] text-xs font-semibold text-[#5E6482] hover:bg-slate-100"
                >
                  Back
                </button>
              ) : <div />}

              {onboardingStep < 3 ? (
                <button
                  onClick={() => setOnboardingStep(s => s + 1)}
                  className="flex-1 py-2.5 bg-[#171E52] hover:bg-[#0F1155] text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('hub');
                    playLuxuryChime(528);
                    showToast('Sanctuary preferences locked & synced with Front Desk');
                  }}
                  className="flex-1 py-2.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Enter Your Residence</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: HOTEL FACILITIES & WELLNESS CALENDAR                    */}
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
                      Available Today
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {facility.slots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => {
                            createServiceRequest(`${facility.name} Booking`, 'wellness', `Slot confirmed for ${slot}`, slot);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-[#171E52] hover:text-white transition-colors"
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
        {/* TAB 4: ZERO-LOGIN NFC DIGITAL KEYCARD PASS (Screen 3)           */}
        {/* ============================================================== */}
        {activeTab === 'keycard' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24 flex flex-col items-center justify-between text-center">
            <div className="space-y-1 w-full">
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase">
                Zero-Download NFC Key Pass
              </span>
              <h2 className="text-lg font-serif font-bold text-[#171E52]">
                Residence Suite 412
              </h2>
              <p className="text-xs text-[#5E6482]">Hold phone near room lock reader to unlock.</p>
            </div>

            {/* Realistic RFID / NFC Hotel Keycard Graphic */}
            <div 
              onClick={() => {
                setNfcUnlocked(true);
                playLuxuryChime(880);
                setTimeout(() => setNfcUnlocked(false), 3000);
              }}
              className="w-full max-w-[280px] h-[400px] bg-gradient-to-tr from-[#0F1155] via-[#171E52] to-[#1E22AA] rounded-[24px] shadow-2xl p-6 flex flex-col justify-between text-white border border-[#C5A880]/50 relative overflow-hidden cursor-pointer group transition-transform active:scale-95"
            >
              {/* Subtle Luxury Pattern Lines */}
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
                  setTimeout(() => setNfcUnlocked(false), 3000);
                }}
                className="w-full py-3 bg-[#171E52] hover:bg-[#0F1155] text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
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
        <div className="bg-[#171E52] text-white/70 px-4 py-2 text-[10px] flex items-center justify-between border-t border-white/10 select-none">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Concierge Online • Floor 4 Butler
          </span>
          <span className="text-[#C5A880]">Novotel Pulse v2.0</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 10 CURATED LUXURY PERSONAS SELECTOR MODAL                      */}
      {/* ============================================================== */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 bg-[#0F1155]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#171E52] via-[#0F1155] to-[#0A0D30] text-white rounded-[32px] p-5 max-w-lg w-full border border-[#C5A880]/50 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase block">
                  Anticipatory Luxury Hospitality
                </span>
                <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                  10 Curated Guest Personas
                </h3>
                <p className="text-xs text-white/70">
                  Select any persona to experience bespoke 5-star sensory presets & staff dispatch.
                </p>
              </div>
              <button
                onClick={() => setShowPersonaModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Personas Scrollable Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {LUXURY_PERSONAS.map((persona) => {
                const isSelected = currentPersona.id === persona.id;

                return (
                  <div
                    key={persona.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/15 border-[#C5A880] ring-1 ring-[#C5A880]/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-white">
                            {persona.title}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#C5A880] text-[#171E52]">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#C5A880] font-medium">
                          {persona.subtitle}
                        </p>
                        <p className="text-[11px] text-white/70 italic">
                          "{persona.tagline}"
                        </p>
                      </div>

                      <button
                        onClick={() => applyPersona(persona)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                          isSelected
                            ? 'bg-[#C5A880] text-[#171E52] shadow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {isSelected ? 'Applied' : 'Apply'}
                      </button>
                    </div>

                    {/* Sensory Pills Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2.5 border-t border-white/10 text-[10px] text-white/80">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-cyan-200">
                        ❄️ {persona.sensoryProfile.roomTemp}°C
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-purple-200">
                        🌸 {persona.sensoryProfile.aromatherapy.split('&')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-200">
                        🛏️ {persona.sensoryProfile.pillow.split('(')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-emerald-200">
                        ☕ {persona.refreshments.coffeeRoast.split('(')[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
              <span>Automatic real-time sync with Front Desk & Butler tablets.</span>
              <button
                onClick={() => setShowPersonaModal(false)}
                className="px-4 py-1.5 bg-white/15 hover:bg-white/20 text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
