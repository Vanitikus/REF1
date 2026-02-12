'use client';

import { use } from 'react';
import Link from 'next/link';
import { MOCK_POSTS, getTimeAgo, CATEGORY_LABELS, CATEGORY_EMOJI } from '@/lib/mock-data';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = MOCK_POSTS.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="py-20 text-center text-gray-400">
        <span className="text-5xl block mb-4">&#x1F6AB;</span>
        <p className="text-lg font-medium">Post negasit</p>
        <Link href="/" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">
          Inapoi la feed
        </Link>
      </div>
    );
  }

  const isLost = post.type === 'lost';

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        &#x2190; Inapoi
      </Link>

      {/* Image area */}
      <div className={`h-64 rounded-2xl flex items-center justify-center ${isLost ? 'bg-red-50' : 'bg-emerald-50'}`}>
        <span className="text-8xl">{post.imageEmoji}</span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
          isLost ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isLost ? 'Pierdut' : 'Gasit'}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {CATEGORY_EMOJI[post.category]} {CATEGORY_LABELS[post.category]}
        </span>
        {post.isBoosted && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            &#x26A1; Promovat
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {getTimeAgo(post.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>&#x1F4CD;</span>
        <span>{post.locationName}</span>
      </div>

      {/* Reward */}
      {post.rewardAmount && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">&#x1F3C6;</span>
          <div>
            <p className="text-amber-800 font-semibold text-lg">{post.rewardAmount} {post.rewardCurrency}</p>
            <p className="text-amber-700 text-xs">Recompensa oferita pentru gasire</p>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descriere</h2>
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
      </div>

      {/* Map placeholder */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Locatie</h2>
        <div className="h-48 bg-gray-200 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-10 h-12 flex flex-col items-center`}>
              <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg ${
                isLost ? 'bg-red-500' : 'bg-emerald-500'
              }`}>
                {post.imageEmoji}
              </div>
              <div className={`w-3 h-3 -mt-1.5 rotate-45 ${isLost ? 'bg-red-500' : 'bg-emerald-500'}`} />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs text-gray-600">
            {post.locationName}
          </div>
        </div>
      </div>

      {/* Matches */}
      {post.matchCount > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Match-uri posibile</h2>
          <div className="space-y-2">
            {Array.from({ length: post.matchCount }).map((_, i) => (
              <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">
                  &#x1F517;
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">Match #{i + 1}</p>
                  <p className="text-xs text-emerald-600">Scor: {85 - i * 12}% compatibilitate</p>
                </div>
                <button className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">
                  Vezi detalii
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Postat de</h2>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
            post.user.isVerified ? 'bg-emerald-600' : 'bg-gray-400'
          }`}>
            {post.user.avatarInitial}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{post.user.displayName}</span>
              {post.user.isVerified && <span className="text-emerald-500">&#x2713;</span>}
            </div>
            <p className="text-xs text-gray-500">Scor comunitate: {post.user.communityScore}</p>
          </div>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
            &#x1F4AC; Contacteaza
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-400 py-2">
        <span>&#x1F441; {post.viewCount} vizualizari</span>
        <span>&#x1F517; {post.matchCount} match-uri</span>
      </div>
    </div>
  );
}
