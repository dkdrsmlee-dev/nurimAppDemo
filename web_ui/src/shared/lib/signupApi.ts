import { buildApiUrl } from '../config/api';

type ApiEnvelope<T> = {
  code?: string;
  msg?: string;
  message?: string;
  data?: T;
};

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

const successCode = 'COMMON.SUCCESS';

function unwrapResponseData<T>(payload: ApiEnvelope<T>) {
  if (payload.data !== undefined) {
    return payload.data;
  }

  const envelopeKeys = ['code', 'msg', 'message', 'data'];
  const payloadKeys = Object.keys(payload);
  const hasOnlyEnvelopeKeys = payloadKeys.every((key) => envelopeKeys.includes(key));

  if (!hasOnlyEnvelopeKeys && payloadKeys.length > 0) {
    return payload as T;
  }

  return {} as T;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const message = (payload as ApiEnvelope<unknown>).msg ?? (payload as ApiEnvelope<unknown>).message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  const nestedData = (payload as ApiEnvelope<unknown>).data;
  if (nestedData && typeof nestedData === 'object') {
    const nestedMessage =
      (nestedData as { msg?: unknown; message?: unknown }).msg ??
      (nestedData as { msg?: unknown; message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage.trim();
    }
  }

  return fallback;
}

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
    throw new Error(extractErrorMessage(responsePayload, fallbackMessage));
  }

  if (responsePayload.code && responsePayload.code !== successCode) {
    throw new Error(extractErrorMessage(responsePayload, fallbackMessage));
  }

  return unwrapResponseData(responsePayload);
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
