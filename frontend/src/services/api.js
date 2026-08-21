import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Before every request: check if token exists and is not expired
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const decoded = jwtDecode(token);
            const isExpired = decoded.exp * 1000 < Date.now();

            if (isExpired) {
                // Token is expired — clear storage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                sessionStorage.setItem('authError', 'Your session has expired. Please log in again.');
                window.location.href = '/login';
                return Promise.reject(new Error('Token expired'));
            }

            config.headers.Authorization = `Bearer ${token}`;
        } catch (err) {
            // Malformed token — clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
            return Promise.reject(err);
        }
    }

    return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// If backend returns 401 (token rejected/expired on server side), redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isRegisterRequest = error.config?.url?.includes('/auth/register');

        if (error.response?.status === 401 && !isLoginRequest && !isRegisterRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            sessionStorage.setItem('authError', 'Your session has expired. Please log in again.');
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            // 403 = Forbidden — user is logged in but doesn't have permission
            sessionStorage.setItem('authError', 'You do not have permission to perform this action.');
        }

        return Promise.reject(error);
    }
);

export default api;
