'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <span className="text-5xl block mb-4">{'\u26A0\uFE0F'}</span>
        <h2 className="text-xl font-bold mb-2">Ceva nu a mers bine</h2>
        <p className="text-sm text-gray-500 mb-6">
          A aparut o eroare neasteptata. Incearca din nou sau revino mai tarziu.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-brand-orange-500 text-white rounded-xl text-sm font-medium hover:bg-brand-orange-600 transition-colors"
        >
          Incearca din nou
        </button>
      </div>
    </div>
  );
}
