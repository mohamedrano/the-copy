import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CharacterNodeProps {
  name: string;
  role: string;
  intensity?: number;
}

export default function CharacterNode({ name, role, intensity = 0 }: CharacterNodeProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const intensityColor = 
    intensity > 70 ? 'border-destructive' : 
    intensity > 40 ? 'border-chart-4' : 
    'border-chart-3';

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-card rounded-lg border border-border hover-elevate">
      <Avatar className={`w-12 h-12 border-2 ${intensityColor}`}>
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
