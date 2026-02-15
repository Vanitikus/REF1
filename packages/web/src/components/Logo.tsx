import Link from 'next/link';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className={dims}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Pin body */}
          <path
            d="M24 4C15.2 4 8 11.2 8 20C8 31 24 44 24 44C24 44 40 31 40 20C40 11.2 32.8 4 24 4Z"
            fill="#2EC4B6"
          />
          {/* Heart inside pin */}
          <path
            d="M24 32C24 32 14 24.5 14 19.5C14 16.5 16.5 14 19.5 14C21.2 14 22.7 14.8 24 16.2C25.3 14.8 26.8 14 28.5 14C31.5 14 34 16.5 34 19.5C34 24.5 24 32 24 32Z"
            fill="#F2994A"
          />
          {/* Shine */}
          <circle cx="17" cy="17" r="3" fill="white" opacity="0.25" />
        </svg>
      </div>
      <span className={`${textSize} font-poppins font-bold tracking-tight`}>
        <span className="text-brand-teal-400">Re</span>
        <span className="text-brand-orange-500">Find</span>
      </span>
    </Link>
  );
}

export function LogoIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path
        d="M24 4C15.2 4 8 11.2 8 20C8 31 24 44 24 44C24 44 40 31 40 20C40 11.2 32.8 4 24 4Z"
        fill="#2EC4B6"
      />
      <path
        d="M24 32C24 32 14 24.5 14 19.5C14 16.5 16.5 14 19.5 14C21.2 14 22.7 14.8 24 16.2C25.3 14.8 26.8 14 28.5 14C31.5 14 34 16.5 34 19.5C34 24.5 24 32 24 32Z"
        fill="#F2994A"
      />
      <circle cx="17" cy="17" r="3" fill="white" opacity="0.25" />
    </svg>
  );
}
