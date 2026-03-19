// Ensures Node's global fetch (undici) respects HTTP_PROXY/HTTPS_PROXY.
// Without this, the MCP server may return "fetch failed" even if curl works.
try {
  const undici = require("undici");
  const { EnvHttpProxyAgent, setGlobalDispatcher } = undici;
  if (typeof EnvHttpProxyAgent === "function" && typeof setGlobalDispatcher === "function") {
    const agent = new EnvHttpProxyAgent();
    setGlobalDispatcher(agent);
  }
} catch (e) {
  // Non-fatal: if undici wiring fails, MCP server will just behave as before.
}

