import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Issue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion?: string;
}

interface DiagnosticPanelProps {
  issues: Issue[];
}

export default function DiagnosticPanel({ issues }: DiagnosticPanelProps) {
  const { language } = useLanguage();

  const t = {
    ar: {
      title: 'التشخيص والتوصيات',
      critical: 'حرج',
      warning: 'تحذير',
      info: 'معلومة',
      suggestion: 'التوصية'
    },
    en: {
      title: 'Diagnosis & Recommendations',
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
      suggestion: 'Suggestion'
    }
  };

  const getIcon = (type: Issue['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning': return <Info className="w-5 h-5 text-chart-4" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-chart-3" />;
    }
  };

  const getBadgeVariant = (type: Issue['type']) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{t[language].title}</h3>
      
      <div className="space-y-4">
        {issues.map((issue, index) => (
          <div key={index} className="p-4 border border-border rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              {getIcon(issue.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{issue.title}</h4>
                  <Badge variant={getBadgeVariant(issue.type)} className="text-xs">
                    {t[language][issue.type]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            </div>
            
            {issue.suggestion && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-muted rounded-md">
                <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{t[language].suggestion}</p>
                  <p className="text-sm">{issue.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
