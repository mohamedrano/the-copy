import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onFullAnalysis?: () => void;
}

export default function TextInput({ value, onChange, onAnalyze, onFullAnalysis }: TextInputProps) {
  const { language } = useLanguage();

  const t = {
    ar: {
      title: 'أدخل النص السردي',
      placeholder: 'الصق النص السردي أو الدرامي هنا للتحليل...\n\nيمكنك لصق قصة قصيرة، مشهد درامي، أو أي نص سردي يحتوي على شخصيات وأحداث.',
      analyze: 'تحليل النص',
      fullAnalysis: 'تحليل شامل (5 محطات)',
      upload: 'رفع ملف',
      wordCount: 'عدد الكلمات'
    },
    en: {
      title: 'Enter Narrative Text',
      placeholder: 'Paste your narrative or dramatic text here for analysis...\n\nYou can paste a short story, dramatic scene, or any narrative text with characters and events.',
      analyze: 'Analyze Text',
      fullAnalysis: 'Full Analysis (5 Stations)',
      upload: 'Upload File',
      wordCount: 'Word Count'
    }
  };

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {t[language].title}
        </h2>
        <Button variant="outline" size="sm" data-testid="button-upload-file">
          <Upload className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {t[language].upload}
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t[language].placeholder}
        className="min-h-96 resize-none text-base leading-relaxed"
        data-testid="textarea-narrative-input"
      />

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          {t[language].wordCount}: <span className="font-medium text-foreground">{wordCount}</span>
        </p>
        
        <div className="flex gap-3">
          <Button 
            onClick={onAnalyze}
            disabled={wordCount < 10}
            variant="outline"
            data-testid="button-analyze"
          >
            {t[language].analyze}
          </Button>
          
          {onFullAnalysis && (
            <Button 
              onClick={onFullAnalysis}
              disabled={wordCount < 10}
              size="lg"
              data-testid="button-full-analysis"
            >
              {t[language].fullAnalysis}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
