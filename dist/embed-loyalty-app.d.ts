import { InitConfig, OnSizePayload } from './types/types';
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
    init(config: InitConfig): void;
    private handleMessage;
    private applyAutoResize;
    private sendToken;
    refreshToken(newToken: string): void;
    onTokenRefreshRequested(callback: () => void): void;
    onSizeRequested(callback: (payload: OnSizePayload) => void): void;
    destroy(): void;
}
export declare const embedLoyaltyApp: EmbedLoyaltyApp;
export {};
