# WhiteLabel SDK

SDK to embed Loyal Guru White Label modules (loyalty, CDP, coupons, login) into external websites and apps using an iframe-based approach.

This SDK creates and manages an `<iframe>` that points to your White Label webview (hosted in Loyal Guru infra or in your environment), sends the auth token to it, listens for resize events, and exposes hooks for token refresh and analytics events.



## Features

- Simple initialization using a container `div`
- Supports multiple modules: `loyalty`, `cdp`, `coupons`, `login`
- Secure token 
- Optional auto-resize (iframe grows/shrinks based on content height)
- Hooks for:
  - `onLoad`
  - `onError`
  - `onSize` (height/width from iframe)
  - `onData` (generic `DATA` messages)
  - `onTracking` (`LG_DATALAYER_EVENT` messages)
  - token refresh request (`REQUEST_NEW_TOKEN`)
- GTM support via `LG_DATALAYER_EVENT` (pushes into `window.dataLayer` by default)



## Installation

### 1. From source (local development)

```bash
git clone https://github.com/loyalguru/WhiteLabel-SDK.git
cd WhiteLabel-SDK
npm install
```

> The project uses Rollup to build a UMD bundle (`embed-sdk.umd.js`) and TypeScript for typings.



## Build

To generate the distributable bundle:

```bash
npm run build
```

This will create the compiled files inside the `dist/` folder (according to your current `package.json`):

- `dist/embed-sdk.umd.js` → UMD bundle you can include in a `<script>`
- `dist/index.d.ts` → TypeScript declarations

Publish this to npm/GitHub Packages or serve it from a static/CDN bucket. For the Loyal Guru CDN, use the automated release below.


## Using the SDK from the CDN

Every release is published to `https://cdn.loyal.guru/sdk/`, which is served from the `cdn-sdk-streaming-west` GCS bucket (project `streaming-west`).

| URL | Content | Cache |
| --- | --- | --- |
| `https://cdn.loyal.guru/sdk/vX.Y.Z/embed-sdk.umd.js` | A fixed version. It never changes after it is published. | 1 year, `immutable` |
| `https://cdn.loyal.guru/sdk/embed-sdk.umd.js` | The latest release. It is replaced on every release. | 5 min in the browser, 1 h at the CDN |

Use a fixed version in production, so a new release never changes a client's integration without warning:

```html
<script src="https://cdn.loyal.guru/sdk/v1.1.4/embed-sdk.umd.js"></script>
```

Use the latest URL only for demos or tests.


## Releasing a new version

Releases are deployed by Cloud Build. The trigger `whitelabel-sdk-deploy` (project `streaming-west`) runs [`cloudbuild.yaml`](cloudbuild.yaml) when a tag matching `v*` is pushed.

1. Bump `version` in `package.json` (and `package-lock.json`) on `main`, for example to `1.1.5`. `npm version` does both and creates the tag:
   ```bash
   npm version patch   # or minor / major
   ```
   If you edit the version by hand, create the tag yourself:
   ```bash
   git tag v1.1.5
   ```
2. Push the commit and the tag:
   ```bash
   git push origin main --follow-tags
   ```
3. Follow the build in Cloud Build (project `streaming-west`) → History. Then check that the file is live:
   ```bash
   curl -sI https://cdn.loyal.guru/sdk/v1.1.5/embed-sdk.umd.js
   ```

### What the pipeline does

1. **check-version**: fails if the tag is not exactly `v` + the `package.json` version (for example tag `v1.1.5` and `"version": "1.1.5"`).
2. **install**: `npm ci`, using the exact versions in the lockfile.
3. **test**: `npm test`. Nothing is uploaded if the tests fail.
4. **build**: `npm run build` → `dist/embed-sdk.umd.js`.
5. **upload-versioned**: uploads to `gs://cdn-sdk-streaming-west/sdk/vX.Y.Z/embed-sdk.umd.js`. It uses `--no-clobber`, so an existing version is never overwritten.
6. **upload-latest**: replaces `gs://cdn-sdk-streaming-west/sdk/embed-sdk.umd.js`.

