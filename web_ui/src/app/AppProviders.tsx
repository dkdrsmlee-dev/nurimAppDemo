import type { PropsWithChildren } from 'react';

import { AppProvider } from '../state/app/AppContext';

export function AppProviders({ children }: PropsWithChildren) {
  return <AppProvider>{children}</AppProvider>;
}
