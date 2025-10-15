import { Card } from '@/components/ui/card';
import CharacterNode from './CharacterNode';
import { useLanguage } from '@/contexts/LanguageContext';

interface Character {
  id: string;
  name: string;
  role: string;
  intensity: number;
}

interface Conflict {
  from: string;
  to: string;
  type: 'strong' | 'medium' | 'weak';
}

interface ConflictNetworkProps {
  characters: Character[];
  conflicts: Conflict[];
}

export default function ConflictNetwork({ characters, conflicts }: ConflictNetworkProps) {
  const { language } = useLanguage();

  const t = {
    ar: {
      title: 'شبكة الصراع',
      legend: 'أنواع الصراع',
      strong: 'صراع قوي',
      medium: 'صراع متوسط',
      weak: 'صراع ضعيف'
    },
    en: {
      title: 'Conflict Network',
      legend: 'Conflict Types',
      strong: 'Strong Conflict',
      medium: 'Medium Conflict',
      weak: 'Weak Conflict'
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{t[language].title}</h3>
      
      <div className="relative min-h-96 bg-muted/30 rounded-lg p-8 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-8">
          {characters.map(char => (
            <CharacterNode 
              key={char.id}
              name={char.name}
              role={char.role}
              intensity={char.intensity}
            />
          ))}
        </div>
        
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {conflicts.map((conflict, i) => (
            <line
              key={i}
              x1="30%"
              y1="50%"
              x2="70%"
              y2="50%"
              className={
                conflict.type === 'strong' ? 'stroke-destructive' :
                conflict.type === 'medium' ? 'stroke-chart-4' :
                'stroke-chart-3'
              }
              strokeWidth="2"
              strokeDasharray={conflict.type === 'weak' ? '5,5' : '0'}
            />
          ))}
        </svg>
      </div>

      <div className="mt-4 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-destructive" />
          <span className="text-muted-foreground">{t[language].strong}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-chart-4" />
          <span className="text-muted-foreground">{t[language].medium}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-chart-3" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)' }} />
          <span className="text-muted-foreground">{t[language].weak}</span>
        </div>
      </div>
    </Card>
  );
}
