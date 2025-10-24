'use client';

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MinusCircle,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';

interface Station {
  id: number;
  name: string;
  description: string;
  Icon: LucideIcon;
}

type Status = 'pending' | 'running' | 'completed' | 'failed';

interface StationCardProps {
  station: Station;
  status: Status;
  results: any;
  isActive: boolean;
}

const StationCard = ({ station, status, results, isActive }: StationCardProps) => {
  const { id, name, description, Icon } = station;
  const hasResults = status === 'completed' && results[id];

  const statusIcons: Record<Status, JSX.Element> = {
    pending: <MinusCircle className="text-muted-foreground" />,
    running: <Loader2 className="animate-spin text-primary" />,
    completed: <CheckCircle2 className="text-green-500" />,
    failed: <AlertCircle className="text-destructive" />,
  };

  const renderResults = () => {
    const data = results[id];
    if (!data) return null;

    switch (id) {
      case 1:
        return (
          <div className="space-y-2">
            <p className="text-sm"><strong>الشخصيات:</strong> {data.majorCharacters?.join(', ')}</p>
            <p className="text-sm"><strong>النمط:</strong> {data.narrativeStyleAnalysis?.overallTone}</p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-2">
            <p className="text-sm"><strong>بيان القصة:</strong> {data.storyStatement}</p>
            <p className="text-sm"><strong>النوع:</strong> {typeof data.hybridGenre === 'object' ? data.hybridGenre?.genre || JSON.stringify(data.hybridGenre) : data.hybridGenre}</p>
          </div>
        );
      case 3:
        return (
          <p className="text-sm">
            <strong>الشبكة:</strong> {data.networkSummary?.charactersCount} شخصيات، {data.networkSummary?.relationshipsCount} علاقات
          </p>
        );
      case 4:
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Progress value={data.efficiencyMetrics?.overallEfficiencyScore} className="flex-1" />
              <span className="text-sm">{Math.round(data.efficiencyMetrics?.overallEfficiencyScore || 0)}/100</span>
            </div>
          </div>
        );
      case 7:
        return (
          <p className="text-sm">{data.finalReport?.executiveSummary}</p>
        );
      default:
        return <p className="text-sm">تم إنجاز التحليل بنجاح</p>;
    }
  };

  return (
    <Card
      className={cn(
        'flex h-full flex-col transition-all duration-300',
        isActive ? 'border-primary shadow-lg' : 'border-dashed',
        status === 'pending' && 'bg-muted/30'
      )}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <CardTitle className="font-headline text-lg">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div>{statusIcons[status]}</div>
      </CardHeader>
      {(hasResults || isActive) && (
        <CardContent className="flex-1">
          {isActive && status === 'running' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {hasResults && renderResults()}
        </CardContent>
      )}
      {hasResults && (
        <CardFooter>
          <Badge variant="secondary">تم إنشاء المخرجات</Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default StationCard;