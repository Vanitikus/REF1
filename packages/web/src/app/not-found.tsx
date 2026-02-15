import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <span className="text-7xl block mb-6">{'\u{1F50D}'}</span>
        <h1 className="text-3xl font-bold mb-2">Pagina nu a fost gasita</h1>
        <p className="text-gray-500 mb-8">
          Se pare ca aceasta pagina s-a pierdut. Poate o gasesti pe harta?
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors"
          >
            Inapoi la feed
          </Link>
          <Link
            href="/harta"
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Vezi harta
          </Link>
        </div>
      </div>
    </div>
  );
}
