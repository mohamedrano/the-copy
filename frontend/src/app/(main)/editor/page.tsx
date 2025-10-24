'use client';

import dynamic from 'next/dynamic';

const ScreenplayEditor = dynamic(() => import('@/components/ScreenplayEditor'), {
  ssr: false,
});

export default function EditorPage() {
  return <ScreenplayEditor />;
}
