# @loyalguru/embed-sdk

SDK para integrar el módulo de Loyalty, CDP o Cupones en webs de terceros mediante `iframe` y autenticación vía JWT.

## Instalación

```bash
npm install git+https://github.com/loyalguru/embed-sdk.git
```

> Requiere acceso privado. Usa un token personal o SSH para clonar.

## Uso básico

```html
<div id="loyalty-container"></div>
```

```js
import EmbedLoyaltyApp from '@loyalguru/embed-sdk';

EmbedLoyaltyApp.init({
  containerId: 'loyalty-container',
  module: 'loyalty', // o 'cdp', 'coupons'
  iframeOrigin: 'https://webview.loyalguru.io',
  token: '<JWT>',
  onLoad: () => console.log('Módulo cargado')
});

// Para actualizar el token en caliente:
EmbedLoyaltyApp.refreshToken('<NEW_JWT>');

// Para destruir el iframe:
EmbedLoyaltyApp.destroy();
```

## Licencia

MIT © Loyal Guru