'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNotifications, type Notification } from '@/lib/hooks';

type FilterKey = 'all' | 'match' | 'message' | 'alert' | 'system';

export default function NotificariPage() {
  const { notifications, loading, unreadCount: unread, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter || (filter === 'alert' && n.type === 'reward'));

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `Toate (${notifications.length})` },
    { key: 'match', label: 'Match-uri' },
    { key: 'message', label: 'Mesaje' },
    { key: 'alert', label: 'Alerte' },
    { key: 'system', label: 'Sistem' },
  ];

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notificari</h1>
          <p className="text-sm text-gray-500">
            {unread > 0 ? `${unread} necitite` : 'Toate citite'}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-brand-orange-500 hover:text-brand-orange-600 font-medium"
          >
            Marcheaza toate ca citite
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-brand-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-orange-300 border-t-brand-orange-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">{'\u{1F514}'}</span>
          <p className="text-lg font-medium">Nicio notificare</p>
          <p className="text-sm mt-1">
            {filter !== 'all' ? 'Incearca alt filtru.' : 'Vei primi notificari cand apar match-uri sau mesaje noi.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const content = (
              <div
                className={`flex gap-3 p-4 rounded-xl border transition-all group relative ${
                  notif.isRead
                    ? 'bg-white border-gray-100 hover:border-gray-200'
                    : 'bg-brand-orange-50 border-brand-orange-200 hover:border-brand-orange-300'
                } hover:shadow-sm`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  notif.isRead ? 'bg-gray-100' : 'bg-brand-orange-100'
                }`}>
                  {notif.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-orange-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{notif.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-gray-400">{notif.time}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      notif.type === 'match' ? 'bg-brand-orange-100 text-brand-orange-500' :
                      notif.type === 'message' ? 'bg-blue-100 text-blue-600' :
                      notif.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                      notif.type === 'reward' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {notif.type === 'match' ? 'Match' :
                       notif.type === 'message' ? 'Mesaj' :
                       notif.type === 'alert' ? 'Alerta' :
                       notif.type === 'reward' ? 'Recompensa' : 'Sistem'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 text-gray-300 hover:text-red-400 flex items-center justify-center text-xs rounded transition-all"
                >
                  {'\u2715'}
                </button>
              </div>
            );

            return notif.link ? (
              <Link key={notif.id} href={notif.link}>{content}</Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
