import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  max?: number;
  icon: LucideIcon;
  description?: string;
}

export default function MetricCard({ title, value, max = 100, icon: Icon, description }: MetricCardProps) {
  const percentage = (value / max) * 100;
  
  const getColor = () => {
    if (percentage >= 70) return 'text-chart-3';
    if (percentage >= 40) return 'text-chart-4';
    return 'text-chart-5';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className={`text-3xl font-bold ${getColor()}`}>{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <Progress value={percentage} className="h-2 mb-2" />
      
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  );
}
