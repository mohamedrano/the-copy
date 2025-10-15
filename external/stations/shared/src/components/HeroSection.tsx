import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
// import heroImage from '@assets/generated_images/Arabic_manuscript_hero_image_8c9cfc14.png';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { language } = useLanguage();

  const t = {
    ar: {
      title: 'حلل نصوصك الدرامية باحترافية',
      subtitle: 'نظام متكامل يستخدم 7 محطات تحليلية متطورة لفهم عميق للنصوص السردية والدرامية',
      cta: 'ابدأ التحليل',
      features: [
        '7 محطات تحليلية متخصصة',
        'تحليل الشخصيات والعلاقات',
        'قياس الكفاءة الدرامية',
        'توصيات تحسين احترافية'
      ]
    },
    en: {
      title: 'Analyze Your Dramatic Texts Professionally',
      subtitle: 'Comprehensive system using 7 advanced analytical stations for deep understanding of narrative and dramatic texts',
      cta: 'Start Analysis',
      features: [
        '7 Specialized Analysis Stations',
        'Character & Relationship Analysis',
        'Dramatic Efficiency Measurement',
        'Professional Improvement Recommendations'
      ]
    }
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{language === 'ar' ? 'تحليل مدعوم بالذكاء الاصطناعي' : 'AI-Powered Analysis'}</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {t[language].title}
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {t[language].subtitle}
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 mb-12"
          onClick={onGetStarted}
          data-testid="button-hero-cta"
        >
          {t[language].cta}
          <ArrowIcon className="ltr:ml-2 rtl:mr-2 w-5 h-5" />
        </Button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {t[language].features.map((feature, i) => (
            <div 
              key={i}
              className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border"
            >
              <p className="text-sm font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
