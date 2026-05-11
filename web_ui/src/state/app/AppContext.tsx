import { useEffect, useState, type PropsWithChildren } from 'react';

import { BRIDGE_EVENT } from '../../bridge/eventTypes';
import { nativeBridge } from '../../bridge/nativeBridge';
import type { BootstrapPayload, HomeTab, ProfileDraft, TermsState } from '../../shared/types/app';
import { AppContext, type AppContextValue } from './AppContextObject';

const onboardingStorageKey = 'nurim.demo.onboardingSeen';
const signupTokenStorageKey = 'nurim.demo.signupToken';

const readOnboardingSeen = () => {
  try {
    return window.localStorage.getItem(onboardingStorageKey) === 'true';
  } catch {
    return false;
  }
};

const readSignupToken = () => {
  try {
    return window.localStorage.getItem(signupTokenStorageKey);
  } catch {
    return null;
  }
};

const writeSignupToken = (token: string | null) => {
  try {
    if (token) {
      window.localStorage.setItem(signupTokenStorageKey, token);
      return;
    }

    window.localStorage.removeItem(signupTokenStorageKey);
  } catch {
    return;
  }
};

const writeOnboardingSeen = (value: boolean) => {
  try {
    window.localStorage.setItem(onboardingStorageKey, String(value));
  } catch {
    return;
  }
};

const defaultTerms: TermsState = {
  age: false,
  service: false,
  privacy: false,
  marketing: false,
};

const defaultProfile: ProfileDraft = {
  name: '',
  provider: null,
  providerLabel: '',
  phone: '',
  zipCode: '',
  address1: '',
  address2: '',
  birthDate: '',
};

export function AppProvider({ children }: PropsWithChildren) {
  const [bootReady, setBootReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [pendingSignupToken, setPendingSignupToken] = useState<string | null>(readSignupToken);
  const [onboardingSeen, setOnboardingSeen] = useState(readOnboardingSeen);
  const [terms, setTerms] = useState<TermsState>(defaultTerms);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfile);
  const [activeHomeTab, setActiveHomeTab] = useState<HomeTab>('home');

  useEffect(() => {
    const unsubscribe = nativeBridge.subscribe((event) => {
      if (event.type !== BRIDGE_EVENT.bootstrap) {
        return;
      }

      const payload = (event.payload ?? {}) as BootstrapPayload;
      setToken(payload.token ?? null);
      setBootReady(true);
    });

    nativeBridge.ready();

    return unsubscribe;
  }, []);

  const markOnboardingSeen = () => {
    writeOnboardingSeen(true);
    setOnboardingSeen(true);
  };

  const beginSocialLogin: AppContextValue['beginSocialLogin'] = async (provider) => {
    const socialLoginResult = await nativeBridge.startSocialLogin(provider);
    setTerms(defaultTerms);
    setVerificationComplete(false);
    const nextSignupToken =
      socialLoginResult.nextStep === 'signup' && socialLoginResult.token
        ? socialLoginResult.token
        : null;
    setPendingSignupToken(nextSignupToken);
    writeSignupToken(nextSignupToken);
    setProfile({
      ...defaultProfile,
      ...socialLoginResult.profile,
    });
    if (socialLoginResult.nextStep === 'home' && socialLoginResult.token) {
      await nativeBridge.saveToken(socialLoginResult.token);
      setToken(socialLoginResult.token);
      setActiveHomeTab('home');
      writeSignupToken(null);
    }
    return socialLoginResult;
  };

  const setAllTerms = (checked: boolean) => {
    setTerms({
      age: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const toggleTerm = (key: keyof TermsState) => {
    setTerms((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const markVerificationComplete = () => {
    setVerificationComplete(true);
  };

  const updateProfile = (nextProfile: Partial<ProfileDraft>) => {
    setProfile((current) => ({
      ...current,
      ...nextProfile,
    }));
  };

  const finishSignup = async (accessToken: string) => {
    await nativeBridge.saveToken(accessToken);
    setToken(accessToken);
    setPendingSignupToken(null);
    writeSignupToken(null);
    setTerms(defaultTerms);
    setVerificationComplete(false);
    setActiveHomeTab('home');
  };

  const logout = async () => {
    await nativeBridge.clearToken();
    setToken(null);
    setPendingSignupToken(null);
    writeSignupToken(null);
    setTerms(defaultTerms);
    setVerificationComplete(false);
    setProfile(defaultProfile);
    setActiveHomeTab('home');
  };

  return (
    <AppContext.Provider
      value={{
        bootReady,
        token,
        signupToken: pendingSignupToken,
        onboardingSeen,
        terms,
        verificationComplete,
        profile,
        activeHomeTab,
        markOnboardingSeen,
        beginSocialLogin,
        setAllTerms,
        toggleTerm,
        markVerificationComplete,
        updateProfile,
        finishSignup,
        setActiveHomeTab,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
