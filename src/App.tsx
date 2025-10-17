import type { JSX } from 'react';
import { useState } from 'react';
import HomePage from './components/HomePage';
import ScreenplayEditor from './components/editor/ScreenplayEditor';
import ProjectsPage from './components/ProjectsPage';
import TemplatesPage from './components/TemplatesPage';
import ExportPage from './components/ExportPage';
import SettingsPage from './components/SettingsPage';

/**
 * Available page identifiers for navigation routing.
 * 
 * @public
 */
export type PageId = 'home' | 'basic-editor' | 'projects' | 'templates' | 'export' | 'settings';

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
        return <ScreenplayEditor onBack={() => setCurrentPage('home')} />;
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
