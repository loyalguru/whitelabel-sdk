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
        }
        init(config) {
            const container = document.getElementById(config.containerId);
            if (!container)
                throw new Error('Container not found');
            this.origin = config.iframeOrigin;
            this.token = config.token;
            this.iframe = document.createElement('iframe');
            this.iframe.src = `${config.iframeOrigin}/${config.module}`;
            this.iframe.width = '100%';
            this.iframe.height = config.height || '600';
            this.iframe.sandbox = 'allow-scripts allow-same-origin';
            this.iframe.onload = () => {
                var _a;
                this.sendToken();
                (_a = config.onLoad) === null || _a === void 0 ? void 0 : _a.call(config);
            };
            this.iframe.onerror = () => { var _a; return (_a = config.onError) === null || _a === void 0 ? void 0 : _a.call(config, new Error('Iframe failed to load')); };
            container.innerHTML = '';
            container.appendChild(this.iframe);
        }
        sendToken() {
            var _a;
            if ((_a = this.iframe) === null || _a === void 0 ? void 0 : _a.contentWindow) {
                this.iframe.contentWindow.postMessage({ type: 'AUTH_TOKEN', token: this.token }, this.origin);
            }
        }
        refreshToken(newToken) {
            this.token = newToken;
            this.sendToken();
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
