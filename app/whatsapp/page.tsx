'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCheck, Phone, ArrowUpRight, ShieldCheck, 
  Sparkles, ExternalLink, MessageSquare, ChevronLeft 
} from 'lucide-react';
import NovotelLogo from '@/components/NovotelLogo';

export default function WhatsAppPreviewPage() {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#0B141B] min-h-screen text-white">
      {/* Device Frame */}
      <div className="w-full max-w-[420px] bg-[#111B21] rounded-[36px] shadow-2xl border border-white/10 overflow-hidden flex flex-col min-h-[820px] relative">
        
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#202C33] px-4 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            
            {/* Avatar with Verified Green Badge */}
            <div className="relative">
              <NovotelLogo variant="badge" size="sm" theme="dark" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00A884] border-2 border-[#202C33] flex items-center justify-center text-[8px] text-white font-bold">
                ✓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-white">Novotel Concierge</span>
              </div>
              <span className="text-[11px] text-[#00A884]">Official Business Account</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white/70">
            <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Chat Message Scrollable Area */}
        <div data-lenis-prevent className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#0B141B]">
          
          <div className="text-center my-2">
            <span className="px-3 py-1 rounded-lg bg-[#182229] text-[10px] text-white/50 uppercase tracking-widest font-semibold">
              Today
            </span>
          </div>

          {/* MESSAGE 1: Pre-Arrival Welcome Card */}
          <div className="max-w-[340px] bg-[#202C33] rounded-2xl rounded-tl-sm p-3 shadow-md border border-white/5 space-y-3">
            {/* Rich Media Header */}
            <div className="rounded-xl overflow-hidden border border-white/10 relative">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
                alt="Novotel Heated Pool"
                className="w-full h-36 object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-[#171E52]/90 backdrop-blur-md text-[#C5A880] text-[10px] font-semibold tracking-wider flex items-center gap-1.5 border border-[#C5A880]/30">
                <NovotelLogo variant="symbol" size="xs" />
                <span>EXECUTIVE SUITE 412</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-white">
                Welcome to Novotel, Arthur
              </h4>
              <p className="text-xs text-white/75 leading-relaxed">
                Suite 412 is reserved for your arrival. To choose your Live N' Dream pillows and have heated towels waiting before you step into the room, tap your key link below:
              </p>
            </div>

            <div className="text-right text-[10px] text-white/40 flex items-center justify-end gap-1">
              <span>14:02</span>
              <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
            </div>

            {/* Interactive WhatsApp CTAs */}
            <div className="space-y-1.5 pt-1 border-t border-white/10">
              <Link
                href="/stay?token=magic_token_412_vip"
                className="w-full py-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize My Room (30s)</span>
              </Link>
              <button
                onClick={() => alert('Dialing Novotel Executive Butler Desk: +33 1 40 00 00 00')}
                className="w-full py-2 bg-[#2A3942] hover:bg-[#32444f] text-white/90 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Phone className="w-3 h-3 text-[#00A884]" />
                <span>Call Butler Desk</span>
              </button>
            </div>
          </div>

          {/* MESSAGE 2: Live Action Confirmation Card */}
          <div className="max-w-[340px] bg-[#202C33] rounded-2xl rounded-tl-sm p-3.5 shadow-md border border-white/5 space-y-2.5">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00A884]/20 text-[#00A884] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-xs text-white/85 leading-relaxed">
                <strong className="text-white block mb-0.5">Butler Service Confirmed</strong>
                Your 2x heated plush Turkish bath towels are scheduled for delivery to Suite 412 at <span className="text-[#53BDEB] font-semibold">20:30 PM</span>. Residence climate pre-cooled to <span className="text-[#53BDEB] font-semibold">20°C</span>.
              </p>
            </div>

            <div className="text-right text-[10px] text-white/40 flex items-center justify-end gap-1">
              <span>14:05</span>
              <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
            </div>

            <div className="pt-1 border-t border-white/10">
              <Link
                href="/"
                className="w-full py-2 bg-[#2A3942] hover:bg-[#32444f] text-white text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3 h-3 text-[#53BDEB]" />
                <span>Track Request in Mini-App</span>
              </Link>
            </div>
          </div>

        </div>

        {/* WhatsApp Fake Input Bar */}
        <div className="bg-[#202C33] p-3 flex items-center gap-2 border-t border-white/5">
          <div className="flex-1 bg-[#2A3942] px-4 py-2 rounded-full text-xs text-white/50">
            Type a request to Novotel Butler...
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center text-white cursor-pointer hover:bg-[#008f6f]">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}
