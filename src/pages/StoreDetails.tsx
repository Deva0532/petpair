import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BuildingStorefrontIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, CheckBadgeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = 'http://localhost:5000';

interface Store {
    _id: string;
    name: string;
    email: string;
    storeName: string;
    storeDescription: string;
    storeAddress: string;
    location: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    emailVerified: boolean;
    mobileVerified: boolean;
}

interface Pet {
    _id: string;
    name: string;
    breed: string;
    age: number;
    price: number;
    imageUrls: string[];
    type: string;
}

export const StoreDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [store, setStore] = useState<Store | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStoreDetails();
    }, [id]);

    const fetchStoreDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stores/${id}`);
            const data = await response.json();
            setStore(data.store);
            setPets(data.pets || []);
        } catch (error) {
            console.error('Error fetching store details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Store not found</h2>
                <Link to="/stores" className="text-violet-600 hover:text-violet-700 mt-4 inline-block">
                    ← Back to stores
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link to="/stores" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to stores
            </Link>

            {/* Store Header */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        {store.avatar ? (
                            <img src={store.avatar} alt={store.storeName} className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            <BuildingStorefrontIcon className="w-12 h-12 text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
                            {(store.emailVerified || store.mobileVerified) && (
                                <CheckBadgeIcon className="w-7 h-7 text-blue-500" />
                            )}
                        </div>
                        <p className="text-gray-600 mt-2">{store.storeDescription || store.bio}</p>

                        <div className="flex flex-wrap gap-4 mt-4">
                            <div className="flex items-center text-gray-600">
                                <MapPinIcon className="w-5 h-5 mr-2" />
                                {store.storeAddress || store.location}
                            </div>
                            {store.phone && (
                                <div className="flex items-center text-gray-600">
                                    <PhoneIcon className="w-5 h-5 mr-2" />
                                    {store.phone}
                                </div>
                            )}
                            <div className="flex items-center text-gray-600">
                                <EnvelopeIcon className="w-5 h-5 mr-2" />
                                {store.email}
                            </div>
                        </div>

                        {/* Verification Badges */}
                        <div className="flex items-center space-x-2 mt-4">
                            {store.emailVerified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✓ Email Verified
                                </span>
                            )}
                            {store.mobileVerified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    ✓ Mobile Verified
                                </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                                ✓ Approved Store
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pets Section */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pets from this store ({pets.length})</h2>

                {pets.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <p className="text-gray-500">No pets listed by this store yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {pets.map((pet) => (
                            <Link
                                key={pet._id}
                                to={`/pet/${pet._id}`}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                            >
                                <div className="aspect-square relative">
                                    <img
                                        src={pet.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1'}
                                        alt={pet.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                                    <p className="text-sm text-gray-500">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                                    {pet.price > 0 && (
                                        <p className="text-lg font-bold text-violet-600 mt-2">₹{pet.price.toLocaleString()}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
