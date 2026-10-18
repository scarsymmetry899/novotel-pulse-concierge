'use client';

import React, { useState, useEffect } from 'react';
import { 
  Waves, Dumbbell, Sparkles, Flame, Bed, Coffee, 
  Check, Clock, ShieldCheck, ChevronRight, Bell, 
  Thermometer, Wine, UtensilsCrossed, Calendar, Key,
  HeartHandshake, ChevronLeft, Volume2, ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_FACILITIES, INITIAL_REQUESTS, INITIAL_PREFERENCES } from '@/lib/mockData';
import { GuestPreferences, ServiceRequest, Facility } from '@/types/hospitality';

export default function GuestMiniApp() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'hub' | 'onboarding' | 'facilities' | 'keycard'>('hub');
  
  // Onboarding Stepper (1 to 3)
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Guest State (Room 412 - Arthur Hastings)
  const [preferences, setPreferences] = useState<GuestPreferences>(INITIAL_PREFERENCES['stay-412']);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [saveStatus, setSaveStatus] = useState<string>('Saved to cloud');
  const [selectedSlotModal, setSelectedSlotModal] = useState<string | null>(null);
  const [nfcUnlocked, setNfcUnlocked] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
            wellnessInterests: prefData.wellness_interests || [],
            tennisSlot: prefData.tennis_slot,
            pillowType: prefData.pillow_type || 'Hungarian Goose Down',
            towelWarmingTime: prefData.towel_warming_time || '20:30',
            roomTemp: Number(prefData.room_temp) || 20.0,
            breakfastStyle: prefData.breakfast_style || 'The Square Buffet (6:30 - 10:30 AM)',
            minibarItems: prefData.minibar_items || [],
            allergies: prefData.allergies || [],
            customNotes: prefData.custom_notes || '',
          });
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
          wellness_interests: updated.wellnessInterests,
          tennis_slot: updated.tennisSlot,
          pillow_type: updated.pillowType,
          towel_warming_time: updated.towelWarmingTime,
          room_temp: updated.roomTemp,
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
        <div className="bg-gradient-to-b from-[#171E52] to-[#0F1155] text-white px-5 pt-4 pb-5 rounded-b-[28px] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-medium tracking-widest text-[#C5A880] uppercase">
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

          <div className="flex items-center justify-between text-xs text-white/70 pt-2 border-t border-white/10">
            <span>Mr. Arthur Hastings</span>
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
        {/* TAB 1: IN-STAY CONCIERGE HUB & LIVE DISPATCH (Screen 2)         */}
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
                    <p className="text-[11px] text-white/70">6:00 - 22:00 • 30% Occupied</p>
                  </div>
                  <button 
                    onClick={() => createServiceRequest('Cabana Reservation', 'wellness', 'Poolside Cabana #4')}
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
                    onClick={() => showToast('Fitness pass added to room NFC keycard')}
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
                <span className="text-[10px] text-emerald-600 font-medium">Avg dispatch: 8 mins</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => createServiceRequest('Warm My Towels', 'housekeeping', 'Pre-warm 2x bath towels', '20:30')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[84px] group"
                >
                  <div className="flex items-center justify-between text-[#1E22AA]">
                    <Flame className="w-4 h-4" />
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded">20:30</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Warm Bath Towels</span>
                    <span className="text-[10px] text-[#5E6482]">Scheduled for evening</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Evening Turndown', 'housekeeping', 'Turndown service with lavender mist')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[84px] group"
                >
                  <div className="flex items-center justify-between text-[#171E52]">
                    <Bed className="w-4 h-4" />
                    <span className="text-[10px] bg-slate-100 text-[#5E6482] font-semibold px-1.5 py-0.5 rounded">1-Tap</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Evening Turndown</span>
                    <span className="text-[10px] text-[#5E6482]">Pillows fluffed & mist</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Ice & Champagne Glasses', 'fnb', 'Crystal flutes & fresh ice')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[84px] group"
                >
                  <div className="flex items-center justify-between text-[#C5A880]">
                    <Wine className="w-4 h-4" />
                    <span className="text-[10px] bg-slate-100 text-[#5E6482] font-semibold px-1.5 py-0.5 rounded">F&B</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Ice & Glassware</span>
                    <span className="text-[10px] text-[#5E6482]">Champagne service kit</span>
                  </div>
                </button>

                <button
                  onClick={() => createServiceRequest('Nespresso & Water Refill', 'fnb', 'Intenso pods & San Pellegrino')}
                  className="p-3 bg-white hover:bg-blue-50/50 border border-[#E2E5F0] rounded-2xl text-left transition-all shadow-sm flex flex-col justify-between h-[84px] group"
                >
                  <div className="flex items-center justify-between text-[#171E52]">
                    <Coffee className="w-4 h-4" />
                    <span className="text-[10px] bg-slate-100 text-[#5E6482] font-semibold px-1.5 py-0.5 rounded">Pantry</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171E52] block group-hover:text-[#1E22AA]">Nespresso & Water</span>
                    <span className="text-[10px] text-[#5E6482]">Minibar replenishment</span>
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
                <span className="text-[10px] text-[#5E6482]">Room 412 Pipeline</span>
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
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${req.status === 'in_progress' || req.status === 'completed' ? 'bg-[#171E52] text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {req.status === 'in_progress' || req.status === 'completed' ? '✓' : '2'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">Assigned</span>
                    </div>

                    {/* Stage 3: En Route */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${req.status === 'in_progress' ? 'bg-[#1E22AA] text-white animate-pulse' : req.status === 'completed' ? 'bg-[#171E52] text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {req.status === 'completed' ? '✓' : '3'}
                      </div>
                      <span className="text-[9px] text-[#1E22AA] font-semibold mt-1">En Route</span>
                    </div>

                    {/* Stage 4: Delivered */}
                    <div className="flex flex-col items-center z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${req.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {req.status === 'completed' ? '✓' : '4'}
                      </div>
                      <span className="text-[9px] text-[#5E6482] mt-1">Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Climate & Room Telemetry Quick Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-[#E2E5F0] rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white shadow-sm text-[#1E22AA]">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#171E52] block">Residence Climate</span>
                  <span className="text-[11px] text-[#5E6482]">Target: {preferences.roomTemp}°C • Pre-cooled</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updatePreference('roomTemp', Math.max(18, preferences.roomTemp - 0.5))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#E2E5F0] text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                >
                  -
                </button>
                <span className="text-xs font-bold text-[#171E52] w-8 text-center">{preferences.roomTemp}°</span>
                <button
                  onClick={() => updatePreference('roomTemp', Math.min(26, preferences.roomTemp + 0.5))}
                  className="w-7 h-7 rounded-lg bg-white border border-[#E2E5F0] text-sm font-bold flex items-center justify-center hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 3-STEP CHIP PREFERENCE ONBOARDING (<30s) (Screen 1)     */}
        {/* ============================================================== */}
        {activeTab === 'onboarding' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
            
            {/* Header with 3-segment progress indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-lg font-serif font-bold text-[#171E52]">
                  Tailor Your Sanctuary
                </h2>
                <span className="text-xs font-medium text-[#1E22AA]">
                  Step {onboardingStep} of 3
                </span>
              </div>
              <p className="text-xs text-[#5E6482] mb-3">
                Sub-30-second preference capture. Auto-saves on every tap.
              </p>

              {/* Progress bar */}
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 1 ? 'bg-[#1E22AA]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 2 ? 'bg-[#1E22AA]' : 'bg-slate-200'}`} />
                <div className={`h-1.5 rounded-full transition-all ${onboardingStep >= 3 ? 'bg-[#1E22AA]' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* STEP 1: Wellness & Active Recreation */}
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Wellness & Active Facilities
                  </label>
                  <p className="text-[11px] text-[#5E6482] mb-3">
                    Select the amenities you plan to enjoy during your executive stay:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'Heated Pool Access', label: 'Heated Pool Access (28°C)' },
                      { id: '24/7 Gym Pass', label: '24/7 InBalance Gym' },
                      { id: 'Tennis Court Rental', label: 'Tennis Court Rental' },
                      { id: 'Hydrotherapy & Spa', label: 'Hydrotherapy & Spa' },
                      { id: 'Valet Parking', label: 'Valet Parking' },
                      { id: 'Executive Lounge Access', label: 'Executive Lounge Access' }
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

                {/* Tennis Slot Selector */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Padel / Tennis Slot Reservation
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['15:00', '16:00', '17:00', '18:00'].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => updatePreference('tennisSlot', slot)}
                        className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                          preferences.tennisSlot === slot
                            ? 'bg-[#1E22AA] text-white shadow-sm'
                            : 'bg-slate-100 text-[#5E6482] hover:bg-slate-200'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Rest & Sleep Sanctuary */}
            {onboardingStep === 2 && (
              <div className="space-y-4">
                {/* Pillows */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Signature Pillow Menu
                  </label>
                  <div className="space-y-2">
                    {[
                      { name: 'Hungarian Goose Down', desc: 'Ultra-soft natural loft with breathable sateen cover' },
                      { name: 'Ergonomic Memory Foam', desc: 'Contoured neck alignment and cervical spine relief' },
                      { name: 'Organic Buckwheat', desc: 'Therapeutic cooling support with natural hull filling' },
                      { name: 'Anti-Allergen Cotton', desc: 'Hypoallergenic micro-cluster fiber' }
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
                    <span className="text-xs font-bold text-[#171E52] block">Pre-Warm Bath Towels</span>
                    <span className="text-[11px] text-[#5E6482]">Target evening warming cycle</span>
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
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: Breakfast & Refreshment */}
            {onboardingStep === 3 && (
              <div className="space-y-4">
                {/* Breakfast Style */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Breakfast Preference
                  </label>
                  <div className="space-y-2">
                    {[
                      { title: 'The Square Buffet (6:30 - 10:30 AM)', desc: 'Artisanal live stations, cold-pressed juices & French bakery' },
                      { title: 'In-Room Express Continental Tray', desc: 'Delivered directly to your residence at your requested hour' }
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

                {/* Dietary Allergens */}
                <div className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171E52] block mb-2">
                    Dietary Requirements & Allergens
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Gluten-Free', 'Nut Allergy', 'Lactose-Free', 'Vegan', 'Allium-Free', 'Halal'].map((diet) => {
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
                    showToast('Sanctuary preferences locked & synced with Front Desk');
                  }}
                  className="flex-1 py-2.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-gold flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  <span>Enter Your Residence</span>
                </button>
              )}
            </div>

            <div className="text-center text-[10px] text-emerald-600 font-medium">
              ✓ {saveStatus}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: LIVE FACILITIES BOARD                                  */}
        {/* ============================================================== */}
        {activeTab === 'facilities' && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#5E6482] mb-1">
              Novotel Property Facilities
            </h2>

            {facilities.map((f) => (
              <div key={f.id} className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#171E52]">{f.name}</h3>
                    <p className="text-[11px] text-[#5E6482]">{f.hours}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {f.temperature || f.currentOccupancy}
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6482]">{f.rules}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.slots.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        createServiceRequest(`${f.name} Booking`, 'wellness', `Slot reserved: ${s}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1E22AA] hover:text-white text-[10px] font-medium text-[#171E52] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: DIGITAL KEYCARD & NFC MODAL (Screen 4)                 */}
        {/* ============================================================== */}
        {activeTab === 'keycard' && (
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 pb-24 flex flex-col items-center justify-center text-center">
            
            {/* Luxury Digital Keycard Card */}
            <div className="w-full bg-gradient-to-br from-[#171E52] via-[#0F1155] to-[#0A0D30] text-white p-6 rounded-[28px] border border-[#C5A880]/40 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#C5A880]/10 blur-xl" />
              
              <div className="flex items-center justify-between text-[11px] text-[#C5A880] tracking-widest font-semibold uppercase mb-6">
                <span>Novotel Hotels & Resorts</span>
                <span>NFC Keycard</span>
              </div>

              <div className="my-4">
                <span className="text-xs text-white/60 tracking-wider uppercase block">Guest Room</span>
                <span className="text-4xl font-serif font-bold text-white tracking-wider block mt-1">
                  412
                </span>
                <span className="text-xs text-[#C5A880] font-medium block mt-1">
                  Executive Suite • Arthur Hastings
                </span>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
                <span>Valid: Oct 18 - Oct 22</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Authorized
                </span>
              </div>
            </div>

            {/* NFC Tap Simulator */}
            <div className="w-full bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-[#171E52]">Contactless Room Lock Handoff</h4>
              <p className="text-[11px] text-[#5E6482]">Hold iPhone/Android near door lock plate</p>
              
              <button
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                      navigator.vibrate([40, 60, 40]);
                    }
                    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioCtx) {
                      const ctx = new AudioCtx();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.type = 'sine';
                      osc.frequency.setValueAtTime(880, ctx.currentTime);
                      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
                      gain.gain.setValueAtTime(0.15, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.4);
                    }
                  } catch (e) {}
                  setNfcUnlocked(true);
                  showToast('Room 412 Door Unlocked via Digital NFC Pass');
                  setTimeout(() => setNfcUnlocked(false), 4000);
                }}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  nfcUnlocked
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#171E52] hover:bg-[#0F1155] text-white shadow-md'
                }`}
              >
                <Key className="w-4 h-4 text-[#C5A880]" />
                <span>{nfcUnlocked ? 'Door Unlocked (Green LED)' : 'Simulate NFC Door Tap'}</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('hub')}
              className="text-xs text-[#1E22AA] font-semibold underline"
            >
              Return to In-Stay Dashboard
            </button>
          </div>
        )}

        {/* Floating Bottom Blurred Glass Navigation Dock (Screen 2) */}
        <div className="absolute bottom-3 left-4 right-4 glass-nav rounded-2xl p-2 flex items-center justify-around shadow-luxury border border-[#E2E5F0] z-40">
          <button
            onClick={() => setActiveTab('hub')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${activeTab === 'hub' ? 'text-[#1E22AA] font-bold' : 'text-[#5E6482]'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${activeTab === 'facilities' ? 'text-[#1E22AA] font-bold' : 'text-[#5E6482]'}`}
          >
            <Waves className="w-4 h-4" />
            <span>Wellness</span>
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${activeTab === 'onboarding' ? 'text-[#1E22AA] font-bold' : 'text-[#5E6482]'}`}
          >
            <Bed className="w-4 h-4" />
            <span>Sanctuary</span>
          </button>
          <button
            onClick={() => setActiveTab('keycard')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${activeTab === 'keycard' ? 'text-[#1E22AA] font-bold' : 'text-[#5E6482]'}`}
          >
            <Key className="w-4 h-4" />
            <span>Key Pass</span>
          </button>
        </div>

      </div>
    </div>
  );
}
