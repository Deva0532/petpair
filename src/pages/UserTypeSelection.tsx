import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, BuildingStorefrontIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const API_BASE_URL = 'http://localhost:5000';

export const UserTypeSelection: React.FC = () => {
    const [selectedType, setSelectedType] = useState<'individual' | 'store' | null>(null);
    const [step, setStep] = useState<'select' | 'store-details' | 'verification'>('select');
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    // Redirect admin users away from this page - they should never need to select user type
    useEffect(() => {
        if (isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Also redirect if user is not new (already selected type)
    useEffect(() => {
        if (user && !user.isNewUser && !isAdmin) {
            navigate('/');
        }
    }, [user, isAdmin, navigate]);

    const handleTypeSelect = (type: 'individual' | 'store') => {
        setSelectedType(type);
        setError('');
    };

    const handleContinue = async () => {
        if (!selectedType) return;

        if (selectedType === 'store' && step === 'select') {
            setStep('store-details');
            return;
        }

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
                body: JSON.stringify({
                    userType: selectedType,
                    storeName: selectedType === 'store' ? storeName : undefined,
                    storeDescription: selectedType === 'store' ? storeDescription : undefined,
                    storeAddress: selectedType === 'store' ? storeAddress : undefined
                })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                if (selectedType === 'individual') {
                    // Show verification step (skippable)
                    setStep('verification');
                } else {
                    // Store owner - go to verification, then pending approval
                    setStep('verification');
                }
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
        if (selectedType === 'store') {
            navigate('/', { state: { showPendingApproval: true } });
        } else {
            navigate('/');
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">
                                {selectedType === 'store' ? 'Store Application Submitted!' : 'Account Setup Complete!'}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {selectedType === 'store'
                                    ? 'Your store application is pending admin approval. You can verify your email and mobile to get a verification badge.'
                                    : 'Would you like to verify your email and mobile number to get a verification badge?'}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleVerifyLater}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30"
                            >
                                Verify in Profile Settings
                            </Button>
                            <button
                                onClick={handleSkipVerification}
                                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Skip for now
                            </button>
                        </div>

                        {selectedType === 'store' && (
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-sm text-amber-800">
                                    <strong>Note:</strong> Your store will be visible to others after admin approval. You'll receive an email once approved.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'store-details') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/20">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Store Details</h1>
                            <p className="text-gray-600 mt-2">Tell us about your pet store</p>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50"
                                    placeholder="My Awesome Pet Store"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                                <textarea
                                    value={storeDescription}
                                    onChange={(e) => setStoreDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50 resize-none"
                                    placeholder="Tell customers about your store..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Address</label>
                                <input
                                    type="text"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50/50"
                                    placeholder="123 Pet Street, City"
                                />
                            </div>

                            <Button
                                onClick={handleContinue}
                                disabled={!storeName.trim() || isLoading}
                                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg shadow-violet-500/30 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center">
                                        Submit Application <ArrowRightIcon className="w-5 h-5 ml-2" />
                                    </span>
                                )}
                            </Button>

                            <button
                                onClick={() => setStep('select')}
                                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Back
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
                        <h1 className="text-2xl font-bold text-gray-900">Welcome to PetPair!</h1>
                        <p className="text-gray-600 mt-2">How would you like to use our platform?</p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        {/* Individual Owner Option */}
                        <button
                            onClick={() => handleTypeSelect('individual')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${selectedType === 'individual'
                                ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/20'
                                : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === 'individual' ? 'bg-violet-500' : 'bg-gray-100'
                                    }`}>
                                    <UserIcon className={`w-6 h-6 ${selectedType === 'individual' ? 'text-white' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Individual Pet Owner</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        I want to list my pets for sale or adoption, or find a pet for myself.
                                    </p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" />
                                        Verification optional (email & mobile)
                                    </div>
                                </div>
                                {selectedType === 'individual' && (
                                    <CheckCircleIcon className="w-6 h-6 text-violet-500" />
                                )}
                            </div>
                        </button>

                        {/* Store Owner Option */}
                        <button
                            onClick={() => handleTypeSelect('store')}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${selectedType === 'store'
                                ? 'border-pink-500 bg-pink-50 shadow-lg shadow-pink-500/20'
                                : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === 'store' ? 'bg-pink-500' : 'bg-gray-100'
                                    }`}>
                                    <BuildingStorefrontIcon className={`w-6 h-6 ${selectedType === 'store' ? 'text-white' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Pet Store Owner</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        I run a pet store and want to list my inventory and reach more customers.
                                    </p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <CheckCircleIcon className="w-4 h-4 mr-1 text-amber-500" />
                                        Requires admin approval
                                    </div>
                                </div>
                                {selectedType === 'store' && (
                                    <CheckCircleIcon className="w-6 h-6 text-pink-500" />
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
