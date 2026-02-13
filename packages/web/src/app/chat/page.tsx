'use client';

import { useState } from 'react';

interface Conversation {
  id: string;
  otherUser: { name: string; initial: string; isVerified: boolean };
  postTitle: string;
  postEmoji: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  type: 'lost' | 'found';
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    otherUser: { name: 'Maria Ionescu', initial: 'M', isVerified: true },
    postTitle: 'Catel labrador auriu pierdut',
    postEmoji: '\u{1F415}',
    lastMessage: 'Buna! Cred ca am vazut catelul tau azi in parc. Avea zgarda albastra?',
    lastMessageTime: 'acum 5 min',
    unread: 2,
    type: 'lost',
  },
  {
    id: '2',
    otherUser: { name: 'Elena Stanescu', initial: 'E', isVerified: true },
    postTitle: 'Buletin gasit pe Calea Victoriei',
    postEmoji: '\u{1F194}',
    lastMessage: 'Da, cred ca e buletinul meu. Pot sa vin sa il recuperez maine?',
    lastMessageTime: 'acum 1h',
    unread: 0,
    type: 'found',
  },
  {
    id: '3',
    otherUser: { name: 'Andrei Popa', initial: 'A', isVerified: false },
    postTitle: 'Pisica gri gasita in Drumul Taberei',
    postEmoji: '\u{1F431}',
    lastMessage: 'Am trimis o poza cu pisica. E a dumneavoastra?',
    lastMessageTime: 'ieri',
    unread: 1,
    type: 'found',
  },
  {
    id: '4',
    otherUser: { name: 'Ana Dumitrescu', initial: 'A', isVerified: true },
    postTitle: 'Cheie auto BMW gasita in Parcul Cismigiu',
    postEmoji: '\u{1F511}',
    lastMessage: 'Multumesc mult! Am recuperat cheia cu succes.',
    lastMessageTime: 'acum 2 zile',
    unread: 0,
    type: 'found',
  },
];

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  time: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Buna ziua! Am vazut postarea dvs despre catelul pierdut.', isMine: false, time: '14:30' },
  { id: '2', text: 'Buna! Da, il caut disperat. L-ati vazut?', isMine: true, time: '14:32' },
  { id: '3', text: 'Cred ca am vazut un labrador auriu azi dimineata in Parcul Herastrau, zona lacul.', isMine: false, time: '14:33' },
  { id: '4', text: 'Avea zgarda albastra cu medalion?', isMine: true, time: '14:34' },
  { id: '5', text: 'Buna! Cred ca am vazut catelul tau azi in parc. Avea zgarda albastra?', isMine: false, time: '14:35' },
];

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const selected = MOCK_CONVERSATIONS.find((c) => c.id === selectedId);

  return (
    <div className="py-4">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col ${selected ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h1 className="text-lg font-bold">Mesaje</h1>
              <p className="text-xs text-gray-400">{MOCK_CONVERSATIONS.filter((c) => c.unread > 0).length} conversatii necitite</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MOCK_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === conv.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                      conv.otherUser.isVerified ? 'bg-emerald-600' : 'bg-gray-400'
                    }`}>
                      {conv.otherUser.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold truncate">{conv.otherUser.name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{conv.postEmoji}</span>
                        <span className="text-[11px] text-gray-500 truncate">{conv.postTitle}</span>
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
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="sm:hidden text-gray-400 hover:text-gray-600"
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
                      <span className="text-[11px] text-gray-400 truncate">{selected.postTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Match banner */}
                <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 text-xs text-emerald-700 border-b border-emerald-100">
                  <span>{'\u{1F517}'}</span>
                  <span>Match detectat cu scor de 85% - Conversatie securizata end-to-end</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Azi</span>
                  </div>
                  {MOCK_MESSAGES.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                        msg.isMine
                          ? 'bg-emerald-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.isMine ? 'text-emerald-200' : 'text-gray-400'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50">
                      {'\u{1F4F7}'}
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Scrie un mesaj..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onKeyDown={(e) => e.key === 'Enter' && newMessage.trim() && setNewMessage('')}
                    />
                    <button
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                        newMessage.trim()
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {'\u{27A4}'}
                    </button>
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
