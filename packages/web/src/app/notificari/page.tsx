'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'system' | 'reward' | 'alert';
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  link?: string;
  emoji: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'Match nou detectat!',
    body: 'Un catel similar cu "Labrador auriu pierdut" a fost gasit in zona Herastrau.',
    time: 'acum 5 min',
    isRead: false,
    link: '/matchuri',
    emoji: '\u{1F517}',
  },
  {
    id: '2',
    type: 'message',
    title: 'Mesaj nou de la Maria Ionescu',
    body: 'Cred ca am vazut catelul tau azi in parc...',
    time: 'acum 20 min',
    isRead: false,
    link: '/chat',
    emoji: '\u{1F4AC}',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Alerta zona: Document gasit',
    body: 'Un buletin a fost gasit la 500m de zona ta de alerta.',
    time: 'acum 1h',
    isRead: false,
    link: '/post/4',
    emoji: '\u{1F4CD}',
  },
  {
    id: '4',
    type: 'reward',
    title: 'Recompensa disponibila',
    body: 'Postarea "Catel labrador auriu" ofera o recompensa de 500 RON.',
    time: 'acum 3h',
    isRead: true,
    link: '/post/1',
    emoji: '\u{1F3C6}',
  },
  {
    id: '5',
    type: 'system',
    title: 'Postare expirata',
    body: 'Postarea "Portofel maro pierdut" a expirat dupa 30 de zile. Doresti sa o reactivezi?',
    time: 'ieri',
    isRead: true,
    link: '/postarile-mele',
    emoji: '\u{23F0}',
  },
  {
    id: '6',
    type: 'match',
    title: 'Match confirmat!',
    body: 'Elena Stanescu a confirmat match-ul pentru "Buletin gasit pe Calea Victoriei".',
    time: 'acum 2 zile',
    isRead: true,
    link: '/matchuri',
    emoji: '\u{2705}',
  },
  {
    id: '7',
    type: 'system',
    title: 'Bine ai venit pe REFiND!',
    body: 'Contul tau a fost creat cu succes. Completeaza-ti profilul pentru a primi mai multe match-uri.',
    time: 'acum 5 zile',
    isRead: true,
    link: '/profil',
    emoji: '\u{1F44B}',
  },
];

type FilterKey = 'all' | 'match' | 'message' | 'alert' | 'system';

export default function NotificariPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<FilterKey>('all');

  const unread = notifications.filter((n) => !n.isRead).length;

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filter || (filter === 'alert' && n.type === 'reward'));

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
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
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
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
                    : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                } hover:shadow-sm`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                  notif.isRead ? 'bg-gray-100' : 'bg-emerald-100'
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
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{notif.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-gray-400">{notif.time}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      notif.type === 'match' ? 'bg-emerald-100 text-emerald-600' :
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
