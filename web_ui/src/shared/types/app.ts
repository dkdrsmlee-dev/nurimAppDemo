export type SocialProvider = 'kakao' | 'naver';

export type HomeTab = 'home' | 'news' | 'my' | 'benefit' | 'event';

export interface TermsState {
  age: boolean;
  service: boolean;
  privacy: boolean;
  marketing: boolean;
}

export interface ProfileDraft {
  name: string;
  provider: SocialProvider | null;
  providerLabel: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2: string;
  birthDate: string;
}

export interface NativeEvent<T = unknown> {
  type: string;
  payload?: T;
}

export interface BootstrapPayload {
  token: string | null;
}

export type SocialLoginNextStep = 'signup' | 'home';

export interface LoginConfig {
  idLogin: boolean;
  snsLogin: boolean;
  providers: Record<SocialProvider, boolean>;
}

export interface SocialLoginCallbackPayload {
  provider: SocialProvider;
  status: 'success' | 'error' | 'cancelled';
  callbackUrl?: string;
  message?: string;
  token?: string | null;
  isRegistered?: boolean;
  nextStep?: SocialLoginNextStep;
  params?: Record<string, string>;
  profile?: Partial<Pick<ProfileDraft, 'name' | 'providerLabel' | 'phone'>>;
}

export interface SocialLoginResult {
  nextStep: SocialLoginNextStep;
  token: string | null;
  callbackUrl?: string;
  params?: Record<string, string>;
  profile: Pick<ProfileDraft, 'name' | 'provider' | 'providerLabel' | 'phone'>;
}
