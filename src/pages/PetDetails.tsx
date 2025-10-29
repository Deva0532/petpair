import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  MapPinIcon, 
  StarIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  CakeIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Pet } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { mockPets } from '../data/mockData';

export const PetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'owner'>('overview');

  // Mock additional images and data
  const images = pet ? [pet.image, pet.image, pet.image, pet.image] : [];
  const mockHealthRecords = [
    { date: '2024-01-15', type: 'Vaccination', description: 'Annual vaccines updated', vet: 'Dr. Smith' },
    { date: '2023-12-10', type: 'Checkup', description: 'Regular health checkup', vet: 'Dr. Johnson' },
    { date: '2023-11-05', type: 'Treatment', description: 'Dental cleaning', vet: 'Dr. Smith' }
  ];

  const mockSimilarPets = [
    { id: '1', name: 'Buddy', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) + 200, image: pet?.image || '' },
    { id: '2', name: 'Max', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) - 100, image: pet?.image || '' },
    { id: '3', name: 'Luna', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) + 50, image: pet?.image || '' }
  ];

  useEffect(() => {
    if (id) {
      const foundPet = mockPets.find(p => p.id === id);
      if (foundPet) {
        setPet(foundPet);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pet details...</p>
        </div>
      </div>
    );
  }

  const handleMessage = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/messages');
  };

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    alert('Contact feature would be implemented here');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${pet.name} - ${pet.breed}`,
        text: `Check out ${pet.name}, a beautiful ${pet.breed} available on PetPair!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-center">
                <CakeIcon className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{pet.age}</div>
                <div className="text-sm text-gray-600">Years Old</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 text-center">
                <ScaleIcon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">25</div>
                <div className="text-sm text-gray-600">lbs</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
                <HomeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 capitalize">{pet.type}</div>
                <div className="text-sm text-gray-600">Pet Type</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 text-center">
                <UserIcon className="w-8 h-8 text-rose-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{pet.neutered ? 'Yes' : 'No'}</div>
                <div className="text-sm text-gray-600">Neutered</div>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About {pet.name}</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{pet.description}</p>
            </Card>

            {/* Personality Traits */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality</h3>
              <div className="flex flex-wrap gap-3">
                {['Friendly', 'Energetic', 'Loyal', 'Playful', 'Gentle'].map((trait) => (
                  <span
                    key={trait}
                    className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </Card>

            {/* Care Requirements */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Care Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Exercise</div>
                    <div className="text-sm text-gray-600">2 hours daily</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <HomeIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Space</div>
                    <div className="text-sm text-gray-600">Large yard preferred</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'health':
        return (
          <div className="space-y-8">
            {/* Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className={`p-6 border-2 ${pet.vaccinated ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  {pet.vaccinated ? (
                    <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                  )}
                  <span className="font-semibold text-lg">Vaccinations</span>
                </div>
                <p className="text-gray-600">
                  {pet.vaccinated ? 'Up to date' : 'Needs updating'}
                </p>
              </Card>

              <Card className={`p-6 border-2 ${pet.neutered ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <div className="flex items-center space-x-3 mb-3">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                  <span className="font-semibold text-lg">Spayed/Neutered</span>
                </div>
                <p className="text-gray-600">
                  {pet.neutered ? 'Yes' : 'No'}
                </p>
              </Card>

              <Card className="p-6 border-2 border-emerald-200 bg-emerald-50">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                  <span className="font-semibold text-lg">Health Check</span>
                </div>
                <p className="text-gray-600">Recent checkup clear</p>
              </Card>
            </div>

            {/* Health Records */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Records</h3>
              <div className="space-y-4">
                {mockHealthRecords.map((record, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-3 h-3 bg-violet-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-lg">{record.type}</span>
                        <span className="text-sm text-gray-500">{record.date}</span>
                      </div>
                      <p className="text-gray-600 mb-1">{record.description}</p>
                      <p className="text-sm text-gray-500">By {record.vet}</p>
                  </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Medical Notes */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical Notes</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  No known allergies. Regular exercise recommended. Annual dental cleaning due in 3 months.
                </p>
              </div>
            </Card>
          </div>
        );

      case 'owner':
        return (
          <div className="space-y-8">
            {/* Owner Profile */}
            <Card className="p-6 bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-100">
              <div className="flex items-start space-x-6">
                <img
                  src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
                  alt={pet.owner.name}
                  className="w-20 h-20 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-semibold text-gray-900">{pet.owner.name}</h3>
                    {pet.owner.verified && (
                      <div className="flex items-center space-x-1">
                        <StarSolidIcon className="w-6 h-6 text-amber-400" />
                        <span className="text-sm text-emerald-600 font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPinIcon className="w-5 h-5" />
                    <span className="text-lg">{pet.owner.location}</span>
                  </div>
                  <p className="text-gray-500">
                    Member since {new Date(pet.owner.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Owner Stats */}
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-violet-600">12</div>
                <div className="text-gray-600 mt-1">Pets Listed</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-emerald-600">8</div>
                <div className="text-gray-600 mt-1">Successful Sales</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600">4.9</div>
                <div className="text-gray-600 mt-1">Rating</div>
              </Card>
            </div>

            {/* Reviews */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Reviews</h3>
              <div className="space-y-6">
                {[
                  { name: 'Sarah M.', rating: 5, comment: 'Great seller! Pet was exactly as described.' },
                  { name: 'Mike R.', rating: 5, comment: 'Very responsive and helpful throughout the process.' },
                  { name: 'Emma L.', rating: 4, comment: 'Smooth transaction, would recommend.' }
                ].map((review, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 text-lg">{review.name}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <StarSolidIcon key={i} className="w-5 h-5 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to listings</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={images[selectedImageIndex]}
                alt={pet.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  <ShareIcon className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
                >
                  {isFavorited ? (
                    <HeartSolidIcon className="w-6 h-6 text-rose-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {pet.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Club
                  </span>
                )}
                {pet.availableForMating && (
                  <span className="bg-gradient-to-r from-rose-400 to-pink-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    💕 Available for Dating
                  </span>
                )}
              </div>

              {/* Image Navigation */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedImageIndex === index
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex space-x-3 mt-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-violet-500 scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
          </div>

          </div>

          {/* Pet Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{pet.name}</h1>
              <p className="text-xl text-gray-600 mb-3">{pet.breed}</p>
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{pet.location}</span>
              </div>
              {pet.price > 0 && (
                <div className="text-4xl font-bold text-violet-600 mb-6">${pet.price}</div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{pet.age} years</div>
                <div className="text-gray-600">Age</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900 capitalize">{pet.type}</div>
                <div className="text-gray-600">Type</div>
              </div>
            </div>

            {/* Health Badges */}
            <div className="flex flex-wrap gap-2">
              {pet.vaccinated && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  ✓ Vaccinated
                </span>
              )}
              {pet.neutered && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ✓ Spayed/Neutered
                </span>
              )}
              {pet.owner.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                  ⭐ Verified Owner
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleMessage}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 text-lg"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6 mr-3" />
                Message Owner
              </Button>
              <Button
                onClick={handleContact}
                variant="outline"
                className="w-full border-violet-300 text-violet-700 hover:bg-violet-50 py-4 text-lg"
              >
                <PhoneIcon className="w-6 h-6 mr-3" />
                Contact Seller
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'health', label: 'Health' },
            { id: 'owner', label: 'Owner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {renderTabContent()}
        </div>

        {/* Location Section (Always Visible) */}
        <div className="space-y-8 mb-12">
          {/* Location Info */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
            <div className="flex items-center space-x-4 mb-4">
              <MapPinIcon className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
            </div>
            <p className="text-gray-700 text-lg mb-3">{pet.location}</p>
            <p className="text-gray-600">Available for local pickup or delivery within 50 miles</p>
          </Card>

          {/* Nearby Services */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Nearby Pet Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-lg">Pet Hospital</h4>
                <p className="text-gray-600">0.5 miles away</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-lg">Dog Park</h4>
                <p className="text-gray-600">1.2 miles away</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-lg">Pet Store</h4>
                <p className="text-gray-600">0.8 miles away</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-lg">Grooming Salon</h4>
                <p className="text-gray-600">1.5 miles away</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Similar Pets Section */}
        <Card className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">Similar Pets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockSimilarPets.map((similarPet) => (
              <div 
                key={similarPet.id} 
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => navigate(`/pet/${similarPet.id}`)}
              >
                <img
                  src={similarPet.image}
                  alt={similarPet.name}
                  className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                />
                <h4 className="font-semibold text-gray-900 text-lg">{similarPet.name}</h4>
                <p className="text-gray-600 mb-2">{similarPet.breed}</p>
                <p className="text-xl font-bold text-violet-600">${similarPet.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};