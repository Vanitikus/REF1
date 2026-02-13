'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-gray-100 rounded-2xl">
      <div className="text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Se incarca harta...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="py-4">
      <MapView />
    </div>
  );
}
