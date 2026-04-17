import React, { useState, useRef } from 'react';
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

const petTypeEmojis: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  fish: '🐠',
  reptile: '🦎',
  other: '🐾',
};

const genderSymbols: Record<string, { symbol: string; color: string; bg: string }> = {
  male: { symbol: '♂', color: 'text-blue-600', bg: 'bg-blue-50' },
  female: { symbol: '♀', color: 'text-pink-500', bg: 'bg-pink-50' },
};

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  onFavorite,
  isFavorited = false,
  mode = 'sell'
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Determine if owner is a kennel user
  const isKennel = (pet.owner as any)?.userType === 'kennel';
  const videoUrl = (pet as any).videoUrl;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onFavorite) {
      onFavorite(pet.id);
    }
  };

  const handleCardClick = () => {
    navigate(`/pet/${pet.id}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && videoUrl) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const genderInfo = pet.gender ? genderSymbols[pet.gender] : null;
  const typeEmoji = petTypeEmojis[pet.type] || '🐾';

  return (
    <div
      className="pet-card-container group cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`pet-card relative overflow-hidden transition-all duration-500 ${
        isKennel
          ? 'kennel-card-premium rounded-[1.4rem]'
          : 'bg-white rounded-[1.25rem] border border-slate-100/80 hover:border-slate-200/80'
      }`}>

        {/* Kennel premium top accent bar */}
        {isKennel && (
          <div className="kennel-accent-bar-premium" />
        )}

        {/* Image Section */}
        <div className="pet-card-image-wrapper relative aspect-[4/3.5] overflow-hidden bg-slate-100">
          {/* Shimmer loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton-shimmer z-10" />
          )}

          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
              <span className="text-5xl mb-2 opacity-60">{typeEmoji}</span>
              <span className="text-sm text-slate-400 font-medium">No photo available</span>
            </div>
          ) : (
            <img
              src={pet.image}
              alt={pet.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          )}

          {/* Video overlay on hover */}
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-[5] ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Kennel golden glow overlay on hover */}
          {isKennel && (
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          )}

          {/* Top left - Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isKennel && (
              <span className="kennel-badge-premium inline-flex items-center gap-1.5 text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                Kennel
              </span>
            )}
            {pet.vaccinated && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/25">
                ✓ Vaccinated
              </span>
            )}
            {pet.featured && (
              <span className="inline-flex items-center gap-1 bg-violet-500/90 backdrop-blur-sm text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/25">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Top right - Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all duration-300 ${
              isFavorited
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110'
                : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:bg-rose-50 hover:text-rose-500 shadow-md shadow-black/5'
            }`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? (
              <HeartSolidIcon className="w-[1.1rem] h-[1.1rem]" />
            ) : (
              <HeartIcon className="w-[1.1rem] h-[1.1rem]" />
            )}
          </button>

          {/* Bottom right on image - Pet type badge */}
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm shadow-md shadow-black/5 text-lg">
              {typeEmoji}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className={`pet-card-content p-4 pt-3.5 ${isKennel ? 'kennel-card-content' : ''}`}>
          {/* Name + Gender row */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-[1.05rem] font-bold text-slate-900 truncate leading-tight">
                {pet.name}
              </h3>
              {genderInfo && (
                <span className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold ${genderInfo.bg} ${genderInfo.color}`}>
                  {genderInfo.symbol}
                </span>
              )}
            </div>
            {mode === 'sell' && pet.price != null && (
              <span className={`flex-shrink-0 text-[0.95rem] font-extrabold bg-clip-text text-transparent ${
                isKennel
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600'
              }`}>
                {formatPrice(pet.price)}
              </span>
            )}
          </div>

          {/* Breed */}
          <p className="text-[0.8rem] text-slate-500 font-medium mb-2.5 truncate">
            {pet.breed} · {pet.age} yr{pet.age !== 1 ? 's' : ''} old
          </p>

          {/* Location + Kennel owner indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[0.75rem] text-slate-400 font-medium truncate">
                {pet.location}
              </span>
            </div>
            {isKennel && (pet.owner as any)?.storeName && (
              <span className="kennel-store-tag text-[0.65rem] font-bold px-2.5 py-1 rounded-lg truncate max-w-[130px]">
                🏠 {(pet.owner as any).storeName}
              </span>
            )}
          </div>

          {/* Tags row - visible on hover */}
          <div className="pet-card-tags mt-3 pt-2.5 border-t border-slate-100/80 flex flex-wrap gap-1.5 max-h-0 overflow-hidden opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-500 ease-out">
            {pet.size && (
              <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-md bg-slate-50 text-slate-500 uppercase tracking-wide">
                {pet.size}
              </span>
            )}
            {pet.neutered && (
              <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-md bg-indigo-50 text-indigo-500 uppercase tracking-wide">
                Neutered
              </span>
            )}
            {pet.goodWithKids && (
              <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-md bg-green-50 text-green-600 uppercase tracking-wide">
                Kid Friendly
              </span>
            )}
            {pet.houseTrained && (
              <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-md bg-amber-50 text-amber-600 uppercase tracking-wide">
                House Trained
              </span>
            )}
            {mode === 'dating' && pet.availableForMating && (
              <span className="px-2 py-0.5 text-[0.65rem] font-bold rounded-md bg-rose-50 text-rose-500 uppercase tracking-wide">
                Ready to Mate
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};