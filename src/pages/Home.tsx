import React, { useState, useEffect } from 'react';
import { PetCard } from '../components/pets/PetCard';
import { PetFilters } from '../components/pets/PetFilters';
import { Pet } from '../types';
import { getPets, getWishlist, addToWishlist, removeFromWishlist } from '../services/petService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BuildingStorefrontIcon, HeartIcon } from '@heroicons/react/24/outline'; // Adjust icons as needed

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalPets: 0,
    petsPerPage: 12
  });
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
      setLoading(true);
      try {
        const { pets: fetchedPets, pagination: paginationData } = await getPets(currentPage, 12, sortBy, filters, activeTab);
        setPets(fetchedPets);
        setPagination(paginationData);
      } catch (error) {
        console.error("Failed to fetch pets", error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [currentPage, sortBy, filters, activeTab]);

  // Reset to page 1 when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeTab]);

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

  // Only filter out user's own pets client-side
  // All other filtering should be done on backend for proper pagination
  const filteredPets = pets.filter(pet => {
    // If logged in, filter out own pets
    if (user && pet.owner && (pet.owner.id === user.id || (pet.owner as any)._id === user.id)) return false;
    return true;
  });

  // Use filtered pets for display
  const displayPets = filteredPets;

  // Use pagination total for count
  const displayCount = pagination.totalPets;

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-semibold mb-6 border border-orange-100">
          <span className="text-lg">✨</span> The smartest way to find your companion
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-4">
          Find Your New
        </h1>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">Best Friend</span>
        </h1>

        <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-12 leading-relaxed">
          Browse thousands of verified pets from trusted sellers and breeders near you.
        </p>

        {/* Mode Selection Cards */}
        <div className="flex flex-col md:flex-row gap-6 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 p-6 rounded-3xl text-left transition-all duration-300 border ${activeTab === 'sell'
                ? 'bg-violet-50 border-violet-200 shadow-xl shadow-violet-100 ring-2 ring-violet-500 ring-offset-2'
                : 'bg-white border-slate-100 hover:border-violet-200 hover:shadow-lg'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${activeTab === 'sell' ? 'bg-violet-500 text-white' : 'bg-violet-100 text-violet-600'
              }`}>
              <BuildingStorefrontIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pet Marketplace</h3>
            <p className="text-sm text-slate-500 font-medium">Buy and adopt pets safely.</p>
          </button>

          <button
            onClick={() => setActiveTab('dating')}
            className={`flex-1 p-6 rounded-3xl text-left transition-all duration-300 border ${activeTab === 'dating'
                ? 'bg-rose-50 border-rose-200 shadow-xl shadow-rose-100 ring-2 ring-rose-500 ring-offset-2'
                : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-lg'
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${activeTab === 'dating' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'
              }`}>
              <HeartIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Pet Dating</h3>
            <p className="text-sm text-slate-500 font-medium">Match and breed pets.</p>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="pets-section">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-hide">
                <PetFilters filters={filters} onFiltersChange={setFilters} activeTab={activeTab} />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Available Pets
                  </h2>
                  <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {displayCount}
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer appearance-none transition-all"
                  >
                    <option value="recent">Sort by: Newest</option>
                    <option value="featured">Featured First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600"></div>
                  <p className="text-slate-500 mt-4 font-medium">Finding perfect matches...</p>
                </div>
              ) : (
                <>
                  {displayPets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {displayPets.map(pet => (
                        <PetCard
                          key={pet.id}
                          pet={pet}
                          mode={activeTab}
                          isFavorited={favorites.includes(pet.id)}
                          onFavorite={handleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="text-6xl mb-6">🔍</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No pets found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any pets matching your criteria. Try adjusting your filters.</p>
                      <button
                        onClick={() => setFilters({ ...filters, type: 'all', breed: '', minPrice: 0, maxPrice: 500000 })}
                        className="mt-6 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-11 h-11 rounded-xl font-bold transition-all ${currentPage === pageNum
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
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