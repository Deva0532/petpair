import React from 'react';
import {
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Veterinarian } from '../../types';

interface VetCardProps {
  vet: Veterinarian;
  onBookAppointment?: (vetId: string) => void;
}

export const VetCard: React.FC<VetCardProps> = ({ vet }) => {
  const handleCall = () => {
    if (vet.phone) {
      window.location.href = `tel:${vet.phone.replace(/\s/g, '')}`;
    }
  };

  const handleDirections = () => {
    if (vet.directionsUrl) {
      window.open(vet.directionsUrl, '_blank');
    } else if (vet.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.address)}`, '_blank');
    }
  };

  const handleWebsite = () => {
    if (vet.website) {
      window.open(vet.website, '_blank');
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolidIcon key={i} className="w-4 h-4 text-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <StarIcon className="absolute w-4 h-4 text-gray-300" />
            <div className="absolute overflow-hidden w-1/2">
              <StarSolidIcon className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden card-hover animate-fadeInUp h-full min-h-[420px] flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <img
                src={vet.image}
                alt={vet.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-md"
              />
              {vet.emergencyService && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                  <ClockIcon className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{vet.name}</h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {renderStars(vet.rating)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{vet.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({vet.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                </div>

                {/* Emergency Badge */}
                {vet.emergencyService && (
                  <span className="flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
                    <ClockIcon className="w-3.5 h-3.5 mr-1" />
                    24/7
                  </span>
                )}
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {vet.specialty.slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700"
                  >
                    {spec}
                  </span>
                ))}
                {vet.specialty.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{vet.specialty.length - 3} more
                  </span>
                )}
              </div>

              {/* Location & Contact Info */}
              <div className="mt-4 space-y-2">
                {vet.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{vet.location}</span>
                  </div>
                )}

                {vet.address && vet.address !== vet.location && (
                  <p className="text-sm text-gray-500 pl-6 line-clamp-1">{vet.address}</p>
                )}

                {vet.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium">{vet.phone}</span>
                  </div>
                )}

                {/* Years in Business & On-site Services */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {vet.yearsInBusiness && (
                    <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckBadgeIcon className="w-3.5 h-3.5 mr-1" />
                      {vet.yearsInBusiness}
                    </span>
                  )}
                  {vet.onSiteServices && (
                    <span className="inline-flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                      On-site services
                    </span>
                  )}
                </div>

                {/* Hours/Availability */}
                {vet.availableTime && (
                  <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-gray-50 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{vet.availableTime}</span>
                  </div>
                )}

                {/* Review Preview */}
                {vet.review && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <p className="text-sm text-gray-600 italic line-clamp-2">"{vet.review}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
          {/* Call Button */}
          <button
            onClick={handleCall}
            disabled={!vet.phone}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
          >
            <PhoneIcon className="w-4 h-4" />
            <span>Call Now</span>
          </button>

          {/* Directions Button */}
          <button
            onClick={handleDirections}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
          >
            <MapPinIcon className="w-4 h-4" />
            <span>Directions</span>
          </button>

          {/* Website Button */}
          {vet.website && (
            <button
              onClick={handleWebsite}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-600 rounded-xl transition-all duration-200"
              title="Visit Website"
            >
              <GlobeAltIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};