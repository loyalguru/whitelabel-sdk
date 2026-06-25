(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.EmbedLoyaltyApp = {}));
})(this, (function (exports) { 'use strict';

    //Messages: iframe -> SDK
    const MSG_REQUEST_NEW_TOKEN = 'REQUEST_NEW_TOKEN';
    const MSG_DATALAYER_EVENT = 'LG_DATALAYER_EVENT';
    const MSG_SIZE = 'SIZE';
    //Messages: SDK -> iframe
    const MSG_AUTH_TOKEN = 'AUTH_TOKEN';
    const MSG_SERVER_ERRORS = 'SERVER_ERRORS';
    const MSG_DATA = 'DATA';

    // SDK internal codes
    const SDK_ERROR_CODES = {
        CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
        IFRAME_LOAD_FAILED: 'IFRAME_LOAD_FAILED',
    };
    //Messages english by default
    const SDK_ERROR_MESSAGES = {
        [SDK_ERROR_CODES.CONTAINER_NOT_FOUND]: 'Container not found',
        [SDK_ERROR_CODES.IFRAME_LOAD_FAILED]: 'Iframe failed to load',
    };
    function createSdkError(code) {
        var _a;
        const msg = (_a = SDK_ERROR_MESSAGES[code]) !== null && _a !== void 0 ? _a : 'Unexpected SDK error';
        const err = new Error(msg);
        err.code = code;
        return err;
    }

    //Sandbox allowed attributes
    const IFRAME_SANDBOX_ATTRS = [
        'allow-scripts',
        'allow-same-origin',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-top-navigation-by-user-activation'
    ];
    //Other attrs
    const IFRAME_ALLOW_ATTR = 'clipboard-read; clipboard-write';
    const IFRAME_SCROLLING_ATTR = 'no';
    //Common base styles and all iframes of the SDK
    const IFRAME_BASE_STYLES = {
        border: 'none',
        width: '100%',
        margin: '0',
        padding: '0',
        display: 'block',
        backgroundColor: 'transparent',
        overflow: 'hidden',
        transition: 'height 0.25s ease',
        maxHeight: '100vh',
    };

    function createIframe(config, autoResize) {
        const iframe = document.createElement('iframe');
        iframe.src = `${config.iframeOrigin}`;
        //Attrs
        iframe.setAttribute('sandbox', IFRAME_SANDBOX_ATTRS.join(' '));
        iframe.setAttribute('allow', IFRAME_ALLOW_ATTR);
        iframe.setAttribute('scrolling', IFRAME_SCROLLING_ATTR);
        //Styles
        Object.assign(iframe.style, IFRAME_BASE_STYLES, {
            height: autoResize ? '0px' : '100vh',
        });
        return iframe;
    }

    class EmbedLoyaltyApp {
        constructor() {
            this.iframe = null;
            this.origin = '';
            this.token = '';
            this.locale = 'en';
            this.module = '';
            this.autoResize = false;
            this.gtmEnabled = true;
            this.handleMessage = (event) => {
                var _a, _b, _c, _d;
                const data = event.data;
                if (!data || typeof data !== 'object')
                    return;
                // if (event.origin !== this.origin) return; // Activate to validate origin
                switch (data.type) {
                    case MSG_REQUEST_NEW_TOKEN: {
                        (_a = this.onTokenRefreshRequest) === null || _a === void 0 ? void 0 : _a.call(this);
                        break;
                    }
                    case MSG_DATALAYER_EVENT: {
                        const payload = data.payload;
                        if (this.gtmEnabled) {
                            window.dataLayer = window.dataLayer || [];
                            window.dataLayer.push(payload);
                        }
                        (_b = this.onTrackingCb) === null || _b === void 0 ? void 0 : _b.call(this, { payload, origin: event.origin });
                        break;
                    }
                    case MSG_SIZE: {
                        const msg = data;
                        const height = Number(msg.height) || 0;
                        const width = Number(msg.width) || undefined;
                        this.applyAutoResize(height);
                        (_c = this.onSizeCb) === null || _c === void 0 ? void 0 : _c.call(this, { height, width, origin: event.origin });
                        break;
                    }
                    case MSG_SERVER_ERRORS: {
                        if (this.onServerErrorCb) {
                            this.onServerErrorCb(data.payload);
                        }
                        else if (this.onErrorCb) {
                            const err = new Error(`Server error ${data.payload.status}: ${data.payload.message}`);
                            this.onErrorCb(err);
                        }
                        break;
                    }
                    case MSG_DATA: {
                        const payload = data.payload;
                        (_d = this.onDataCb) === null || _d === void 0 ? void 0 : _d.call(this, { payload, origin: event.origin });
                        break;
                    }
                }
            };
        }
        init(config) {
            var _a;
            const container = document.getElementById(config.containerId);
            if (!container)
                throw createSdkError(SDK_ERROR_CODES.CONTAINER_NOT_FOUND);
            this.origin = config.iframeOrigin;
            this.token = config.token;
            this.locale = config.locale || 'en';
            this.module = (_a = config.module) !== null && _a !== void 0 ? _a : '';
            this.autoResize = !!config.autoResize;
            this.gtmEnabled = config.gtmEnabled !== false;
            if (this.gtmEnabled) {
                window.dataLayer = window.dataLayer || [];
            }
            if (typeof config.onSize === 'function') {
                this.onSizeCb = config.onSize;
            }
            if (typeof config.onTokenRefresh === 'function') {
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
                var _a;
                this.sendToken();
                (_a = config.onLoad) === null || _a === void 0 ? void 0 : _a.call(config);
            };
            iframe.onerror = () => {
                var _a;
                (_a = this.onErrorCb) === null || _a === void 0 ? void 0 : _a.call(this, createSdkError(SDK_ERROR_CODES.IFRAME_LOAD_FAILED));
            };
            window.addEventListener('message', this.handleMessage);
            container.innerHTML = '';
            container.appendChild(iframe);
            this.iframe = iframe;
        }
        applyAutoResize(nextHeight) {
            if (!this.autoResize || !this.iframe)
                return;
            const current = parseFloat(this.iframe.style.height) || 0;
            if (Math.abs(current - nextHeight) > 1) {
                this.iframe.style.height = `${nextHeight}px`;
            }
        }
        sendToken() {
            var _a;
            if (!((_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow))
                return;
            const message = {
                type: MSG_AUTH_TOKEN,
                token: this.token,
                locale: this.locale,
                module: this.module
            };
            this.iframe.contentWindow.postMessage(message, this.origin);
        }
        refreshToken(newToken) {
            this.token = newToken;
            this.sendToken();
        }
        onTokenRefreshRequested(callback) {
            this.onTokenRefreshRequest = callback;
        }
        onSizeRequested(callback) {
            this.onSizeCb = callback;
        }
        onDataRequested(callback) {
            this.onDataCb = callback;
        }
        onTrackingRequested(callback) {
            this.onTrackingCb = callback;
        }
        destroy() {
            var _a;
            window.removeEventListener('message', this.handleMessage);
            (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.remove();
            this.iframe = null;
        }
    }
    const embedLoyaltyApp = new EmbedLoyaltyApp();

    if (typeof window !== 'undefined') {
        window.EmbedLoyaltyApp = embedLoyaltyApp;
    }

    exports.MSG_AUTH_TOKEN = MSG_AUTH_TOKEN;
    exports.MSG_DATA = MSG_DATA;
    exports.MSG_DATALAYER_EVENT = MSG_DATALAYER_EVENT;
    exports.MSG_REQUEST_NEW_TOKEN = MSG_REQUEST_NEW_TOKEN;
    exports.MSG_SERVER_ERRORS = MSG_SERVER_ERRORS;
    exports.MSG_SIZE = MSG_SIZE;
    exports.SDK_ERROR_CODES = SDK_ERROR_CODES;
    exports.SDK_ERROR_MESSAGES = SDK_ERROR_MESSAGES;
    exports.createSdkError = createSdkError;
    exports.default = embedLoyaltyApp;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
