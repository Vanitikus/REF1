import Link from 'next/link';

export default function DesprePage() {
  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-3">Despre ReFind</h1>
        <p className="text-gray-600 leading-relaxed">
          ReFind este o platforma civica inovatoare care conecteaza persoanele care au pierdut obiecte
          cu cele care le-au gasit. Inspirata de modelul Waze, platforma foloseste inteligenta artificiala
          si puterea comunitatii pentru a creste semnificativ rata de recuperare a obiectelor pierdute.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <span className="text-3xl block mb-3">{'\u{1F3AF}'}</span>
          <h2 className="text-lg font-bold mb-2">Misiunea noastra</h2>
          <p className="text-sm text-gray-600">
            Sa facem din recuperarea obiectelor pierdute un proces simplu, rapid si accesibil pentru toata lumea.
            Credem ca tehnologia poate transforma modul in care comunitatile se ajuta reciproc.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <span className="text-3xl block mb-3">{'\u{1F916}'}</span>
          <h2 className="text-lg font-bold mb-2">Tehnologie AI</h2>
          <p className="text-sm text-gray-600">
            Algoritmul nostru de matching analizeaza 5 semnale simultan: locatie, similaritate vizuala,
            categorie, proximitate temporala si analiza de text. Scorul combinat ofera match-uri precise.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <span className="text-3xl block mb-3">{'\u{1F30D}'}</span>
          <h2 className="text-lg font-bold mb-2">Comunitate</h2>
          <p className="text-sm text-gray-600">
            Fiecare utilizator contribuie la o retea civica mai puternica. Sistemul de scor comunitate
            recompenseaza actiunile pozitive si construieste incredere intre membrii.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <span className="text-3xl block mb-3">{'\u{1F512}'}</span>
          <h2 className="text-lg font-bold mb-2">Siguranta</h2>
          <p className="text-sm text-gray-600">
            Comunicarea intre utilizatori este protejata. Nu expunem date personale, iar mesageria
            integrata asigura un schimb de informatii sigur si controlat.
          </p>
        </div>
      </div>

      <div className="bg-brand-orange-50 border border-brand-orange-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-brand-orange-800 mb-3">Echipa</h2>
        <p className="text-sm text-brand-orange-600 mb-4">
          ReFind este dezvoltat de o echipa pasionata de tehnologie si impact social din Bucuresti, Romania.
          Proiectul a fost lansat in 2026 cu scopul de a rezolva o problema reala a comunitatii.
        </p>
        <div className="flex gap-3">
          <Link href="/cum-functioneaza" className="px-4 py-2 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors">
            Cum functioneaza
          </Link>
          <Link href="/" className="px-4 py-2 border border-brand-orange-300 text-brand-orange-600 rounded-xl text-sm font-medium hover:bg-brand-orange-100 transition-colors">
            Exploreaza platforma
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">In cifre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: '10k+', label: 'Utilizatori activi' },
            { value: '25k+', label: 'Postari create' },
            { value: '8k+', label: 'Obiecte recuperate' },
            { value: '92%', label: 'Rata de satisfactie' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-brand-orange-500">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
