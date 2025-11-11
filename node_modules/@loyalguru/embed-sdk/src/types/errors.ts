// SDK internal codes
export const SDK_ERROR_CODES = {
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
} as const;

export type SdkErrorCode = typeof SDK_ERROR_CODES[keyof typeof SDK_ERROR_CODES];

//Messages english by default
export const SDK_ERROR_MESSAGES: Record<SdkErrorCode, string> = {
  [SDK_ERROR_CODES.CONTAINER_NOT_FOUND]: 'Container not found',
  [SDK_ERROR_CODES.IFRAME_LOAD_FAILED]: 'Iframe failed to load',
};

export function createSdkError(code: SdkErrorCode): Error {
  const msg = SDK_ERROR_MESSAGES[code] ?? 'Unexpected SDK error';
  const err = new Error(msg);
  (err as any).code = code;
  return err;
}
