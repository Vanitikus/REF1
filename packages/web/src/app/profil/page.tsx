'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_POSTS, getTimeAgo, CATEGORY_LABELS } from '@/lib/mock-data';

const USER = {
  displayName: 'Utilizator Demo',
  email: 'demo@refind.ro',
  avatarInitial: 'U',
  communityScore: 145,
  isVerified: true,
  joinedDate: 'ianuarie 2026',
  postsCount: 5,
  resolvedCount: 3,
  matchesFound: 8,
};

type Tab = 'posts' | 'resolved' | 'settings';

export default function ProfilPage() {
  const [tab, setTab] = useState<Tab>('posts');

  const userPosts = MOCK_POSTS.slice(0, 3);
  const resolvedPosts = MOCK_POSTS.slice(3, 5);

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {USER.avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{USER.displayName}</h1>
              {USER.isVerified && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {'\u2713'} Verificat
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{USER.email}</p>
            <p className="text-xs text-gray-400 mt-1">Membru din {USER.joinedDate}</p>
          </div>
          <button className="text-sm text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg">
            Editeaza
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">{USER.communityScore}</div>
            <div className="text-[11px] text-emerald-600">Scor comunitate</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{USER.postsCount}</div>
            <div className="text-[11px] text-blue-600">Postari</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-700">{USER.resolvedCount}</div>
            <div className="text-[11px] text-amber-600">Rezolvate</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Realizari</h2>
        <div className="flex gap-3">
          {[
            { emoji: '\u{1F31F}', label: 'Primele 5 postari', unlocked: true },
            { emoji: '\u{1F91D}', label: '3 match-uri confirmate', unlocked: true },
            { emoji: '\u{1F3C6}', label: 'Scor 100+', unlocked: true },
            { emoji: '\u{1F48E}', label: '10 rezolvate', unlocked: false },
          ].map((badge, i) => (
            <div
              key={i}
              className={`flex-1 text-center p-3 rounded-xl ${
                badge.unlocked ? 'bg-amber-50' : 'bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-2xl block mb-1">{badge.emoji}</span>
              <span className="text-[10px] text-gray-600">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { key: 'posts', label: 'Postarile mele' },
          { key: 'resolved', label: 'Rezolvate' },
          { key: 'settings', label: 'Setari' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {userPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${
                post.type === 'lost' ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
                {post.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{post.locationName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                    post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {post.type === 'lost' ? 'Pierdut' : 'Gasit'}
                  </span>
                  <span className="text-[10px] text-gray-400">{getTimeAgo(post.createdAt)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-gray-400">{post.viewCount} vizualizari</div>
                {post.matchCount > 0 && (
                  <div className="text-xs text-emerald-600 font-medium">{post.matchCount} match-uri</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'resolved' && (
        <div className="space-y-3">
          {resolvedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-emerald-200 hover:shadow-sm transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-2xl shrink-0">
                {post.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                <p className="text-xs text-gray-500">{post.locationName}</p>
              </div>
              <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {'\u2713'} Rezolvat
              </span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          {[
            { label: 'Notificari push', desc: 'Primeste notificari pentru match-uri noi', on: true },
            { label: 'Alerte de zona', desc: 'Notificari cand apare ceva in zona ta', on: true },
            { label: 'Email digest', desc: 'Sumar saptamanal pe email', on: false },
            { label: 'Mod intunecat', desc: 'Activeaza tema intunecata', on: false },
          ].map((setting, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              <div>
                <h3 className="text-sm font-medium">{setting.label}</h3>
                <p className="text-xs text-gray-400">{setting.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors ${
                setting.on ? 'bg-emerald-600' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  setting.on ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200">
            <button className="w-full py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors">
              Deconecteaza-te
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
