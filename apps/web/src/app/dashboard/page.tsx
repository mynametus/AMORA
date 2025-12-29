'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { charactersApi, chatsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    }
  }, [token, router]);

  const { data: characters } = useQuery({
    queryKey: ['characters'],
    queryFn: () => charactersApi.findAll({ page: 1, pageSize: 20 }),
    enabled: !!token,
  });

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatsApi.findAll({ page: 1, pageSize: 10 }),
    enabled: !!token,
  });

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-pink-600">Amora</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => {
                  useAuthStore.getState().logout();
                  router.push('/auth/login');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Chats</h2>
          {chats?.data?.items && chats.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chats.data.items.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold mb-2">{chat.title || 'Untitled Chat'}</h3>
                  <p className="text-sm text-gray-600">
                    {chat.character?.name || 'Unknown Character'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No chats yet. Start a new conversation!</p>
          )}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Explore Characters</h2>
          {characters?.data?.items && characters.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {characters.data.items.map((character) => (
                <Link
                  key={character.id}
                  href={`/characters/${character.id}`}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                >
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                  <h3 className="font-semibold mb-1">{character.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{character.description}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Loading characters...</p>
          )}
        </div>
      </main>
    </div>
  );
}

