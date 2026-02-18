'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getTimeAgo } from '@/lib/mock-data';
import { usePosts } from '@/lib/hooks';

type Tab = 'posts' | 'resolved' | 'settings';

export default function ProfilPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [settings, setSettings] = useState({
    push: true,
    alerts: true,
    email: false,
    dark: false,
  });
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [zoneRadius, setZoneRadius] = useState(2);
  const [zoneCategories, setZoneCategories] = useState<string[]>(['pet', 'object']);
  const [zones, setZones] = useState([
    { id: '1', name: 'Bucuresti, Sector 1', radius: 2, categories: ['pet', 'object'] },
  ]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-brand-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <span className="text-5xl block mb-4">{'\u{1F464}'}</span>
        <h1 className="text-xl font-bold mb-2">Conecteaza-te</h1>
        <p className="text-gray-500 mb-6">Trebuie sa fii autentificat pentru a vedea profilul.</p>
        <Link
          href="/autentificare"
          className="inline-block px-6 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors"
        >
          Login / Inregistrare
        </Link>
      </div>
    );
  }

  const { posts: allPosts, loading: postsLoading } = usePosts();
  const userPosts = allPosts.slice(0, 3);
  const resolvedPosts = allPosts.slice(3, 5);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openEdit = () => {
    setEditName(user.displayName);
    setEditBio('');
    setShowEditModal(true);
  };

  const toggleZoneCategory = (cat: string) => {
    setZoneCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const addZone = () => {
    setZones((prev) => [...prev, {
      id: String(Date.now()),
      name: `Zona ${prev.length + 1}`,
      radius: zoneRadius,
      categories: zoneCategories,
    }]);
    setShowZoneModal(false);
  };

  const removeZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  return (
    <div className="py-6 max-w-2xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-teal-400 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {user.avatarInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">{user.displayName}</h1>
              {user.isVerified && (
                <span className="bg-brand-teal-100 text-brand-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {'\u2713'} Verificat
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">Rol: {user.role}</p>
          </div>
          <button
            onClick={openEdit}
            className="text-sm text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            Editeaza
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-brand-teal-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-brand-teal-700">{user.communityScore}</div>
            <div className="text-[11px] text-brand-orange-500">Scor comunitate</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-700">5</div>
            <div className="text-[11px] text-blue-600">Postari</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-amber-700">3</div>
            <div className="text-[11px] text-amber-600">Rezolvate</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 mt-4">
          <Link href="/postarile-mele" className="flex-1 text-center py-2 text-xs font-medium text-brand-teal-700 bg-brand-teal-50 rounded-lg hover:bg-brand-teal-100 transition-colors">
            {'\u{1F4DD}'} Postarile mele
          </Link>
          <Link href="/matchuri" className="flex-1 text-center py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            {'\u{1F517}'} Match-uri AI
          </Link>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Realizari</h2>
        <div className="flex gap-3">
          {[
            { emoji: '\u{1F31F}', label: 'Primele 5 postari', unlocked: true },
            { emoji: '\u{1F91D}', label: '3 match-uri confirmate', unlocked: true },
            { emoji: '\u{1F3C6}', label: 'Scor 100+', unlocked: user.communityScore >= 100 },
            { emoji: '\u{1F48E}', label: '10 rezolvate', unlocked: false },
          ].map((badge, i) => (
            <div
              key={i}
              className={`flex-1 text-center p-3 rounded-xl ${
                badge.unlocked ? 'bg-amber-50' : 'bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-2xl block mb-1">{badge.emoji}</span>
              <span className="text-[10px] text-gray-600">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { key: 'posts' as const, label: 'Postarile mele' },
          { key: 'resolved' as const, label: 'Rezolvate' },
          { key: 'settings' as const, label: 'Setari' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-brand-orange-500 text-brand-teal-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-3">
          {userPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">{'\u{1F4DD}'}</span>
              <p className="text-sm">Nu ai nicio postare inca.</p>
              <Link href="/posteaza" className="text-brand-orange-500 text-sm mt-2 inline-block hover:underline">
                Creeaza prima postare
              </Link>
            </div>
          ) : (
            <>
              {userPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${
                    post.type === 'lost' ? 'bg-red-50' : 'bg-brand-teal-50'
                  }`}>
                    {post.imageEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{post.locationName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${
                        post.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
                      }`}>
                        {post.type === 'lost' ? 'Pierdut' : 'Gasit'}
                      </span>
                      <span className="text-[10px] text-gray-400">{getTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-400">{post.viewCount} vizualizari</div>
                    {post.matchCount > 0 && (
                      <div className="text-xs text-brand-orange-500 font-medium">{post.matchCount} match-uri</div>
                    )}
                  </div>
                </Link>
              ))}
              <Link href="/postarile-mele" className="block text-center text-sm text-brand-orange-500 font-medium hover:underline py-2">
                Vezi toate postarile {'\u2192'}
              </Link>
            </>
          )}
        </div>
      )}

      {tab === 'resolved' && (
        <div className="space-y-3">
          {resolvedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-4 border border-brand-teal-200 hover:shadow-sm transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-brand-teal-50 flex items-center justify-center text-2xl shrink-0">
                {post.imageEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                <p className="text-xs text-gray-500">{post.locationName}</p>
              </div>
              <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-brand-teal-100 text-brand-teal-700">
                {'\u2713'} Rezolvat
              </span>
            </Link>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-4">
          {([
            { key: 'push' as const, label: 'Notificari push', desc: 'Primeste notificari pentru match-uri noi' },
            { key: 'alerts' as const, label: 'Alerte de zona', desc: 'Notificari cand apare ceva in zona ta' },
            { key: 'email' as const, label: 'Email digest', desc: 'Sumar saptamanal pe email' },
            { key: 'dark' as const, label: 'Mod intunecat', desc: 'Activeaza tema intunecata' },
          ]).map((setting) => (
            <div key={setting.key} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
              <div>
                <h3 className="text-sm font-medium">{setting.label}</h3>
                <p className="text-xs text-gray-400">{setting.desc}</p>
              </div>
              <button
                onClick={() => toggleSetting(setting.key)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  settings[setting.key] ? 'bg-brand-teal-400' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  settings[setting.key] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}

          {/* Alert zones management */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium">Zone de alerta</h3>
                <p className="text-xs text-gray-400">Primeste notificari cand apare ceva in zona ta.</p>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-xl">{'\u{1F4CD}'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">{zone.name}</p>
                    <p className="text-xs text-blue-600">
                      Raza: {zone.radius}km - {zone.categories.map((c) => c === 'pet' ? 'Animale' : c === 'object' ? 'Obiecte' : c === 'document' ? 'Documente' : 'Altele').join(', ')}
                    </p>
                  </div>
                  <button onClick={() => removeZone(zone.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">
                    {'\u2715'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowZoneModal(true)}
              className="w-full py-2 text-sm text-brand-orange-500 font-medium border border-brand-orange-200 rounded-lg hover:bg-brand-orange-50 transition-colors"
            >
              + Adauga zona noua
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full py-3 text-red-500 text-sm font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
              Deconecteaza-te
            </button>
            <button className="w-full py-2 text-xs text-gray-400 hover:text-red-400 transition-colors">
              Sterge contul
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onKeyDown={(e) => e.key === 'Escape' && setShowEditModal(false)} role="dialog" aria-modal="true" aria-label="Editeaza profilul">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Editeaza profilul</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                {'\u2715'}
              </button>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-brand-teal-400 text-white flex items-center justify-center text-3xl font-bold">
                  {user.avatarInitial}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs hover:bg-gray-50">
                  {'\u{1F4F7}'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nume</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Spune ceva despre tine..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 resize-none"
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
              />
              <p className="text-[10px] text-gray-400 mt-1">Email-ul nu poate fi schimbat.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Anuleaza
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-orange-500 rounded-xl hover:bg-brand-orange-600"
              >
                Salveaza
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onKeyDown={(e) => e.key === 'Escape' && setShowZoneModal(false)} role="dialog" aria-modal="true" aria-label="Zona noua de alerta">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Zona noua de alerta</h2>
              <button onClick={() => setShowZoneModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                {'\u2715'}
              </button>
            </div>

            <div className="bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
              {'\u{1F5FA}'} Harta - selecteaza locatia
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Raza: {zoneRadius} km</label>
              <input
                type="range"
                min={1}
                max={10}
                value={zoneRadius}
                onChange={(e) => setZoneRadius(Number(e.target.value))}
                className="w-full accent-brand-orange-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Categorii</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'pet', label: 'Animale', emoji: '\u{1F43E}' },
                  { key: 'object', label: 'Obiecte', emoji: '\u{1F4E6}' },
                  { key: 'document', label: 'Documente', emoji: '\u{1F4C4}' },
                  { key: 'other', label: 'Altele', emoji: '\u{2753}' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => toggleZoneCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      zoneCategories.includes(cat.key)
                        ? 'bg-brand-teal-100 text-brand-teal-700 border border-brand-teal-300'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowZoneModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
              >
                Anuleaza
              </button>
              <button
                onClick={addZone}
                disabled={zoneCategories.length === 0}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-orange-500 rounded-xl hover:bg-brand-orange-600 disabled:opacity-50"
              >
                Adauga zona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
