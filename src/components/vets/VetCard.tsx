import React from 'react';
import { MapPinIcon, PhoneIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Veterinarian } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface VetCardProps {
  vet: Veterinarian;
  onBookAppointment?: (vetId: string) => void;
}

export const VetCard: React.FC<VetCardProps> = ({ vet, onBookAppointment }) => {
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
              <div className="flex items-center space-x-1">
                <PhoneIcon className="w-4 h-4" />
                <span>{vet.phone}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mt-2">{vet.address}</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onBookAppointment?.(vet.id)}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};