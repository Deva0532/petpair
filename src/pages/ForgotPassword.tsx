import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
        if (location.state?.otpSent) {
            setStep(2);
        }
    }, [location.state]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                showToast('OTP sent successfully. Please check your email.', 'success');
                setStep(2);
            } else {
                showToast(data.message || 'Failed to send OTP', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                showToast('Password reset successfully.', 'success');
                // If coming from profile, go back to profile or stay logged in
                if (location.state?.fromProfile) {
                    navigate('/profile');
                } else {
                    navigate('/login');
                }
            } else {
                showToast(data.message || 'Failed to reset password', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
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
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">

                    <div className="text-center mb-8">
                        {!location.state?.fromProfile && (
                            <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-violet-600 mb-4 transition-colors">
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to Login
                            </Link>
                        )}
                        {location.state?.fromProfile && (
                            <Link to="/profile" className="inline-flex items-center text-sm text-gray-500 hover:text-violet-600 mb-4 transition-colors">
                                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                                Back to Profile
                            </Link>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="text-gray-600 mt-2">
                            {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-violet-500 focus:ring-2 focus:border-transparent transition-all bg-gray-50/50"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </Button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="rounded-xl bg-green-50 p-4 border border-green-100 flex items-start">
                                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">OTP Sent</h3>
                                    <p className="mt-1 text-sm text-green-700">Please check your email for the verification code.</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-violet-500 focus:ring-2 focus:border-transparent transition-all bg-gray-50/50 text-center tracking-widest text-lg"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-violet-500 focus:ring-2 focus:border-transparent transition-all bg-gray-50/50"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-violet-500 focus:ring-2 focus:border-transparent transition-all bg-gray-50/50"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                    Resend OTP?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30 transition-all hover:shadow-xl"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
