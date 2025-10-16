import HeroSection from '../HeroSection';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function HeroSectionExample() {
  return (
    <LanguageProvider>
      <HeroSection onGetStarted={() => console.log('Get started clicked')} />
    </LanguageProvider>
  );
}
