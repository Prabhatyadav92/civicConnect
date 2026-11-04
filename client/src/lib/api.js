const BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'cc_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const mediaUrl = (path) => `${BASE}${path}`;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function request(path, { method = 'GET', json, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form; // the browser sets the multipart boundary
  }

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body });
  } catch {
    throw new ApiError('We could not reach the server. Check your connection and try again', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data.error || 'Something went wrong. Try again', res.status);
  }
  return data;
}

export const api = {
  meta: () => request('/meta'),
  register: (json) => request('/auth/register', { method: 'POST', json }),
  login: (json) => request('/auth/login', { method: 'POST', json }),
  me: () => request('/auth/me'),
  createReport: (form) => request('/reports', { method: 'POST', form }),
  myReports: () => request('/reports/mine'),
  report: (id) => request(`/reports/${id}`),
  queue: (params) => request(`/reports?${new URLSearchParams(params)}`),
  stats: () => request('/reports/stats'),
  updateStatus: (id, json) => request(`/reports/${id}/status`, { method: 'PATCH', json }),
};
