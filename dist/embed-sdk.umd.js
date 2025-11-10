(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.EmbedLoyaltyApp = factory());
})(this, (function () { 'use strict';

    class EmbedLoyaltyApp {
        constructor() {
            this.iframe = null;
            this.origin = '';
            this.token = '';
            this.locale = 'en';
            this.autoResize = false;
        }
        init(config) {
            const container = document.getElementById(config.containerId);
            if (!container)
                throw new Error('Container not found');
            window.dataLayer = window.dataLayer || [];
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
            this.iframe.setAttribute('sandbox', [
                'allow-scripts',
                'allow-same-origin',
                'allow-popups',
                'allow-popups-to-escape-sandbox'
            ].join(' '));
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
                transition: 'height 0.25s ease'
            });
            this.iframe.onload = () => {
                var _a;
                this.sendToken();
                (_a = config.onLoad) === null || _a === void 0 ? void 0 : _a.call(config);
            };
            this.iframe.onerror = () => { var _a; return (_a = config.onError) === null || _a === void 0 ? void 0 : _a.call(config, new Error('Iframe failed to load')); };
            // Listeners: messages coming from iframe
            window.addEventListener('message', (event) => {
                var _a, _b;
                //if (event.origin !== this.origin) return;
                const data = event.data;
                if ((data === null || data === void 0 ? void 0 : data.type) === 'REQUEST_NEW_TOKEN') {
                    (_a = this.onTokenRefreshRequest) === null || _a === void 0 ? void 0 : _a.call(this);
                }
                if ((data === null || data === void 0 ? void 0 : data.type) === 'LG_DATALAYER_EVENT' && (data === null || data === void 0 ? void 0 : data.payload)) { //GTM 
                    window.dataLayer.push(data.payload);
                }
                if ((data === null || data === void 0 ? void 0 : data.type) === 'SIZE') {
                    const msg = data;
                    const height = Number(msg.height) || 0;
                    const width = Number(msg.width) || undefined;
                    if (this.autoResize && this.iframe) {
                        const current = parseFloat(this.iframe.style.height) || 0;
                        if (Math.abs(current - height) > 1) {
                            this.iframe.style.height = `${height}px`;
                        }
                    }
                    (_b = this.onSizeCb) === null || _b === void 0 ? void 0 : _b.call(this, { height, width, origin: event.origin });
                }
            });
            container.innerHTML = '';
            container.appendChild(this.iframe);
        }
        sendToken() {
            var _a;
            if ((_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) {
                this.iframe.contentWindow.postMessage({
                    type: 'AUTH_TOKEN',
                    token: this.token,
                    locale: this.locale,
                }, this.origin);
            }
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
        destroy() {
            var _a;
            (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.remove();
            this.iframe = null;
        }
    }
    var index = new EmbedLoyaltyApp();

    return index;

}));
