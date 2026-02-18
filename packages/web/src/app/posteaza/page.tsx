'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ImageUpload';
import { LocationPicker } from '@/components/LocationPicker';
import { useCreatePost } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-context';

type PostType = 'lost' | 'found';
type Category = 'pet' | 'object' | 'document' | 'other';

const CATEGORIES: { key: Category; label: string; emoji: string; desc: string }[] = [
  { key: 'pet', label: 'Animal', emoji: '\u{1F43E}', desc: 'Caine, pisica, pasare, etc.' },
  { key: 'object', label: 'Obiect', emoji: '\u{1F4E6}', desc: 'Telefon, cheie, rucsac, etc.' },
  { key: 'document', label: 'Document', emoji: '\u{1F4C4}', desc: 'Buletin, pasaport, permis, etc.' },
  { key: 'other', label: 'Altele', emoji: '\u{2753}', desc: 'Orice altceva' },
];

export default function PosteazaPage() {
  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState<PostType | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [reward, setReward] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createPost, loading: submitting } = useCreatePost();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const totalSteps = 3;

  const canNext = () => {
    if (step === 1) return postType !== null && category !== null;
    if (step === 2) return title.length >= 5 && description.length >= 10 && location.length >= 3;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!isAuthenticated) {
      router.push('/autentificare');
      return;
    }

    const result = await createPost({
      type: postType,
      category,
      title,
      description,
      locationName: location,
      location: locationCoords ? { lat: locationCoords.lat, lng: locationCoords.lng } : undefined,
      rewardAmount: reward ? Number(reward) : undefined,
      rewardCurrency: reward ? 'RON' : undefined,
    });

    if (result.error) {
      setSubmitError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-brand-teal-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          {'\u2705'}
        </div>
        <h1 className="text-2xl font-bold mb-2">Postare creata!</h1>
        <p className="text-gray-500 mb-6">
          Postarea ta a fost publicata cu succes. Algoritmul nostru AI va cauta match-uri automat.
        </p>
        <div className="bg-brand-teal-50 border border-brand-teal-200 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
              postType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
            }`}>
              {postType === 'lost' ? 'Pierdut' : 'Gasit'}
            </span>
            <span className="text-xs text-gray-400">
              {CATEGORIES.find((c) => c.key === category)?.label}
            </span>
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{location}</p>
          {images.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">{'\u{1F4F7}'} {images.length} fotografi{images.length === 1 ? 'e' : 'i'} atasate</p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Inapoi la feed
          </Link>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setPostType(null);
              setCategory(null);
              setTitle('');
              setDescription('');
              setLocation('');
              setLocationCoords(null);
              setReward('');
              setImages([]);
            }}
            className="px-6 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors"
          >
            Posteaza din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Creeaza postare</h1>
          <p className="text-sm text-gray-500">Pasul {step} din {totalSteps}</p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          {'\u2715'} Anuleaza
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors ${
              i < step ? 'bg-brand-orange-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Type & Category */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Ce s-a intamplat?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPostType('lost')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  postType === 'lost'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-3xl block mb-2">{'\u{1F61F}'}</span>
                <span className="font-semibold block">Am pierdut</span>
                <span className="text-xs text-gray-500">Posteaza un obiect pierdut</span>
              </button>
              <button
                onClick={() => setPostType('found')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  postType === 'found'
                    ? 'border-brand-teal-400 bg-brand-teal-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-3xl block mb-2">{'\u{1F60A}'}</span>
                <span className="font-semibold block">Am gasit</span>
                <span className="text-xs text-gray-500">Posteaza un obiect gasit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Categorie</label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    category === cat.key
                      ? 'border-brand-teal-400 bg-brand-teal-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  <span className="font-medium text-sm block">{cat.label}</span>
                  <span className="text-[11px] text-gray-500">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Titlu <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === 'lost' ? 'ex: Catel labrador pierdut in Herastrau' : 'ex: Portofel maro gasit in metrou'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-[11px] text-gray-400 mt-1">{title.length}/200 caractere</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Descriere <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrie obiectul cat mai detaliat: culoare, marime, semne distinctive, imprejurari..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent resize-none"
              maxLength={2000}
            />
            <p className="text-[11px] text-gray-400 mt-1">{description.length}/2000 caractere</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Locatie <span className="text-red-400">*</span>
            </label>
            <LocationPicker
              value={location}
              coords={locationCoords}
              onChange={(loc, coords) => {
                setLocation(loc);
                setLocationCoords(coords);
              }}
            />
          </div>

          {postType === 'lost' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Recompensa (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{'\u{1F3C6}'}</span>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="ex: 200"
                  className="w-full pl-10 pr-16 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">RON</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Photos & Review */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Adauga fotografii</label>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          {/* Summary */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">Sumar postare</label>
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
                  postType === 'lost' ? 'bg-red-100 text-red-700' : 'bg-brand-teal-100 text-brand-teal-700'
                }`}>
                  {postType === 'lost' ? 'Pierdut' : 'Gasit'}
                </span>
                <span className="text-xs text-gray-400">
                  {CATEGORIES.find((c) => c.key === category)?.emoji}{' '}
                  {CATEGORIES.find((c) => c.key === category)?.label}
                </span>
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
              <p className="text-xs text-gray-500">{'\u{1F4CD}'} {location}</p>
              {reward && (
                <p className="text-xs text-amber-700 font-medium">{'\u{1F3C6}'} Recompensa: {reward} RON</p>
              )}
              {images.length > 0 && (
                <p className="text-xs text-gray-400">{'\u{1F4F7}'} {images.length} fotografi{images.length === 1 ? 'e' : 'i'}</p>
              )}
              {locationCoords && (
                <p className="text-xs text-gray-400">{'\u{1F4CD}'} GPS: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3">
            <span className="text-lg">{'\u{2139}'}</span>
            <p className="text-xs text-blue-700">
              Dupa publicare, algoritmul nostru AI va scana automat postari similare si te va notifica
              daca gaseste un match potential.
            </p>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-3">
              <span className="text-lg">{'\u{26A0}'}</span>
              <p className="text-xs text-red-700">{submitError}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {'\u2190'} Inapoi
          </button>
        )}
        <button
          onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
          disabled={!canNext() || submitting}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
            canNext()
              ? 'bg-brand-orange-500 text-white hover:bg-brand-orange-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Se publica...' : step < totalSteps ? 'Continua \u2192' : 'Publica postarea'}
        </button>
      </div>
    </div>
  );
}
