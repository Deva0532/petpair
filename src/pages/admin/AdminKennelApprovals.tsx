import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, BuildingStorefrontIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

import { API_BASE_URL } from '../../config';

interface PendingStore {
    _id: string;
    name: string;
    email: string;
    storeName: string;
    storeDescription: string;
    storeAddress: string;
    location: string;
    phone?: string;
    emailVerified: boolean;
    mobileVerified: boolean;
}

export const AdminKennelApprovals: React.FC = () => {
    const { showToast } = useToast();
    const [pendingStores, setPendingStores] = useState<PendingStore[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchPendingStores();
    }, []);

    const fetchPendingStores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/kennel-approvals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPendingStores(data);
        } catch (error) {
            console.error('Error fetching pending kennels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (storeId: string, action: 'approve' | 'reject') => {
        setProcessing(storeId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/kennels/${storeId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                setPendingStores(pendingStores.filter(s => s._id !== storeId));
                showToast(`Kennel ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, 'success');
            } else {
                const data = await response.json();
                showToast(data.message || `Failed to ${action} kennel`, 'error');
            }
        } catch (error) {
            console.error(`Error ${action}ing kennel:`, error);
            showToast(`Error ${action}ing kennel`, 'error');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Kennel Approvals</h1>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                </div>
            ) : pendingStores.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900">All caught up!</h3>
                    <p className="text-gray-600 mt-2">No pending kennel approvals at this time.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingStores.map((store) => (
                        <div key={store._id} className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-amber-400">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                                        <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{store.name} (Kennel)</h3>
                                        <p className="text-gray-600 mt-1">{store.storeDescription || 'No description provided'}</p>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                {store.storeAddress || store.location}
                                            </div>
                                            <div className="flex items-center">
                                                <EnvelopeIcon className="w-4 h-4 mr-1" />
                                                {store.email}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-3">
                                            {store.emailVerified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Email Verified
                                                </span>
                                            )}
                                            {store.mobileVerified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    ✓ Mobile Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 lg:flex-shrink-0">
                                    <button
                                        onClick={() => handleAction(store._id, 'reject')}
                                        disabled={processing === store._id}
                                        className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                        <span>Reject & Delete</span>
                                    </button>
                                    <button
                                        onClick={() => handleAction(store._id, 'approve')}
                                        disabled={processing === store._id}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing === store._id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <CheckCircleIcon className="w-5 h-5" />
                                        )}
                                        <span>Approve User</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
