import type { JSX } from 'react';
import { useState } from 'react';
import HomePage from './components/HomePage';
import ScreenplayEditor from './components/editor/ScreenplayEditor';
import ProjectsPage from './components/ProjectsPage';
import TemplatesPage from './components/TemplatesPage';
import ExportPage from './components/ExportPage';
import SettingsPage from './components/SettingsPage';

/**
 * Root application component that routes between the main navigation views.
 *
 * @returns Top-level JSX for the Naqid front-end shell.
 */
export default function App(): JSX.Element {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
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
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}
