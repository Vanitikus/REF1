'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Conversation {
  id: string;
  otherUser: { name: string; initial: string; isVerified: boolean };
  postTitle: string;
  postId: string;
  postEmoji: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  type: 'lost' | 'found';
  matchScore: number;
  status: 'active' | 'resolved';
}

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  time: string;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    otherUser: { name: 'Maria Ionescu', initial: 'M', isVerified: true },
    postTitle: 'Catel labrador auriu pierdut',
    postId: '1',
    postEmoji: '\u{1F415}',
    lastMessage: 'Buna! Cred ca am vazut catelul tau azi in parc. Avea zgarda albastra?',
    lastMessageTime: 'acum 5 min',
    unread: 2,
    type: 'lost',
    matchScore: 92,
    status: 'active',
  },
  {
    id: '2',
    otherUser: { name: 'Elena Stanescu', initial: 'E', isVerified: true },
    postTitle: 'Buletin gasit pe Calea Victoriei',
    postId: '4',
    postEmoji: '\u{1F194}',
    lastMessage: 'Da, cred ca e buletinul meu. Pot sa vin sa il recuperez maine?',
    lastMessageTime: 'acum 1h',
    unread: 0,
    type: 'found',
    matchScore: 78,
    status: 'active',
  },
  {
    id: '3',
    otherUser: { name: 'Andrei Popa', initial: 'A', isVerified: false },
    postTitle: 'Pisica gri gasita in Drumul Taberei',
    postId: '2',
    postEmoji: '\u{1F431}',
    lastMessage: 'Am trimis o poza cu pisica. E a dumneavoastra?',
    lastMessageTime: 'ieri',
    unread: 1,
    type: 'found',
    matchScore: 65,
    status: 'active',
  },
  {
    id: '4',
    otherUser: { name: 'Ana Dumitrescu', initial: 'A', isVerified: true },
    postTitle: 'Cheie auto BMW gasita in Parcul Cismigiu',
    postId: '6',
    postEmoji: '\u{1F511}',
    lastMessage: 'Multumesc mult! Am recuperat cheia cu succes.',
    lastMessageTime: 'acum 2 zile',
    unread: 0,
    type: 'found',
    matchScore: 88,
    status: 'resolved',
  },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 's1', text: 'Conversatie deschisa dupa match AI (92%)', isMine: false, time: '14:28', type: 'system' },
  { id: '1', text: 'Buna ziua! Am vazut postarea dvs despre catelul pierdut.', isMine: false, time: '14:30', type: 'text' },
  { id: '2', text: 'Buna! Da, il caut disperat. L-ati vazut?', isMine: true, time: '14:32', type: 'text' },
  { id: '3', text: 'Cred ca am vazut un labrador auriu azi dimineata in Parcul Herastrau, zona lacul.', isMine: false, time: '14:33', type: 'text' },
  { id: 'img1', text: '', isMine: false, time: '14:33', type: 'image', imageUrl: '' },
  { id: '4', text: 'Avea zgarda albastra cu medalion?', isMine: true, time: '14:34', type: 'text' },
  { id: '5', text: 'Buna! Cred ca am vazut catelul tau azi in parc. Avea zgarda albastra?', isMine: false, time: '14:35', type: 'text' },
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: String(Date.now()),
      text: newMessage.trim(),
      isMine: true,
      time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Simulate typing and auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        'Multumesc pentru informatii! Verific imediat.',
        'Da, suna corect. Putem stabili o intalnire?',
        'Perfect, iti trimit locatia exacta.',
        'Am inteles, revin cu detalii.',
      ];
      const reply: Message = {
        id: String(Date.now() + 1),
        text: replies[Math.floor(Math.random() * replies.length)],
        isMine: false,
        time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500 + Math.random() * 1500);
  };

  const handleImageSend = () => {
    const msg: Message = {
      id: String(Date.now()),
      text: '',
      isMine: true,
      time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      type: 'image',
      imageUrl: '',
    };
    setMessages((prev) => [...prev, msg]);
  };

  const markAsResolved = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => c.id === convId ? { ...c, status: 'resolved' as const } : c)
    );
    const sysMsg: Message = {
      id: String(Date.now()),
      text: 'Conversatia a fost marcata ca rezolvata. Felicitari!',
      isMine: false,
      time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
    };
    setMessages((prev) => [...prev, sysMsg]);
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="py-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col ${selected ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-lg font-bold">Mesaje</h1>
              <p className="text-xs text-gray-400">
                {totalUnread > 0 ? `${totalUnread} mesaje necitite` : 'Toate la zi'}
              </p>
            </div>

            {/* Conversation filters */}
            <div className="flex gap-1 px-4 py-2 border-b border-gray-50">
              {['Toate', 'Active', 'Rezolvate'].map((f, i) => (
                <button key={f} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  i === 0 ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:bg-gray-100'
                }`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === conv.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        conv.otherUser.isVerified ? 'bg-emerald-600' : 'bg-gray-400'
                      }`}>
                        {conv.otherUser.initial}
                      </div>
                      {conv.status === 'resolved' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white text-[8px] flex items-center justify-center border-2 border-white">
                          {'\u2713'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold truncate">{conv.otherUser.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{conv.postEmoji}</span>
                        <span className="text-[11px] text-gray-500 truncate">{conv.postTitle}</span>
                        <span className="text-[9px] text-emerald-600 font-medium shrink-0">{conv.matchScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="ml-2 w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center shrink-0">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!selected ? 'hidden sm:flex' : 'flex'}`}>
            {selected ? (
              <>
                {/* Chat header */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="sm:hidden text-gray-400 hover:text-gray-600 text-lg"
                  >
                    {'\u2190'}
                  </button>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    selected.otherUser.isVerified ? 'bg-emerald-600' : 'bg-gray-400'
                  }`}>
                    {selected.otherUser.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold">{selected.otherUser.name}</span>
                      {selected.otherUser.isVerified && <span className="text-emerald-500 text-xs">{'\u2713'}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px]">{selected.postEmoji}</span>
                      <Link href={`/post/${selected.postId}`} className="text-[11px] text-gray-400 truncate hover:text-emerald-600">
                        {selected.postTitle}
                      </Link>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {selected.status === 'active' && (
                      <button
                        onClick={() => markAsResolved(selected.id)}
                        className="text-[10px] px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium hover:bg-emerald-100 transition-colors"
                      >
                        {'\u2713'} Rezolvat
                      </button>
                    )}
                    {selected.status === 'resolved' && (
                      <span className="text-[10px] px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium">
                        {'\u2713'} Rezolvat
                      </span>
                    )}
                  </div>
                </div>

                {/* Match banner */}
                <div className="bg-emerald-50 px-4 py-2 flex items-center justify-between text-xs border-b border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span>{'\u{1F517}'}</span>
                    <span>Match AI: <strong>{selected.matchScore}%</strong> compatibilitate</span>
                  </div>
                  <Link href={`/post/${selected.postId}`} className="text-emerald-600 hover:underline font-medium">
                    Vezi postarea {'\u2192'}
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Azi</span>
                  </div>
                  {messages.map((msg) => {
                    if (msg.type === 'system') {
                      return (
                        <div key={msg.id} className="text-center">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }

                    if (msg.type === 'image') {
                      return (
                        <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[60%] rounded-2xl overflow-hidden ${
                            msg.isMine ? 'rounded-br-md' : 'rounded-bl-md'
                          }`}>
                            <div className={`w-48 h-36 flex items-center justify-center text-3xl ${
                              msg.isMine ? 'bg-emerald-100' : 'bg-gray-100'
                            }`}>
                              {'\u{1F4F7}'}
                            </div>
                            <div className={`px-3 py-1 text-[10px] ${
                              msg.isMine ? 'bg-emerald-600 text-emerald-200' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          msg.isMine
                            ? 'bg-emerald-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
                            {msg.time} {msg.isMine && '\u2713\u2713'}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Resolved banner */}
                {selected.status === 'resolved' && (
                  <div className="bg-blue-50 px-4 py-3 border-t border-blue-100 text-center">
                    <p className="text-xs text-blue-700 font-medium">{'\u{1F389}'} Aceasta conversatie a fost marcata ca rezolvata.</p>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-gray-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleImageSend();
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {'\u{1F4F7}'}
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Scrie un mesaj..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                        newMessage.trim()
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {'\u{27A4}'}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-[9px] text-gray-300">{'\u{1F512}'}</span>
                    <span className="text-[9px] text-gray-300">Mesaje criptate end-to-end</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <span className="text-5xl block mb-4">{'\u{1F4AC}'}</span>
                  <h2 className="text-lg font-semibold text-gray-700 mb-1">Selecteaza o conversatie</h2>
                  <p className="text-sm text-gray-400">Alege o conversatie din lista pentru a vedea mesajele</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
