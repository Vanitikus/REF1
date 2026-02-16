'use client';

import { useState, useEffect, useCallback } from 'react';
import { postsApi } from '../api-client';
import { MOCK_POSTS, type MockPost } from '../mock-data';
import { useAuth } from '../auth-context';

const API_AVAILABLE = Boolean(process.env.NEXT_PUBLIC_API_URL);

interface UsePostsOptions {
  type?: string;
  category?: string;
  page?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (API_AVAILABLE) {
      const res = await postsApi.list(options);
      if (res.data) {
        setPosts(res.data as unknown as MockPost[]);
      } else {
        setError(res.error ?? 'Eroare la incarcarea posturilor');
        setPosts(MOCK_POSTS); // Fallback
      }
    } else {
      // Mock mode
      let filtered = [...MOCK_POSTS];
      if (options.type && options.type !== 'all') {
        filtered = filtered.filter((p) => p.type === options.type);
      }
      if (options.category && options.category !== 'all') {
        filtered = filtered.filter((p) => p.category === options.category);
      }
      setPosts(filtered);
    }

    setLoading(false);
  }, [options.type, options.category, options.page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refetch: fetchPosts };
}

export function usePost(id: string) {
  const [post, setPost] = useState<MockPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      if (API_AVAILABLE) {
        const res = await postsApi.get(id);
        if (res.data) {
          setPost(res.data as unknown as MockPost);
        } else {
          setError(res.error ?? 'Post negasit');
          setPost(MOCK_POSTS.find((p) => p.id === id) ?? null);
        }
      } else {
        setPost(MOCK_POSTS.find((p) => p.id === id) ?? null);
      }
      setLoading(false);
    }
    fetch();
  }, [id]);

  return { post, loading, error };
}

export function useCreatePost() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const createPost = useCallback(async (data: Record<string, unknown>) => {
    if (!token) return { error: 'Trebuie sa fii autentificat' };
    setLoading(true);

    if (API_AVAILABLE) {
      const res = await postsApi.create(data, token);
      setLoading(false);
      if (res.error) return { error: res.error };
      return { data: res.data };
    }

    // Mock mode
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    return { data: { id: `mock-${Date.now()}` } };
  }, [token]);

  return { createPost, loading };
}
