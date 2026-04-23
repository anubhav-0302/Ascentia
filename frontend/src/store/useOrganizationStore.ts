import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  currentOrgId: number | null;
  currentOrg: any | null;
  setCurrentOrgId: (id: number | null) => void;
  setCurrentOrg: (org: any) => void;
  clearOrg: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      currentOrgId: null,
      currentOrg: null,
      setCurrentOrgId: (id) => set({ currentOrgId: id }),
      setCurrentOrg: (org) => set({ currentOrg: org }),
      clearOrg: () => set({ currentOrgId: null, currentOrg: null })
    }),
    {
      name: 'organization-storage'
    }
  )
);
