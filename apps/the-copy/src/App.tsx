import type { JSX } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ShellLayout } from '@/components/layout/ShellLayout';

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ShellLayout>
        <AppRoutes />
      </ShellLayout>
    </BrowserRouter>
  );
}

