import React, { useState, useEffect } from 'react';
import { PetCard } from '../components/pets/PetCard';
import { PetFilters } from '../components/pets/PetFilters';
import { mockPets } from '../data/mockData';
import { Pet } from '../types';
import { getPets } from '../services/petService';

interface FilterOptions {
  type: string;
  breed: string;
  minAge: number;
  maxAge: number;
  minPrice: number;
  maxPrice: number;
  location: string;
  radius: number;
  vaccinated?: boolean;
  availableForMating?: boolean;
  sizePreference?: string;
  activityLevel?: string;
  goodWithKids?: boolean;
  goodWithPets?: boolean;
  houseTrained?: boolean;
  spayedNeutered?: boolean;
  specialNeeds?: boolean;
}

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sell' | 'dating'>('sell');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    breed: '',
    minAge: 0,
    maxAge: 20,
    minPrice: 0,
    maxPrice: 5000,
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

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const fetchedPets = await getPets();
        setPets([...fetchedPets, ...mockPets]);
      } catch (error) {
        console.error("Failed to fetch pets", error);
        setPets(mockPets);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = pets.filter(pet => {
    if (activeTab === 'dating' && !pet.availableForMating) return false;
    if (activeTab === 'sell' && pet.availableForMating && !pet.price) return false;
    if (filters.type !== 'all' && pet.type !== filters.type) return false;
    if (filters.breed && pet.breed !== filters.breed) return false;
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

  const featuredPets = filteredPets.filter(pet => pet.featured);
  const regularPets = filteredPets.filter(pet => !pet.featured);

  const handleFavorite = (petId: string) => {
    setFavorites(prev =>
      prev.includes(petId)
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
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
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'sell'
                  ? 'bg-white text-violet-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                🏪 Buy & Sell
              </button>
              <button
                onClick={() => setActiveTab('dating')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === 'dating'
                  ? 'bg-white text-rose-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
                  }`}
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
            {/* Filters Sidebar - Sticky */}
            <div className="lg:w-1/4">
              <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-transparent">
                <PetFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  activeTab={activeTab}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'sell' ? 'Pets for Sale' : 'Dating Partners'} ({filteredPets.length})
                </h2>
                <select className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm">
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Age: Youngest First</option>
                  <option>Recently Added</option>
                </select>
              </div>

              {/* Tab Content Description */}
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
                  {/* Featured Pets */}
                  {featuredPets.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        ⭐ Club {activeTab === 'sell' ? 'Pets' : 'Partners'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {featuredPets.map(pet => (
                          <PetCard
                            key={pet.id}
                            pet={pet}
                            onFavorite={handleFavorite}
                            isFavorited={favorites.includes(pet.id)}
                            mode={activeTab}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Pets */}
                  {regularPets.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        All Available {activeTab === 'sell' ? 'Pets' : 'Partners'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {regularPets.map(pet => (
                          <PetCard
                            key={pet.id}
                            pet={pet}
                            onFavorite={handleFavorite}
                            isFavorited={favorites.includes(pet.id)}
                            mode={activeTab}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPets.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No {activeTab === 'sell' ? 'pets' : 'partners'} found
                      </h3>
                      <p className="text-gray-600">Try adjusting your filters to see more results.</p>
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