### Notes

- **Published versions can't be fixed in place.** They are cached as immutable, and the pipeline won't overwrite one that already exists. To fix a bad release, publish a new patch version.
- **Re-pushing an existing tag does not replace its file.** The versioned upload is skipped and only the latest file is updated.
- Don't upload SDK files to the bucket by hand. Manual uploads skip the tests and the cache headers.


## Local demo (`demo/`)

The `demo/` folder is a static HTML page (no bundler). Defaults live in `demo/config.js` with safe placeholders (no real JWTs).

1. Copy `demo/config.local.example.js` to `demo/config.local.js` (gitignored).
2. Put your local `token` / optional `refreshToken` and origins only in `config.local.js`.
3. Open `demo/index.html` via a local static server. A missing `config.local.js` may 404 in the network tab; the demo still loads defaults from `config.js`.

Never commit real JWTs.

## Usage

Load the SDK in a plain HTML page and initialize it like this:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test SDK</title>
  <!-- Load the built SDK (UMD) -->
  <script src="embed-sdk.umd.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <!-- Container where the iframe will be injected -->
  <div id="loyalty-container"></div>

  <script>
    // Initialize the SDK
    EmbedLoyaltyApp.init({
      containerId: 'loyalty-container',
      module: 'loyalty',              // 'loyalty' | 'cdp' | 'coupons' | 'login'
      iframeOrigin: 'http://localhost:4200', // URL where the white-label modules are hosted
      token: 'YOUR_JWT_TOKEN_HERE',   // JWT generated by your backend
      locale: 'fr',                   // optional, defaults to 'en'
      autoResize: false,              // true: iframe resizes automatically
      gtmEnabled: true,               // optional, defaults to true
      onLoad: () => console.log('[host] Iframe loaded'),
      onSize: ({ height }) => console.log('[host] iframe height:', height),
      onData: ({ payload, origin }) => console.log('[host] DATA:', origin, payload),
      onTracking: ({ payload, origin }) => console.log('[host] tracking:', origin, payload),
      onError: (err) => console.error('Loyalty iframe error', err)
    });

    // Listen for token refresh requests coming from the iframe
    EmbedLoyaltyApp.onTokenRefreshRequested(async () => {
      // fetch/refresh token from your backend
      const newToken = 'NEW_TOKEN_FROM_BACKEND';
      EmbedLoyaltyApp.refreshToken(newToken);
      console.log('Token refreshed and sent to iframe');
    });

    // Listen to size messages (alternative way)
    EmbedLoyaltyApp.onSizeRequested(({ height, width }) => {
      console.log('[host] SIZE via onSizeRequested =>', height, width);
    });
  </script>
</body>
</html>
```


## API

### `EmbedLoyaltyApp.init(config: InitConfig)`

Creates the iframe and injects it into the container.

**Config shape:**

```ts
type EmbedModule = 'loyalty' | 'cdp' | 'coupons' | 'login';

