'use client';

import { useState } from 'react';

const FILTERS = [
  { key: 'all', label: 'Toate' },
  { key: 'lost', label: 'Pierdute' },
  { key: 'found', label: 'Gasite' },
] as const;

const CATEGORIES = [
  { key: 'all', label: 'Toate', emoji: '' },
  { key: 'pet', label: 'Animale', emoji: '\uD83D\uDC3E' },
  { key: 'object', label: 'Obiecte', emoji: '\uD83D\uDCE6' },
  { key: 'document', label: 'Documente', emoji: '\uD83D\uDCC4' },
] as const;

type TypeFilter = typeof FILTERS[number]['key'];
type CategoryFilter = typeof CATEGORIES[number]['key'];

interface FilterBarProps {
  onTypeChange: (type: TypeFilter) => void;
  onCategoryChange: (cat: CategoryFilter) => void;
  activeType: TypeFilter;
  activeCategory: CategoryFilter;
}

export function FilterBar({ onTypeChange, onCategoryChange, activeType, activeCategory }: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Type filters */}
      <div className="flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTypeChange(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeType === key
                ? 'bg-brand-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => onCategoryChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {emoji && <span>{emoji}</span>}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { TypeFilter, CategoryFilter };
