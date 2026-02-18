'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { getTimeAgo, CATEGORY_LABELS, CATEGORY_EMOJI, type MockPost } from '@/lib/mock-data';
import { usePost, usePosts } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';
import { reportsApi } from '@/lib/api-client';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { post, loading } = usePost(id);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center text-gray-400">
        <span className="text-5xl block mb-4">{'\u{1F6AB}'}</span>
        <p className="text-lg font-medium">Post negasit</p>
        <Link href="/" className="text-brand-orange-500 text-sm mt-2 inline-block hover:underline">
          Inapoi la feed
        </Link>
      </div>
    );
  }

  const isLost = post.type === 'lost';

  const { posts: categoryPosts } = usePosts({ category: post.category });
  const similarPosts = categoryPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${post.type === 'lost' ? 'Pierdut' : 'Gasit'}: ${post.title} - ${post.locationName}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: post.title, text, url });
      } catch {
        // cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const { token } = useAuth();

  const handleReport = async () => {
    if (reportReason) {
      if (token) {
        await reportsApi.submit({
          targetType: 'post',
          targetId: id,
          reason: reportReason,
        }, token);
      }
      setReportSent(true);
      setTimeout(() => {
        setShowReport(false);
        setReportSent(false);
        setReportReason('');
      }, 2000);
    }
  };

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          {'\u2190'} Inapoi
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Distribuie"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={() => setShowReport(!showReport)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Raporteaza"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {'\u{2705}'} Link copiat!
        </div>
      )}

      {/* Report panel */}
      {showReport && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          {reportSent ? (
            <div className="text-center py-2">
              <span className="text-2xl block mb-1">{'\u{2705}'}</span>
              <p className="text-sm text-red-800 font-medium">Raport trimis! Multumim.</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-red-800 mb-3">Raporteaza postarea</h3>
              <div className="space-y-2 mb-3">
                {[
                  { key: 'spam', label: 'Spam sau duplicat' },
                  { key: 'inappropriate', label: 'Continut inadecvat' },
                  { key: 'fraud', label: 'Frauda sau inselaciune' },
                  { key: 'other', label: 'Altceva' },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setReportReason(r.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      reportReason === r.key ? 'bg-red-200 text-red-800' : 'bg-white text-gray-600 hover:bg-red-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReport(false)} className="flex-1 py-2 text-sm text-gray-600 bg-white rounded-lg hover:bg-gray-50">
                  Anuleaza
                </button>
                <button onClick={handleReport} disabled={!reportReason} className="flex-1 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  Trimite raport
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Image area */}
      <div className={`h-64 sm:h-80 rounded-2xl flex items-center justify-center relative ${isLost ? 'bg-red-50' : 'bg-brand-teal-50'}`}>
        <span className="text-8xl">{post.imageEmoji}</span>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-red-400' : 'bg-brand-teal-400'}`} />
          <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-red-200' : 'bg-brand-teal-200'}`} />
          <span className={`w-2 h-2 rounded-full ${isLost ? 'bg-red-200' : 'bg-brand-teal-200'}`} />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
          isLost ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
        }`}>
          {isLost ? 'Pierdut' : 'Gasit'}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {CATEGORY_EMOJI[post.category]} {CATEGORY_LABELS[post.category]}
        </span>
        {post.isBoosted && (
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            {'\u26A1'} Promovat
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{getTimeAgo(post.createdAt)}</span>
      </div>

      <h1 className="text-2xl font-bold">{post.title}</h1>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>{'\u{1F4CD}'}</span>
        <span>{post.locationName}</span>
        <Link href="/harta" className="ml-auto text-brand-orange-500 text-xs hover:underline">
          Vezi pe harta {'\u2192'}
        </Link>
      </div>

      {/* Reward */}
      {post.rewardAmount && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">{'\u{1F3C6}'}</span>
          <div className="flex-1">
            <p className="text-amber-800 font-semibold text-lg">{post.rewardAmount} {post.rewardCurrency}</p>
            <p className="text-amber-700 text-xs">Recompensa oferita pentru gasire</p>
          </div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors">
            Revendica
          </button>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Descriere</h2>
        <p className="text-gray-700 leading-relaxed">{post.description}</p>
      </div>

      {/* Map */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Locatie</h2>
        <Link href="/harta" className="block">
          <div className="h-48 bg-gray-200 rounded-xl relative overflow-hidden hover:opacity-90 transition-opacity">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg ${isLost ? 'bg-red-500' : 'bg-brand-teal-400'}`}>
                  {post.imageEmoji}
                </div>
                <div className={`w-3 h-3 -mt-1.5 rotate-45 ${isLost ? 'bg-red-500' : 'bg-brand-teal-400'}`} />
              </div>
            </div>
            <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs text-gray-600">
              {post.locationName}
            </div>
            <div className="absolute top-2 right-2 bg-white/90 rounded px-2 py-1 text-[10px] text-brand-orange-500 font-medium">
              Deschide harta {'\u2192'}
            </div>
          </div>
        </Link>
      </div>

      {/* Matches */}
      {post.matchCount > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Match-uri posibile</h2>
          <div className="space-y-2">
            {Array.from({ length: post.matchCount }).map((_, i) => {
              const score = 85 - i * 12;
              return (
                <div key={i} className={`border rounded-xl p-3 flex items-center gap-3 ${score >= 70 ? 'bg-brand-teal-50 border-brand-teal-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${score >= 70 ? 'bg-brand-teal-100' : 'bg-gray-200'}`}>
                    {'\u{1F517}'}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${score >= 70 ? 'text-brand-teal-800' : 'text-gray-700'}`}>
                      Match #{i + 1}
                      {score >= 80 && <span className="ml-2 text-[10px] bg-brand-orange-500 text-white px-1.5 py-0.5 rounded-full">Top match</span>}
                    </p>
                    <p className={`text-xs ${score >= 70 ? 'text-brand-teal-600' : 'text-gray-500'}`}>Scor: {score}% compatibilitate</p>
                  </div>
                  <Link href="/chat" className={`text-xs px-3 py-1.5 rounded-lg font-medium ${score >= 70 ? 'bg-brand-orange-500 text-white hover:bg-brand-orange-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                    Contacteaza
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Postat de</h2>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${post.user.isVerified ? 'bg-brand-teal-400' : 'bg-gray-400'}`}>
            {post.user.avatarInitial}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">{post.user.displayName}</span>
              {post.user.isVerified && <span className="bg-brand-teal-100 text-brand-teal-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">{'\u2713'} Verificat</span>}
            </div>
            <p className="text-xs text-gray-500">Scor comunitate: {post.user.communityScore}</p>
          </div>
          <Link href="/chat" className="bg-brand-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors">
            {'\u{1F4AC}'} Contacteaza
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-400 py-2">
        <span>{'\u{1F441}'} {post.viewCount} vizualizari</span>
        <span>{'\u{1F517}'} {post.matchCount} match-uri</span>
        <span>{getTimeAgo(post.createdAt)}</span>
      </div>

      {/* Similar posts */}
      {similarPosts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Postari similare</h2>
          <div className="space-y-2">
            {similarPosts.map((p) => (
              <SimilarPostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimilarPostCard({ post }: { post: MockPost }) {
  return (
    <Link href={`/post/${post.id}`} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 ${post.type === 'lost' ? 'bg-red-50' : 'bg-brand-teal-50'}`}>
        {post.imageEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{post.title}</h3>
        <p className="text-xs text-gray-400">{post.locationName}</p>
      </div>
      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'}`}>
        {post.type === 'lost' ? 'Pierdut' : 'Gasit'}
      </span>
    </Link>
  );
}
