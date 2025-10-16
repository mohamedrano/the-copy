import ScreenplayEditor from './ScreenplayEditor';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">
            المحرر الأساسي - محرر السيناريو العربي
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <ScreenplayEditor />
      </main>
    </div>
  );
}

export default App;
