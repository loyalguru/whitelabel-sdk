class EmbedLoyaltyApp {
  private iframe: HTMLIFrameElement | null = null;
  private origin: string = '';
  private token: string = '';
  private locale: string = 'en';

  init(config: {
    containerId: string;
    module: 'loyalty' | 'cdp' | 'coupons' | 'login';
    iframeOrigin: string;
    token: string;
    locale?: string;
    onLoad?: () => void;
    onError?: (e: Error) => void;
  }) {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error('Container not found');

    this.origin = config.iframeOrigin;
    this.token = config.token;
    this.locale = config.locale || 'en';

    Object.assign(container.style, {
      margin: '0',
      padding: '0',
      height: '100vh',
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
    });

    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100%;
        overflow: hidden;
        background: transparent;
      }
    `;
    document.head.appendChild(style);

    this.iframe = document.createElement('iframe');
    this.iframe.src = `${config.iframeOrigin}/${config.module}`;
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    this.iframe.setAttribute('scrolling', 'no');

    Object.assign(this.iframe.style, {
      border: 'none',
      width: '100%',
      height: '100vh',
      margin: '0',
      padding: '0',
      display: 'block',
      backgroundColor: 'transparent',
    });

    this.iframe.onload = () => {
      this.sendToken();
      config.onLoad?.();
    };

    this.iframe.onerror = () =>
      config.onError?.(new Error('Iframe failed to load'));

    container.innerHTML = '';
    container.appendChild(this.iframe);
  }

  private sendToken() {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(
        {
          type: 'AUTH_TOKEN',
          token: this.token,
          locale: this.locale
        },
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