import {
  InitConfig,
  IncomingMessage,
  SizeMessage,
  OnSizePayload,
  OutgoingMessage,
} from './types/types';
import {
  MSG_REQUEST_NEW_TOKEN,
  MSG_DATALAYER_EVENT,
  MSG_SIZE,
  MSG_AUTH_TOKEN,
} from './types/messages-types';

import { createSdkError, SDK_ERROR_CODES } from './types/errors';
import { createIframe } from './iframe/iframe-factory';

class EmbedLoyaltyApp {
  private iframe: HTMLIFrameElement | null = null;
  private origin = '';
  private token = '';
  private locale = 'en';
  private onTokenRefreshRequest?: () => void;
  private onSizeCb?: (payload: OnSizePayload) => void;
  private autoResize = false;

  init(config: InitConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) throw createSdkError(SDK_ERROR_CODES.CONTAINER_NOT_FOUND);

    (window as any).dataLayer = (window as any).dataLayer || [];

    this.origin = config.iframeOrigin;
    this.token = config.token;
    this.locale = config.locale || 'en';
    this.autoResize = !!config.autoResize;

    if (typeof config.onSize === 'function') {
      this.onSizeCb = config.onSize;
    }

    const iframe = createIframe(config, this.autoResize);

    iframe.onload = () => {
      this.sendToken();
      config.onLoad?.();
    };

    iframe.onerror = () => {
      config.onError?.(createSdkError(SDK_ERROR_CODES.IFRAME_LOAD_FAILED));
    };

    window.addEventListener('message', this.handleMessage);

    container.innerHTML = '';
    container.appendChild(iframe);
    this.iframe = iframe;
  }

  private handleMessage = (event: MessageEvent<IncomingMessage>) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    // if (event.origin !== this.origin) return; // Activate to validate origin

    switch (data.type) {
      case MSG_REQUEST_NEW_TOKEN: {
        this.onTokenRefreshRequest?.();
        break;
      }

      case MSG_DATALAYER_EVENT: {
        (window as any).dataLayer.push(data.payload);
        break;
      }

      case MSG_SIZE: {
        const msg: SizeMessage = data;
        const height = Number(msg.height) || 0;
        const width = Number(msg.width) || undefined;
        this.applyAutoResize(height);
        this.onSizeCb?.({ height, width, origin: event.origin });
        break;
      }
    }
  };

  private applyAutoResize(nextHeight: number) {
    if (!this.autoResize || !this.iframe) return;
    const current = parseFloat(this.iframe.style.height) || 0;
    if (Math.abs(current - nextHeight) > 1) {
      this.iframe.style.height = `${nextHeight}px`;
    }
  }

  private sendToken() {
    if (!this.iframe?.contentWindow) return;

    const message: OutgoingMessage = {
      type: MSG_AUTH_TOKEN,
      token: this.token,
      locale: this.locale,
    };

    this.iframe.contentWindow.postMessage(message, this.origin);
  }

  refreshToken(newToken: string) {
    this.token = newToken;
    this.sendToken();
  }

  onTokenRefreshRequested(callback: () => void) {
    this.onTokenRefreshRequest = callback;
  }

  onSizeRequested(callback: (payload: OnSizePayload) => void) {
    this.onSizeCb = callback;
  }

  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.iframe?.remove();
    this.iframe = null;
  }
}

export const embedLoyaltyApp = new EmbedLoyaltyApp();
