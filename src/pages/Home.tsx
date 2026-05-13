import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  q?: string;
}
// 8 pet-themed SVG icons used by the ambient background
const petSvgs = {
  // Paw print
  paw: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8.35 3c-.98 0-2 .76-2 1.76S7.37 7 8.35 7s2-.98 2-1.76S9.33 3 8.35 3m7.3 0c-.98 0-2 .76-2 1.76S14.67 7 15.65 7s2-.98 2-1.76S16.63 3 15.65 3M5 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m-7 3c-2.76 0-5 2.24-5 5 0 1.65.67 3.14 1.76 4.24A5.96 5.96 0 0 0 12 22a5.96 5.96 0 0 0 4.24-1.76A5.96 5.96 0 0 0 18 16c0-2.76-2.24-5-5-5z"/></svg>,
  // Heart
  heart: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  // Bone
  bone: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M8.094 2.577a2.723 2.723 0 0 0-3.86 0 2.731 2.731 0 0 0-.614 2.953L3.1 6.05a2.731 2.731 0 0 0-2.953.614 2.723 2.723 0 0 0 0 3.86 2.723 2.723 0 0 0 3.86 0l6.418-6.418-.06-.06a2.723 2.723 0 0 0 0-3.86 2.723 2.723 0 0 0-2.27-.609zM15.906 21.423a2.723 2.723 0 0 0 3.86 0 2.731 2.731 0 0 0 .614-2.953l.52-.52a2.731 2.731 0 0 0 2.953-.614 2.723 2.723 0 0 0 0-3.86 2.723 2.723 0 0 0-3.86 0l-6.418 6.418.06.06a2.723 2.723 0 0 0 0 3.86c.632.632 1.46.89 2.27.609z"/></svg>,
  // Star
  star: <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  // Fish
  fish: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 20L2 12l10-8v4c7 0 10 4 10 8-2-3.5-5-5-10-5v5zM4.5 12L12 17.5V14c4.5 0 7.5 1 9.3 3.5C20.5 14 17.5 11 12 11V7.5L4.5 12z"/></svg>,
  // Collar / tag
  collar: <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>,
  // Ball
  ball: <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.86 0 3.56.64 4.9 1.71l-1.44 1.44A6.924 6.924 0 0 0 12 6c-1.2 0-2.33.31-3.31.99L7.1 5.71A7.958 7.958 0 0 1 12 4zM4 12c0-1.86.64-3.56 1.71-4.9l1.44 1.44C6.31 9.67 6 10.8 6 12s.31 2.33.99 3.31L5.71 16.9A7.958 7.958 0 0 1 4 12zm8 8c-1.86 0-3.56-.64-4.9-1.71l1.44-1.44c1.13.84 2.26 1.15 3.46 1.15s2.33-.31 3.31-.99l1.59 1.28A7.958 7.958 0 0 1 12 20zm6.29-3.1l-1.44-1.44c.84-1.13 1.15-2.26 1.15-3.46s-.31-2.33-.99-3.31l1.28-1.59A7.958 7.958 0 0 1 20 12c0 1.86-.64 3.56-1.71 4.9z"/></svg>,
  // Butterfly
  butterfly: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 3c-.55 0-1 .45-1 1v1.07C7.91 5.5 5.24 7.89 4.26 11c-.6 1.9-.2 4 .96 5.46 1.21 1.52 3 2.38 4.78 2.54v1c0 .55.45 1 1 1s1-.45 1-1v-1c1.78-.16 3.57-1.02 4.78-2.54 1.16-1.46 1.56-3.56.96-5.46-.98-3.11-3.65-5.5-6.74-5.93V4c0-.55-.45-1-1-1zm-1 4.07c2.27.44 4.19 2.21 4.97 4.63.4 1.24.14 2.53-.62 3.5-.73.92-1.84 1.5-2.99 1.67V9c0-.55-.45-1-1-1h-.36c.02-.64.08-1.27.36-1.93h-.36zM7.65 16.2c-.76-.97-1.02-2.26-.62-3.5.78-2.42 2.7-4.19 4.97-4.63V16.87c-1.15-.17-2.26-.75-2.99-1.67h-1.36z"/></svg>,
};

// Pick which SVG to show based on index and mode
const getSvgForIndex = (i: number, mode: 'sell' | 'dating') => {
  if (mode === 'dating') {
    // Dating: heavy on hearts, paws, butterflies, stars
    const pool = [petSvgs.heart, petSvgs.paw, petSvgs.butterfly, petSvgs.star, petSvgs.heart, petSvgs.paw, petSvgs.collar, petSvgs.heart];
    return pool[i % pool.length];
  }
  // Marketplace: heavy on paws, bones, balls, fish
  const pool = [petSvgs.paw, petSvgs.bone, petSvgs.ball, petSvgs.star, petSvgs.paw, petSvgs.fish, petSvgs.bone, petSvgs.collar];
  return pool[i % pool.length];
};

