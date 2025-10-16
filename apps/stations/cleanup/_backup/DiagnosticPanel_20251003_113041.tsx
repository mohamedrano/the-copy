import DiagnosticPanel from '../DiagnosticPanel';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function DiagnosticPanelExample() {
  const issues = [
    {
      type: 'critical' as const,
      title: 'ضعف في تطور الشخصية الرئيسية',
      description: 'الشخصية الرئيسية لا تظهر تطوراً واضحاً خلال الأحداث',
      suggestion: 'أضف مشاهد تُظهر التحول الداخلي للشخصية بناءً على الأحداث'
    },
    {
      type: 'warning' as const,
      title: 'الصراع الثانوي غير مُستغل',
      description: 'هناك صراع ثانوي بين شخصيتين لم يتم تطويره بشكل كافٍ',
      suggestion: 'خصص مشهداً أو اثنين لتعميق هذا الصراع'
    },
    {
      type: 'info' as const,
      title: 'الحبكة قوية ومتماسكة',
      description: 'تسلسل الأحداث منطقي ويحافظ على اهتمام القارئ'
    }
  ];

  return (
    <LanguageProvider>
      <div className="p-8 bg-background">
        <DiagnosticPanel issues={issues} />
      </div>
    </LanguageProvider>
  );
}
