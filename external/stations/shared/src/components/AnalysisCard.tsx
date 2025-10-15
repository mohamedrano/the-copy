import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface AnalysisCardProps {
  title: string;
  icon: LucideIcon;
   
  children: React.ReactNode;
  badge?: string;
}

export default function AnalysisCard({ title, icon: Icon, children, badge }: AnalysisCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">{badge}</Badge>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </Card>
  );
}
