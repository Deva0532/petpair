import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  goodWithKids?: boolean; // New optional filter
  goodWithPets?: boolean; // New optional filter
  houseTrained?: boolean; // New optional filter
  spayedNeutered?: boolean; // New optional filter
  specialNeeds?: boolean; // New optional filter
}

interface PetFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  activeTab?: 'sell' | 'dating';
}

const petTypes = ['all', 'dog', 'cat', 'bird', 'fish', 'reptile', 'other'];
const popularBreeds = [
  'All Breeds',
  'Golden Retriever',
  'German Shepherd',
  'Labrador',
  'Persian',
  'Siamese',
  'Maine Coon',
  'Bulldog',
  'Poodle'
];

export const PetFilters: React.FC<PetFiltersProps> = ({ filters, onFiltersChange, activeTab = 'sell' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

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
      goodWithKids: undefined, // Reset new filter
      goodWithPets: undefined, // Reset new filter
      houseTrained: undefined, // Reset new filter
      spayedNeutered: undefined, // Reset new filter
      specialNeeds: undefined, // Reset new filter
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-violet-600 hover:bg-violet-50"
          >
            Clear All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden"
          >
            {isExpanded ? <XMarkIcon className="w-4 h-4" /> : 'More'}
          </Button>
        </div>
      </div>

      <div className={`space-y-6 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Pet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            {petTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
          <select
            value={filters.breed}
            onChange={(e) => updateFilter('breed', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            {popularBreeds.map((breed) => (
              <option key={breed} value={breed === 'All Breeds' ? '' : breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>
        
        {/* Size Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size Preference
          </label>
          <select
            value={filters.sizePreference}
            onChange={(e) => updateFilter('sizePreference', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="any">Any Size</option>
            <option value="small">Small (Under 25 lbs)</option>
            <option value="medium">Medium (25-60 lbs)</option>
            <option value="large">Large (60-100 lbs)</option>
            <option value="extra-large">Extra Large (Over 100 lbs)</option>
          </select>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Level
          </label>
          <select
            value={filters.activityLevel}
            onChange={(e) => updateFilter('activityLevel', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="any">Any Activity Level</option>
            <option value="low">Low - Calm and relaxed</option>
            <option value="moderate">Moderate - Some exercise needed</option>
            <option value="high">High - Very active and energetic</option>
          </select>
        </div>
        
        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min age"
                value={filters.minAge}
                onChange={(e) => updateFilter('minAge', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max age"
                value={filters.maxAge}
                onChange={(e) => updateFilter('maxAge', parseInt(e.target.value) || 20)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Price Range - Only show for sell tab */}
        {activeTab === 'sell' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value) || 5000)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            placeholder="Enter city or zip code"
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">Search Radius: {filters.radius} miles</label>
            <input
              type="range"
              min="5"
              max="100"
              value={filters.radius}
              onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Additional Options</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.vaccinated === true}
                onChange={(e) => updateFilter('vaccinated', e.target.checked ? true : undefined)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="ml-2 text-sm text-gray-700">Vaccinated only</span>
            </label>
            {activeTab === 'sell' && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.availableForMating === true}
                  onChange={(e) => updateFilter('availableForMating', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="ml-2 text-sm text-gray-700">Also available for mating</span>
              </label>
            )}
          </div>
        </div>
        
        {/* Pet Characteristics */}
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Pet Characteristics (Optional)</label>
            <div className="space-y-2">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.goodWithKids === true}
                        onChange={(e) => updateFilter('goodWithKids', e.target.checked ? true : undefined)}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Good with Kids</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.goodWithPets === true}
                        onChange={(e) => updateFilter('goodWithPets', e.target.checked ? true : undefined)}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Good with Other Pets</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.houseTrained === true}
                        onChange={(e) => updateFilter('houseTrained', e.target.checked ? true : undefined)}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">House Trained</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.spayedNeutered === true}
                        onChange={(e) => updateFilter('spayedNeutered', e.target.checked ? true : undefined)}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Spayed/Neutered</span>
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={filters.specialNeeds === true}
                        onChange={(e) => updateFilter('specialNeeds', e.target.checked ? true : undefined)}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Open to Special Needs</span>
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};