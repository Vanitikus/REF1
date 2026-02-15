import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Platforma civica pentru recuperarea obiectelor pierdute si gasite. The Waze of Lost & Found.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Platforma</h3>
            <ul className="space-y-2">
              {[
                { href: '/harta', label: 'Harta' },
                { href: '/cauta', label: 'Cautare' },
                { href: '/posteaza', label: 'Posteaza' },
                { href: '/chat', label: 'Mesaje' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-brand-orange-500">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Informatii</h3>
            <ul className="space-y-2">
              {[
                { href: '/despre', label: 'Despre noi' },
                { href: '/cum-functioneaza', label: 'Cum functioneaza' },
                { href: '/termeni', label: 'Termeni si conditii' },
                { href: '/confidentialitate', label: 'Confidentialitate' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-500 hover:text-brand-orange-500">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>contact@refind.ro</li>
              <li>Bucuresti, Romania</li>
              <li className="flex gap-3 pt-2">
                <span className="hover:text-brand-orange-500 cursor-pointer">Facebook</span>
                <span className="hover:text-brand-orange-500 cursor-pointer">Instagram</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            &copy; 2026 ReFind. Toate drepturile rezervate.
          </p>
          <p className="text-xs text-gray-400">
            Facut cu {'\u{2764}'} in Bucuresti
          </p>
        </div>
      </div>
    </footer>
  );
}
