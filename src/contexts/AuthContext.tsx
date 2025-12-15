import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { updateUserProfile } from '../services/userService';

interface GoogleLoginResult {
  success: boolean;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  signup: (name: string, email: string, password: string, location: string, otp?: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<GoogleLoginResult>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  refreshToken: () => void;
  isLoading: boolean;
  isAdmin: boolean;
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
// Helper to decode JWT
const decodeToken = (token: string): User | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }
    const payloadBase64 = parts[1];

    // Add padding if needed
    const pad = payloadBase64.length % 4;
    const paddedPayload = pad ? payloadBase64 + '='.repeat(4 - pad) : payloadBase64;

    const base64 = paddedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));

    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
      console.warn("Token expired");
      return null;
    }

    console.log("Decoded Token Success:", { email: decodedPayload.email, role: decodedPayload.role });

    return {
      id: decodedPayload.userId,
      name: decodedPayload.name || 'User',
      email: decodedPayload.email,
      location: decodedPayload.location || 'N/A',
      phone: decodedPayload.phone || '',
      bio: decodedPayload.bio || '',
      avatar: decodedPayload.avatar,
      joinedAt: decodedPayload.joinedAt,
      // New fields
      userType: decodedPayload.userType || 'individual',
      isNewUser: decodedPayload.isNewUser ?? false,
      emailVerified: decodedPayload.emailVerified || false,
      mobileVerified: decodedPayload.mobileVerified || false,
      storeApproved: decodedPayload.storeApproved || false,
      storeRejected: decodedPayload.storeRejected || false,
      storeName: decodedPayload.storeName || '',
      storeDescription: decodedPayload.storeDescription || '',
      storeAddress: decodedPayload.storeAddress || '',
      role: decodedPayload.role || 'user',
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
  const initialLoadRef = React.useRef(false);
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const token = localStorage.getItem('token');
    console.log('Initial token check:', token ? 'Token exists' : 'No token');
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        console.log('Setting user from token:', decodedUser.email);
        setUser(decodedUser);
      } else {
        console.log('Token decode failed, removing token');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Periodic expiration check - DISABLED for debugging
  // The token check was causing unexpected logouts
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Periodic token check running...');
        const decoded = decodeToken(token);
        if (!decoded) {
          console.log('Token expired or invalid, logging out');
          logout();
          window.location.href = '/login';
        } else {
          console.log('Token still valid for user:', decoded.email);
        }
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  */

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

  const signup = async (name: string, email: string, password: string, location: string, otp?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, location, otp }),
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
  const loginWithGoogle = async (credential: string): Promise<GoogleLoginResult> => {
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
        return { success: true, isNewUser: decodedUser?.isNewUser };
      } else {
        console.error('Google login failed:', data.message);
        setUser(null);
        return { success: false };
      }
    } catch (err) {
      console.error('Network error during Google login:', err);
      setUser(null);
      return { success: false };
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
    console.log('LOGOUT CALLED - Stack trace:', new Error().stack);
    localStorage.removeItem('token');
    setUser(null);
  };

  // Refresh token from localStorage
  const refreshToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      }
    }
  };

  // Check if current user is admin
  // const ADMIN_EMAIL = 'varunrockes2004@gmail.com'; // Deprecated hardcode
  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    refreshToken,
    isLoading,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;