import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, MapPinIcon, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid';
import { Pet } from '../../types';

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

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-md border border-gray-100 card-hover flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden img-zoom">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-52 object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Featured Badge */}
        {pet.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse-soft">
            <SparklesIcon className="w-3.5 h-3.5" />
            Featured
          </div>
        )}

        {/* Dating Badge */}
        {mode === 'dating' && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <HeartSolidIcon className="w-3.5 h-3.5" />
            Looking for Love
          </div>
        )}

        {/* Price Badge */}
        {mode === 'sell' && pet.price && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-violet-700 px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg">
            {formatPrice(pet.price)}
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${isFavorited
            ? 'bg-rose-500 text-white'
            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-rose-500'
            }`}
        >
          {isFavorited ? (
            <HeartSolidIcon className="w-5 h-5 animate-bounceIn" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
              {pet.name}
            </h3>
            <p className="text-sm text-gray-500">
              {pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old
            </p>
          </div>
          {mode === 'dating' && (
            <span className="flex-shrink-0 text-sm font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              💕 Dating
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
          <span className="truncate">{pet.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {pet.description}
        </p>

        {/* Tags - flex-grow to push footer to bottom */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-grow">
          {pet.vaccinated && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 h-fit">
              ✓ Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 h-fit">
              ✓ Neutered
            </span>
          )}
          {pet.goodWithKids && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 h-fit">
              👶 Kid Friendly
            </span>
          )}
          {pet.houseTrained && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 h-fit">
              🏠 House Trained
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Owner Info */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pet.owner.name)}&background=8b5cf6&color=ffffff`}
                alt={pet.owner.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              {pet.owner.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <CheckBadgeIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{pet.owner.name}</p>
              {pet.owner.rating ? (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-gray-500">{pet.owner.rating}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Seller</p>
              )}
            </div>
          </div>

          {/* View Button */}
          <button className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:text-white hover:bg-violet-600 bg-violet-50 rounded-lg transition-all duration-200">
            View →
          </button>
        </div>
      </div>
    </div>
  );
};