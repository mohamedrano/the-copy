import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const t = {
    ar: {
      title: 'تحليل النصوص الدرامية',
      subtitle: 'نظام متكامل لتحليل النصوص السردية'
    },
    en: {
      title: 'Dramatic Text Analysis',
      subtitle: 'Comprehensive Narrative Text Analysis System'
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{t[language].title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t[language].subtitle}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              data-testid="button-language-toggle"
            >
              <Languages className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
