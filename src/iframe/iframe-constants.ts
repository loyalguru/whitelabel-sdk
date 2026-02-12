//Sandbox allowed attributes
export const IFRAME_SANDBOX_ATTRS = [
  'allow-scripts',
  'allow-same-origin',
  'allow-popups',
  'allow-popups-to-escape-sandbox',
] as const;

//Other attrs
export const IFRAME_ALLOW_ATTR = 'clipboard-read; clipboard-write';
export const IFRAME_SCROLLING_ATTR = 'no';

//Common base styles and all iframes of the SDK
export const IFRAME_BASE_STYLES: Partial<CSSStyleDeclaration> = {
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
