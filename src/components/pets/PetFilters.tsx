import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';

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
  };

  const activeFiltersCount = [
    filters.type !== 'all',
    filters.breed !== '',
    filters.sizePreference !== 'any',
    filters.activityLevel !== 'any',
    filters.location !== '',
    filters.vaccinated !== undefined,
    filters.goodWithKids !== undefined,
    filters.goodWithPets !== undefined,
    filters.houseTrained !== undefined,
    filters.spayedNeutered !== undefined,
    filters.specialNeeds !== undefined,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FunnelIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-violet-200">{activeFiltersCount} active</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden bg-white/20 p-2 rounded-lg text-white"
            >
              {isExpanded ? <XMarkIcon className="w-4 h-4" /> : <AdjustmentsHorizontalIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`p-6 space-y-5 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Pet Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type</label>
          <div className="grid grid-cols-4 gap-2">
            {petTypes.slice(0, 4).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.type === type
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                  }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {petTypes.slice(4).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.type === type
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
          <select
            value={filters.breed}
            onChange={(e) => updateFilter('breed', e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all bg-gray-50"
          >
            {availableBreeds.map((breed) => (
              <option key={breed} value={breed === 'All Breeds' ? '' : breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>

        {/* Size Preference */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'any', label: 'Any' },
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ].map((size) => (
              <button
                key={size.value}
                onClick={() => updateFilter('sizePreference', size.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.sizePreference === size.value
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                  }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Activity Level</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'any', label: 'Any', icon: '🎯' },
              { value: 'low', label: 'Low', icon: '😴' },
              { value: 'moderate', label: 'Moderate', icon: '🚶' },
              { value: 'high', label: 'High', icon: '🏃' },
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => updateFilter('activityLevel', level.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${filters.activityLevel === level.value
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                  }`}
              >
                <span>{level.icon}</span>
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age Range (years)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAge}
                onChange={(e) => updateFilter('minAge', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50"
              />
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAge}
                onChange={(e) => updateFilter('maxAge', parseInt(e.target.value) || 20)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Price Range */}
        {activeTab === 'sell' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range ($)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 5000)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Advanced Options - Collapsible */}
        <div className="border-2 border-gray-100 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-semibold text-gray-700">Advanced Options</span>
            </div>
            {isAdvancedOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {isAdvancedOpen && (
            <div className="p-4 space-y-4 bg-white border-t border-gray-100">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📍 Location</label>
                <input
                  type="text"
                  placeholder="Enter city or zip code"
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50"
                />
              </div>

              {/* Search Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius: <span className="text-violet-600 font-semibold">{filters.radius} miles</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={filters.radius}
                  onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 mi</span>
                  <span>100 mi</span>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.vaccinated === true}
                    onChange={(e) => updateFilter('vaccinated', e.target.checked ? true : undefined)}
                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-violet-700">💉 Vaccinated only</span>
                </label>

                {activeTab === 'sell' && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.availableForMating === true}
                      onChange={(e) => updateFilter('availableForMating', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">💕 Also available for mating</span>
                  </label>
                )}
              </div>

              {/* Pet Characteristics */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">Pet Characteristics</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.goodWithKids === true}
                      onChange={(e) => updateFilter('goodWithKids', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">👶 Good with Kids</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.goodWithPets === true}
                      onChange={(e) => updateFilter('goodWithPets', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">🐾 Good with Other Pets</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.houseTrained === true}
                      onChange={(e) => updateFilter('houseTrained', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">🏠 House Trained</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.spayedNeutered === true}
                      onChange={(e) => updateFilter('spayedNeutered', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">✂️ Spayed/Neutered</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.specialNeeds === true}
                      onChange={(e) => updateFilter('specialNeeds', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-violet-700">🩺 Open to Special Needs</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};