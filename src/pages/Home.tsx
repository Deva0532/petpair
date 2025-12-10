import React, { useState, useEffect } from 'react';
import { PetCard } from '../components/pets/PetCard';
import { PetFilters } from '../components/pets/PetFilters';
import { Pet } from '../types';
import { getPets, getWishlist, addToWishlist, removeFromWishlist } from '../services/petService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface FilterOptions {
  type: string;
  breed: string;
  gender: string;
  minAge: number;
  maxAge: number;
  minPrice: number;
  maxPrice: number;
  location: string;
  radius: number;
  vaccinated?: boolean;
  availableForMating?: boolean;
  sizePreference: string;
  activityLevel: string;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  houseTrained?: boolean;
  spayedNeutered?: boolean;
  specialNeeds?: boolean;
}

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'sell' | 'dating'>('sell');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    breed: '',
    gender: 'any',
    minAge: 0,
    maxAge: 20,
    minPrice: 0,
    maxPrice: 500000,
    location: '',
    radius: 50,
    vaccinated: undefined,
    availableForMating: undefined,
    sizePreference: 'any',
    activityLevel: 'any',
    goodWithKids: undefined,
    goodWithPets: undefined,
    houseTrained: undefined,
    spayedNeutered: undefined,
    specialNeeds: undefined,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high' | 'age' | 'featured'>('recent');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const fetchedPets = await getPets();
        setPets(fetchedPets);
      } catch (error) {
        console.error("Failed to fetch pets", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }
      try {
        const wishlist = await getWishlist();
        const favoriteIds = wishlist.map((item: any) => item.pet?.id || item.pet?._id).filter(Boolean);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      }
    };
    fetchWishlist();
  }, [user]);

  const filteredPets = pets.filter(pet => {
    // If logged in, filter out own pets
    if (user && pet.owner && (pet.owner.id === user.id || (pet.owner as any)._id === user.id)) return false;

    if (activeTab === 'dating' && !pet.availableForMating) return false;
    if (activeTab === 'sell' && pet.availableForMating && !pet.price) return false;
    if (filters.type !== 'all' && pet.type !== filters.type) return false;
    if (filters.breed && pet.breed !== filters.breed) return false;
    if (filters.gender && filters.gender !== 'any' && pet.gender !== filters.gender) return false;
    if (filters.sizePreference && filters.sizePreference !== 'any' && pet.size !== filters.sizePreference) return false;
    if (filters.activityLevel && filters.activityLevel !== 'any' && pet.activityLevel !== filters.activityLevel) return false;
    if (pet.age < filters.minAge || pet.age > filters.maxAge) return false;
    if (activeTab === 'sell' && (pet.price < filters.minPrice || pet.price > filters.maxPrice)) return false;
    if (filters.location && !pet.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.vaccinated !== undefined && pet.vaccinated !== filters.vaccinated) return false;
    if (filters.availableForMating !== undefined && pet.availableForMating !== filters.availableForMating) return false;
    if (filters.goodWithKids !== undefined && pet.goodWithKids !== filters.goodWithKids) return false;
    if (filters.goodWithPets !== undefined && pet.goodWithPets !== filters.goodWithPets) return false;
    if (filters.houseTrained !== undefined && pet.houseTrained !== filters.houseTrained) return false;
    if (filters.spayedNeutered !== undefined && pet.spayedNeutered !== filters.spayedNeutered) return false;
    if (filters.specialNeeds !== undefined && pet.specialNeeds !== filters.specialNeeds) return false;
    return true;
  });

  // Sort the filtered pets
  const sortedPets = [...filteredPets].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'age':
        return a.age - b.age;
      case 'recent':
      default:
        return 0; // Keep original order (newest first from API)
    }
  });

  const handleFavorite = async (petId: string) => {
    if (!user) {
      showToast('Please sign in to add to wishlist', 'info');
      return;
    }
    const isCurrentlyFavorited = favorites.includes(petId);
    if (isCurrentlyFavorited) {
      setFavorites(prev => prev.filter(id => id !== petId));
    } else {
      setFavorites(prev => [...prev, petId]);
    }
    try {
      if (isCurrentlyFavorited) {
        await removeFromWishlist(petId);
      } else {
        await addToWishlist(petId);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      if (isCurrentlyFavorited) {
        setFavorites(prev => [...prev, petId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== petId));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect <span className="text-rose-300">Pet</span> Match
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-violet-100">
              Buy, sell, and find love for your furry companions
            </p>

            {/* Tab Navigation */}
            <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-full p-1 mb-8">
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'sell' ? 'bg-white text-violet-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
              >
                🏪 Buy & Sell
              </button>
              <button
                onClick={() => setActiveTab('dating')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'dating' ? 'bg-white text-rose-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
              >
                💕 Pet Dating
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="pets-section">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-thin">
                <PetFilters filters={filters} onFiltersChange={setFilters} activeTab={activeTab} />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'sell' ? 'Pets for Sale' : 'Dating Partners'} ({filteredPets.length})
                </h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 bg-white shadow-sm cursor-pointer"
                >
                  <option value="recent">Sort by: Recent</option>
                  <option value="featured">⭐ Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="age">Age: Youngest First</option>
                </select>
              </div>

              {/* Tab Description */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-100">
                {activeTab === 'sell' ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-violet-900">Pet Marketplace</h3>
                      <p className="text-violet-700 text-sm">Browse and purchase pets from verified sellers</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-rose-900">Pet Dating Service</h3>
                      <p className="text-rose-700 text-sm">Find perfect breeding partners for your pets</p>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
                  <p className="text-gray-500 mt-4">Loading pets...</p>
                </div>
              ) : (
                <>
                  {sortedPets.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        All Available {activeTab === 'sell' ? 'Pets' : 'Partners'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {sortedPets.map(pet => (
                          <PetCard
                            key={pet.id}
                            pet={pet}
                            mode={activeTab}
                            isFavorited={favorites.includes(pet.id)}
                            onFavorite={handleFavorite}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPets.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🐾</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets found</h3>
                      <p className="text-gray-600">Try adjusting your filters to find more pets</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};