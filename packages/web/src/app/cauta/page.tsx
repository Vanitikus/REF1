'use client';

import { useState, useMemo } from 'react';
import { PostCard } from '@/components/PostCard';
import { MOCK_POSTS, CATEGORY_LABELS, CATEGORY_EMOJI } from '@/lib/mock-data';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hasReward, setHasReward] = useState(false);

  const results = useMemo(() => {
    let posts = MOCK_POSTS;

    if (query.trim()) {
      const q = query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.locationName.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      posts = posts.filter((p) => p.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      posts = posts.filter((p) => p.category === categoryFilter);
    }

    if (hasReward) {
      posts = posts.filter((p) => p.rewardAmount && p.rewardAmount > 0);
    }

    return posts;
  }, [query, typeFilter, categoryFilter, hasReward]);

  const suggestions = ['labrador', 'buletin', 'portofel', 'pisica', 'cheie', 'rucsac'];

  return (
    <div className="py-6 space-y-6">
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{'\u{1F50E}'}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cauta obiect pierdut sau gasit..."
          autoFocus
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {'\u2715'}
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      {!query && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Cautari populare</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium mr-1">Filtre:</span>

        {/* Type filter */}
        {(['all', 'lost', 'found'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              typeFilter === t
                ? t === 'lost'
                  ? 'bg-red-100 text-red-700'
                  : t === 'found'
                    ? 'bg-brand-teal-100 text-brand-teal-700'
                    : 'bg-brand-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {t === 'all' ? 'Toate' : t === 'lost' ? 'Pierdute' : 'Gasite'}
          </button>
        ))}

        <span className="w-px h-5 bg-gray-200" />

        {/* Category filter */}
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {CATEGORY_EMOJI[key]} {label}
          </button>
        ))}

        <span className="w-px h-5 bg-gray-200" />

        {/* Reward filter */}
        <button
          onClick={() => setHasReward(!hasReward)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            hasReward
              ? 'bg-amber-100 text-amber-700'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {'\u{1F3C6}'} Cu recompensa
        </button>
      </div>

      {/* Results */}
      {query && (
        <p className="text-sm text-gray-500">
          {results.length} rezultat{results.length !== 1 ? 'e' : ''} pentru &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-grid">
          {results.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">{'\u{1F50D}'}</span>
          <p className="text-lg font-medium">Niciun rezultat gasit</p>
          <p className="text-sm mt-1">Incearca alte cuvinte cheie sau modifica filtrele</p>
        </div>
      ) : null}

      {/* Recent activity when no query */}
      {!query && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Postari recente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-grid">
            {MOCK_POSTS.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
