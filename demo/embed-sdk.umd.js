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
        }
        init(config) {
            const container = document.getElementById(config.containerId);
            if (!container)
                throw new Error('Container not found');
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
                var _a;
                this.sendToken();
                (_a = config.onLoad) === null || _a === void 0 ? void 0 : _a.call(config);
            };
            this.iframe.onerror = () => { var _a; return (_a = config.onError) === null || _a === void 0 ? void 0 : _a.call(config, new Error('Iframe failed to load')); };
            // Escuchar mensajes desde el iframe
            window.addEventListener('message', (event) => {
                var _a, _b;
                if (event.origin !== this.origin)
                    return;
                if (((_a = event.data) === null || _a === void 0 ? void 0 : _a.type) === 'REQUEST_NEW_TOKEN') {
                    (_b = this.onTokenRefreshRequest) === null || _b === void 0 ? void 0 : _b.call(this);
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
        destroy() {
            var _a;
            (_a = this.iframe) === null || _a === void 0 ? void 0 : _a.remove();
            this.iframe = null;
        }
    }
    var index = new EmbedLoyaltyApp();

    return index;

}));
