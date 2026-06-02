import { User } from '../types';
import { API_BASE_URL } from '../config';

// Helper to get token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : null;
};

export const getUserProfile = async (userId: string): Promise<Partial<User> | null> => {
    // In this architecture, profile data is largely in the JWT or fetched via auth context.
    // However, if we need a fresh fetch:
    // For now, we'll rely on the AuthContext's initial fetch or return null to let AuthContext handle it.
    // If we implement a specific GET /api/profile endpoint, we'd call it here.
    return null;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
    const headers = getAuthHeader();
    if (!headers) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        // The backend returns a new token, which AuthContext should handle.
        // We might need to return the token here if the caller expects it, 
        // but for now we'll stick to the void signature and let AuthContext handle the state update 
        // via the side effect of this call (though AuthContext currently expects this to just update DB).
        // Ideally, AuthContext should call this and then update its state with the response.
        const resData = await response.json();
        if (resData.token) {
            localStorage.setItem('token', resData.token);
        }
    } catch (error) {
        console.error("Error updating user profile: ", error);
        throw error;
    }
};

export const getUserPreferences = async (userId: string): Promise<any> => {
    const headers = getAuthHeader();
    if (!headers) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/preferences`, {
            headers
        });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error fetching preferences: ", error);
        return null;
    }
};

export const updateUserPreferences = async (userId: string, data: any): Promise<void> => {
    const headers = getAuthHeader();
    if (!headers) throw new Error('Not authenticated');

    try {
        const response = await fetch(`${API_BASE_URL}/api/preferences`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update preferences');
        }
    } catch (error) {
        console.error("Error updating preferences: ", error);
        throw error;
    }
};
