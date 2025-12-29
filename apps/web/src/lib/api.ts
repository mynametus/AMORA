import axios from 'axios';
import type { ApiResponse, User, Character, Chat, Message, PaginatedResponse } from '@amora/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, password: string, name?: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      email,
      password,
      name,
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },
};

// Characters API
export const charactersApi = {
  findAll: async (params?: {
    page?: number;
    pageSize?: number;
    archetype?: string;
    isPremium?: boolean;
    tags?: string[];
  }) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Character>>>('/characters', {
      params,
    });
    return data;
  },

  findById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Character>>(`/characters/${id}`);
    return data;
  },

  create: async (character: any) => {
    const { data } = await api.post<ApiResponse<Character>>('/characters', character);
    return data;
  },
};

// Chats API
export const chatsApi = {
  findAll: async (params?: { page?: number; pageSize?: number }) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Chat>>>('/chats', { params });
    return data;
  },

  findById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Chat>>(`/chats/${id}`);
    return data;
  },

  create: async (chat: { characterId: string; title?: string; scene?: any }) => {
    const { data } = await api.post<ApiResponse<Chat>>('/chats', chat);
    return data;
  },

  sendMessage: async (chatId: string, message: { content: string; imageUrl?: string }) => {
    const { data } = await api.post<ApiResponse<Message>>(`/chats/${chatId}/messages`, message);
    return data;
  },
};

// Users API
export const usersApi = {
  updatePreferences: async (preferences: any) => {
    const { data } = await api.put('/users/preferences', preferences);
    return data;
  },
};

export default api;

