'use client';

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

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'Match nou detectat!',
    body: 'Un catel similar cu "Labrador auriu pierdut" a fost gasit in zona Herastrau.',
    time: 'acum 5 min',
    isRead: false,
    link: '/post/1',
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
    link: '/post/7',
    emoji: '\u{23F0}',
  },
  {
    id: '6',
    type: 'match',
    title: 'Match confirmat!',
    body: 'Elena Stanescu a confirmat match-ul pentru "Buletin gasit pe Calea Victoriei".',
    time: 'acum 2 zile',
    isRead: true,
    link: '/post/4',
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

export default function NotificariPage() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length;

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notificari</h1>
          <p className="text-sm text-gray-500">{unread} necitite</p>
        </div>
        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Marcheaza toate ca citite
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Toate' },
          { key: 'match', label: 'Match-uri' },
          { key: 'message', label: 'Mesaje' },
          { key: 'alert', label: 'Alerte' },
        ].map((f) => (
          <button
            key={f.key}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              f.key === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((notif) => {
          const content = (
            <div className={`flex gap-3 p-4 rounded-xl border transition-colors ${
              notif.isRead
                ? 'bg-white border-gray-100'
                : 'bg-emerald-50/50 border-emerald-200'
            } hover:shadow-sm`}>
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
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{notif.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
              </div>
            </div>
          );

          return notif.link ? (
            <Link key={notif.id} href={notif.link}>{content}</Link>
          ) : (
            <div key={notif.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
