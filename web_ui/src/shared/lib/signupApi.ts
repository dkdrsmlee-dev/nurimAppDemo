import { buildApiUrl } from '../config/api';
import {
  ensureEnvelopeSuccess,
  extractEnvelopeMessage,
  type ApiEnvelope,
  unwrapEnvelopeData,
} from './apiEnvelope';

type SignupProfilePayload = {
  nextStep?: string;
};

type VerifyPhonePayload = {
  nextStep?: string;
};

type SignupProfileInitPayload = {
  name?: string | null;
  phoneNumber?: string | null;
  provider?: string | null;
};

type CompleteSignupPayload = {
  nextStep?: string;
  accessToken?: string;
  refreshToken?: string;
};

async function requestSignupJson<T>(
  path: string,
  signupToken: string,
  init: RequestInit,
  fallbackMessage: string,
) {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${signupToken}`,
      ...(init.headers ?? {}),
    },
  });

  const responsePayload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok) {
    throw new Error(extractEnvelopeMessage(responsePayload, fallbackMessage));
  }

  ensureEnvelopeSuccess(responsePayload, fallbackMessage);

  return unwrapEnvelopeData(responsePayload);
}

export function verifySignupPhone(signupToken: string) {
  return requestSignupJson<VerifyPhonePayload>(
    '/api/v1/auth/signup/verify-phone',
    signupToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    },
    '휴대폰 인증 처리에 실패했습니다.',
  );
}

export function fetchSignupProfileInit(signupToken: string) {
  return requestSignupJson<SignupProfileInitPayload>(
    '/api/v1/auth/signup/profile-init',
    signupToken,
    {
      method: 'GET',
    },
    '회원 초기 정보를 불러오지 못했습니다.',
  );
}

export async function submitSignupProfile(
  signupToken: string,
  payload: {
    zipCode: string;
    address1: string;
    address2: string;
    birthDate: string;
  },
) {
  return requestSignupJson<SignupProfilePayload>(
    '/api/v1/auth/signup/profile',
    signupToken,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
    '회원정보 저장에 실패했습니다.',
  );
}

export function completeSignup(signupToken: string) {
  return requestSignupJson<CompleteSignupPayload>(
    '/api/v1/auth/signup/complete',
    signupToken,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    },
    '회원가입 완료 처리에 실패했습니다.',
  );
}
