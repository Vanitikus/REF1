'use client';

import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../api-client';
import { useAuth } from '../auth-context';

const API_AVAILABLE = Boolean(process.env.NEXT_PUBLIC_API_URL);

interface ChatUser {
  id: string;
  displayName: string;
  avatarInitial: string;
  isOnline: boolean;
}

interface Conversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  time: string;
  unread: number;
  matchScore?: number;
  postTitle: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  time: string;
  isMe: boolean;
}

const MOCK_USERS: ChatUser[] = [
  { id: 'u1', displayName: 'Maria Ionescu', avatarInitial: 'M', isOnline: true },
  { id: 'u2', displayName: 'Andrei Popescu', avatarInitial: 'A', isOnline: false },
  { id: 'u3', displayName: 'Elena Stanescu', avatarInitial: 'E', isOnline: true },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'c1', user: MOCK_USERS[0], lastMessage: 'Cred ca am vazut catelul tau azi in parc!', time: 'acum 5 min', unread: 2, matchScore: 92, postTitle: 'Catel labrador auriu pierdut' },
  { id: 'c2', user: MOCK_USERS[1], lastMessage: 'Am gasit un portofel maro in zona.', time: 'acum 2h', unread: 0, matchScore: 78, postTitle: 'Portofel maro pierdut pe Victoriei' },
  { id: 'c3', user: MOCK_USERS[2], lastMessage: 'Multumesc ca m-ai ajutat sa-l gasesc!', time: 'ieri', unread: 0, postTitle: 'Buletin gasit pe Calea Victoriei' },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1', senderId: 'u1', content: 'Buna! Am vazut postarea ta cu labradorul pierdut.', time: '14:20', isMe: false },
    { id: 'm2', senderId: 'me', content: 'Multumesc! L-ai vazut pe undeva?', time: '14:22', isMe: true },
    { id: 'm3', senderId: 'u1', content: 'Cred ca am vazut catelul tau azi in parc!', time: '14:25', isMe: false },
  ],
};

export function useConversations() {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      if (API_AVAILABLE && token) {
        const res = await chatApi.conversations(token);
        if (res.data) {
          setConversations(res.data as unknown as Conversation[]);
        } else {
          setConversations(MOCK_CONVERSATIONS);
        }
      } else {
        setConversations(MOCK_CONVERSATIONS);
      }
      setLoading(false);
    }
    fetch();
  }, [token]);

  return { conversations, loading };
}

export function useMessages(conversationId: string) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      if (API_AVAILABLE && token) {
        const res = await chatApi.messages(conversationId, token);
        if (res.data) {
          setMessages(res.data as unknown as Message[]);
        } else {
          setMessages(MOCK_MESSAGES[conversationId] || []);
        }
      } else {
        setMessages(MOCK_MESSAGES[conversationId] || []);
      }
      setLoading(false);
    }
    fetch();
  }, [conversationId, token]);

  const sendMessage = useCallback(async (content: string) => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      content,
      time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (API_AVAILABLE && token) {
      await chatApi.send(conversationId, content, token);
    }
  }, [conversationId, token]);

  return { messages, loading, sendMessage };
}

export type { Conversation, Message, ChatUser };
