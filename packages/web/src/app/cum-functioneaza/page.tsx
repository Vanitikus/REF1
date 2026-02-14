import Link from 'next/link';

const STEPS = [
  {
    emoji: '\u{1F4F1}',
    title: 'Posteaza',
    desc: 'Ai pierdut sau ai gasit ceva? Creeaza o postare cu descriere, poze si locatie in cateva secunde.',
  },
  {
    emoji: '\u{1F916}',
    title: 'AI-ul cauta match-uri',
    desc: 'Algoritmul nostru analizeaza locatia, imaginile, categoria, timpul si textul pentru a gasi potriviri automat.',
  },
  {
    emoji: '\u{1F517}',
    title: 'Match & Notificare',
    desc: 'Cand gasim un match potential, primesti notificare instant. Verifici scorul de compatibilitate si detaliile.',
  },
  {
    emoji: '\u{1F4AC}',
    title: 'Contacteaza & Recupereaza',
    desc: 'Comunica prin chat-ul integrat cu celalalt utilizator si organizeaza returnarea obiectului.',
  },
];

const SIGNALS = [
  { label: 'Locatie', weight: '30%', desc: 'Proximitatea geografica intre cele doua postari', emoji: '\u{1F4CD}' },
  { label: 'Similaritate vizuala', weight: '30%', desc: 'Analiza AI a imaginilor postate', emoji: '\u{1F441}' },
  { label: 'Categorie', weight: '20%', desc: 'Potrivirea exacta a categoriei (animal, obiect, document)', emoji: '\u{1F3F7}' },
  { label: 'Proximitate temporala', weight: '10%', desc: 'Cat de aproape in timp au fost postate', emoji: '\u{23F0}' },
  { label: 'Text', weight: '10%', desc: 'Analiza semantica a descrierilor', emoji: '\u{1F4DD}' },
];

export default function CumFunctioneazaPage() {
  return (
    <div className="py-8 max-w-3xl mx-auto space-y-12">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">Cum functioneaza REFiND?</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          REFiND este platforma civica care foloseste inteligenta artificiala pentru a conecta automat
          obiectele pierdute cu cele gasite. Simplu, rapid, eficient.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-3xl shrink-0">
              {step.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Pasul {i + 1}
                </span>
                <h3 className="text-lg font-bold">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Matching Engine */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200 p-6">
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">{'\u{1F9E0}'}</span>
          <h2 className="text-xl font-bold">Motorul de matching AI</h2>
          <p className="text-sm text-gray-600 mt-1">5 semnale analizate simultan pentru fiecare pereche</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {SIGNALS.map((signal) => (
            <div key={signal.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{signal.emoji}</span>
                <span className="text-sm font-semibold">{signal.label}</span>
                <span className="text-xs font-bold text-emerald-600 ml-auto">{signal.weight}</span>
              </div>
              <p className="text-xs text-gray-500">{signal.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Scor total</span>
                <span className="font-bold text-emerald-600">0% - 100%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div className="bg-red-400 h-full" style={{ width: '30%' }} />
                <div className="bg-amber-400 h-full" style={{ width: '30%' }} />
                <div className="bg-emerald-400 h-full" style={{ width: '40%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>Slab (&lt;50%)</span>
                <span>Moderat (50-79%)</span>
                <span>Puternic (80%+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-center mb-6">De ce REFiND?</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { emoji: '\u{1F30D}', title: 'Harta interactiva', desc: 'Vizualizeaza toate postarile pe harta in timp real.' },
            { emoji: '\u{1F514}', title: 'Alerte zona', desc: 'Seteaza zone si primeste notificari cand apare ceva nou.' },
            { emoji: '\u{1F512}', title: 'Chat securizat', desc: 'Comunicare directa si in siguranta intre utilizatori.' },
            { emoji: '\u{1F3C6}', title: 'Recompense', desc: 'Ofera sau revendica recompense pentru obiectele gasite.' },
            { emoji: '\u{2B50}', title: 'Scor comunitate', desc: 'Castiga reputatie prin fiecare actiune pozitiva.' },
            { emoji: '\u{26A1}', title: 'Boost postari', desc: 'Promoveaza postarea ta pentru vizibilitate maxima.' },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <span className="text-2xl block mb-2">{f.emoji}</span>
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-emerald-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Gata sa incepi?</h2>
        <p className="text-emerald-100 mb-6 text-sm">Creeaza prima ta postare in mai putin de un minut.</p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/posteaza"
            className="px-6 py-3 bg-white text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            + Posteaza acum
          </Link>
          <Link
            href="/harta"
            className="px-6 py-3 border border-white/30 text-white rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Exploreaza harta
          </Link>
        </div>
      </div>
    </div>
  );
}
