import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
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
      className="group relative h-[400px] w-full bg-slate-100 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <img
        src={pet.image}
        alt={pet.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient Overlay - Always subtle at bottom, darker on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>

      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {pet.vaccinated && (
          <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
            Vaccinated
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-rose-500 text-white transition-all duration-300 z-10 group/btn"
      >
        {isFavorited ? (
          <HeartSolidIcon className="w-5 h-5 text-rose-500 group-hover/btn:text-white" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
      </button>

      {/* Content - Bottom Aligned */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        {/* Name & Price */}
        <div className="flex items-end justify-between mb-1">
          <h3 className="text-2xl font-bold tracking-tight text-white mb-1 shadow-black/50 drop-shadow-lg">
            {pet.name}
          </h3>
          {mode === 'sell' && pet.price && (
            <span className="text-xl font-bold text-white shadow-black/50 drop-shadow-lg">
              {formatPrice(pet.price)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-white/90 text-sm font-medium mb-4 shadow-black/50 drop-shadow-md">
          <MapPinIcon className="w-4 h-4 mr-1.5 text-white/80" />
          {pet.location}
        </div>

        {/* Hover Details (Breed, Age) */}
        <div className="max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-3 pt-2 border-t border-white/20">
            <span className="text-sm font-medium text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {pet.breed}
            </span>
            <span className="text-sm font-medium text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
              {pet.age} year{pet.age !== 1 ? 's' : ''} old
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};