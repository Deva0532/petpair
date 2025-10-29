import React from 'react';
import { CameraIcon, StarIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface ProfileHeaderProps {
  onEditPhoto?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onEditPhoto }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=ffffff&size=150`}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl"
            />
            <button
              onClick={onEditPhoto}
              className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-violet-600 p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg"
            >
              <CameraIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
              {user.verified && (
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-300" />
                  <span className="text-emerald-300 font-medium">Verified Member</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <MapPinIcon className="w-5 h-5 text-violet-200" />
              <span className="text-violet-100 text-lg">{user.location}</span>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-1 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarSolidIcon key={i} className="w-5 h-5 text-amber-300" />
                ))}
              </div>
              <span className="text-violet-100 ml-2">4.9 (127 reviews)</span>
            </div>

            <p className="text-violet-100 text-lg max-w-2xl">
              Passionate pet lover and experienced breeder. Member since {new Date(user.joinedAt).getFullYear()}.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-violet-200 text-sm">Pets Listed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">18</div>
              <div className="text-violet-200 text-sm">Successful Sales</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-violet-200 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};