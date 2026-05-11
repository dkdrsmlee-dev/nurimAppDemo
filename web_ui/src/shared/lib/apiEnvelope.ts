type ApiEnvelope<T> = {
  code?: string;
  msg?: string;
  message?: string;
  data?: T;
};

const defaultSuccessCode = 'COMMON.SUCCESS';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function extractEnvelopeMessage(payload: unknown, fallback: string) {
  if (!isObject(payload)) {
    return fallback;
  }

  const message = (payload as ApiEnvelope<unknown>).msg ?? (payload as ApiEnvelope<unknown>).message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  const nestedData = (payload as ApiEnvelope<unknown>).data;
  if (isObject(nestedData)) {
    const nestedMessage =
      (nestedData as { msg?: unknown; message?: unknown }).msg ??
      (nestedData as { msg?: unknown; message?: unknown }).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage.trim();
    }
  }

  return fallback;
}

export function ensureEnvelopeSuccess(
  payload: unknown,
  fallback: string,
  successCode = defaultSuccessCode,
) {
  if (!isObject(payload)) {
    return;
  }

  const code = (payload as ApiEnvelope<unknown>).code;
  if (code && code !== successCode) {
    throw new Error(extractEnvelopeMessage(payload, fallback));
  }
}

export function unwrapEnvelopeData<T>(payload: ApiEnvelope<T>) {
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

export type { ApiEnvelope };
