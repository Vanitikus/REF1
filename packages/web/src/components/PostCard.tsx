import Link from 'next/link';
import { type MockPost, getTimeAgo, CATEGORY_LABELS } from '@/lib/mock-data';

export function PostCard({ post }: { post: MockPost }) {
  const isLost = post.type === 'lost';

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image placeholder */}
        <div className={`h-44 flex items-center justify-center ${isLost ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <span className="text-6xl">{post.imageEmoji}</span>
        </div>

        <div className="p-4">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isLost
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isLost ? 'Pierdut' : 'Gasit'}
            </span>
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[post.category]}
            </span>
            {post.isBoosted && (
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                &#x26A1; Promovat
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-tight mb-1.5 line-clamp-2">
            {post.title}
          </h3>

          {/* Location & time */}
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <span>&#x1F4CD;</span>
            <span className="truncate">{post.locationName}</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="whitespace-nowrap">{getTimeAgo(post.createdAt)}</span>
          </p>

          {/* Reward */}
          {post.rewardAmount && (
            <div className="mb-3 inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-lg">
              <span>&#x1F3C6;</span>
              Recompensa: {post.rewardAmount} {post.rewardCurrency}
            </div>
          )}

          {/* Footer: user + stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                post.user.isVerified ? 'bg-emerald-600' : 'bg-gray-400'
              }`}>
                {post.user.avatarInitial}
              </div>
              <span className="text-xs text-gray-600">{post.user.displayName}</span>
              {post.user.isVerified && <span className="text-emerald-500 text-xs">&#x2713;</span>}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span>&#x1F441; {post.viewCount}</span>
              {post.matchCount > 0 && (
                <span className="text-emerald-500 font-medium">&#x1F517; {post.matchCount} match{post.matchCount > 1 ? '-uri' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
