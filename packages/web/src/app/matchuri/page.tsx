'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_POSTS, getTimeAgo, CATEGORY_EMOJI } from '@/lib/mock-data';

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

type Tab = 'all' | 'pending' | 'confirmed' | 'rejected';

export default function MatchuriPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = tab === 'all' ? matches : matches.filter((m) => m.status === tab);
  const counts = {
    all: matches.length,
    pending: matches.filter((m) => m.status === 'pending').length,
    confirmed: matches.filter((m) => m.status === 'confirmed').length,
    rejected: matches.filter((m) => m.status === 'rejected').length,
  };

  const handleAction = (id: string, action: 'confirmed' | 'rejected') => {
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: action } : m));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `Toate (${counts.all})` },
    { key: 'pending', label: `In asteptare (${counts.pending})` },
    { key: 'confirmed', label: `Confirmate (${counts.confirmed})` },
    { key: 'rejected', label: `Respinse (${counts.rejected})` },
  ];

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Match-uri AI</h1>
        <p className="text-sm text-gray-500 mt-1">
          Algoritmul nostru a gasit posibile potriviri intre postari pierdute si gasite.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 min-w-fit px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 mb-6">
        <span className="text-lg">{'\u{1F916}'}</span>
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-0.5">Cum functioneaza scorul de match?</p>
          <p>AI-ul analizeaza 5 semnale: locatie (30%), similaritate vizuala (30%), categorie (20%), proximitate temporala (10%) si text (10%).</p>
        </div>
      </div>

      {/* Match list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">{'\u{1F50D}'}</span>
          <p className="text-lg font-medium">Niciun match {tab !== 'all' ? 'in aceasta categorie' : ''}</p>
          <p className="text-sm mt-1">Algoritmul cauta continuu. Te notificam cand gaseste ceva!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              expanded={expandedId === match.id}
              onToggle={() => setExpandedId(expandedId === match.id ? null : match.id)}
              onConfirm={() => handleAction(match.id, 'confirmed')}
              onReject={() => handleAction(match.id, 'rejected')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchCard({
  match,
  expanded,
  onToggle,
  onConfirm,
  onReject,
}: {
  match: Match;
  expanded: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const scoreColor =
    match.score >= 80 ? 'text-brand-teal-600 bg-brand-teal-50 border-brand-teal-200' :
    match.score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-gray-600 bg-gray-50 border-gray-200';

  const scoreBg =
    match.score >= 80 ? 'bg-brand-teal-400' :
    match.score >= 60 ? 'bg-amber-500' :
    'bg-gray-400';

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      match.status === 'confirmed' ? 'border-brand-teal-200 bg-brand-teal-50' :
      match.status === 'rejected' ? 'border-gray-200 bg-gray-50/50 opacity-60' :
      'border-gray-200 bg-white'
    }`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-3 text-left">
        {/* Score circle */}
        <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center shrink-0 ${scoreColor}`}>
          <span className="text-lg font-bold leading-none">{match.score}%</span>
          <span className="text-[8px] font-medium">match</span>
        </div>

        {/* Posts preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">Pierdut</span>
            <span className="text-xs truncate text-gray-700">{match.lostPost.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-brand-teal-100 text-brand-teal-700">Gasit</span>
            <span className="text-xs truncate text-gray-700">{match.foundPost.title}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          {match.status === 'pending' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">In asteptare</span>
          )}
          {match.status === 'confirmed' && (
            <span className="text-xs bg-brand-teal-100 text-brand-teal-700 px-2 py-1 rounded-full font-medium">{'\u2713'} Confirmat</span>
          )}
          {match.status === 'rejected' && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">{'\u2715'} Respins</span>
          )}
        </div>

        <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>{'\u25BC'}</span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4">
          {/* Side by side comparison */}
          <div className="grid grid-cols-2 gap-3">
            <PostMiniCard post={match.lostPost} type="lost" />
            <PostMiniCard post={match.foundPost} type="found" />
          </div>

          {/* Signal breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Analiza semnale AI</h4>
            <div className="space-y-2">
              {match.signals.map((signal) => (
                <div key={signal.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20">{signal.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        signal.score >= 80 ? 'bg-brand-teal-400' : signal.score >= 60 ? 'bg-amber-500' : 'bg-red-400'
                      }`}
                      style={{ width: `${signal.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8 text-right">{signal.score}%</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-500">Scor total:</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full ${scoreBg}`} style={{ width: `${match.score}%` }} />
              </div>
              <span className="text-sm font-bold">{match.score}%</span>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            Match detectat {getTimeAgo(match.createdAt)}
          </p>

          {/* Actions */}
          {match.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={onReject}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                {'\u2715'} Nu e potrivire
              </button>
              <Link
                href="/chat"
                className="flex-1 py-2.5 text-sm font-medium text-center text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                {'\u{1F4AC}'} Contacteaza
              </Link>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-orange-500 rounded-xl hover:bg-brand-orange-600 transition-colors"
              >
                {'\u2713'} Confirma match
              </button>
            </div>
          )}
          {match.status === 'confirmed' && (
            <div className="bg-brand-teal-50 border border-brand-teal-200 rounded-xl p-3 text-center">
              <p className="text-sm text-brand-teal-700 font-medium">{'\u{1F389}'} Match confirmat! Contacteaza celalalt utilizator in chat.</p>
              <Link href="/chat" className="inline-block mt-2 text-xs text-brand-orange-500 font-medium hover:underline">
                Deschide conversatia {'\u2192'}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostMiniCard({ post, type }: { post: typeof MOCK_POSTS[0]; type: 'lost' | 'found' }) {
  const isLost = type === 'lost';

  return (
    <Link href={`/post/${post.id}`} className="block">
      <div className={`rounded-xl border p-3 hover:shadow-sm transition-shadow ${
        isLost ? 'border-red-200 bg-red-50/50' : 'border-brand-teal-200 bg-brand-teal-50'
      }`}>
        <div className={`w-full h-20 rounded-lg flex items-center justify-center text-3xl mb-2 ${
          isLost ? 'bg-red-100' : 'bg-brand-teal-100'
        }`}>
          {post.imageEmoji}
        </div>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs">{CATEGORY_EMOJI[post.category]}</span>
          <span className={`text-[10px] font-semibold uppercase ${isLost ? 'text-red-600' : 'text-brand-orange-500'}`}>
            {isLost ? 'Pierdut' : 'Gasit'}
          </span>
        </div>
        <h4 className="text-xs font-semibold truncate">{post.title}</h4>
        <p className="text-[10px] text-gray-500 truncate mt-0.5">{post.locationName}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{getTimeAgo(post.createdAt)}</p>
      </div>
    </Link>
  );
}
