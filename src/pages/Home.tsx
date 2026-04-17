import React, { useState, useEffect } from 'react';
import { PetCard } from '../components/pets/PetCard';
import { PetFilters } from '../components/pets/PetFilters';
import { Pet } from '../types';
import { getPets, getWishlist, addToWishlist, removeFromWishlist } from '../services/petService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
  const [filterOpen, setFilterOpen] = useState(false);

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
        // Extract pet IDs from wishlist items, handling both id formats
        const favoriteIds = wishlist.map((item: any) => {
          // Handle both formats: item.pet or direct item structure
          const pet = item.pet || item;
          if (pet) {
            return String(pet.id || pet._id || '');
          }
          return '';
        }).filter((id: string) => id.length > 0);
        console.log('Wishlist favorite IDs:', favoriteIds);
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

    const petIdStr = String(petId);
    const isCurrentlyFavorited = favorites.includes(petIdStr);

    // Optimistic update
    if (isCurrentlyFavorited) {
      setFavorites(prev => prev.filter(id => id !== petIdStr));
    } else {
      setFavorites(prev => [...prev, petIdStr]);
    }

    try {
      if (isCurrentlyFavorited) {
        await removeFromWishlist(petIdStr);
        showToast('Removed from wishlist', 'info');
      } else {
        await addToWishlist(petIdStr);
        showToast('Added to wishlist ❤️', 'success');
      }
    } catch (error: any) {
      console.error('Failed to update wishlist:', error);
      // Revert optimistic update
      if (isCurrentlyFavorited) {
        setFavorites(prev => [...prev, petIdStr]);
      } else {
        setFavorites(prev => prev.filter(id => id !== petIdStr));
      }
      // Show appropriate error message
      const msg = error?.message || 'Failed to update wishlist';
      if (msg.includes('already in wishlist')) {
        // Not really an error - just sync state
        setFavorites(prev => prev.includes(petIdStr) ? prev : [...prev, petIdStr]);
      } else {
        showToast(msg, 'error');
      }
    }
  };

  const switchToDating = () => {
    setActiveTab('dating');
    showToast('Switched to Pet Dating mode 💕', 'info');
  };

  const switchToSell = () => {
    setActiveTab('sell');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        {/* Decorative background orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-fuchsia-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 text-center">
          <div className="animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-600 text-sm font-semibold mb-8 border border-violet-100/60 shadow-sm shadow-violet-100/20">
              <span className="text-base">✨</span> The smartest way to find your companion
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-3 leading-[1.1]">
              Find Your New
            </h1>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">Best Friend</span>
            </h1>

            <p className="max-w-xl mx-auto text-lg text-slate-500 mb-8 leading-relaxed font-medium">
              Browse thousands of verified pets from trusted sellers and breeders near you.
            </p>
          </div>

        </div>
      </div>

      {/* Floating Navigation Pill */}
      <div 
        className={`floating-nav-indicator fixed z-50 cursor-pointer group ${activeTab === 'sell' ? 'top-[88px] right-6 floating-nav-right' : 'top-[88px] left-6 floating-nav-left'}`}
        onClick={activeTab === 'sell' ? switchToDating : switchToSell}
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 opacity-80 group-hover:opacity-100 transition-opacity floating-nav-gradient-spin" />
        
        {/* Inner content */}
        <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl px-4 py-3 flex items-center gap-3">
          {/* Pulsing heart */}
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500 rounded-xl blur-md opacity-40 floating-nav-heart" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <HeartSolidIcon className="w-5 h-5 text-white floating-nav-heart-icon" />
            </div>
          </div>
          
          {/* Text */}
          <div className="flex flex-col mr-1">
            <span className="text-[12px] font-extrabold text-white leading-tight tracking-wide">
              {activeTab === 'sell' ? 'Pet Dating' : 'Marketplace'}
            </span>
            <span className="text-[10px] font-medium text-rose-300/80 leading-tight">
              {activeTab === 'sell' ? 'Find a match →' : '← Browse pets'}
            </span>
          </div>
          
          {/* Arrow indicator */}
          <div className={`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center floating-nav-arrow ${activeTab === 'dating' ? 'rotate-180' : ''}`}>
            <ArrowRightIcon className="w-3.5 h-3.5 text-white/80" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div id="pets-section">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop only, collapsible */}
            <div className="lg:w-1/4 hidden lg:block">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-hide">
                <PetFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  activeTab={activeTab}
                  isOpen={filterOpen}
                  onToggle={() => setFilterOpen(!filterOpen)}
                  onClose={() => setFilterOpen(false)}
                />
              </div>
            </div>

            {/* Mobile filter (floating button + slide-over rendered by PetFilters) */}
            <div className="lg:hidden">
              <PetFilters
                filters={filters}
                onFiltersChange={setFilters}
                activeTab={activeTab}
                isOpen={filterOpen}
                onToggle={() => setFilterOpen(!filterOpen)}
                onClose={() => setFilterOpen(false)}
              />
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {activeTab === 'dating' ? 'Pets for Dating' : 'Available Pets'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[1.25rem] overflow-hidden border border-slate-100/80 animate-pulse">
                      <div className="aspect-[4/3.5] bg-slate-100 skeleton-shimmer" />
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-28 bg-slate-100 rounded-lg" />
                          <div className="h-5 w-16 bg-slate-100 rounded-lg" />
                        </div>
                        <div className="h-3.5 w-36 bg-slate-100 rounded-md" />
                        <div className="h-3 w-24 bg-slate-50 rounded-md" />
                      </div>
                    </div>
                  ))}
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
                          isFavorited={favorites.includes(String(pet.id))}
                          onFavorite={handleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-[1.25rem] border border-slate-100/80 shadow-sm">
                      <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl flex items-center justify-center">
                        <span className="text-4xl">🔍</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No pets found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-[0.95rem] leading-relaxed">We couldn't find any pets matching your criteria. Try adjusting your filters.</p>
                      <button
                        onClick={() => setFilters({ ...filters, type: 'all', breed: '', minPrice: 0, maxPrice: 500000 })}
                        className="mt-6 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all duration-300"
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