const BackgroundAnimation: React.FC<{ mode: 'sell' | 'dating' }> = ({ mode }) => {
  const elements = Array.from({ length: 24 });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((_, i) => {
        const left = `${((i * 13 + 7) % 100)}%`;
        const duration = `${10 + (i % 8) * 1.8}s`;
        const delay = `${(i * 1.3) % 10}s`;
        const opacity = 0.22 + ((i % 5) * 0.04);
        const scale = 0.6 + ((i % 4) * 0.3);
        const rotate = (i % 2 === 0) ? '360deg' : '-360deg';

        const colorClass = mode === 'dating'
            ? ['text-rose-300', 'text-pink-300', 'text-red-300', 'text-rose-400/70'][i % 4]
            : ['text-violet-300', 'text-fuchsia-300', 'text-orange-300', 'text-purple-300/70'][i % 4];

        return (
          <div
            key={i}
            className={`ambient-element ${colorClass} transition-colors duration-1000`}
            style={{
              left,
              '--ambient-duration': duration,
              '--ambient-delay': delay,
              '--ambient-opacity': opacity,
              '--ambient-scale': scale,
              '--ambient-rotate': rotate,
            } as React.CSSProperties}
          >
            {getSvgForIndex(i, mode)}
          </div>
        );
      })}
    </div>
  );
};

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') as 'sell' | 'dating';
  const [activeTab, setActiveTab] = useState<'sell' | 'dating'>(modeParam || 'sell');

  useEffect(() => {
    if (modeParam && (modeParam === 'sell' || modeParam === 'dating')) {
      setActiveTab(modeParam);
    }
  }, [modeParam]);
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
    q: searchParams.get('q') || undefined,
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

  // Listen for search query changes from Header
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== filters.q) {
      setFilters(prev => ({ ...prev, q: q || undefined }));
    }
  }, [searchParams]);

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
    if (pet.status === 'sold') return false;
    // If logged in, filter out own pets
    if (user && pet.owner && (pet.owner.id === user.id || (pet.owner as any)._id === user.id)) return false;
    // Filter out admin pets from the marketplace
    if (pet.owner && (pet.owner.role === 'admin' || (pet.owner as any).role === 'admin')) return false;
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
    <div className="min-h-screen bg-slate-50/50 relative">
      {/* Full-page floating pet animations */}
      <BackgroundAnimation mode={activeTab} />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50/50 transition-colors duration-700">
        {/* Decorative background orbs - Dynamic colors */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 z-0 ${activeTab === 'sell' ? 'bg-violet-100/60' : 'bg-rose-100/60'}`} />
        <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-1000 z-0 ${activeTab === 'sell' ? 'bg-fuchsia-100/50' : 'bg-pink-100/50'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-colors duration-1000 z-0 ${activeTab === 'sell' ? 'bg-orange-50/40' : 'bg-red-50/40'}`} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 sm:pb-12 text-center z-10">
          <div className="animate-fadeInUp relative z-10">
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border shadow-sm transition-colors duration-700 text-xs sm:text-sm font-semibold mb-4 sm:mb-8 
              ${activeTab === 'sell' 
                ? 'bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-600 border-violet-100/60 shadow-violet-100/20' 
                : 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 border-rose-200/60 shadow-rose-200/30'}`}>
              <span className="text-sm sm:text-base">{activeTab === 'sell' ? '✨' : '💖'}</span> 
              <span className="hidden sm:inline">{activeTab === 'sell' ? 'The smartest way to find your companion' : 'Find true love for your furry friend'}</span>
              <span className="sm:hidden">{activeTab === 'sell' ? 'Find your companion' : 'Find love for your pet'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-2 sm:mb-3 leading-[1.1] transition-all duration-500">
              {activeTab === 'sell' ? 'Find Your New' : 'Find The Perfect'}
            </h1>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.1] transition-all duration-500">
              <span className={`bg-clip-text text-transparent bg-gradient-to-r transition-all duration-700 ${
                activeTab === 'sell' 
                  ? 'from-violet-600 via-fuchsia-500 to-orange-400' 
                  : 'from-rose-500 via-pink-500 to-red-500'
              }`}>
                {activeTab === 'sell' ? 'Best Friend' : 'Match'}
              </span>
            </h1>

            <p className="max-w-xl mx-auto text-sm sm:text-lg text-slate-500 mb-4 sm:mb-8 leading-relaxed font-medium transition-all duration-500 px-2 sm:px-0">
              {activeTab === 'sell' 
                ? 'Browse thousands of verified pets from trusted sellers and breeders near you.'
                : 'Discover wonderful companions in your area for your pet to date, play, or breed with.'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 z-10">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 px-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${activeTab === 'sell' ? 'text-violet-900' : 'text-rose-900'}`}>
                    {activeTab === 'dating' ? 'Pets for Dating' : 'Available Pets'}
                  </h2>
                  <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${
                    activeTab === 'sell' ? 'bg-violet-100 text-violet-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {displayCount}
                  </span>
                </div>

                <div className="relative w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`w-full sm:w-auto pl-4 pr-10 py-2 sm:py-2.5 bg-white border-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm cursor-pointer appearance-none outline-none transition-all ${
                      activeTab === 'sell'
                        ? 'border-violet-100 text-violet-700 hover:border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10'
                        : 'border-rose-100 text-rose-700 hover:border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                    }`}
                  >
                    <option value="recent">Sort by: Newest</option>
                    <option value="featured">Featured First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${activeTab === 'sell' ? 'text-violet-500' : 'text-rose-500'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                    <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">←</span>
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
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
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
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">→</span>
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
    </div>
  );
};