'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CATEGORY_LABELS, getTimeAgo, type MockPost } from '@/lib/mock-data';
import { usePosts } from '@/lib/hooks';

// Leaflet requires dynamic import in Next.js (no SSR)
let L: typeof import('leaflet') | null = null;

export default function MapView() {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<MockPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
  const { posts: allPosts } = usePosts({
    type: filter !== 'all' ? filter : undefined,
  });

  useEffect(() => {
    // Dynamic import of leaflet (CSS loaded via link tag)
    import('leaflet').then((leaflet) => {
      L = leaflet.default || leaflet;

      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted || !L) return;

    const container = document.getElementById('refind-map');
    if (!container) return;

    // Clean up any existing map
    if ((container as any)._leaflet_id) {
      (container as any)._leaflet_id = null;
      container.innerHTML = '';
    }

    const map = L.map('refind-map', {
      zoomControl: false,
    }).setView([44.4268, 26.1025], 13);

    // OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create custom icon
    const createIcon = (type: 'lost' | 'found', emoji: string) => {
      const color = type === 'lost' ? '#EF4444' : '#2EC4B6';
      return L!.divIcon({
        className: 'custom-pin',
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:${color};display:flex;align-items:center;justify-content:center;
          font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.3);
          border:3px solid white;cursor:pointer;
        ">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });
    };

    // Add markers
    allPosts.forEach((post) => {
      const marker = L!.marker([post.location.lat, post.location.lng], {
        icon: createIcon(post.type, post.imageEmoji),
      }).addTo(map);

      marker.on('click', () => {
        setSelected(post);
      });
    });

    return () => {
      map.remove();
    };
  }, [mounted, filter, allPosts]);

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-brand-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Se incarca harta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filter chips */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        {(['all', 'lost', 'found'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setSelected(null); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-md transition-colors ${
              filter === f
                ? 'bg-brand-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'Toate' : f === 'lost' ? 'Pierdute' : 'Gasite'}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg p-3 shadow-md text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Pierdut</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-brand-teal-400" />
          <span className="text-gray-600">Gasit</span>
        </div>
      </div>

      {/* Map container */}
      <div
        id="refind-map"
        className="h-[calc(100vh-8rem)] rounded-2xl overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {/* Selected post panel */}
      {selected && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-xl shadow-xl p-4 w-72 animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-sm"
          >
            {'\u2715'}
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              selected.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
            }`}>
              {selected.type === 'lost' ? 'Pierdut' : 'Gasit'}
            </span>
            <span className="text-[10px] text-gray-400">{CATEGORY_LABELS[selected.category]}</span>
            <span className="text-[10px] text-gray-400 ml-auto">{getTimeAgo(selected.createdAt)}</span>
          </div>
          <div className="flex gap-3 mb-2">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl shrink-0 ${
              selected.type === 'lost' ? 'bg-red-50' : 'bg-brand-teal-50'
            }`}>
              {selected.imageEmoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold line-clamp-2">{selected.title}</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">{selected.locationName}</p>
            </div>
          </div>
          {selected.rewardAmount && (
            <p className="text-xs text-amber-700 font-medium mb-2">
              {'\u{1F3C6}'} Recompensa: {selected.rewardAmount} RON
            </p>
          )}
          <Link
            href={`/post/${selected.id}`}
            className="block w-full text-center bg-brand-orange-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-orange-600 transition-colors"
          >
            Vezi detalii
          </Link>
        </div>
      )}
    </div>
  );
}
