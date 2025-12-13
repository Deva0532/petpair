import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const { login, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        // Admin should never see user type selection - always go to home/admin
        // Decode JWT to check if admin
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payloadBase64 = token.split('.')[1];
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(atob(base64));
            const isAdminUser = decodedPayload.role === 'admin';

            if (isAdminUser) {
              navigate('/');
              return;
            }
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }

        // If new user (not admin), redirect to user type selection
        if (result.isNewUser) {
          navigate('/select-user-type');
        } else {
          navigate('/');
        }
      } else {
        setErrors({ general: 'Failed to sign in with Google' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glass card */}
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-12 h-12">
                <svg viewBox="0 0 50 50" className="w-full h-full">
                  <defs>
                    <linearGradient id="pawGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="pawGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#F472B6" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(5, 0) rotate(-20, 15, 12)">
                    <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                    <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#pawGrad1)" />
                    <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                    <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#pawGrad1)" />
                  </g>
                  <g transform="translate(15, 22) rotate(20, 15, 12)">
                    <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#pawGrad2)" />
                    <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#pawGrad2)" />
                    <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#pawGrad2)" />
                    <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#pawGrad2)" />
                  </g>
                </svg>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Peto</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-6">Welcome back!</h1>
            <p className="text-gray-600 mt-2">Sign in to continue to your account</p>
          </div>



          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-violet-500'} focus:ring-2 focus:border-transparent transition-all bg-gray-50/50`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-violet-500'} focus:ring-2 focus:border-transparent transition-all bg-gray-50/50`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-violet-600 hover:text-violet-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-gray-500">or continue with Google</span>
            </div>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrors({ general: 'Google sign in failed' })}
                theme="outline"
                size="large"
                width="100%"
                text="signin_with"
                shape="pill"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-600 hover:text-violet-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          By signing in, you agree to our <Link to="/terms" className="underline hover:text-white">Terms</Link> and <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};