import Link from 'next/link';

interface NavigationProps {
  currentSymbol?: string;
  activePage: 'overview' | 'wyckoff';
}

export default function Navigation({ currentSymbol, activePage }: NavigationProps) {
  const overviewHref = currentSymbol ? `/?symbol=${currentSymbol}` : '/';
  const wyckoffHref = currentSymbol ? `/wyckoff?symbol=${currentSymbol}` : '/wyckoff';

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1">
          <Link
            href={overviewHref}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activePage === 'overview'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            Overview
          </Link>
          <Link
            href={wyckoffHref}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activePage === 'wyckoff'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
            }`}
          >
            Wyckoff Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}
