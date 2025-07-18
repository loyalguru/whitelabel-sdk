class EmbedLoyaltyApp {
  private iframe: HTMLIFrameElement | null = null;
  private origin: string = '';
  private token: string = '';

  init(config: {
    containerId: string;
    module: 'loyalty' | 'cdp' | 'coupons';
    iframeOrigin: string;
    token: string;
    height?: string;
    onLoad?: () => void;
    onError?: (e: Error) => void;
  }) {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error('Container not found');

    this.origin = config.iframeOrigin;
    this.token = config.token;

    this.iframe = document.createElement('iframe');
    this.iframe.src = `${config.iframeOrigin}/${config.module}`;
    this.iframe.width = '100%';
    this.iframe.height = config.height || '600';
    this.iframe.sandbox = 'allow-scripts allow-same-origin';
    this.iframe.onload = () => {
      this.sendToken();
      config.onLoad?.();
    };
    this.iframe.onerror = () => config.onError?.(new Error('Iframe failed to load'));
    container.innerHTML = '';
    container.appendChild(this.iframe);
  }

  private sendToken() {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(
        { type: 'AUTH_TOKEN', token: this.token },
        this.origin
      );
    }
  }

  refreshToken(newToken: string) {
    this.token = newToken;
    this.sendToken();
  }

  destroy() {
    this.iframe?.remove();
    this.iframe = null;
  }
}

export default new EmbedLoyaltyApp();