'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { HotelBranch } from '@/types/hospitality';
import { NOVOTEL_BRANCHES } from '@/lib/mockData';

interface BranchContextType {
  activeBranch: HotelBranch;
  setBranchById: (id: string) => void;
  branches: HotelBranch[];
}

const BranchContext = createContext<BranchContextType>({
  activeBranch: NOVOTEL_BRANCHES[2], // Default: Novotel Singapore on Stevens (Full resort facilities with dual pools & tennis)
  setBranchById: () => {},
  branches: NOVOTEL_BRANCHES,
});

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [activeBranch, setActiveBranch] = useState<HotelBranch>(NOVOTEL_BRANCHES[2]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('novotel_active_branch_id');
      if (saved) {
        const found = NOVOTEL_BRANCHES.find(b => b.id === saved);
        if (found) setActiveBranch(found);
      }
    } catch (e) {}
  }, []);

  const setBranchById = (id: string) => {
    const found = NOVOTEL_BRANCHES.find(b => b.id === id);
    if (found) {
      setActiveBranch(found);
      try {
        localStorage.setItem('novotel_active_branch_id', id);
      } catch (e) {}
    }
  };

  return (
    <BranchContext.Provider value={{ activeBranch, setBranchById, branches: NOVOTEL_BRANCHES }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  return useContext(BranchContext);
}
