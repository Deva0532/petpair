import React, { useState, useEffect } from 'react';
import { MapIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { VetCard } from '../components/vets/VetCard';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Veterinarian } from '../types';

const API_BASE_URL = 'http://localhost:5000';

export const Vets: React.FC = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [bookingVetId, setBookingVetId] = useState<string | null>(null);
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const specialties = [
    'all',
    'General Practice',
    'Surgery',
    'Exotic Pets',
    'Emergency Care',
    'Dermatology',
    'Internal Medicine'
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
          image: vet.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vet.name)}&background=3b82f6&color=ffffff`,
          emergencyService: vet.emergencyService || false,
          availableDays: vet.availableDays || [],
          availableTime: vet.availableTime || ''
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
    if (selectedSpecialty !== 'all' && !vet.specialty.includes(selectedSpecialty)) {
      return false;
    }
    if (showEmergencyOnly && !vet.emergencyService) {
      return false;
    }
    return true;
  });

  const handleBookAppointment = (vetId: string) => {
    setBookingVetId(vetId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Veterinary Care
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with trusted veterinarians in your area for the best care for your pets
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showEmergencyOnly}
                    onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">24/7 Emergency only</span>
                </label>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-2"
            >
              <MapIcon className="w-5 h-5" />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </Button>
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Map integration would show veterinarian locations</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Veterinarians ({filteredVets.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading veterinarians...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredVets.map((vet) => (
              <VetCard
                key={vet.id}
                vet={vet}
                onBookAppointment={handleBookAppointment}
              />
            ))}
          </div>
        )}

        {filteredVets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No veterinarians found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
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
              {bookingVetId && vets.find((v: Veterinarian) => v.id === bookingVetId)?.name}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                placeholder="Describe the reason for your visit"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setBookingVetId(null)}>
              Cancel
            </Button>
            <Button variant="primary">
              Book Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};