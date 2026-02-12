'use client';

import { MOCK_POSTS, CATEGORY_LABELS } from '@/lib/mock-data';
import Link from 'next/link';

export default function MapPage() {
  return (
    <div className="py-6 space-y-4">
      <h1 className="text-xl font-bold">Harta</h1>

      {/* Map placeholder */}
      <div className="relative bg-gray-200 rounded-2xl overflow-hidden h-[60vh] min-h-[400px]">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Simulated streets */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-300" />
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300" />
          <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-gray-300" />
          {/* Diagonal */}
          <div className="absolute top-0 left-1/3 w-0.5 bg-gray-300 origin-top-left" style={{
            height: '140%', transform: 'rotate(30deg)'
          }} />
        </div>

        {/* "Bucuresti" label */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
          Bucuresti, Romania
        </div>

        {/* Map pins */}
        {MOCK_POSTS.map((post, i) => {
          const positions = [
            { top: '25%', left: '45%' },
            { top: '55%', left: '25%' },
            { top: '40%', left: '60%' },
            { top: '35%', left: '50%' },
            { top: '60%', left: '70%' },
            { top: '45%', left: '42%' },
            { top: '30%', left: '55%' },
            { top: '50%', left: '52%' },
          ];
          const pos = positions[i % positions.length];
          const isLost = post.type === 'lost';

          return (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="absolute group"
              style={{ top: pos.top, left: pos.left }}
            >
              {/* Pin */}
              <div className={`relative -ml-4 -mt-10 w-8 h-10 flex flex-col items-center cursor-pointer transition-transform group-hover:scale-125`}>
                <div className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-sm ${
                  isLost ? 'bg-red-500' : 'bg-emerald-500'
                }`}>
                  <span>{post.imageEmoji}</span>
                </div>
                <div className={`w-2 h-2 -mt-1 rotate-45 ${isLost ? 'bg-red-500' : 'bg-emerald-500'}`} />
              </div>

              {/* Tooltip */}
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl p-3 w-52 z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                    isLost ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isLost ? 'Pierdut' : 'Gasit'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                </div>
                <p className="text-xs font-semibold line-clamp-2">{post.title}</p>
                <p className="text-[10px] text-gray-400 mt-1">{post.locationName}</p>
                {post.rewardAmount && (
                  <p className="text-[10px] text-amber-700 mt-1 font-medium">
                    Recompensa: {post.rewardAmount} RON
                  </p>
                )}
              </div>
            </Link>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-sm text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Pierdut</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Gasit</span>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <button className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-light">+</button>
          <button className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center text-lg font-light">&minus;</button>
        </div>
      </div>

      {/* Nearby list */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">In apropiere</h2>
      <div className="space-y-2">
        {MOCK_POSTS.slice(0, 4).map((post) => (
          <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:shadow-sm transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
              post.type === 'lost' ? 'bg-red-50' : 'bg-emerald-50'
            }`}>
              {post.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.title}</p>
              <p className="text-xs text-gray-400 truncate">{post.locationName}</p>
            </div>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {post.type === 'lost' ? 'Pierdut' : 'Gasit'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
