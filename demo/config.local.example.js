// Copy to config.local.js (gitignored) and fill in local values.
// Never commit real JWTs.
window.EMBED_SDK_CONFIG_LOCAL = {
  iframeOrigin: 'https://lg-app-palacio-dev.web.app/',
  token: 'YOUR_JWT_TOKEN_HERE',
  // Optional explicit refresh token for the demo callback (do not reuse token automatically).
  // refreshToken: 'YOUR_REFRESH_JWT_TOKEN_HERE',
  locale: 'es',
  module: '',
  autoResize: true,
  gtmEnabled: true,
};
