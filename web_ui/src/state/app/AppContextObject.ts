import { createContext } from 'react';

import type { HomeTab, ProfileDraft, SocialLoginResult, SocialProvider, TermsState } from '../../shared/types/app';

export interface AppContextValue {
  bootReady: boolean;
  token: string | null;
  signupToken: string | null;
  onboardingSeen: boolean;
  terms: TermsState;
  verificationComplete: boolean;
  profile: ProfileDraft;
  activeHomeTab: HomeTab;
  markOnboardingSeen: () => void;
  beginSocialLogin: (provider: SocialProvider) => Promise<SocialLoginResult>;
  setAllTerms: (checked: boolean) => void;
  toggleTerm: (key: keyof TermsState) => void;
  markVerificationComplete: () => void;
  updateProfile: (profile: Partial<ProfileDraft>) => void;
  finishSignup: (accessToken: string) => Promise<void>;
  setActiveHomeTab: (tab: HomeTab) => void;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
