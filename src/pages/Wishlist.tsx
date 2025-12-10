import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, TrashIcon, ExclamationTriangleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { getWishlist, removeFromWishlist, addToWishlist } from '../services/petService';
import { useAuth } from '../contexts/AuthContext';
import { Pet } from '../types';

interface WishlistItem {
    id: string;
    pet: Pet | null;
    addedAt: string;
}

export const Wishlist: React.FC = () => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [removedPetIds, setRemovedPetIds] = useState<Set<string>>(new Set());

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const items = await getWishlist();
            setWishlistItems(items);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const handleToggle = async (petId: string) => {
        if (processingId) return;
        setProcessingId(petId);

        try {
            const isRemoved = removedPetIds.has(petId);

            if (isRemoved) {
                // Restore item
                await addToWishlist(petId);
                setRemovedPetIds(prev => {
                    const next = new Set(prev);
                    next.delete(petId);
                    return next;
                });
            } else {
                // Remove item
                await removeFromWishlist(petId);
                setRemovedPetIds(prev => {
                    const next = new Set(prev);
                    next.add(petId);
                    return next;
                });
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
        } finally {
            setProcessingId(null);
        }
    };

    const removeAllUnavailable = async () => {
        const unavailable = wishlistItems.filter(item =>
            !item.pet || item.pet.status === 'sold' || item.pet.status === 'deleted'
        );
        for (const item of unavailable) {
            if (item.pet?.id) {
                await removeFromWishlist(item.pet.id);
            }
        }
        await fetchWishlist();
    };

    const availableItems = wishlistItems.filter(item => item.pet && item.pet.status !== 'sold' && item.pet.status !== 'deleted');
    const soldItems = wishlistItems.filter(item => item.pet?.status === 'sold');
    const unavailableItems = wishlistItems.filter(item => !item.pet || item.pet.status === 'deleted');

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <HeartSolidIcon className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
                    <p className="text-gray-600 mb-6">Keep track of your favorite pets by signing in.</p>
                    <Link to="/login">
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600">Sign In</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-rose-500 to-pink-500 p-3 rounded-xl">
                            <HeartSolidIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                            <p className="text-gray-600">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
                        </div>
                    </div>

                    {(soldItems.length > 0 || unavailableItems.length > 0) && (
                        <Button
                            variant="outline"
                            onClick={removeAllUnavailable}
                            className="text-gray-600"
                        >
                            Remove unavailable items
                        </Button>
                    )}
                </div>

                {wishlistItems.length === 0 ? (
                    <Card className="p-16 text-center">
                        <HeartIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-600 mb-6">Start adding pets you love to keep track of them here.</p>
                        <Link to="/">
                            <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
                                Browse Pets
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {/* Available Items */}
                        {availableItems.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm mr-2">
                                        {availableItems.length} Available
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableItems.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggle}
                                            isProcessing={processingId === item.pet?.id}
                                            isRemoved={item.pet ? removedPetIds.has(item.pet.id) : false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sold Items */}
                        {soldItems.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm mr-2">
                                        {soldItems.length} Sold
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {soldItems.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggle}
                                            isProcessing={processingId === item.pet?.id}
                                            isRemoved={item.pet ? removedPetIds.has(item.pet.id) : false}
                                            status="sold"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Unavailable Items */}
                        {unavailableItems.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mr-2">
                                        {unavailableItems.length} No Longer Available
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {unavailableItems.map((item) => (
                                        <WishlistCard
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggle}
                                            isProcessing={processingId === item.pet?.id}
                                            isRemoved={item.pet ? removedPetIds.has(item.pet.id) : false}
                                            status="deleted"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface WishlistCardProps {
    item: WishlistItem;
    onToggle: (petId: string) => void;
    isProcessing: boolean;
    isRemoved: boolean;
    status?: 'sold' | 'deleted';
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item, onToggle, isProcessing, isRemoved, status }) => {
    const pet = item.pet;

    if (!pet) {
        return (
            <Card className="overflow-hidden opacity-60">
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-400">Item Unavailable</h3>
                    </div>
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-gray-500">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm">This item is no longer available</span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-gray-500"
                        onClick={() => item.pet && onToggle(item.pet.id)}
                        disabled={isProcessing}
                    >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Processing...' : (isRemoved ? 'Restore' : 'Remove from wishlist')}
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`overflow-hidden transition-all ${status ? 'opacity-75 grayscale-[30%]' : 'hover:shadow-lg'}`}>
            <div className="relative">
                <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-full h-48 object-cover"
                />
                {pet.featured && !status && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Club
                    </div>
                )}

                {/* Status Overlay */}
                {status && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className={`px-4 py-2 rounded-lg font-semibold text-white ${status === 'sold' ? 'bg-amber-500' : 'bg-gray-600'
                            }`}>
                            {status === 'sold' ? '🏷️ This pet has been sold' : '❌ No longer available'}
                        </div>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onToggle(pet.id);
                    }}
                    disabled={isProcessing}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group/heart"
                    title={isRemoved ? "Add to wishlist" : "Remove from wishlist"}
                >
                    {isRemoved ? (
                        <HeartIcon className={`w-5 h-5 text-gray-600 transition-colors ${isProcessing ? 'animate-pulse' : 'hover:text-rose-500'}`} />
                    ) : (
                        <HeartSolidIcon className={`w-5 h-5 text-rose-500 transition-colors ${isProcessing ? 'animate-pulse' : 'group-hover/heart:text-gray-400'}`} />
                    )}
                </button>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-600">{pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old</p>
                    </div>
                    <span className={`text-lg font-bold ${status ? 'text-gray-400 line-through' : 'text-violet-600'}`}>
                        ${pet.price}
                    </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex items-center">
                    📍 {pet.location}
                </p>

                {status === 'sold' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-amber-700">
                            <ShoppingBagIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">This pet has been sold</span>
                        </div>
                    </div>
                )}

                {status === 'deleted' && (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-gray-600">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm">This listing has been removed by the seller</span>
                        </div>
                    </div>
                )}

                <div className="flex space-x-2">
                    {!status && (
                        <Link to={`/pet/${pet.id}`} className="w-full">
                            <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                                View Pet
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </Card>
    );
};
