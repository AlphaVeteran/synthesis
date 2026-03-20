// Ensures Node's global fetch (undici) respects HTTP_PROXY/HTTPS_PROXY.
//
// NOTE: Different undici versions expose different proxy helpers. In some versions
// `EnvHttpProxyAgent` is not available, but `ProxyAgent` is.
try {
  const undici = require("undici");
  const { ProxyAgent, setGlobalDispatcher } = undici;

  if (typeof ProxyAgent === "function" && typeof setGlobalDispatcher === "function") {
    // Prefer HTTPS proxy when available; otherwise fall back to HTTP proxy.
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxyUrl) {
      const agent = new ProxyAgent(proxyUrl);
      setGlobalDispatcher(agent);
    }
  }
} catch (e) {
  // Non-fatal: if undici wiring fails, MCP server will just behave as before.
}

