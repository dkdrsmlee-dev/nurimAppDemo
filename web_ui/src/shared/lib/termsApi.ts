import { buildApiUrl } from '../config/api';
import type { ActiveTerm, TermAgreement, TermsCategory } from '../types/content';

type ApiEnvelope<T> = {
  code?: string;
  msg?: string;
  message?: string;
  data?: T;
};

const successCode = 'COMMON.SUCCESS';

function normalizeTerm(raw: Record<string, unknown>): ActiveTerm {
  return {
    termsId: String(raw.termsId ?? ''),
    termsKey: String(raw.termsKey ?? ''),
    termsNm: String(raw.termsNm ?? ''),
    content: String(raw.content ?? ''),
    termsCategory: String(raw.termsCategory ?? 'ETC') as TermsCategory,
    requiredType: String(raw.requiredType ?? ''),
    sortNo: Number(raw.sortNo ?? 0),
    status: String(raw.status ?? ''),
  };
}

function normalizeTerms(rawTerms: unknown[]) {
  return rawTerms
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeTerm)
    .sort((left, right) => left.sortNo - right.sortNo);
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
    const nestedMessage = (nestedData as { msg?: unknown; message?: unknown }).msg ?? (nestedData as { msg?: unknown; message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage.trim();
    }
  }

  return fallback;
}

function ensureSuccessCode(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return;
  }

  const code = (payload as ApiEnvelope<unknown>).code;
  if (code && code !== successCode) {
    throw new Error(extractErrorMessage(payload, fallback));
  }
}

function parseTermsPayload(payload: unknown, categories: TermsCategory[]): ActiveTerm[] {
  if (Array.isArray(payload)) {
    return normalizeTerms(payload);
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('약관 목록 응답 형식이 올바르지 않습니다.');
  }

  const data = (payload as ApiEnvelope<unknown>).data;
  if (Array.isArray(data)) {
    return normalizeTerms(data);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('약관 목록 응답 형식이 올바르지 않습니다.');
  }

  const groupedTerms = data as Record<string, unknown>;
  const orderedCategories = categories.length
    ? categories
    : Object.keys(groupedTerms).filter((category): category is TermsCategory =>
        ['SIGNUP', 'SECURITY', 'MARKETING', 'ETC'].includes(category),
      );

  return orderedCategories.flatMap((category) => {
    const rawTerms = groupedTerms[category];
    return Array.isArray(rawTerms) ? normalizeTerms(rawTerms) : [];
  });
}

export async function fetchActiveTerms(categories: TermsCategory[] = []) {
  const queryString = categories.length
    ? `?categories=${encodeURIComponent(categories.join(','))}`
    : '';

  const response = await fetch(buildApiUrl(`/api/v1/terms${queryString}`), {
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, '약관 목록을 불러오지 못했습니다.'));
  }

  ensureSuccessCode(payload, '약관 목록을 불러오지 못했습니다.');
  return parseTermsPayload(payload, categories);
}

export async function submitSignupTerms(signupToken: string, agreements: TermAgreement[]) {
  const response = await fetch(buildApiUrl('/api/v1/auth/signup/terms'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${signupToken}`,
    },
    body: JSON.stringify({
      terms: agreements,
    }),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, '약관 동의 저장에 실패했습니다.'));
  }

  ensureSuccessCode(payload, '약관 동의 저장에 실패했습니다.');
  return payload;
}
