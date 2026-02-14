'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_POSTS, getTimeAgo, CATEGORY_EMOJI, CATEGORY_LABELS } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';

type PostStatus = 'active' | 'resolved' | 'expired';

interface ManagedPost {
  id: string;
  status: PostStatus;
  title: string;
  type: 'lost' | 'found';
  category: string;
  locationName: string;
  imageEmoji: string;
  createdAt: string;
  viewCount: number;
  matchCount: number;
  rewardAmount: number | null;
  expiresAt: string;
}

const MY_POSTS: ManagedPost[] = MOCK_POSTS.slice(0, 4).map((p, i) => ({
  ...p,
  status: (i === 3 ? 'resolved' : i === 2 ? 'expired' : 'active') as PostStatus,
  expiresAt: new Date(Date.now() + (30 - i * 10) * 86400000).toISOString(),
}));

export default function PostarileMelePage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(MY_POSTS);
  const [filter, setFilter] = useState<'all' | PostStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <span className="text-5xl block mb-4">{'\u{1F512}'}</span>
        <p className="text-lg font-medium text-gray-700 mb-2">Trebuie sa fii autentificat</p>
        <Link href="/autentificare" className="text-emerald-600 text-sm hover:underline">
          Autentifica-te {'\u2192'}
        </Link>
      </div>
    );
  }

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleStatusChange = (id: string, newStatus: PostStatus) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleEditSave = (id: string) => {
    if (editTitle.trim().length >= 5) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, title: editTitle } : p));
      setEditingId(null);
    }
  };

  const startEdit = (post: ManagedPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
  };

  const statusLabels: Record<PostStatus, { label: string; class: string }> = {
    active: { label: 'Activa', class: 'bg-emerald-100 text-emerald-700' },
    resolved: { label: 'Rezolvata', class: 'bg-blue-100 text-blue-700' },
    expired: { label: 'Expirata', class: 'bg-gray-100 text-gray-500' },
  };

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Postarile mele</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} postari totale</p>
        </div>
        <Link
          href="/posteaza"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + Postare noua
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {(['all', 'active', 'resolved', 'expired'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              filter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `Toate (${posts.length})` : `${statusLabels[f].label} (${posts.filter((p) => p.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">{'\u{1F4ED}'}</span>
          <p className="text-lg font-medium">Nicio postare</p>
          <Link href="/posteaza" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">
            Creeaza prima postare {'\u2192'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Post row */}
              <div className="p-4 flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${
                  post.type === 'lost' ? 'bg-red-50' : 'bg-emerald-50'
                }`}>
                  {post.imageEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === post.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditSave(post.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium"
                      >
                        Salveaza
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                      >
                        Anuleaza
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/post/${post.id}`} className="text-sm font-semibold hover:text-emerald-600 truncate">
                          {post.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {post.type === 'lost' ? 'Pierdut' : 'Gasit'}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusLabels[post.status].class}`}>
                          {statusLabels[post.status].label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {CATEGORY_EMOJI[post.category]} {CATEGORY_LABELS[post.category]}
                        </span>
                        <span className="text-[10px] text-gray-400">{'\u{1F4CD}'} {post.locationName}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                    <span>{'\u{1F441}'} {post.viewCount}</span>
                    <span>{'\u{1F517}'} {post.matchCount} matchuri</span>
                    <span>{getTimeAgo(post.createdAt)}</span>
                    {post.rewardAmount && <span className="text-amber-600">{'\u{1F3C6}'} {post.rewardAmount} RON</span>}
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-2 bg-gray-50/50">
                <button
                  onClick={() => startEdit(post)}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                >
                  {'\u270F'} Editeaza
                </button>
                <Link href={`/post/${post.id}`} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                  {'\u{1F441}'} Vizualizeaza
                </Link>
                {post.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(post.id, 'resolved')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                  >
                    {'\u2713'} Marcheaza rezolvat
                  </button>
                )}
                {post.status === 'expired' && (
                  <button
                    onClick={() => handleStatusChange(post.id, 'active')}
                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    {'\u{1F504}'} Reactiveaza
                  </button>
                )}
                {post.status === 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(post.id, 'active')}
                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    {'\u{1F504}'} Redeschide
                  </button>
                )}

                {deleteConfirm === post.id ? (
                  <div className="ml-auto flex items-center gap-1">
                    <span className="text-xs text-red-500">Esti sigur?</span>
                    <button onClick={() => handleDelete(post.id)} className="text-xs text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600">Da</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Nu</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(post.id)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors ml-auto"
                  >
                    {'\u{1F5D1}'} Sterge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
