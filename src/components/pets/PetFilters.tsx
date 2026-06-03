import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon, ChevronDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface FilterOptions {
  type: string;
  breed: string;
  gender: string;
  minAge: number | '';
  maxAge: number | '';
  minPrice: number | '';
  maxPrice: number | '';
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
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
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

export const PetFilters: React.FC<PetFiltersProps> = ({ filters, onFiltersChange, activeTab = 'sell', isOpen, onToggle, onClose }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [minAgeInput, setMinAgeInput] = useState<string>(filters.minAge === '' ? '' : filters.minAge.toString());
  const [maxAgeInput, setMaxAgeInput] = useState<string>(filters.maxAge === '' ? '' : filters.maxAge.toString());
  const [minPriceInput, setMinPriceInput] = useState<string>(filters.minPrice === '' ? '' : filters.minPrice.toString());
  const [maxPriceInput, setMaxPriceInput] = useState<string>(filters.maxPrice === '' ? '' : filters.maxPrice.toString());

  useEffect(() => {
    setMinAgeInput(filters.minAge === '' ? '' : filters.minAge.toString());
    setMaxAgeInput(filters.maxAge === '' ? '' : filters.maxAge.toString());
    setMinPriceInput(filters.minPrice === '' ? '' : filters.minPrice.toString());
    setMaxPriceInput(filters.maxPrice === '' ? '' : filters.maxPrice.toString());
  }, [filters.minAge, filters.maxAge, filters.minPrice, filters.maxPrice]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleTypeChange = (newType: string) => {
    onFiltersChange({ ...filters, type: newType, breed: '' });
  };

  const availableBreeds = breedsByType[filters.type] || breedsByType['all'];

  const activeFilterCount = [
    filters.type !== 'all',
    filters.breed !== '',
    filters.gender !== 'any',
    filters.minAge !== '' && filters.minAge > 0,
    filters.maxAge !== '' && filters.maxAge < 20,
    filters.minPrice !== '' && filters.minPrice > 0,
    filters.maxPrice !== '' && filters.maxPrice < 500000,
    filters.sizePreference !== 'any',
    filters.activityLevel !== 'any',
    filters.vaccinated === true,
    filters.goodWithKids === true,
    filters.goodWithPets === true,
    filters.houseTrained === true,
  ].filter(Boolean).length;

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

  const filterContent = (
    <div className="p-5 space-y-6">
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
            {filters.minAge === '' ? 0 : filters.minAge} - {filters.maxAge === '' ? 20 : filters.maxAge}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input type="number" placeholder="Min" value={minAgeInput}
            onChange={(e) => {
              const val = e.target.value;
              setMinAgeInput(val);
              updateFilter('minAge', val === '' ? '' : parseFloat(val));
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
          />
          <span className="text-gray-300">-</span>
          <input type="number" placeholder="Max" value={maxAgeInput}
            onChange={(e) => {
              const val = e.target.value;
              setMaxAgeInput(val);
              updateFilter('maxAge', val === '' ? '' : parseFloat(val));
            }}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
          />
        </div>
      </div>

      {/* Price Range */}
      {activeTab === 'sell' && (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Range (₹)</label>
          <div className="flex items-center gap-3">
            <input type="number" placeholder="Min" value={minPriceInput}
              onChange={(e) => {
                const val = e.target.value;
                setMinPriceInput(val);
                updateFilter('minPrice', val === '' ? '' : parseFloat(val));
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-gray-50"
            />
            <span className="text-gray-300">-</span>
            <input type="number" placeholder="Max" value={maxPriceInput}
              onChange={(e) => {
                const val = e.target.value;
                setMaxPriceInput(val);
                updateFilter('maxPrice', val === '' ? '' : parseFloat(val));
              }}
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
  );

  return (
    <>
      {/* ====== DESKTOP: Collapsible inline panel ====== */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-3xl shadow-lg shadow-violet-50 overflow-hidden border border-gray-100">
          {/* Header - always visible, acts as toggle */}
          <button
            onClick={onToggle}
            className="w-full bg-white px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-violet-50 p-2.5 rounded-xl">
                <FunnelIcon className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <span className="bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearFilters(); }}
                  className="text-gray-400 hover:text-rose-500 text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowPathIcon className="w-3 h-3" /> Reset
                </span>
              )}
              <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Collapsible content */}
          <div className={`border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {filterContent}
          </div>
        </div>
      </div>

      {/* ====== MOBILE: Floating button + slide-over panel ====== */}

      {/* Floating filter button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-violet-600 text-white p-4 rounded-2xl shadow-xl shadow-violet-300/50 hover:bg-violet-700 transition-all active:scale-95"
      >
        <FunnelIcon className="w-6 h-6" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile slide-over backdrop */}
      {/* Mobile slide-over backdrop */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {/* Slide-over panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white shadow-2xl h-full flex flex-col animate-slide-left">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-violet-50 p-2.5 rounded-xl">
                  <FunnelIcon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs font-bold text-rose-500 uppercase tracking-wide px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                    Reset
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {filterContent}
            </div>

            {/* Apply button */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all active:scale-[0.98]"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile slide-left animation */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
};