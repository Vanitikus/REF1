'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { MOCK_POSTS, getTimeAgo } from '@/lib/mock-data';

type AdminTab = 'overview' | 'reports' | 'users' | 'posts';

const MOCK_REPORTS = [
  { id: '1', targetType: 'post', targetTitle: 'Portofel maro pierdut in Uber', reporter: 'Ana D.', reason: 'spam', status: 'pending', date: '2026-02-12' },
  { id: '2', targetType: 'user', targetTitle: 'user_xyz', reporter: 'Vlad G.', reason: 'fraud', status: 'pending', date: '2026-02-11' },
  { id: '3', targetType: 'post', targetTitle: 'Vand catelus de rasa', reporter: 'Maria I.', reason: 'inappropriate', status: 'resolved', date: '2026-02-10' },
];

const MOCK_USERS = [
  { id: '1', name: 'Maria Ionescu', email: 'maria@email.ro', posts: 12, score: 87, verified: true, suspended: false },
  { id: '2', name: 'Andrei Popa', email: 'andrei@email.ro', posts: 5, score: 62, verified: false, suspended: false },
  { id: '3', name: 'Elena Stanescu', email: 'elena@email.ro', posts: 8, score: 120, verified: true, suspended: false },
  { id: '4', name: 'User Suspect', email: 'suspect@email.ro', posts: 1, score: 3, verified: false, suspended: true },
];

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 text-center">
        <span className="text-5xl block mb-4">{'\u{1F512}'}</span>
        <p className="text-lg font-medium">Acces restrictionat</p>
        <Link href="/autentificare" className="text-brand-orange-500 text-sm mt-2 inline-block hover:underline">
          Conecteaza-te
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Gestioneaza platforma ReFind</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
          {user.role}
        </span>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Utilizatori', value: '2,847', change: '+12%', color: 'blue' },
          { label: 'Postari active', value: '3,891', change: '+8%', color: 'teal' },
          { label: 'Match-uri azi', value: '47', change: '+23%', color: 'amber' },
          { label: 'Rapoarte noi', value: '3', change: '', color: 'red' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            {stat.change && (
              <p className="text-xs text-brand-orange-500 mt-0.5">{stat.change} vs saptamana trecuta</p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { key: 'overview' as const, label: 'Prezentare' },
          { key: 'reports' as const, label: 'Rapoarte' },
          { key: 'users' as const, label: 'Utilizatori' },
          { key: 'posts' as const, label: 'Postari' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Activity chart placeholder */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Activitate ultimele 7 zile</h3>
            <div className="flex items-end gap-2 h-32">
              {[45, 62, 38, 75, 53, 89, 67].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-brand-teal-200 rounded-t" style={{ height: `${v}%` }}>
                    <div className="w-full bg-brand-teal-400 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-teal-400 rounded" />Postari noi</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-brand-teal-200 rounded" />Match-uri</span>
            </div>
          </div>

          {/* Recent reports */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Rapoarte recente</h3>
            <div className="space-y-3">
              {MOCK_REPORTS.filter((r) => r.status === 'pending').map((report) => (
                <div key={report.id} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                  <span className="text-lg">{report.reason === 'spam' ? '\u{1F4E9}' : report.reason === 'fraud' ? '\u{26A0}' : '\u{1F6A9}'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{report.targetTitle}</p>
                    <p className="text-xs text-gray-500">{report.reason} - raportat de {report.reporter}</p>
                  </div>
                  <button className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg">Review</button>
                </div>
              ))}
            </div>
          </div>

          {/* Top categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Distributie categorii</h3>
            <div className="space-y-2">
              {[
                { label: 'Animale', pct: 42, color: 'bg-brand-teal-400' },
                { label: 'Obiecte', pct: 31, color: 'bg-blue-500' },
                { label: 'Documente', pct: 18, color: 'bg-amber-500' },
                { label: 'Altele', pct: 9, color: 'bg-gray-400' },
              ].map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20">{cat.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Actiuni rapide</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Expira posturi vechi', icon: '\u{23F0}' },
                { label: 'Ruleaza match scan', icon: '\u{1F517}' },
                { label: 'Trimite digest', icon: '\u{1F4E7}' },
                { label: 'Export raport', icon: '\u{1F4CA}' },
              ].map((action) => (
                <button key={action.label} className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors">
                  <span className="text-xl block mb-1">{action.icon}</span>
                  <span className="text-xs text-gray-600">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tinta</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Motiv</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Raportor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORTS.map((report) => (
                <tr key={report.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{report.targetType}</span>
                      <span className="truncate max-w-[150px]">{report.targetTitle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{report.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{report.reporter}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      report.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-brand-teal-100 text-brand-teal-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="text-xs bg-brand-teal-50 text-brand-teal-700 px-2 py-1 rounded hover:bg-brand-teal-100">Aproba</button>
                      <button className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">Respinge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Utilizator</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Postari</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Scor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{u.name}</span>
                        {u.verified && <span className="text-brand-teal-400 text-xs">{'\u2713'}</span>}
                      </div>
                      <span className="text-xs text-gray-400">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.posts}</td>
                  <td className="px-4 py-3 text-gray-500">{u.score}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.suspended ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
                    }`}>
                      {u.suspended ? 'Suspendat' : 'Activ'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!u.verified && <button className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">Verifica</button>}
                      <button className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded hover:bg-red-100">
                        {u.suspended ? 'Reactiveaza' : 'Suspenda'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="space-y-3">
          {MOCK_POSTS.map((post) => (
            <div key={post.id} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                post.type === 'lost' ? 'bg-red-50' : 'bg-brand-teal-50'
              }`}>
                {post.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                <p className="text-xs text-gray-400">{post.user.displayName} - {getTimeAgo(post.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{post.viewCount} views</span>
                <Link href={`/post/${post.id}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">
                  Vezi
                </Link>
                <button className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">
                  Sterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
