import { create } from 'zustand';
import type { User, Character, Chat } from '@amora/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null });
  },
}));

interface ChatState {
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentChat: null,
  setCurrentChat: (chat) => set({ currentChat: chat }),
}));

