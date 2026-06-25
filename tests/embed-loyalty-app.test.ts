import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MSG_DATALAYER_EVENT, MSG_DATA } from '../src/types/messages-types';

const IFRAME_ORIGIN = 'https://iframe.example';

type EmbedLoyaltyApp = typeof import('../src/embed-loyalty-app')['embedLoyaltyApp'];

const createContainer = () => {
  document.body.innerHTML = '<div id="loyalty-container"></div>';
};

const loadSdk = async (): Promise<EmbedLoyaltyApp> => {
  vi.resetModules();
  const { embedLoyaltyApp } = await import('../src/embed-loyalty-app');
  return embedLoyaltyApp;
};

const initSdk = (app: EmbedLoyaltyApp, config = {}) => {
  app.init({
    containerId: 'loyalty-container',
    module: '',
    iframeOrigin: IFRAME_ORIGIN,
    token: 'test-token',
    locale: 'es',
    ...config,
  });
};

const sendMessage = (type: string, payload: unknown, origin = IFRAME_ORIGIN) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { type, payload },
      origin,
    })
  );
};

describe('EmbedLoyaltyApp tracking events', () => {
  let app: EmbedLoyaltyApp;

  beforeEach(async () => {
    createContainer();
    delete (window as any).dataLayer;
    app = await loadSdk();
  });

  afterEach(() => {
    app.destroy();
    document.body.innerHTML = '';
    delete (window as any).dataLayer;
    vi.restoreAllMocks();
  });

  it('pushes tracking events to dataLayer by default', () => {
    initSdk(app);
    const payload = { event: 'lg_view' };

    sendMessage(MSG_DATALAYER_EVENT, payload);

    expect((window as any).dataLayer).toEqual([payload]);
  });

  it('pushes tracking events and calls onTracking when gtmEnabled is true', () => {
    const onTracking = vi.fn();
    initSdk(app, { gtmEnabled: true, onTracking });
    const payload = { event: 'lg_purchase', value: 12 };

    sendMessage(MSG_DATALAYER_EVENT, payload);

    expect((window as any).dataLayer).toEqual([payload]);
    expect(onTracking).toHaveBeenCalledWith({ payload, origin: IFRAME_ORIGIN });
  });

  it('does not initialize or push to dataLayer when gtmEnabled is false but still calls onTracking', () => {
    const onTracking = vi.fn();
    initSdk(app, { gtmEnabled: false, onTracking });
    const payload = { event: 'lg_no_gtm' };

    sendMessage(MSG_DATALAYER_EVENT, payload);

    expect((window as any).dataLayer).toBeUndefined();
    expect(onTracking).toHaveBeenCalledWith({ payload, origin: IFRAME_ORIGIN });
  });

  it('does not throw without onTracking and still pushes to GTM when enabled', () => {
    initSdk(app, { gtmEnabled: true });
    const payload = { event: 'lg_without_callback' };

    expect(() => sendMessage(MSG_DATALAYER_EVENT, payload)).not.toThrow();
    expect((window as any).dataLayer).toEqual([payload]);
  });

  it('does not call onData for tracking events', () => {
    const onData = vi.fn();
    const onTracking = vi.fn();
    initSdk(app, { onData, onTracking });

    sendMessage(MSG_DATALAYER_EVENT, { event: 'lg_tracking' });
    sendMessage(MSG_DATA, { value: 'host-data' });

    expect(onTracking).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledTimes(1);
    expect(onData).toHaveBeenCalledWith({
      payload: { value: 'host-data' },
      origin: IFRAME_ORIGIN,
    });
  });

  it('registers tracking callbacks through onTrackingRequested', () => {
    const initOnTracking = vi.fn();
    const requestedOnTracking = vi.fn();
    initSdk(app, { onTracking: initOnTracking });
    app.onTrackingRequested(requestedOnTracking);
    const payload = { event: 'lg_requested_listener' };

    sendMessage(MSG_DATALAYER_EVENT, payload);

    expect(initOnTracking).not.toHaveBeenCalled();
    expect(requestedOnTracking).toHaveBeenCalledWith({
      payload,
      origin: IFRAME_ORIGIN,
    });
  });
});
