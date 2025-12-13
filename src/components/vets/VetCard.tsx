import React from 'react';
import { MapPinIcon, PhoneIcon, StarIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Veterinarian } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

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

  const copyPhone = () => {
    if (vet.phone) {
      navigator.clipboard.writeText(vet.phone);
      alert('Phone number copied to clipboard!');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <img
          src={vet.image}
          alt={vet.name}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{vet.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">{vet.rating}</span>
                <span className="text-sm text-gray-500">({vet.reviewCount} reviews)</span>
              </div>
            </div>

            {vet.emergencyService && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <ClockIcon className="w-3 h-3 mr-1" />
                24/7 Emergency
              </span>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {vet.specialty.map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{vet.location}</span>
              </div>
            </div>

            {/* Availability Info */}
            {(vet.availableDays && vet.availableDays.length > 0) || vet.availableTime ? (
              <div className="flex items-start space-x-2 text-sm text-gray-600 mt-2 p-2 bg-emerald-50 rounded-lg">
                <CalendarDaysIcon className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  {vet.availableDays && vet.availableDays.length > 0 && (
                    <p className="text-emerald-800">
                      <span className="font-medium">Days:</span> {vet.availableDays.join(', ')}
                    </p>
                  )}
                  {vet.availableTime && (
                    <p className="text-emerald-800">
                      <span className="font-medium">Hours:</span> {vet.availableTime}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Only show address if it exists and is different from location */}
            {vet.address && vet.address !== vet.location && (
              <p className="text-sm text-gray-700 mt-2">{vet.address}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Phone with copy option */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-600">
                <PhoneIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{vet.phone || 'No phone'}</span>
              </div>
              {vet.phone && (
                <button
                  onClick={copyPhone}
                  className="text-xs text-gray-500 hover:text-violet-600 underline"
                >
                  Copy
                </button>
              )}
            </div>

            {/* Call Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleCall}
              disabled={!vet.phone}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call Now</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};