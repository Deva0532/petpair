import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await signup(formData.name, formData.email, formData.password, formData.location);
    if (success) {
      navigate('/');
    } else {
      setErrors({ general: 'Failed to create account. Please try again.' });
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const success = await loginWithGoogle(credentialResponse.credential);
      if (success) {
        navigate('/');
      } else {
        setErrors({ general: 'Failed to sign up with Google' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Create an account</h1>
            <p className="text-gray-600 mt-1">Join the pet-loving community</p>
          </div>

          {/* Google Sign Up */}
          <div className="mb-5">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrors({ general: 'Google sign up failed' })}
                theme="outline"
                size="large"
                text="signup_with"
                shape="pill"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-gray-500">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50`}
                  placeholder="Full name"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50`}
                  placeholder="Email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Location */}
            <div>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.location ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50`}
                  placeholder="City, State"
                />
              </div>
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border ${errors.password ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50`}
                  placeholder="Password (min 6 characters)"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50`}
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 mt-1"
                />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the <Link to="/terms" className="text-violet-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms}</p>}
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 hover:text-violet-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};