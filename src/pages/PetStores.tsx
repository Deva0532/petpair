import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BuildingStorefrontIcon,
    MapPinIcon,
    CheckBadgeIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    PhoneIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

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
        store.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.storeAddress?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-1/3 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <div className="text-center animate-fadeInUp">
                        <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                            <BuildingStorefrontIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Verified Pet Stores</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover <span className="text-violet-200">Pet Stores</span>
                        </h1>
                        <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto">
                            Find trusted and verified pet stores near you with quality pets and supplies
                        </p>

                        {/* Search Bar */}
                        <div className="mt-8 max-w-2xl mx-auto">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search stores by name or location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 rounded-2xl focus:ring-2 focus:ring-violet-500 shadow-xl placeholder:text-gray-400 text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-violet-600">{stores.length}</div>
                        <div className="text-sm text-gray-500 mt-1">Verified Stores</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-emerald-600">
                            {stores.filter(s => s.emailVerified && s.mobileVerified).length}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Fully Verified</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-blue-600">
                            {new Set(stores.map(s => s.location).filter(Boolean)).size}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Cities Covered</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                        <div className="text-3xl font-bold text-pink-600">100%</div>
                        <div className="text-sm text-gray-500 mt-1">Admin Approved</div>
                    </div>
                </div>

                {/* Stores Grid */}
                {isLoading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mb-4"></div>
                        <p className="text-gray-500">Loading stores...</p>
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <BuildingStorefrontIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchQuery
                                ? 'Try adjusting your search query to find more stores'
                                : 'Check back later for new verified pet stores in your area'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStores.map((store, index) => (
                            <Link
                                key={store._id}
                                to={`/stores/${store._id}`}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 card-hover animate-fadeInUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Card Header with gradient */}
                                <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"></div>

                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Store Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                                                {store.avatar ? (
                                                    <img src={store.avatar} alt={store.storeName} className="w-full h-full rounded-2xl object-cover" />
                                                ) : (
                                                    <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            {(store.emailVerified && store.mobileVerified) && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Store Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
                                                    {store.storeName}
                                                </h3>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                                                <span className="truncate">{store.storeAddress || store.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {store.storeDescription && (
                                        <p className="text-sm text-gray-600 mt-4 line-clamp-2 leading-relaxed">
                                            {store.storeDescription}
                                        </p>
                                    )}

                                    {/* Verification Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {store.emailVerified && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <EnvelopeIcon className="w-3.5 h-3.5 mr-1" />
                                                Email Verified
                                            </span>
                                        )}
                                        {store.mobileVerified && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                <PhoneIcon className="w-3.5 h-3.5 mr-1" />
                                                Phone Verified
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                                            <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" />
                                            Approved
                                        </span>
                                    </div>

                                    {/* View Store Button */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className="w-4 h-4 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="inline-flex items-center text-sm font-medium text-violet-600 group-hover:text-violet-700 transition-colors">
                                            View Store
                                            <ArrowRightIcon className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
