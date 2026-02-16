'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api-client';
import { useAuth } from '../auth-context';

const API_AVAILABLE = Boolean(process.env.NEXT_PUBLIC_API_URL);

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
  { id: '1', type: 'match', title: 'Match nou detectat!', body: 'Un catel similar cu "Labrador auriu pierdut" a fost gasit in zona Herastrau.', time: 'acum 5 min', isRead: false, link: '/matchuri', emoji: '\u{1F517}' },
  { id: '2', type: 'message', title: 'Mesaj nou de la Maria Ionescu', body: 'Cred ca am vazut catelul tau azi in parc...', time: 'acum 20 min', isRead: false, link: '/chat', emoji: '\u{1F4AC}' },
  { id: '3', type: 'alert', title: 'Alerta zona: Document gasit', body: 'Un buletin a fost gasit la 500m de zona ta de alerta.', time: 'acum 1h', isRead: false, link: '/post/4', emoji: '\u{1F4CD}' },
  { id: '4', type: 'reward', title: 'Recompensa disponibila', body: 'Postarea "Catel labrador auriu" ofera o recompensa de 500 RON.', time: 'acum 3h', isRead: true, link: '/post/1', emoji: '\u{1F3C6}' },
  { id: '5', type: 'system', title: 'Postare expirata', body: 'Postarea "Portofel maro pierdut" a expirat dupa 30 de zile. Doresti sa o reactivezi?', time: 'ieri', isRead: true, link: '/postarile-mele', emoji: '\u{23F0}' },
  { id: '6', type: 'match', title: 'Match confirmat!', body: 'Elena Stanescu a confirmat match-ul pentru "Buletin gasit pe Calea Victoriei".', time: 'acum 2 zile', isRead: true, link: '/matchuri', emoji: '\u{2705}' },
  { id: '7', type: 'system', title: 'Bine ai venit pe ReFind!', body: 'Contul tau a fost creat cu succes. Completeaza-ti profilul pentru a primi mai multe match-uri.', time: 'acum 5 zile', isRead: true, link: '/profil', emoji: '\u{1F44B}' },
];

export function useNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      if (API_AVAILABLE && token) {
        const res = await notificationsApi.list(token);
        if (res.data) {
          setNotifications(res.data as unknown as Notification[]);
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
      }
      setLoading(false);
    }
    fetch();
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback(async (id: string) => {
    if (API_AVAILABLE && token) {
      await notificationsApi.markRead(id, token);
    }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (API_AVAILABLE && token) {
      await notificationsApi.markAllRead(token);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [token]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, loading, unreadCount, markAsRead, markAllRead, deleteNotification };
}

export type { Notification };