type InitConfig = {
  containerId: string; // id of the DOM element where the iframe will be appended
  module: EmbedModule; // module to load from the white-label host
  iframeOrigin: string; // e.g. https://wl.loyalguru.com
  token: string;        // JWT to authenticate user/session
  locale?: string;      // optional, defaults to 'en'
  onLoad?: () => void;
  onError?: (e: Error) => void;
  onSize?: (payload: { height: number; width?: number; origin: string }) => void;
  onData?: (payload: { payload: unknown; origin: string }) => void;
  onTracking?: (payload: { payload: unknown; origin: string }) => void;
  autoResize?: boolean; // if true, SDK updates iframe height on SIZE messages
  gtmEnabled?: boolean; // defaults to true; false disables window.dataLayer push
};
```

**What it does internally:**

1. Finds the container (`document.getElementById(...)`)
2. Creates an `<iframe>` pointing to:  
   ```text
   ${iframeOrigin}/${module}
   ```
3. Adds secure-ish sandbox attributes:
   ```text
   allow-scripts, allow-same-origin, allow-popups, allow-popups-to-escape-sandbox
   ```
4. Sends the auth token to the iframe using `postMessage`:
   ```ts
   {
     type: 'AUTH_TOKEN',
     token: '...',
     locale: '...'
   }
   ```
5. Listens for messages coming from iframe:
   - `REQUEST_NEW_TOKEN`
   - `LG_DATALAYER_EVENT`
   - `SIZE`
   - `DATA`



### `EmbedLoyaltyApp.refreshToken(newToken: string)`

Updates the token stored in the SDK and sends it again to the iframe.

Use this when backend issues a new JWT (expiration, refresh flow, etc.):

```ts
EmbedLoyaltyApp.refreshToken(freshTokenFromBackend);
```



### `EmbedLoyaltyApp.onTokenRefreshRequested(callback: () => void)`

The iframe can send a message:  
```json
{ "type": "REQUEST_NEW_TOKEN" }
```
When that happens, the SDK will call to the callback. Call your backend, get a fresh token and call `refreshToken(...)`.

Example:

```ts
EmbedLoyaltyApp.onTokenRefreshRequested(async () => {
  const newToken = await fetchNewTokenSomehow();
  EmbedLoyaltyApp.refreshToken(newToken);
});
```



### `EmbedLoyaltyApp.onSizeRequested(callback)`

Even if `autoResize` is off, you can still listen to size reports coming from the iframe:

```ts
EmbedLoyaltyApp.onSizeRequested(({ height, width, origin }) => {
  console.log('Iframe wants to be', height, 'px high');
});
```

### `EmbedLoyaltyApp.onTrackingRequested(callback)`

Listen to GTM tracking messages coming from the iframe without routing them through `onData`:

```ts
EmbedLoyaltyApp.onTrackingRequested(({ payload, origin }) => {
  console.log('[host] tracking event:', origin, payload);
});
```

This uses the same internal callback as `init({ onTracking })`, so the last registered callback wins.



### `EmbedLoyaltyApp.destroy()`

Removes the iframe from the DOM and clears internal references.

```ts
EmbedLoyaltyApp.destroy();
```



## Messages from the iframe

The SDK listens to `window.postMessage` from the iframe. Current supported messages:

- **`REQUEST_NEW_TOKEN`** -> triggers the registered `onTokenRefreshRequested` callback.
- **`LG_DATALAYER_EVENT`** -> forwards `{ payload, origin }` to `onTracking` / `onTrackingRequested`.
  - By default, it also pushes `data.payload` into `window.dataLayer` for GTM.
  - Set `gtmEnabled: false` to disable the `window.dataLayer` push while still receiving `onTracking`.
- **`SIZE`** → `{ type: 'SIZE', height: number, width?: number }`  
  - If `autoResize` is `true`, the SDK updates `iframe.style.height`.
  - Also forwards this to `onSize` / `onSizeRequested`.
- **`DATA`** -> forwards `data.payload` to `onData` / `onDataRequested`. Tracking messages are not sent to `onData`.



## Styling & Iframe behavior

The iframe is created with these default styles:

```ts
Object.assign(this.iframe.style, {
  border: 'none',
  width: '100%',
  height: autoResize ? '0px' : '100vh',
  margin: '0',
  padding: '0',
  display: 'block',
  backgroundColor: 'transparent',
  overflow: 'hidden',
  transition: 'height 0.25s ease',
  'max-height': '100vh'
});
```

If the parent host page has scroll constraints, you can override these with your own CSS.



## Development Notes

- The SDK currently **does not** strictly enforce `event.origin` in the `message` listener (the line is commented):
  ```ts
  // if (event.origin !== this.origin) return;
  ```
  In production  should keep origin checks enabled to avoid processing messages from unknown sources.

- The iframe URL is built as `${iframeOrigin}/${module}`. Make sure your white-label host actually serves those routes.

- If you plan to publish to npm as `@loyalguru/embed-sdk`, update the `repository` and `name` in `package.json`, and add an npm publish step to the pipeline (see [Releasing a new version](#releasing-a-new-version)).


