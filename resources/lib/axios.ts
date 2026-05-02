import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',           // Semua request ke /api/v1/...
    headers: {
        'Content-Type': 'application/json',
        'Accept':        'application/json',
        'X-CSRF-TOKEN':  document.querySelector('meta[name="csrf-token"]')
                             ?.getAttribute('content') ?? '',
    },
    withCredentials: true,        // Kirim cookies (wajib untuk session Laravel)
});

// Interceptor: tangkap error global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message ?? error.message);
        return Promise.reject(error);
    }
);

export default api;