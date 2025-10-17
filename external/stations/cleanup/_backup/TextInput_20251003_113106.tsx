import { useState } from 'react';
import TextInput from '../TextInput';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function TextInputExample() {
  const [text, setText] = useState('');

  return (
    <LanguageProvider>
      <div className="p-8 bg-background">
        <TextInput 
          value={text} 
          onChange={setText}
          onAnalyze={() => console.log('Analyze clicked')}
        />
      </div>
    </LanguageProvider>
  );
}
