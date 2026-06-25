import {
  InitConfig,
  IncomingMessage,
  SizeMessage,
  OnSizePayload,
  OutgoingMessage,
  ServerErrorPayload,
  OnDataPayload,
  OnTrackingPayload,
} from './types/types';
import {
  MSG_REQUEST_NEW_TOKEN,
  MSG_DATALAYER_EVENT,
  MSG_SIZE,
  MSG_AUTH_TOKEN,
  MSG_SERVER_ERRORS,
  MSG_DATA,
} from './types/messages-types';

import { createSdkError, SDK_ERROR_CODES } from './types/errors';
import { createIframe } from './iframe/iframe-factory';

class EmbedLoyaltyApp {
  private iframe: HTMLIFrameElement | null = null;
  private origin = '';
  private token = '';
  private locale = 'en';
  private module = '';
  private onTokenRefreshRequest?: () => void;
  private onSizeCb?: (payload: OnSizePayload) => void;
  private autoResize = false;
  private onServerErrorCb?: (payload: ServerErrorPayload) => void;
  private onErrorCb?: (e: Error) => void;
  private onDataCb?: (payload: OnDataPayload) => void;
  private onTrackingCb?: (payload: OnTrackingPayload) => void;
  private gtmEnabled = true;

  init(config: InitConfig) {
    const container = document.getElementById(config.containerId);
    if (!container) throw createSdkError(SDK_ERROR_CODES.CONTAINER_NOT_FOUND);

    this.origin = config.iframeOrigin;
    this.token = config.token;
    this.locale = config.locale || 'en';
    this.module = config.module ?? '';
    this.autoResize = !!config.autoResize;
    this.gtmEnabled = config.gtmEnabled !== false;

    if (this.gtmEnabled) {
      (window as any).dataLayer = (window as any).dataLayer || [];
    }

    if (typeof config.onSize === 'function') {
      this.onSizeCb = config.onSize;
    }

    if (typeof config.onTokenRefresh=== 'function') {
      this.onTokenRefreshRequest = config.onTokenRefresh;
    }

    if (typeof config.onServerError === 'function') {
      this.onServerErrorCb = config.onServerError;
    }

    if (typeof config.onError === 'function') {
      this.onErrorCb = config.onError;
    }

    if (typeof config.onData === 'function') {
      this.onDataCb = config.onData;
    }

    if (typeof config.onTracking === 'function') {
      this.onTrackingCb = config.onTracking;
    }

    const iframe = createIframe(config, this.autoResize);

    iframe.onload = () => {
      this.sendToken();
      config.onLoad?.();
    };

    iframe.onerror = () => {
      this.onErrorCb?.(createSdkError(SDK_ERROR_CODES.IFRAME_LOAD_FAILED));
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
        const payload = data.payload;

        if (this.gtmEnabled) {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push(payload);
        }

        this.onTrackingCb?.({ payload, origin: event.origin });
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

      case MSG_SERVER_ERRORS: {
        if (this.onServerErrorCb) {
          this.onServerErrorCb(data.payload);
        } else if (this.onErrorCb) {
          const err = new Error(
            `Server error ${data.payload.status}: ${data.payload.message}`
          );
          this.onErrorCb(err);
        }
        break;
      }

      case MSG_DATA: {
        const payload = (data as any).payload;
        this.onDataCb?.({ payload, origin: event.origin });
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
      module: this.module
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

  onDataRequested(callback: (payload: OnDataPayload) => void) {
    this.onDataCb = callback;
  }

  onTrackingRequested(callback: (payload: OnTrackingPayload) => void) {
    this.onTrackingCb = callback;
  }

  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.iframe?.remove();
    this.iframe = null;
  }
}

export const embedLoyaltyApp = new EmbedLoyaltyApp();
