import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

interface ShiftState {
    isOpen: boolean;
    shiftId: string | null;
    checkStatus: (userId: string) => Promise<void>;
    openShift: (userId: string, initialAmount: number) => Promise<void>;
    closeShift: (userId: string, finalAmount: number) => Promise<void>;
}

export const useShiftStore = create<ShiftState>()(
    persist(
        (set) => ({
            isOpen: false,
            shiftId: null,
            checkStatus: async (userId: string) => {
                try {
                    const { data } = await api.get(`/cash/status/${userId}`);
                    set({ isOpen: data.isOpen, shiftId: data.shift?.id });
                } catch (error) {
                    console.error("Failed to check shift status", error);
                }
            },
            openShift: async (userId: string, initialAmount: number) => {
                await api.post('/cash/open', { userId, initialAmount });
                set({ isOpen: true });
            },
            closeShift: async (userId: string, finalAmount: number) => {
                await api.post('/cash/close', { userId, finalAmount });
                set({ isOpen: false, shiftId: null });
            },
        }),
        {
            name: 'shift-storage',
        }
    )
);
