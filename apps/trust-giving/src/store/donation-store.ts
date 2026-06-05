import { create } from 'zustand';
import type { DonationReceipt } from '@workspace/api-client-react/src/generated/api.schemas';

interface DonationStore {
  latestReceipt: DonationReceipt | null;
  setReceipt: (receipt: DonationReceipt) => void;
  clearReceipt: () => void;
}

export const useDonationStore = create<DonationStore>((set) => ({
  latestReceipt: null,
  setReceipt: (receipt) => set({ latestReceipt: receipt }),
  clearReceipt: () => set({ latestReceipt: null }),
}));