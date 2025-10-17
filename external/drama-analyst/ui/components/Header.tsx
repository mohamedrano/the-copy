import React from 'react';
import { APP_TITLE } from '@core/constants';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 bg-slate-900 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-secondary-light">
          {APP_TITLE}
        </h1>
        <p className="text-sm text-slate-400 mt-2 md:mt-0">
          رؤى درامية ومحاكاة أسلوبية مدعومة بالذكاء الاصطناعي
        </p>
      </div>
    </header>
  );
};
