'use client';

import { useState, useEffect, useCallback } from 'react';
import { matchesApi } from '../api-client';
import { useAuth } from '../auth-context';
import { MOCK_POSTS } from '../mock-data';

const API_AVAILABLE = Boolean(process.env.NEXT_PUBLIC_API_URL);

interface Match {
  id: string;
  score: number;
  lostPost: typeof MOCK_POSTS[0];
  foundPost: typeof MOCK_POSTS[0];
  status: 'pending' | 'confirmed' | 'rejected';
  signals: { label: string; score: number }[];
  createdAt: string;
}

const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    score: 92,
    lostPost: MOCK_POSTS[0],
    foundPost: MOCK_POSTS[7],
    status: 'pending',
    signals: [
      { label: 'Locatie', score: 85 },
      { label: 'Vizual', score: 95 },
      { label: 'Categorie', score: 100 },
      { label: 'Timp', score: 70 },
      { label: 'Text', score: 88 },
    ],
    createdAt: '2026-02-13T10:00:00Z',
  },
  {
    id: 'm2',
    score: 78,
    lostPost: MOCK_POSTS[2],
    foundPost: MOCK_POSTS[5],
    status: 'pending',
    signals: [
      { label: 'Locatie', score: 60 },
      { label: 'Vizual', score: 70 },
      { label: 'Categorie', score: 100 },
      { label: 'Timp', score: 80 },
      { label: 'Text', score: 65 },
    ],
    createdAt: '2026-02-12T15:30:00Z',
  },
  {
    id: 'm3',
    score: 65,
    lostPost: MOCK_POSTS[4],
    foundPost: MOCK_POSTS[1],
    status: 'confirmed',
    signals: [
      { label: 'Locatie', score: 40 },
      { label: 'Vizual', score: 55 },
      { label: 'Categorie', score: 100 },
      { label: 'Timp', score: 75 },
      { label: 'Text', score: 50 },
    ],
    createdAt: '2026-02-11T08:00:00Z',
  },
];

export function useMatches() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      if (API_AVAILABLE && token) {
        const res = await matchesApi.list(token);
        if (res.data) {
          setMatches(res.data as unknown as Match[]);
        } else {
          setMatches(MOCK_MATCHES);
        }
      } else {
        setMatches(MOCK_MATCHES);
      }
      setLoading(false);
    }
    fetch();
  }, [token]);

  const confirmMatch = useCallback(async (id: string) => {
    if (API_AVAILABLE && token) {
      await matchesApi.confirm(id, token);
    }
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 'confirmed' as const } : m));
  }, [token]);

  const rejectMatch = useCallback(async (id: string) => {
    if (API_AVAILABLE && token) {
      await matchesApi.reject(id, token);
    }
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 'rejected' as const } : m));
  }, [token]);

  return { matches, loading, confirmMatch, rejectMatch };
}

export type { Match };
