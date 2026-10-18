'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Flame, Bell, Search, ShieldCheck, 
  Send, Sparkles, Filter, CheckCircle2, Clock, 
  Phone, Mail, ArrowUpRight, MessageSquare, QrCode, RefreshCw,
  X, Printer, Copy, Check, Bed, Coffee, Droplets, Wind,
  ChevronRight, Sparkle, FileText, Share2, Layers, CheckSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_ROOMS, INITIAL_STAYS, INITIAL_PREFERENCES, INITIAL_REQUESTS, LUXURY_PERSONAS } from '@/lib/mockData';
import { Room, Stay, GuestPreferences, ServiceRequest, Department, LuxuryPersona } from '@/types/hospitality';
import { useBranch } from '@/context/BranchContext';

export default function StaffCommandPortal() {
  const { activeBranch } = useBranch();
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [stays, setStays] = useState<Stay[]>(INITIAL_STAYS);
  const [preferences, setPreferences] = useState<Record<string, GuestPreferences>>(INITIAL_PREFERENCES);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeShift, setActiveShift] = useState<string>('Morning Shift • Floor Butler Desk');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [qrModalGuest, setQrModalGuest] = useState<Stay | null>(null);
  
  // Right-Anchored Spec Sheet Drawer State
  const [specSheetStay, setSpecSheetStay] = useState<{ stay: Stay; room: Room; persona: LuxuryPersona } | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real-time synchronization
  useEffect(() => {
    const channel = supabase
      .channel('staff_operations_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, (payload) => {
        if (payload.new) {
          const updated = payload.new as any;
          setRequests(prev => {
            const idx = prev.findIndex(r => r.id === updated.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = {
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
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update request status and notify guest via WhatsApp simulator
  const updateRequestStatus = async (id: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`✓ Request status updated to ${newStatus.toUpperCase()} (WhatsApp dispatch triggered)`);

    try {
      await supabase
        .from('service_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.log('Updated in local state');
    }
  };

  // Send One-Click Magic WhatsApp Welcome Link
  const sendWhatsAppWelcome = (guest: Stay) => {
    showToast(`✓ Magic link dispatched to ${guest.guestPhone} (${guest.guestName}) via Meta Graph API`);
  };

  // Dispatch all department directives to active requests
  const dispatchAllDirectives = (persona: LuxuryPersona, room: Room, stay: Stay) => {
    const newReqs: ServiceRequest[] = persona.departmentDirectives.map((d, i) => ({
      id: `req-${Date.now()}-${i}`,
      stayId: stay.id,
      roomId: room.id,
      department: d.department,
      serviceType: d.title,
      details: d.actionItems.join(' • '),
      scheduledTime: d.timing || 'Immediate',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setRequests(prev => [...newReqs, ...prev]);
    showToast(`✓ Dispatched ${newReqs.length} Action Directives for ${persona.title} to department tablets!`);
  };

  // Filter requests by department
  const filteredRequests = requests.filter(r => {
    if (selectedDept !== 'all' && r.department !== selectedDept) return false;
    return true;
  });

  // Filter rooms by search
  const filteredRooms = rooms.filter(r => {
    const stay = stays.find(s => s.roomId === r.id);
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      r.roomNumber.toLowerCase().includes(q) ||
      stay?.guestName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6FB] min-h-screen text-[#171E52]">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 right-6 z-50 bg-[#171E52] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C5A880]/50 text-xs font-semibold flex items-center gap-2 animate-modal">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          {toastMsg}
        </div>
      )}

      {/* Top Header Bar (Blue Zodiac #0F1155) */}
      <div className="bg-[#0F1155] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-bold text-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-wider uppercase">
                {activeBranch.name} • Operations Command
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40">
                {activeBranch.code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/60">
              <span>{activeBranch.city}, {activeBranch.country}</span>
              <span>•</span>
              <span>{activeBranch.services.hasPool ? `InBalance Pool: ${activeBranch.services.poolTemp || '28°C'}` : 'Urban Fitness Flagship'}</span>
              <span>•</span>
              <span>{activeBranch.services.gymName} (24/7)</span>
            </div>
          </div>
        </div>

        {/* Search & Shift Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search guest or suite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-[#C5A880] font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{activeShift}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Command Canvas */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Left Column (60%): Master Residence Grid & VIP Indicators */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1E22AA]" />
                Master Residence Grid (10 Luxury Suites)
              </h2>
              <p className="text-xs text-[#5E6482]">Click any residence to inspect the full Butler Action Spec Sheet.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              10 Active Residences • 100% Occupied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredRooms.map((room) => {
              const stay = stays.find(s => s.roomId === room.id);
              const pref = stay ? preferences[stay.id] : null;
              const isVip = room.category === 'Suite';
              const persona = LUXURY_PERSONAS.find(p => p.id === pref?.personaId) || LUXURY_PERSONAS[0];

              return (
                <div
                  key={room.id}
                  onClick={() => stay && setSpecSheetStay({ stay, room, persona })}
                  className={`bg-white rounded-2xl p-4 shadow-sm transition-all border cursor-pointer hover:shadow-md clickable-card ${
                    isVip
                      ? 'border-[#C5A880] ring-1 ring-[#C5A880]/30 hover:border-amber-400'
                      : 'border-[#E2E5F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#171E52]">
                          Suite {room.roomNumber}
                        </span>
                        {isVip && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            VIP Suite
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#5E6482]">
                        {room.category} • Floor {room.floor}
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E22AA]">
                      OCCUPIED
                    </span>
                  </div>

                  {stay && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#171E52]">{stay.guestName}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsAppWelcome(stay);
                          }}
                          className="text-[11px] text-[#1E22AA] hover:underline font-semibold flex items-center gap-1 clickable-card"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          Magic Link
                        </button>
                      </div>

                      {/* Active Persona Tag */}
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#171E52] truncate max-w-[200px]">
                          ✦ {persona.title}
                        </span>
                        <span className="text-[9px] text-[#C5A880] font-semibold">
                          Directives →
                        </span>
                      </div>

                      {/* Preference Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          ❄️ {pref?.roomTemp || persona.sensoryProfile.roomTemp}°C
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          🔥 {pref?.towelWarmingTime || persona.preferences.towelWarmingTime}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          🛏️ {(pref?.pillowType || persona.sensoryProfile.pillow).split(' ')[0]}
                        </span>
                        {pref?.allergies && pref.allergies.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            ⚠️ {pref.allergies[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Action Dispatch Drawer */}
          <div className="bg-[#171E52] text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#C5A880] uppercase tracking-wider block">
                Concierge Quick Utilities
              </span>
              <span className="text-[11px] text-white/70">Instant front-desk tools and guest communications</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Master Pool Temperature notice broadcast to all 10 occupied suites')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all clickable-card"
              >
                Broadcast Notice
              </button>
              <button
                onClick={() => setQrModalGuest(stays[0])}
                className="px-3 py-1.5 rounded-xl bg-[#C5A880] hover:bg-amber-600 text-[#171E52] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm clickable-card"
              >
                <QrCode className="w-3.5 h-3.5" />
                Generate QR Card
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (40%): Live Department Dispatch Kanban */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#171E52] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Live Department Dispatch
              </h2>
              <p className="text-xs text-[#5E6482]">Instant butler and housekeeping tasks synced in real-time.</p>
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#E2E5F0] rounded-xl px-2.5 py-1 text-[#171E52] outline-none"
            >
              <option value="all">All Departments</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="wellness">Wellness</option>
              <option value="fnb">F&B</option>
              <option value="front_desk">Front Desk</option>
            </select>
          </div>

          {/* Kanban Cards List */}
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#E2E5F0] rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-[#5E6482]">
                      {req.department}
                    </span>
                    <h3 className="text-sm font-bold text-[#171E52] mt-1">
                      {req.serviceType}
                    </h3>
                    <p className="text-xs text-[#5E6482]">{req.details}</p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    req.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : req.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-[#1E22AA]'
                  }`}>
                    {req.status === 'in_progress' ? 'EN ROUTE' : req.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5E6482] pt-2 border-t border-slate-100">
                  <span className="font-semibold text-[#171E52]">Suite {req.roomId.replace('room-', '')}</span>
                  <span>Target: {req.scheduledTime || 'Immediate'}</span>
                </div>

                {/* Status Advancement Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {req.status !== 'in_progress' && req.status !== 'completed' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'in_progress')}
                      className="flex-1 py-1.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all clickable-card"
                    >
                      Dispatch En Route
                    </button>
                  )}
                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'completed')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all clickable-card"
                    >
                      Mark Delivered (WhatsApp Alert)
                    </button>
                  )}
                  <button
                    onClick={() => showToast(`Pushed custom WhatsApp notification for request ${req.id}`)}
                    className="p-1.5 rounded-xl border border-[#E2E5F0] hover:bg-slate-100 text-emerald-600 clickable-card"
                    title="Send WhatsApp update"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* EMIL KOWALSKI RIGHT-ANCHORED SLIDE-OVER SPEC SHEET DRAWER      */}
      {/* ============================================================== */}
      {specSheetStay && (
        <div className="fixed inset-0 z-50 bg-[#0F1155]/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white text-[#171E52] h-full shadow-2xl border-l border-[#C5A880]/40 flex flex-col justify-between animate-drawer">
            
            {/* Drawer Top Header */}
            <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-[#F8F9FC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#171E52]">
                    Suite {specSheetStay.room.roomNumber} Butler Spec Sheet
                  </h3>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#C5A880]/20 text-[#171E52] border border-[#C5A880]">
                    {specSheetStay.room.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#5E6482]">
                  <span className="font-semibold text-[#171E52]">{specSheetStay.stay.guestName}</span>
                  <span>•</span>
                  <span>{specSheetStay.stay.guestPhone}</span>
                  <span>•</span>
                  <span className="text-[#1E22AA] font-bold">{activeBranch.name}</span>
                  <span>•</span>
                  <span className="text-[#C5A880] font-bold">✦ {specSheetStay.persona.title}</span>
                </div>
              </div>

              <button
                onClick={() => setSpecSheetStay(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors clickable-card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Persona Blueprint Summary Banner */}
            <div className="p-4 bg-[#171E52] text-white mx-6 mt-4 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase block">
                  Persona Blueprint Active
                </span>
                <span className="text-xs font-semibold text-white">
                  {specSheetStay.persona.subtitle}
                </span>
                <span className="text-[11px] text-white/70 block italic mt-0.5">
                  "{specSheetStay.persona.tagline}"
                </span>
              </div>
              <button
                onClick={() => dispatchAllDirectives(specSheetStay.persona, specSheetStay.room, specSheetStay.stay)}
                className="px-3 py-2 bg-[#C5A880] hover:bg-amber-500 text-[#171E52] text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 clickable-card"
              >
                <Flame className="w-3.5 h-3.5" />
                Dispatch All
              </button>
            </div>

            {/* Department Action Cards (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
              {specSheetStay.persona.departmentDirectives.map((dir, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-[#F8F9FC] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#171E52] text-white">
                        {dir.department.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-[#171E52]">
                        {dir.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {dir.timing}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[#5E6482]">
                    {dir.actionItems.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-6 border-t border-slate-200 bg-[#F8F9FC] flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-[#171E52] border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 clickable-card"
              >
                <Printer className="w-4 h-4" />
                Print Spec Sheet
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendWhatsAppWelcome(specSheetStay.stay)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1.5 clickable-card"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Guest
                </button>
                <button
                  onClick={() => setSpecSheetStay(null)}
                  className="px-4 py-2 bg-[#171E52] text-white text-xs font-semibold rounded-xl clickable-card"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Luxury QR Welcome Card & Digital Key Handoff Modal (Google Stitch Screen 4) */}
      {qrModalGuest && (
        <div className="fixed inset-0 z-50 bg-[#0F1155]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#171E52] via-[#0F1155] to-[#0A0D30] text-white rounded-[32px] p-6 max-w-md w-full border border-[#C5A880]/50 shadow-2xl relative space-y-5 animate-modal">
            
            {/* Close Button */}
            <button
              onClick={() => setQrModalGuest(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors clickable-card"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-semibold tracking-widest text-[#C5A880] uppercase">
                {activeBranch.name} • Sanctuary Pass
              </span>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Scan to Unlock Your Stay
              </h3>
              <p className="text-xs text-white/70">
                {qrModalGuest.guestName} • Room {qrModalGuest.roomId.replace('room-', '')}
              </p>
            </div>

            {/* Central Hero QR Card */}
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg border border-[#C5A880]/40 relative group">
              <div className="w-44 h-44 bg-white p-2 flex items-center justify-center">
                <svg className="w-full h-full text-[#171E52]" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="28" height="28" fill="#171E52" rx="4"/>
                  <rect x="10" y="10" width="18" height="18" fill="white" rx="2"/>
                  <rect x="14" y="14" width="10" height="10" fill="#171E52" rx="1"/>

                  <rect x="67" y="5" width="28" height="28" fill="#171E52" rx="4"/>
                  <rect x="72" y="10" width="18" height="18" fill="white" rx="2"/>
                  <rect x="76" y="14" width="10" height="10" fill="#171E52" rx="1"/>

                  <rect x="5" y="67" width="28" height="28" fill="#171E52" rx="4"/>
                  <rect x="10" y="72" width="18" height="18" fill="white" rx="2"/>
                  <rect x="14" y="76" width="10" height="10" fill="#171E52" rx="1"/>

                  <rect x="40" y="8" width="6" height="6" fill="#1E22AA" rx="1"/>
                  <rect x="52" y="8" width="6" height="6" fill="#171E52" rx="1"/>
                  <rect x="40" y="20" width="6" height="6" fill="#171E52" rx="1"/>
                  <rect x="52" y="20" width="6" height="6" fill="#1E22AA" rx="1"/>
                  <rect x="40" y="32" width="20" height="6" fill="#171E52" rx="1"/>
                  <rect x="8" y="42" width="14" height="6" fill="#171E52" rx="1"/>
                  <rect x="28" y="42" width="8" height="8" fill="#1E22AA" rx="1"/>
                  <rect x="42" y="45" width="16" height="16" fill="#C5A880" rx="3"/>
                  <rect x="65" y="42" width="10" height="6" fill="#171E52" rx="1"/>
                  <rect x="82" y="42" width="10" height="8" fill="#1E22AA" rx="1"/>
                  <rect x="40" y="68" width="8" height="8" fill="#171E52" rx="1"/>
                  <rect x="54" y="68" width="14" height="6" fill="#1E22AA" rx="1"/>
                  <rect x="74" y="68" width="8" height="8" fill="#171E52" rx="1"/>
                  <rect x="88" y="68" width="6" height="14" fill="#171E52" rx="1"/>
                  <rect x="40" y="82" width="18" height="6" fill="#171E52" rx="1"/>
                  <rect x="64" y="82" width="8" height="10" fill="#1E22AA" rx="1"/>
                </svg>
              </div>

              <span className="text-[10px] text-[#5E6482] font-semibold mt-2 tracking-wide">
                Direct URL: https://novotel-pulse.vercel.app/stay
              </span>
            </div>

            {/* Perks list */}
            <div className="space-y-1.5 text-xs text-white/80 px-2">
              <div className="flex items-center gap-2">
                <span className="text-[#C5A880]">✦</span>
                <span>Instant Pool & Tennis Court Reservation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#C5A880]">✦</span>
                <span>One-Tap Heated Towels & Turndown Service</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#C5A880]">✦</span>
                <span>Direct Butler Messaging via WhatsApp</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const url = `https://novotel-pulse-concierge.vercel.app/stay?token=${qrModalGuest.accessTokenHash}`;
                  navigator.clipboard.writeText(url);
                  showToast('✓ Guest Magic Link copied to clipboard');
                }}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors clickable-card"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Magic Link
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-[#C5A880] hover:bg-amber-600 text-[#171E52] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors clickable-card"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
