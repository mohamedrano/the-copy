import type { JSX, PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { environment } from '@/config/environment';

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  `text-sm font-medium transition-colors ${
    isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
  }`;

export function ShellLayout({ children }: PropsWithChildren): JSX.Element {
  const paneLinks = Object.values(environment.panes);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:shadow">
        تخطي إلى المحتوى
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold text-slate-900">
              {environment.shellTitle}
            </Link>
            <nav aria-label="التطبيقات" className="hidden items-center gap-4 md:flex">
              <NavLink to="/" end className={navLinkClassName}>
                الرئيسية
              </NavLink>
              {paneLinks.map((pane) => (
                <NavLink key={pane.id} to={pane.routePath} className={navLinkClassName}>
                  {pane.title}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3" />
        </div>
      </header>
      <main id="main-content" className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
