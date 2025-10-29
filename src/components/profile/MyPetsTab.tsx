import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { mockPets } from '../../data/mockData';

export const MyPetsTab: React.FC = () => {
  const [pets] = useState(mockPets.slice(0, 6)); // Show first 6 pets as user's pets

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
          <p className="text-gray-600 mt-1">Manage your pet listings and track their performance</p>
        </div>
        <Link to="/add-pet">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600">
            <PlusIcon className="w-5 h-5" />
            <span>Add New Pet</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <div className="text-2xl font-bold text-violet-600">24</div>
          <div className="text-gray-600 text-sm">Total Pets</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">18</div>
          <div className="text-gray-600 text-sm">Active Listings</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="text-2xl font-bold text-amber-600">6</div>
          <div className="text-gray-600 text-sm">Sold</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
          <div className="text-2xl font-bold text-rose-600">1,247</div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </Card>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Card key={pet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={pet.image}
                alt={pet.name}
                className="w-full h-48 object-cover"
              />
              {pet.featured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Club
                </div>
              )}
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Active
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                <span className="text-lg font-bold text-violet-600">${pet.price}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old
              </p>
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                {pet.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>👁 247 views</span>
                <span>💬 12 inquiries</span>
                <span>❤️ 18 favorites</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link to={`/pet/${pet.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>View</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets listed yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first pet to the marketplace.</p>
          <Link to="/add-pet">
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600">
              Add Your First Pet
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};