// API client for the Brightloop backend. Every call returns the parsed JSON body,
// or throws an ApiError with the status, error code, and per-field details.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'brightloop.accessToken';
export const SESSION_EXPIRED_EVENT = 'brightloop:session-expired';

export const tokenStore = {
  get() {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage can be blocked (for example, in private mode). The session then lasts only this page load.
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing to clear.
    }
  },
};

export class ApiError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check that the API is running.');
  }

  if (response.status === 204) return null;
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const error = json?.error ?? {};
    if (response.status === 401 && token) {
      // The stored token is no longer valid. Let the app sign the user out.
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(
      response.status,
      error.code ?? 'REQUEST_FAILED',
      error.message ?? 'Something went wrong. Try again.',
      error.details ?? {},
    );
  }
  return json;
}

export const authApi = {
  signup: (input) => request('/auth/signup', { method: 'POST', body: input }).then((r) => r.data),
  login: (input) => request('/auth/login', { method: 'POST', body: input }).then((r) => r.data),
  me: () => request('/auth/me').then((r) => r.data),
};

export const productsApi = {
  // Returns { data, meta } so callers can read pagination.
  list: ({ page = 1, page_size = 20 } = {}) => request('/products', { query: { page, page_size } }),
  get: (id) => request(`/products/${id}`).then((r) => r.data),
  create: (input) => request('/products', { method: 'POST', body: input }).then((r) => r.data),
  update: (id, input) => request(`/products/${id}`, { method: 'PATCH', body: input }).then((r) => r.data),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  addVariant: (productId, input) =>
    request(`/products/${productId}/variants`, { method: 'POST', body: input }).then((r) => r.data),
  removeVariant: (variantId) => request(`/variants/${variantId}`, { method: 'DELETE' }),
};

export const plansApi = {
  list: ({ page = 1, page_size = 20 } = {}) => request('/plans', { query: { page, page_size } }),
  get: (id) => request(`/plans/${id}`).then((r) => r.data),
  create: (input) => request('/plans', { method: 'POST', body: input }).then((r) => r.data),
  update: (id, input) => request(`/plans/${id}`, { method: 'PATCH', body: input }).then((r) => r.data),
  remove: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
};

// Loads every product with its variants, for the variant picker in the plan form.
// Stops at 100 products, which is well above the demo's scope.
export async function loadVariantOptions() {
  const { data: products } = await productsApi.list({ page: 1, page_size: 100 });
  const details = await Promise.all(products.map((p) => productsApi.get(p.id)));
  return details.flatMap((product) =>
    product.variants.map((variant) => ({
      id: variant.id,
      productName: product.name,
      attribute: variant.attribute,
      value: variant.value,
      salePrice: product.sale_price,
      priceExtra: variant.price_extra,
    })),
  );
}
