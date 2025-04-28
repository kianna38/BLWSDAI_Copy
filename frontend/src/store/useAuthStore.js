import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            token: null,
            userId: null,
            userRole: null,
            setUser: ({ token, userId, userRole }) =>
                set({ token, userId, userRole }),
            clearUser: () => set({ token: null, userId: null, userRole: null }),
        }),
        {
            name: 'auth-storage', // The key to store in localStorage
            getStorage: () => localStorage, // Using localStorage for persistence
            skipHydration: false, // Important for client-side state persistence
        }
    )
);

export default useAuthStore;
