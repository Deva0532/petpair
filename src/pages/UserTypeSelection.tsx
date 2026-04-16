import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, CheckCircleIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const API_BASE_URL = 'http://localhost:5000';

export const UserTypeSelection: React.FC = () => {
    const [selectedType, setSelectedType] = useState<'normal' | 'kennel' | null>(null);
    const [step, setStep] = useState<'select' | 'verification'>('select');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    // Redirect admin users away from this page
    useEffect(() => {
        if (isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Redirect if user already selected type
    useEffect(() => {
        if (user && !user.isNewUser && !isAdmin) {
            navigate('/');
        }
    }, [user, isAdmin, navigate]);

    const handleTypeSelect = (type: 'normal' | 'kennel') => {
        setSelectedType(type);
        setError('');
    };

    const handleContinue = async () => {
        if (!selectedType) return;

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/set-user-type`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userType: selectedType })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setStep('verification');
            } else {
                setError(data.message || 'Failed to set user type');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipVerification = () => {
        navigate('/');
    };

    const handleVerifyLater = () => {
        navigate('/profile');
    };

    if (step === 'verification') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Account Setup Complete!</h1>
                            <p className="text-gray-600 mt-2">
                                {selectedType === 'kennel'
                                    ? 'Welcome to Peto Kennel! You can now post unlimited pets and use bulk upload.'
                                    : 'Your account is ready. Would you like to verify your mobile number for a verification badge?'}
                            </p>
                        </div>

                        {selectedType === 'kennel' && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🏅</span>
                                    <span className="font-semibold text-amber-800">Kennel Benefits Active</span>
                                </div>
                                <ul className="text-sm text-amber-700 space-y-1 ml-7">
                                    <li>✓ Unlimited pet listings</li>
                                    <li>✓ Bulk upload via Excel</li>
                                    <li>✓ Premium Kennel badge on all your pets</li>
                                </ul>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                onClick={handleVerifyLater}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30"
                            >
                                Verify Mobile Number in Profile
                            </Button>
                            <button
                                onClick={handleSkipVerification}
                                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome to Peto!</h1>
                        <p className="text-gray-600 mt-2">How would you like to use our platform?</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        {/* Normal User Option */}
                        <button
                            onClick={() => handleTypeSelect('normal')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${selectedType === 'normal'
                                ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/20'
                                : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === 'normal' ? 'bg-violet-500' : 'bg-gray-100'
                                    }`}>
                                    <UserIcon className={`w-6 h-6 ${selectedType === 'normal' ? 'text-white' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">🐾 Normal User</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        I'm a pet owner looking to list my pet for sale, adoption, or mating.
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                                            Up to 2 pet listings
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                                            Browse and connect with sellers
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-green-500" />
                                            Free to use
                                        </div>
                                    </div>
                                </div>
                                {selectedType === 'normal' && (
                                    <CheckCircleIcon className="w-6 h-6 text-violet-500 flex-shrink-0" />
                                )}
                            </div>
                        </button>

                        {/* Kennel User Option */}
                        <button
                            onClick={() => handleTypeSelect('kennel')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedType === 'kennel'
                                ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg shadow-amber-500/20'
                                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                                }`}
                        >
                            {/* Premium ribbon */}
                            <div className="absolute top-3 right-3">
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Premium
                                </span>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === 'kennel'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                    : 'bg-gray-100'
                                    }`}>
                                    <ShieldCheckIcon className={`w-6 h-6 ${selectedType === 'kennel' ? 'text-white' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg">🏅 Kennel User</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        I'm a professional breeder or kennel owner with multiple pets.
                                    </p>
                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-amber-500" />
                                            <span className="font-semibold text-gray-700">Unlimited</span>&nbsp;pet listings
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-amber-500" />
                                            Bulk upload pets via Excel
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-amber-500" />
                                            Premium Kennel badge on all listings
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <CheckCircleIcon className="w-4 h-4 mr-1.5 text-amber-500" />
                                            Stand out from normal listings
                                        </div>
                                    </div>
                                </div>
                                {selectedType === 'kennel' && (
                                    <CheckCircleIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-6" />
                                )}
                            </div>
                        </button>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={!selectedType || isLoading}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                Continue <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};
