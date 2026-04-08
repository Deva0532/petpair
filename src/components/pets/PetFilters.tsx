import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, AdjustmentsHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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

interface PetFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  activeTab?: 'sell' | 'dating';
}

const petTypes = ['all', 'dog', 'cat', 'bird', 'fish', 'reptile', 'other'];

const breedsByType: Record<string, string[]> = {
  all: ['All Breeds'],
  dog: ['All Breeds', 'Golden Retriever', 'German Shepherd', 'Labrador', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Chihuahua', 'Husky', 'Boxer', 'Other'],
  cat: ['All Breeds', 'Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal', 'Sphynx', 'Scottish Fold', 'Other'],
  bird: ['All Breeds', 'Parakeet', 'Canary', 'Cockatiel', 'Parrot', 'Finch', 'Lovebird', 'Other'],
  fish: ['All Breeds', 'Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Other'],
  reptile: ['All Breeds', 'Gecko', 'Python', 'Turtle', 'Iguana', 'Chameleon', 'Other'],
  other: ['All Breeds', 'Other']
};

export const PetFilters: React.FC<PetFiltersProps> = ({ filters, onFiltersChange, activeTab = 'sell' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleTypeChange = (newType: string) => {
    onFiltersChange({ ...filters, type: newType, breed: '' });
  };

  const availableBreeds = breedsByType[filters.type] || breedsByType['all'];

  const clearFilters = () => {
    onFiltersChange({
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
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-violet-50 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-violet-50 p-2.5 rounded-xl">
              <FunnelIcon className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center text-gray-400 hover:text-rose-500 text-xs font-semibold uppercase tracking-wide transition-colors group"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1 group-hover:rotate-180 transition-transform duration-300" />
            Reset
          </button>
        </div>
      </div>

      <div className={`p-6 space-y-8 ${!isExpanded ? 'hidden md:block' : ''}`}>

        {/* Gender */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Gender</label>
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {[
              { value: 'any', label: 'Any' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' }
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => updateFilter('gender', g.value)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${filters.gender === g.value
                    ? 'bg-white text-violet-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Size</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: 'any', label: 'Any' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }].map((size) => (
              <button key={size.value} onClick={() => updateFilter('sizePreference', size.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${filters.sizePreference === size.value
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Activity Level</label>
          <div className="grid grid-cols-2 gap-2">
            {[{ value: 'any', label: 'Any' }, { value: 'low', label: 'Low' }, { value: 'moderate', label: 'Moderate' }, { value: 'high', label: 'High' }].map((level) => (
              <button key={level.value} onClick={() => updateFilter('activityLevel', level.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${filters.activityLevel === level.value
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age (Years)</label>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
              {filters.minAge} - {filters.maxAge}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="0" value={filters.minAge}
              onChange={(e) => updateFilter('minAge', parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
            />
            <span className="text-gray-300">-</span>
            <input type="number" placeholder="20" value={filters.maxAge}
              onChange={(e) => updateFilter('maxAge', parseInt(e.target.value) || 20)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
        </div>

        {/* Price Range */}
        {activeTab === 'sell' && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range (₹)</label>
            <div className="flex items-center gap-3">
              <input type="number" placeholder="Min" value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
              />
              <span className="text-gray-300">-</span>
              <input type="number" placeholder="Max" value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 500000)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Advanced Options Toggle */}
        <div>
          <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
          >
            <span className="text-sm font-bold text-gray-700">Advanced Filters</span>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAdvancedOpen && (
            <div className="mt-4 space-y-4 animate-slideDown">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pet Type</label>
                <select value={filters.type} onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  {petTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Breed</label>
                <select value={filters.breed} onChange={(e) => updateFilter('breed', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  {availableBreeds.map(breed => <option key={breed} value={breed === 'All Breeds' ? '' : breed}>{breed}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'vaccinated', label: '💉 Vaccinated' },
                  { key: 'goodWithKids', label: '👶 Good with Kids' },
                  { key: 'houseTrained', label: '🏠 House Trained' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" checked={filters[item.key as keyof FilterOptions] === true}
                        onChange={(e) => updateFilter(item.key as keyof FilterOptions, e.target.checked ? true : undefined)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-gray-300 transition-all checked:border-violet-600 checked:bg-violet-600"
                      />
                      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-violet-700 transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};