export declare const SDK_ERROR_CODES: {
    readonly CONTAINER_NOT_FOUND: "CONTAINER_NOT_FOUND";
    readonly IFRAME_LOAD_FAILED: "IFRAME_LOAD_FAILED";
};
export type SdkErrorCode = typeof SDK_ERROR_CODES[keyof typeof SDK_ERROR_CODES];
export declare const SDK_ERROR_MESSAGES: Record<SdkErrorCode, string>;
export declare function createSdkError(code: SdkErrorCode): Error;
