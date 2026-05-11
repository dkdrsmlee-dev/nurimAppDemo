import { buildApiUrl } from '../config/api';
import type { LoginConfig, SocialProvider } from '../types/app';
import {
  ensureEnvelopeSuccess,
  extractEnvelopeMessage,
  type ApiEnvelope,
} from './apiEnvelope';

type RawLoginConfig = {
  idLogin?: unknown;
  snsLogin?: unknown;
  providers?: Record<string, unknown>;
};

const providerKeys: SocialProvider[] = ['kakao', 'naver'];
function parseLoginConfig(payload: unknown): LoginConfig {
  if (!payload || typeof payload !== 'object') {
    throw new Error('로그인 설정 응답 형식이 올바르지 않습니다.');
  }

  const envelope = payload as ApiEnvelope<RawLoginConfig>;
  ensureEnvelopeSuccess(envelope, '로그인 설정을 불러오지 못했습니다.');

  const data = envelope.data;
  if (!data || typeof data !== 'object') {
    throw new Error('로그인 설정 응답 형식이 올바르지 않습니다.');
  }

  const rawProviders = data.providers ?? {};
  const providers = providerKeys.reduce<Record<SocialProvider, boolean>>((accumulator, provider) => {
    accumulator[provider] = Boolean(rawProviders[provider]);
    return accumulator;
  }, { kakao: false, naver: false });

  return {
    idLogin: Boolean(data.idLogin),
    snsLogin: Boolean(data.snsLogin),
    providers,
  };
}

export async function fetchLoginConfig() {
  const response = await fetch(buildApiUrl('/api/v1/auth/config'), {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(extractEnvelopeMessage(payload, '로그인 설정을 불러오지 못했습니다.'));
  }

  return parseLoginConfig(payload);
}
