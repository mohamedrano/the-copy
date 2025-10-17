import ConflictNetwork from '../ConflictNetwork';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ConflictNetworkExample() {
  const characters = [
    { id: '1', name: 'أحمد', role: 'البطل', intensity: 80 },
    { id: '2', name: 'فاطمة', role: 'البطلة المساعدة', intensity: 60 },
    { id: '3', name: 'محمود', role: 'الخصم', intensity: 70 },
  ];

  const conflicts = [
    { from: '1', to: '3', type: 'strong' as const },
    { from: '1', to: '2', type: 'weak' as const },
    { from: '2', to: '3', type: 'medium' as const },
  ];

  return (
    <LanguageProvider>
      <div className="p-8 bg-background">
        <ConflictNetwork characters={characters} conflicts={conflicts} />
      </div>
    </LanguageProvider>
  );
}
