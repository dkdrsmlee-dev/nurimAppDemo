export const BRIDGE_EVENT = {
  ready: 'ready',
  bootstrap: 'bootstrap',
  saveToken: 'saveToken',
  clearToken: 'clearToken',
  socialLoginRequested: 'socialLoginRequested',
  socialLoginResult: 'socialLoginResult',
  identityVerificationRequested: 'identityVerificationRequested',
} as const;

export type BridgeEventType = (typeof BRIDGE_EVENT)[keyof typeof BRIDGE_EVENT];
