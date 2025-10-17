import StationProgress from '../StationProgress';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function StationProgressExample() {
  const stations = [
    { id: 1, nameAr: 'تحليل النص', nameEn: 'Text Analysis', status: 'completed' as const },
    { id: 2, nameAr: 'المفاهيم', nameEn: 'Concepts', status: 'completed' as const },
    { id: 3, nameAr: 'شبكة الصراع', nameEn: 'Conflict Network', status: 'active' as const },
    { id: 4, nameAr: 'الكفاءة', nameEn: 'Efficiency', status: 'pending' as const },
    { id: 5, nameAr: 'الديناميكي', nameEn: 'Dynamic', status: 'pending' as const },
    { id: 6, nameAr: 'التشخيص', nameEn: 'Diagnosis', status: 'pending' as const },
    { id: 7, nameAr: 'التصور', nameEn: 'Visualization', status: 'pending' as const },
  ];

  return (
    <LanguageProvider>
      <div className="p-8 bg-background">
        <StationProgress stations={stations} />
      </div>
    </LanguageProvider>
  );
}
