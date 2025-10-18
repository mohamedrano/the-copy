import type { JSX } from 'react';

export interface RemoteAppStubProps {
  'data-testid'?: string;
}

export default function RemoteAppStub({ 'data-testid': testId }: RemoteAppStubProps = {}): JSX.Element {
  return <div data-testid={testId ?? 'remote-app-stub'} />;
}
