import MetricCard from '../MetricCard';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-8 bg-background grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="كفاءة الحبكة" 
        value={85} 
        icon={Activity}
        description="حبكة قوية ومترابطة"
      />
      <MetricCard 
        title="التطور الدرامي" 
        value={72} 
        icon={TrendingUp}
        description="تطور جيد للأحداث"
      />
      <MetricCard 
        title="تعقيد الشخصيات" 
        value={45} 
        icon={Users}
        description="يحتاج لمزيد من العمق"
      />
      <MetricCard 
        title="التوتر الدرامي" 
        value={90} 
        icon={Zap}
        description="توتر عالي ومستمر"
      />
    </div>
  );
}
