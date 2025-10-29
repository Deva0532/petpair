import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Pet } from '../../types';
import { Card } from '../ui/Card';

interface PetCardProps {
  pet: Pet;
  onFavorite?: (petId: string) => void;
  isFavorited?: boolean;
  onClick?: () => void;
  mode?: 'sell' | 'dating';
}

export const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  onFavorite, 
  isFavorited = false,
  mode = 'sell'
}) => {
  const navigate = useNavigate();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(pet.id);
    }
  };

  const handleCardClick = () => {
    navigate(`/pet/${pet.id}`);
  };

  return (
    <Card 
      hover 
      className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-48 object-cover transition-transform duration-500"
        />
        {pet.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Club
          </div>
        )}
        {mode === 'dating' && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Available
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
        >
          {isFavorited ? (
            <HeartSolidIcon className="w-5 h-5 text-rose-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
          {mode === 'sell' ? (
            <span className="text-lg font-bold text-violet-600">${pet.price}</span>
          ) : (
            <span className="text-sm font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
              Dating
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          {pet.location}
        </div>
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {pet.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {pet.vaccinated && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Vaccinated
              </span>
            )}
            {pet.owner.verified && (
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-amber-400 fill-current" />
                <span className="text-xs text-gray-600 ml-1">Verified</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <img
              src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
              alt={pet.owner.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600">{pet.owner.name}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};