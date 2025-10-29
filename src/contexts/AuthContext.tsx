import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  signup: (name: string, email: string, password: string, location: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // NEW: Function to update profile data
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = 'http://localhost:5000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to decode JWT (kept here for context)
const decodeToken = (token: string): User | null => {
    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64));
      
      return {
        id: decodedPayload.userId,
        name: decodedPayload.name || 'User',
        email: decodedPayload.email,
        location: decodedPayload.location || 'N/A',
        phone: decodedPayload.phone || '', // Ensure phone is decoded
        bio: decodedPayload.bio || '',     // Ensure bio is decoded
        verified: decodedPayload.verified || true,
        joinedAt: decodedPayload.joinedAt || new Date().toISOString(),
      };
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  };


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Checks for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  // ... (Login and Signup functions remain the same) ...
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const decodedUser = decodeToken(data.token);
        setUser(decodedUser);
        return true;
      } else {
        console.error("Login failed:", data.general || data.message);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Network error during login:', err);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, location: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, location }),
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const decodedUser = decodeToken(data.token);
        setUser(decodedUser);
        return true;
      } else {
        console.error("Signup failed:", data.general || data.message);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Network error during signup:', err);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };


  // --- NEW: PROFILE UPDATE FUNCTION ---
  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the JWT for authentication
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend returns a new token with updated data
        localStorage.setItem('token', data.token);
        const decodedUser = decodeToken(data.token);
        
        // Update the global state with the new user data
        setUser(decodedUser); 
        return true;
      } else {
        console.error("Profile update failed:", data.message);
        return false;
      }
    } catch (err) {
      console.error('Network error during profile update:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile, // Include the new function
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;