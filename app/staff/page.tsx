'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Flame, Bell, Search, ShieldCheck, 
  Send, Sparkles, Filter, CheckCircle2, Clock, 
  Phone, Mail, ArrowUpRight, MessageSquare, QrCode, RefreshCw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { INITIAL_ROOMS, INITIAL_STAYS, INITIAL_PREFERENCES, INITIAL_REQUESTS } from '@/lib/mockData';
import { Room, Stay, GuestPreferences, ServiceRequest, Department } from '@/types/hospitality';

export default function StaffCommandPortal() {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [stays, setStays] = useState<Stay[]>(INITIAL_STAYS);
  const [preferences, setPreferences] = useState<Record<string, GuestPreferences>>(INITIAL_PREFERENCES);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeShift, setActiveShift] = useState<string>('Morning Shift • Tower A');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
    showToast(`✓ Request status updated to ${newStatus.toUpperCase()} (WhatsApp status dispatch fired)`);

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

  // Filter requests by department
  const filteredRequests = requests.filter(r => {
    if (selectedDept !== 'all' && r.department !== selectedDept) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F4F6FB] min-h-screen text-[#171E52]">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-14 right-6 z-50 bg-[#171E52] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C5A880]/50 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          {toastMsg}
        </div>
      )}

      {/* Top Header Bar (Blue Zodiac #0F1155) */}
      <div className="bg-[#0F1155] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] font-serif font-bold text-sm">
            N
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-wider uppercase">
              Novotel Operations Command
            </h1>
            <span className="text-[11px] text-white/60">Front Desk • Housekeeping • Wellness Coordinator</span>
          </div>
        </div>

        {/* Search & Shift Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search guest or room..."
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
                Master Residence Grid
              </h2>
              <p className="text-xs text-[#5E6482]">Live room statuses, VIP profiles, and scheduled arrival pre-sets.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              4 Occupied • 1 Vacant
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rooms.map((room) => {
              const stay = stays.find(s => s.roomId === room.id);
              const pref = stay ? preferences[stay.id] : null;
              const isVip = room.category === 'Suite';

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm transition-all border ${
                    isVip
                      ? 'border-[#C5A880] ring-1 ring-[#C5A880]/30'
                      : 'border-[#E2E5F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-serif font-bold text-[#171E52]">
                          Room {room.roomNumber}
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

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      room.status === 'occupied' ? 'bg-blue-100 text-[#1E22AA]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                  </div>

                  {stay ? (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#171E52]">{stay.guestName}</span>
                        <button
                          onClick={() => sendWhatsAppWelcome(stay)}
                          className="text-[11px] text-[#1E22AA] hover:underline font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          Send Magic Link
                        </button>
                      </div>

                      {/* Preference Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pref?.tennisSlot && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🎾 Tennis {pref.tennisSlot}
                          </span>
                        )}
                        {pref?.towelWarmingTime && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            🔥 Towels {pref.towelWarmingTime}
                          </span>
                        )}
                        {pref?.roomTemp && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            ❄️ {pref.roomTemp}°C
                          </span>
                        )}
                        {pref?.allergies && pref.allergies.length > 0 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            ⚠️ {pref.allergies.join(' / ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-[#5E6482] pt-2 border-t border-slate-100">
                      Ready for check-in handoff.
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
                onClick={() => showToast('Master Pool Temperature notice broadcast to all 4 occupied suites')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-all"
              >
                Broadcast Notice
              </button>
              <button
                onClick={() => showToast('Generated contactless Room 412 VIP QR Welcome Badge')}
                className="px-3 py-1.5 rounded-xl bg-[#C5A880] hover:bg-amber-600 text-[#171E52] text-xs font-bold transition-all flex items-center gap-1.5"
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

            {/* Department Filter Pills */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#E2E5F0] rounded-xl px-2.5 py-1 text-[#171E52] outline-none"
            >
              <option value="all">All Departments</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="wellness">Wellness</option>
              <option value="fnb">F&B</option>
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
                  <span className="font-semibold text-[#171E52]">Room {req.roomId.replace('room-', '')}</span>
                  <span>Target: {req.scheduledTime || 'Immediate'}</span>
                </div>

                {/* Status Advancement Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {req.status !== 'in_progress' && req.status !== 'completed' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'in_progress')}
                      className="flex-1 py-1.5 bg-[#1E22AA] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Dispatch En Route
                    </button>
                  )}
                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'completed')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Mark Delivered (WhatsApp Alert)
                    </button>
                  )}
                  <button
                    onClick={() => showToast(`Pushed custom WhatsApp notification for request ${req.id}`)}
                    className="p-1.5 rounded-xl border border-[#E2E5F0] hover:bg-slate-100 text-emerald-600"
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
    </div>
  );
}
