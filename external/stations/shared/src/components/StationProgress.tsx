import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StationDefinition } from './station-progress-utils';
import { computeStationProgress } from './station-progress-utils';

interface StationProgressProps {
  stations: StationDefinition[];
}

export default function StationProgress({ stations }: StationProgressProps) {
  const { language } = useLanguage();

  const { currentStation, nextStation, phase, allCompleted } = useMemo(
    () => computeStationProgress(stations),
    [stations]
  );

  const progressMessage = useMemo(() => {
    if (!currentStation) {
      return language === 'ar'
        ? 'لا توجد محطات متاحة حالياً.'
        : 'No stations are available yet.';
    }

    if (phase === 'active') {
      const baseMessage =
        language === 'ar'
          ? `أنت الآن في المحطة ${currentStation.id}: ${currentStation.nameAr}.`
          : `You are currently at station ${currentStation.id}: ${currentStation.nameEn}.`;

      if (nextStation) {
        const nextMessage =
          language === 'ar'
            ? ` المحطة التالية ستكون ${nextStation.id}: ${nextStation.nameAr}.`
            : ` Next up: station ${nextStation.id}: ${nextStation.nameEn}.`;
        return `${baseMessage}${nextMessage}`;
      }

      return baseMessage;
    }

    if (allCompleted) {
      return language === 'ar'
        ? `اكتملت جميع المحطات. انتهيت عند المحطة ${currentStation.id}: ${currentStation.nameAr}.`
        : `All stations are complete. You finished at station ${currentStation.id}: ${currentStation.nameEn}.`;
    }

    if (phase === 'completed' && nextStation) {
      return language === 'ar'
        ? `آخر محطة مكتملة هي ${currentStation.id}: ${currentStation.nameAr}. المحطة التالية: ${nextStation.id}: ${nextStation.nameAr}.`
        : `The last completed station is ${currentStation.id}: ${currentStation.nameEn}. Next station: ${nextStation.id}: ${nextStation.nameEn}.`;
    }

    return language === 'ar'
      ? `لم تبدأ عملية التحليل بعد. ستكون البداية من المحطة ${currentStation.id}: ${currentStation.nameAr}.`
      : `Analysis has not started yet. The journey will begin at station ${currentStation.id}: ${currentStation.nameEn}.`;
  }, [allCompleted, currentStation, language, nextStation, phase]);

  return (
    <div className="w-full py-8">
      <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
        {progressMessage}
      </p>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" style={{ zIndex: 0 }} />

        {stations.map((station, index) => {
          const isCompleted = station.status === 'completed';
          const isActive = station.status === 'active';

          return (
            <div key={station.id} className="flex flex-col items-center relative" style={{ zIndex: 1 }}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'bg-background border-primary text-primary'
                    : 'bg-background border-border text-muted-foreground'
                }`}
                data-testid={`station-indicator-${station.id}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : station.id}
              </div>
              
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {language === 'ar' ? station.nameAr : station.nameEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
