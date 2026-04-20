import type {
  BootstrapPayload,
  NativeEvent,
  SocialLoginCallbackPayload,
  SocialLoginResult,
  SocialProvider,
} from '../shared/types/app';

import { socialLoginProfiles } from './mockBridgeData';

declare global {
  interface Window {
    NurimBridge?: {
      postMessage: (message: string) => void;
    };
  }
}

const tokenStorageKey = 'nurim.demo.token';

const hasNativeBridge = () =>
  typeof window !== 'undefined' &&
  typeof window.NurimBridge?.postMessage === 'function';

const readStoredToken = () => {
  try {
    return window.localStorage.getItem(tokenStorageKey);
  } catch {
    return null;
  }
};

const writeStoredToken = (token: string | null) => {
  try {
    if (token) {
      window.localStorage.setItem(tokenStorageKey, token);
      return;
    }

    window.localStorage.removeItem(tokenStorageKey);
  } catch {
    return;
  }
};

const postMessage = (message: NativeEvent) => {
  if (!hasNativeBridge()) {
    return;
  }

  window.NurimBridge?.postMessage(JSON.stringify(message));
};

const emitNativeEvent = <T,>(event: NativeEvent<T>) => {
  window.dispatchEvent(new CustomEvent<NativeEvent<T>>('nurim-native', { detail: event }));
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const tokenKeys = ['token', 'accessToken', 'jwt', 'jwtToken'] as const;
const registrationKeys = ['isRegistered', 'registered', 'signupCompleted', 'memberExists'] as const;

const readBooleanFlag = (params: Record<string, string>, keys: readonly string[]) => {
  for (const key of keys) {
    const rawValue = params[key];
    if (rawValue == null) {
      continue;
    }

    const normalized = rawValue.trim().toLowerCase();
    if (['true', '1', 'y', 'yes'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'n', 'no'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const readFirstValue = (params: Record<string, string>, keys: readonly string[]) => {
  for (const key of keys) {
    const rawValue = params[key];
    if (rawValue != null && rawValue.trim() !== '') {
      return rawValue.trim();
    }
  }

  return null;
};

const waitForSocialLoginResult = (provider: SocialProvider) =>
  new Promise<SocialLoginCallbackPayload>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('로그인 응답 시간이 초과되었습니다.'));
    }, 180000);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('nurim-native', handler as EventListener);
    };

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<NativeEvent<SocialLoginCallbackPayload>>).detail;
      if (detail.type !== 'socialLoginResult') {
        return;
      }

      const payload = detail.payload;
      if (!payload || payload.provider !== provider) {
        return;
      }

      cleanup();

      if (payload.status === 'cancelled') {
        reject(new Error(payload.message ?? '로그인이 취소되었습니다.'));
        return;
      }

      if (payload.status === 'error') {
        reject(new Error(payload.message ?? '로그인에 실패했습니다.'));
        return;
      }

      resolve(payload);
    };

    window.addEventListener('nurim-native', handler as EventListener);
  });

const createFallbackSocialLoginResult = async (provider: SocialProvider): Promise<SocialLoginResult> => {
  await wait(500);

  return {
    nextStep: 'signup',
    token: null,
    profile: {
      provider,
      ...socialLoginProfiles[provider],
    },
  };
};

const buildSocialLoginResult = (
  provider: SocialProvider,
  payload: SocialLoginCallbackPayload,
): SocialLoginResult => {
  const params = payload.params ?? {};
  const token = payload.token ?? readFirstValue(params, tokenKeys);
  const isRegistered = payload.isRegistered ?? readBooleanFlag(params, registrationKeys);
  const nextStep =
    payload.nextStep ?? (token && isRegistered === true ? 'home' : 'signup');

  return {
    nextStep,
    token: token ?? null,
    callbackUrl: payload.callbackUrl,
    params,
    profile: {
      provider,
      name: payload.profile?.name ?? params.name ?? socialLoginProfiles[provider].name,
      providerLabel: payload.profile?.providerLabel ?? params.providerLabel ?? socialLoginProfiles[provider].providerLabel,
      phone: payload.profile?.phone ?? params.phone ?? params.mobile ?? socialLoginProfiles[provider].phone,
    },
  };
};

export const nativeBridge = {
  subscribe(listener: (event: NativeEvent) => void) {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<NativeEvent>).detail;
      listener(detail);
    };

    window.addEventListener('nurim-native', handler as EventListener);

    return () => {
      window.removeEventListener('nurim-native', handler as EventListener);
    };
  },

  ready() {
    postMessage({ type: 'ready' });

    if (!hasNativeBridge()) {
      window.setTimeout(() => {
        emitNativeEvent<BootstrapPayload>({
          type: 'bootstrap',
          payload: { token: readStoredToken() },
        });
      }, 180);
    }
  },

  async saveToken(token: string) {
    writeStoredToken(token);
    postMessage({ type: 'saveToken', payload: { token } });
  },

  async clearToken() {
    writeStoredToken(null);
    postMessage({ type: 'clearToken' });
  },

  async startSocialLogin(
    provider: SocialProvider,
  ): Promise<SocialLoginResult> {
    if (!hasNativeBridge()) {
      return createFallbackSocialLoginResult(provider);
    }

    postMessage({ type: 'socialLoginRequested', payload: { provider } });
    const payload = await waitForSocialLoginResult(provider);

    return buildSocialLoginResult(provider, payload);
  },

  async startIdentityVerification() {
    postMessage({ type: 'identityVerificationRequested' });
    await wait(700);

    return {
      passed: true,
      verifiedAt: new Date().toISOString(),
    };
  },
};
