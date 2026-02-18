'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PostCard } from '@/components/PostCard';
import { FilterBar, type TypeFilter, type CategoryFilter } from '@/components/FilterBar';
import { StatsBar } from '@/components/StatsBar';
import { usePosts } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';

type SortKey = 'recent' | 'reward' | 'views';
const PAGE_SIZE = 6;

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  const { posts: rawPosts, loading: postsLoading } = usePosts({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  const filtered = useMemo(() => {
    let posts = [...rawPosts];

    if (sort === 'recent') {
      posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'reward') {
      posts = posts.sort((a, b) => (b.rewardAmount || 0) - (a.rewardAmount || 0));
    } else if (sort === 'views') {
      posts = posts.sort((a, b) => b.viewCount - a.viewCount);
    }

    return posts;
  }, [rawPosts, sort]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [typeFilter, categoryFilter, sort]);

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="py-6 space-y-6">
      {/* Hero for visitors */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-brand-orange-500 to-brand-teal-400 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Ai pierdut ceva? Ai gasit ceva?
            </h1>
            <p className="text-brand-orange-100 text-sm sm:text-base mb-6 max-w-lg">
              ReFind conecteaza oamenii care au pierdut obiecte cu cei care le-au gasit.
              Algoritmul nostru AI gaseste match-uri automat.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/posteaza"
                className="px-5 py-2.5 bg-white text-brand-orange-600 rounded-xl text-sm font-semibold hover:bg-brand-orange-50 transition-colors"
              >
                + Posteaza acum
              </Link>
              <Link
                href="/autentificare"
                className="px-5 py-2.5 bg-brand-orange-500/30 text-white border border-brand-orange-400/50 rounded-xl text-sm font-medium hover:bg-brand-orange-500/50 transition-colors"
              >
                Creeaza cont gratuit
              </Link>
              <Link
                href="/cum-functioneaza"
                className="px-5 py-2.5 text-brand-orange-200 text-sm font-medium hover:text-white transition-colors"
              >
                Cum functioneaza? {'\u2192'}
              </Link>
            </div>
            <div className="flex gap-6 mt-6 text-brand-orange-200 text-xs">
              <span>{'\u{2705}'} 100% Gratuit</span>
              <span>{'\u{1F916}'} Match AI automat</span>
              <span>{'\u{1F512}'} Chat securizat</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsBar />

      {/* Filters */}
      <FilterBar
        activeType={typeFilter}
        activeCategory={categoryFilter}
        onTypeChange={setTypeFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Results count + sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length} rezultat{filtered.length !== 1 ? 'e' : ''}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-sm text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1"
        >
          <option value="recent">Cele mai recente</option>
          <option value="views">Cele mai vizualizate</option>
          <option value="reward">Cu recompensa</option>
        </select>
      </div>

      {/* Post grid */}
      {postsLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-orange-300 border-t-brand-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-grid">
          {visiblePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-5 h-5 border-2 border-brand-orange-300 border-t-brand-orange-500 rounded-full animate-spin" />
            Se incarca...
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">{'\u{1F50D}'}</span>
          <p className="text-lg font-medium">Niciun rezultat gasit</p>
          <p className="text-sm mt-1 mb-4">Incearca sa schimbi filtrele sau creeaza o postare noua.</p>
          <Link href="/posteaza" className="inline-block px-5 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors">
            + Posteaza acum
          </Link>
        </div>
      )}

      {/* End of feed */}
      {!hasMore && filtered.length > 0 && (
        <div className="text-center py-6 text-gray-300 text-xs">
          Ai ajuns la sfarsitul feed-ului. {'\u{1F389}'}
        </div>
      )}
    </div>
  );
}
