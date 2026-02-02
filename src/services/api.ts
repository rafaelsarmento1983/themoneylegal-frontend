import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1', // Vite proxy repassa
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/check-email',
];

function isAuthRequest(url?: string) {
  if (!url) return false;

  // url pode vir como "/auth/login" ou "/api/v1/auth/login"
  return AUTH_PATHS.some((path) => url.includes(path));
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Erro sem response = rede / CORS / timeout
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest?.url as string | undefined;

    // ✅ IMPORTANTE: não tenta refresh em rotas de autenticação
    if (isAuthRequest(url)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // ✅ use o mesmo "api" para respeitar baseURL/proxy
        const { data } = await api.post('/auth/refresh', { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // ✅ aqui ok redirecionar, pois é sessão expirada de rota protegida
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
