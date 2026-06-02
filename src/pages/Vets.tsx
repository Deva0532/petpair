import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { VetCard } from '../components/vets/VetCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Veterinarian } from '../types';

import { API_BASE_URL } from '../config';

export const Vets: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [bookingVetId, setBookingVetId] = useState<string | null>(null);
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const specialties = [
    'all',
    'General Practice',
    'Surgery',
    'Emergency Care',
    'Pharmacy',
    'Pet Supplies',
  ];

  const locations = [
    'All Locations',
    'Coimbatore',
    'Chennai',
    'Bangalore',
    'Bengaluru',
    'Tiruppur',
    'Hyderabad',
    'Mumbai',
  ];

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/vets`);
      if (response.ok) {
        const data = await response.json();
        // Map backend data to match Veterinarian interface
        const mappedVets = data.map((vet: any) => ({
          id: vet._id,
          name: vet.name,
          specialty: vet.specialty || [],
          rating: vet.rating || 0,
          reviewCount: vet.reviewCount || 0,
          location: vet.location || '',
          address: vet.address || '',
          phone: vet.phone || '',
          website: vet.website || '',
          directionsUrl: vet.directionsUrl || '',
          image: vet.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=3b82f6&color=ffffff`,
          emergencyService: vet.emergencyService || false,
          availableDays: vet.availableDays || [],
          availableTime: vet.availableTime || '',
          yearsInBusiness: vet.yearsInBusiness || '',
          onSiteServices: vet.onSiteServices || false,
          review: vet.review || '',
        }));
        setVets(mappedVets);
      }
    } catch (error) {
      console.error('Error fetching vets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVets = vets.filter(vet => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        vet.name.toLowerCase().includes(query) ||
        vet.address?.toLowerCase().includes(query) ||
        vet.location?.toLowerCase().includes(query) ||
        vet.specialty.some(s => s.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Location filter
    if (locationFilter && locationFilter !== 'All Locations') {
      if (!vet.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    // Specialty filter
    if (selectedSpecialty !== 'all' && !vet.specialty.includes(selectedSpecialty)) {
      return false;
    }

    // Emergency filter
    if (showEmergencyOnly && !vet.emergencyService) {
      return false;
    }

    return true;
  });

  // Sort by rating and review count
  const sortedVets = [...filteredVets].sort((a, b) => {
    // Emergency services first
    if (showEmergencyOnly) {
      if (a.emergencyService && !b.emergencyService) return -1;
      if (!a.emergencyService && b.emergencyService) return 1;
    }
    // Then by rating
    if (b.rating !== a.rating) return b.rating - a.rating;
    // Then by review count
    return b.reviewCount - a.reviewCount;
  });

  const handleBookAppointment = (vetId: string) => {
    setBookingVetId(vetId);
  };

  const clearFilters = () => {
    setSelectedSpecialty('all');
    setShowEmergencyOnly(false);
    setLocationFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSpecialty !== 'all' || showEmergencyOnly || locationFilter || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center animate-fadeInUp">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <span className="text-sm font-medium">🏥 Trusted Veterinary Care</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find <span className="text-violet-200">Veterinary</span> Care
            </h1>
            <p className="text-lg md:text-xl text-violet-100 max-w-2xl mx-auto">
              Connect with trusted veterinarians and animal hospitals near you
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, specialty, or location..."
                    className="w-full pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-violet-500 shadow-lg placeholder:text-gray-400"
                  />
                </div>
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full sm:w-48 pl-12 pr-4 py-4 bg-white text-gray-900 rounded-xl focus:ring-2 focus:ring-violet-500 shadow-lg appearance-none cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc === 'All Locations' ? '' : loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 animate-fadeInUp animation-delay-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Specialty Filter */}
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 cursor-pointer"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty === 'all' ? 'All Specialties' : specialty}
                  </option>
                ))}
              </select>

              {/* Emergency Filter */}
              <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={showEmergencyOnly}
                  onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                  className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">🚨</span> 24/7 Emergency Only
                </span>
              </label>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900">{sortedVets.length}</span> of {vets.length} veterinarians
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-violet-600">{vets.length}</div>
            <div className="text-sm text-gray-500">Total Vets</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-red-500">{vets.filter(v => v.emergencyService).length}</div>
            <div className="text-sm text-gray-500">24/7 Emergency</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">
              {(vets.reduce((sum, v) => sum + v.rating, 0) / vets.length || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Avg. Rating</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(vets.map(v => v.location).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-500">Locations</div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600 mb-4"></div>
            <p className="text-gray-600">Loading veterinarians...</p>
          </div>
        ) : (
          <>
            {sortedVets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedVets.map((vet, index) => (
                  <div key={vet.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <VetCard
                      vet={vet}
                      onBookAppointment={handleBookAppointment}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No veterinarians found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={!!bookingVetId}
        onClose={() => setBookingVetId(null)}
        title="Book Appointment"
        maxWidth="lg"
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-600 mb-4">
              Book an appointment with{' '}
              <span className="font-semibold text-gray-900">
                {bookingVetId && vets.find((v: Veterinarian) => v.id === bookingVetId)?.name}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                  <option>5:00 PM</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name
              </label>
              <input
                type="text"
                placeholder="Enter your pet's name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Type
              </label>
              <select className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
                <option>Fish</option>
                <option>Reptile</option>
                <option>Other</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                placeholder="Describe the reason for your visit (e.g., vaccination, checkup, illness symptoms)"
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setBookingVetId(null)}>
              Cancel
            </Button>
            <Button variant="primary" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              Request Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};