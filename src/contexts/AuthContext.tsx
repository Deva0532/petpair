import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getUserProfile, updateUserProfile } from '../services/userService';

interface AuthContextType {
  user: User | null;
  signup: (name: string, email: string, password: string, location: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => void;
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

// Helper to decode JWT
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
      phone: decodedPayload.phone || '',
      bio: decodedPayload.bio || '',
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

  // Fetch profile data when user is set
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUser(prev => prev ? { ...prev, ...profile } : null);
        }
      }
    };
    fetchProfile();
  }, [user?.id]);

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

  // Google OAuth login
  const loginWithGoogle = async (credential: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const decodedUser = decodeToken(data.token);
        setUser(decodedUser);
        return true;
      } else {
        console.error('Google login failed:', data.message);
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Network error during Google login:', err);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user?.id) return false;
    setIsLoading(true);
    try {
      await updateUserProfile(user.id, profileData);
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;