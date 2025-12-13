import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, MapPinIcon, CheckBadgeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000';

interface Store {
    _id: string;
    name: string;
    storeName: string;
    storeDescription: string;
    storeAddress: string;
    location: string;
    avatar?: string;
    emailVerified: boolean;
    mobileVerified: boolean;
}

export const PetStores: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stores`);
            const data = await response.json();
            setStores(data);
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStores = stores.filter(store =>
        store.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pet Stores</h1>
                <p className="text-gray-600 mt-2">Find verified pet stores near you</p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search stores by name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Stores Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
            ) : filteredStores.length === 0 ? (
                <div className="text-center py-20">
                    <BuildingStorefrontIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600">No stores found</h3>
                    <p className="text-gray-500 mt-2">Check back later for new pet stores</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStores.map((store) => (
                        <Link
                            key={store._id}
                            to={`/stores/${store._id}`}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    {store.avatar ? (
                                        <img src={store.avatar} alt={store.storeName} className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-gray-900 truncate">{store.storeName}</h3>
                                        {(store.emailVerified || store.mobileVerified) && (
                                            <CheckBadgeIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <MapPinIcon className="w-4 h-4 mr-1" />
                                        {store.storeAddress || store.location}
                                    </div>
                                    {store.storeDescription && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{store.storeDescription}</p>
                                    )}
                                </div>
                            </div>

                            {/* Verification Badges */}
                            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                                {store.emailVerified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Email
                                    </span>
                                )}
                                {store.mobileVerified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        ✓ Mobile
                                    </span>
                                )}
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                                    ✓ Approved
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
