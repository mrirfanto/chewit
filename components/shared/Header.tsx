import Link from 'next/link';

/**
 * Simple navigation header with logo/title
 * Minimal, Notion-like design
 */
export function Header() {
  return (
    <header className="border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">C</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Chewit</h1>
          </Link>

          {/* Navigation (placeholder for future) */}
          <nav className="flex items-center gap-4">
            {/* Add navigation items here as needed */}
          </nav>
        </div>
      </div>
    </header>
  );
}
