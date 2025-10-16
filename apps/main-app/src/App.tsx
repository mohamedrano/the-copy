import type { JSX } from 'react';
import { useState } from 'react';
import HomePage from './components/HomePage';
import ExternalAppFrame from './components/common/ExternalAppFrame';
import ProjectsPage from './components/ProjectsPage';
import TemplatesPage from './components/TemplatesPage';
import ExportPage from './components/ExportPage';
import SettingsPage from './components/SettingsPage';

/**
 * Available page identifiers for navigation routing.
 * 
 * @public
 */
export type PageId = 'home' | 'basic-editor' | 'drama-analyst' | 'stations' | 'multi-agent-story' | 'projects' | 'templates' | 'export' | 'settings';

/**
 * Navigation handler function type for page transitions.
 * 
 * @public
 * @param pageId - The target page identifier to navigate to.
 */
export type NavigationHandler = (pageId: PageId) => void;

/**
 * Root application component that provides the main navigation shell for the Arabic Screenplay Editor.
 * 
 * This component manages the top-level routing between different application views including
 * the home page, screenplay editor, projects management, templates, export functionality, and settings.
 * 
 * @remarks
 * The component uses a simple state-based routing system where the current page is stored
 * in local state and rendered conditionally. Each page component receives a navigation
 * callback to return to the home page or navigate to other sections.
 * 
 * @example
 * ```tsx
 * import App from './App';
 * 
 * function Root() {
 *   return <App />;
 * }
 * ```
 * 
 * @public
 * @returns Top-level JSX element containing the application shell with conditional page rendering.
 */
export default function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  /**
   * Renders the appropriate page component based on the current navigation state.
   * 
   * @remarks
   * This internal function handles the conditional rendering logic for all application pages.
   * Each page component receives an `onBack` callback that navigates to the home page,
   * providing a consistent navigation experience across the application.
   * 
   * @returns JSX element for the currently active page.
   */
  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case 'basic-editor':
        return (
          <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">المحرر الأساسي</h1>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </header>
            <div className="flex-1">
              <ExternalAppFrame
                url="/basic-editor"
                title="المحرر الأساسي"
                onError={(error) => console.error('Error loading basic editor:', error)}
              />
            </div>
          </div>
        );
      case 'drama-analyst':
        return (
          <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">محلل الدراما</h1>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </header>
            <div className="flex-1">
              <ExternalAppFrame
                url="/drama-analyst"
                title="محلل الدراما"
                onError={(error) => console.error('Error loading drama analyst:', error)}
              />
            </div>
          </div>
        );
      case 'stations':
        return (
          <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">المحطات</h1>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </header>
            <div className="flex-1">
              <ExternalAppFrame
                url="/stations"
                title="المحطات"
                onError={(error) => console.error('Error loading stations:', error)}
              />
            </div>
          </div>
        );
      case 'multi-agent-story':
        return (
          <div className="h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">القصة متعددة الوكلاء</h1>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </header>
            <div className="flex-1">
              <ExternalAppFrame
                url="/multi-agent-story"
                title="القصة متعددة الوكلاء"
                onError={(error) => console.error('Error loading multi-agent story:', error)}
              />
            </div>
          </div>
        );
      case 'projects':
        return <ProjectsPage onBack={() => setCurrentPage('home')} />;
      case 'templates':
        return <TemplatesPage onBack={() => setCurrentPage('home')} />;
      case 'export':
        return <ExportPage onBack={() => setCurrentPage('home')} />;
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage onNavigate={(page: string) => setCurrentPage(page as PageId)} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}
