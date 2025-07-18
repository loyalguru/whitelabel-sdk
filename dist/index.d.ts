declare class EmbedLoyaltyApp {
    private iframe;
    private origin;
    private token;
    init(config: {
        containerId: string;
        module: 'loyalty' | 'cdp' | 'coupons';
        iframeOrigin: string;
        token: string;
        height?: string;
        onLoad?: () => void;
        onError?: (e: Error) => void;
    }): void;
    private sendToken;
    refreshToken(newToken: string): void;
    destroy(): void;
}
declare const _default: EmbedLoyaltyApp;
export default _default;
