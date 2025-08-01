declare class EmbedLoyaltyApp {
    private iframe;
    private origin;
    private token;
    private locale;
    private onTokenRefreshRequest?;
    init(config: {
        containerId: string;
        module: 'loyalty' | 'cdp' | 'coupons' | 'login';
        iframeOrigin: string;
        token: string;
        locale?: string;
        onLoad?: () => void;
        onError?: (e: Error) => void;
    }): void;
    private sendToken;
    refreshToken(newToken: string): void;
    onTokenRefreshRequested(callback: () => void): void;
    destroy(): void;
}
declare const _default: EmbedLoyaltyApp;
export default _default;
