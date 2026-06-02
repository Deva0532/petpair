import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    // Handle full URLs vs relative endpoints
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            // Token expired or invalid
            window.dispatchEvent(new Event('auth:logout'));
            throw new Error('Session expired. Please login again.');
        }

        return response;
    } catch (error) {
        throw error;
    }
};
