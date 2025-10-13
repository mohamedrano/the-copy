import AnalysisCard from '../AnalysisCard';
import { Users } from 'lucide-react';

export default function AnalysisCardExample() {
  return (
    <div className="p-8 bg-background">
      <AnalysisCard 
        title="الشخصيات المكتشفة" 
        icon={Users}
        badge="5 شخصيات"
      >
        <div className="space-y-2">
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">أحمد - البطل</p>
            <p className="text-sm text-muted-foreground">شخصية رئيسية، دور محوري في الأحداث</p>
          </div>
          <div className="p-3 bg-muted rounded-md">
            <p className="font-medium">فاطمة - البطلة المساعدة</p>
            <p className="text-sm text-muted-foreground">شخصية ثانوية، داعمة للبطل</p>
          </div>
        </div>
      </AnalysisCard>
    </div>
  );
}
