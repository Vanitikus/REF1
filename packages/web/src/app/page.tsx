'use client';

import { useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { FilterBar, type TypeFilter, type CategoryFilter } from '@/components/FilterBar';
import { StatsBar } from '@/components/StatsBar';
import { MOCK_POSTS } from '@/lib/mock-data';

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filtered = MOCK_POSTS.filter((post) => {
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="py-6 space-y-6">
      {/* Stats */}
      <StatsBar />

      {/* Filters */}
      <FilterBar
        activeType={typeFilter}
        activeCategory={categoryFilter}
        onTypeChange={setTypeFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filtered.length} rezultat{filtered.length !== 1 ? 'e' : ''}
        </p>
        <select className="text-sm text-gray-500 bg-transparent border border-gray-200 rounded-lg px-2 py-1">
          <option>Cele mai recente</option>
          <option>Cele mai apropiate</option>
          <option>Cu recompensa</option>
        </select>
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">&#x1F50D;</span>
          <p className="text-lg font-medium">Niciun rezultat gasit</p>
          <p className="text-sm mt-1">Incearca sa schimbi filtrele</p>
        </div>
      )}
    </div>
  );
}
