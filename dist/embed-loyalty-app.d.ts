import { InitConfig, OnSizePayload, OnDataPayload, OnTrackingPayload } from './types/types';
declare class EmbedLoyaltyApp {
    private iframe;
    private origin;
    private token;
    private locale;
    private module;
    private onTokenRefreshRequest?;
    private onSizeCb?;
    private autoResize;
    private onServerErrorCb?;
    private onErrorCb?;
    private onDataCb?;
    private onTrackingCb?;
    private gtmEnabled;
    init(config: InitConfig): void;
    private handleMessage;
    private applyAutoResize;
    private sendToken;
    refreshToken(newToken: string): void;
    onTokenRefreshRequested(callback: () => void): void;
    onSizeRequested(callback: (payload: OnSizePayload) => void): void;
    onDataRequested(callback: (payload: OnDataPayload) => void): void;
    onTrackingRequested(callback: (payload: OnTrackingPayload) => void): void;
    destroy(): void;
}
export declare const embedLoyaltyApp: EmbedLoyaltyApp;
export {};
