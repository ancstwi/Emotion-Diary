const crypto = require('crypto');

const OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
const CHAT_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

let tokenCache = { accessToken: null, expiresAt: 0 };

let undiciFetch;
function getUndiciFetch() {
  if (undiciFetch) return undiciFetch;
  try {
    const { fetch: ufetch, Agent } = require('undici');
    const ms = Number(process.env.GIGACHAT_CONNECT_TIMEOUT_MS) || 45000;
    const tlsInsecure = /^1|true|yes$/i.test(
      String(process.env.GIGACHAT_TLS_INSECURE || '').trim()
    );
    const agent = new Agent({
      connect: {
        timeout: ms,
        ...(tlsInsecure ? { rejectUnauthorized: false } : {}),
      },
    });
    undiciFetch = (url, opts) => ufetch(url, { ...opts, dispatcher: agent });
  } catch {
    undiciFetch = fetch;
  }
  return undiciFetch;
}

async function safeFetch(url, options) {
  const doFetch = getUndiciFetch();
  try {
    return await doFetch(url, options);
  } catch (e) {
    const cause = e.cause ? String(e.cause) : '';
    const details = cause ? ` (${cause})` : '';
    throw new Error(
      `GigaChat: сеть — ${e.message}${details}.`
    );
  }
}

function getAuthorizationBasic() {
  const rawKey = process.env.GIGACHAT_AUTHORIZATION_KEY;
  const id = process.env.GIGACHAT_CLIENT_ID;
  const secret = process.env.GIGACHAT_CLIENT_SECRET;

  if (rawKey && String(rawKey).trim()) {
    const k = String(rawKey).trim();
    if (k.startsWith('Basic ')) return k;
    return `Basic ${k}`;
  }
  if (id && secret) {
    return `Basic ${Buffer.from(`${id}:${secret}`, 'utf8').toString('base64')}`;
  }
  return null;
}

function isConfigured() {
  return Boolean(getAuthorizationBasic());
}

async function fetchNewAccessToken() {
  const auth = getAuthorizationBasic();
  if (!auth) {
    throw new Error('GigaChat: не заданы GIGACHAT_AUTHORIZATION_KEY или пара GIGACHAT_CLIENT_ID + GIGACHAT_CLIENT_SECRET');
  }

  const scope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';
  const rqUid = crypto.randomUUID();

  const res = await safeFetch(OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      RqUID: rqUid,
      Authorization: auth,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope,
    }).toString(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error_description || data.error || JSON.stringify(data);
    throw new Error(`GigaChat OAuth: ${msg}`);
  }

  const accessToken = data.access_token;
  if (!accessToken) {
    throw new Error('GigaChat OAuth: нет access_token в ответе');
  }

  const expiresInSec = Number(data.expires_in) || 1800;
  const marginSec = 120;
  tokenCache = {
    accessToken,
    expiresAt: Date.now() + Math.max(60, expiresInSec - marginSec) * 1000,
  };

  return accessToken;
}

async function getAccessToken() {
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }
  return fetchNewAccessToken();
}

function invalidateToken() {
  tokenCache = { accessToken: null, expiresAt: 0 };
}

async function chatCompletions(body) {
  const tryRequest = async () => {
    const token = await getAccessToken();
    const res = await safeFetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 401) {
      const err = new Error('UNAUTHORIZED');
      err.status = 401;
      err.payload = json;
      throw err;
    }

    if (!res.ok) {
      const msg = json.message || json.error?.message || JSON.stringify(json);
      throw new Error(`GigaChat: ${msg}`);
    }

    return json;
  };

  try {
    return await tryRequest();
  } catch (e) {
    if (e && e.status === 401) {
      invalidateToken();
      return tryRequest();
    }
    throw e;
  }
}

module.exports = {
  isConfigured,
  chatCompletions,
  invalidateToken,
};
