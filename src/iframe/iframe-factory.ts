import { InitConfig } from '../types/types';
import {
  IFRAME_SANDBOX_ATTRS,
  IFRAME_ALLOW_ATTR,
  IFRAME_SCROLLING_ATTR,
  IFRAME_BASE_STYLES,
} from './iframe-constants';

export function createIframe(config: InitConfig, autoResize: boolean): HTMLIFrameElement {
  const iframe = document.createElement('iframe');

  iframe.src = `${config.iframeOrigin}/${config.module}`;

  //Attrs
  iframe.setAttribute('sandbox', IFRAME_SANDBOX_ATTRS.join(' '));
  iframe.setAttribute('allow', IFRAME_ALLOW_ATTR);
  iframe.setAttribute('scrolling', IFRAME_SCROLLING_ATTR);

  //Styles
  Object.assign(iframe.style, IFRAME_BASE_STYLES, {
    height: autoResize ? '0px' : '100vh',
  } as Partial<CSSStyleDeclaration>);

  return iframe;
}
