type EmbedModule = 'loyalty' | 'cdp' | 'coupons' | 'login';

type SizeMessage = {
  type: 'SIZE';
  height: number;
  width?: number;
};

type InitConfig = {
  containerId: string;
  module: EmbedModule;
  iframeOrigin: string;
  token: string;
  locale?: string;
  onLoad?: () => void;
  onError?: (e: Error) => void;
  onSize?: (payload: { height: number; width?: number; origin: string }) => void;
  autoResize?: boolean;
};

class EmbedLoyaltyApp {
  private iframe: HTMLIFrameElement | null = null;
  private origin = '';
  private token = '';
  private locale = 'en';
  private onTokenRefreshRequest?: () => void;
  private onSizeCb?: (payload: { height: number; width?: number; origin: string }) => void;
  private autoResize = false;

  init(config: InitConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error('Container not found');

    (window as any).dataLayer = (window as any).dataLayer || [];
    this.origin = config.iframeOrigin;
    this.token = config.token;
    this.locale = config.locale || 'en';
    this.autoResize = !!config.autoResize;

    if (typeof config.onSize === 'function') {
      this.onSizeCb = config.onSize;
    }

    //Iframe creation
    this.iframe = document.createElement('iframe');
    this.iframe.src = `${config.iframeOrigin}/${config.module}`;
    this.iframe.setAttribute(
      'sandbox',
      [
        'allow-scripts',
        'allow-same-origin',
        'allow-popups',
        'allow-popups-to-escape-sandbox'
      ].join(' ')
    );
    this.iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
    this.iframe.setAttribute('scrolling', 'no');

    //Iframe sytles
    Object.assign(this.iframe.style, {
      border: 'none',
      width: '100%',
      height: this.autoResize ? '0px' : '100vh',
      margin: '0',
      padding: '0',
      display: 'block',
      backgroundColor: 'transparent',
      overflow: 'hidden', 
      transition: 'height 0.25s ease',
      'max-height': '100vh'
    });

    this.iframe.onload = () => {
      this.sendToken();
      config.onLoad?.();
    };

    this.iframe.onerror = () =>
      config.onError?.(new Error('Iframe failed to load'));

    // Listeners: messages coming from iframe
    window.addEventListener('message', (event) => {
      //if (event.origin !== this.origin) return;
      const data = event.data as any;

      if (data?.type === 'REQUEST_NEW_TOKEN') {
        this.onTokenRefreshRequest?.();
      }
      if (data?.type === 'LG_DATALAYER_EVENT' && data?.payload) {//GTM 
        (window as any).dataLayer.push(data.payload);
      }
      if (data?.type === 'SIZE') {
        const msg = data as SizeMessage;
        const height = Number(msg.height) || 0;
        const width = Number(msg.width) || undefined;

        if (this.autoResize && this.iframe) {
          const current = parseFloat(this.iframe.style.height) || 0;
          if (Math.abs(current - height) > 1) {
            this.iframe.style.height = `${height}px`;
          }
        }

        this.onSizeCb?.({ height, width, origin: event.origin });
      }
    });

    container.innerHTML = '';
    container.appendChild(this.iframe);
  }

  private sendToken() {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(
        {
          type: 'AUTH_TOKEN',
          token: this.token,
          locale: this.locale,
        },
        this.origin
      );
    }
  }

  refreshToken(newToken: string) {
    this.token = newToken;
    this.sendToken();
  }

  onTokenRefreshRequested(callback: () => void) {
    this.onTokenRefreshRequest = callback;
  }

  onSizeRequested(
    callback: (payload: { height: number; width?: number; origin: string }) => void
  ) {
    this.onSizeCb = callback;
  }

  destroy() {
    this.iframe?.remove();
    this.iframe = null;
  }
}

export default new EmbedLoyaltyApp();
