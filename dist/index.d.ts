type EmbedModule = 'loyalty' | 'cdp' | 'coupons' | 'login';
type InitConfig = {
    containerId: string;
    module: EmbedModule;
    iframeOrigin: string;
    token: string;
    locale?: string;
    onLoad?: () => void;
    onError?: (e: Error) => void;
    onSize?: (payload: {
        height: number;
        width?: number;
        origin: string;
    }) => void;
    autoResize?: boolean;
};
declare class EmbedLoyaltyApp {
    private iframe;
    private origin;
    private token;
    private locale;
    private onTokenRefreshRequest?;
    private onSizeCb?;
    private autoResize;
    init(config: InitConfig): void;
    private sendToken;
    refreshToken(newToken: string): void;
    onTokenRefreshRequested(callback: () => void): void;
    onSizeRequested(callback: (payload: {
        height: number;
        width?: number;
        origin: string;
    }) => void): void;
    destroy(): void;
}
declare const _default: EmbedLoyaltyApp;
export default _default;
