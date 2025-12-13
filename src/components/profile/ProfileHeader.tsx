import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

interface UserStats {
  petsListed: number;
  successfulSales: number;
  rating: number;
  reviewCount: number;
}

interface ProfileHeaderProps {
  onPhotoChange?: (newPhotoUrl: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onPhotoChange }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    petsListed: 0,
    successfulSales: 0,
    rating: 0,
    reviewCount: 0
  });
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(user?.avatar);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    fetchStats();
  }, [user?.id]);

  // Update avatar when user changes
  useEffect(() => {
    setCurrentAvatar(user?.avatar);
  }, [user?.avatar]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64 for storage (in production, use a proper image upload service)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        // Update the profile with new avatar
        const success = await updateProfile({ avatar: base64String });
        if (success) {
          setCurrentAvatar(base64String);
          onPhotoChange?.(base64String);
        } else {
          alert('Failed to update profile photo');
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo');
      setIsUploading(false);
    }

    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  if (!user) return null;

  const avatarUrl = currentAvatar || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=ffffff&size=150`;

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl object-cover"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={handlePhotoClick}
              disabled={isUploading}
              className={`absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-violet-600 p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Change profile photo"
            >
              {isUploading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <CameraIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
              {(user.emailVerified || user.mobileVerified) && (
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

            {stats.reviewCount > 0 && (
              <div className="flex items-center justify-center md:justify-start space-x-1 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(stats.rating) ? 'text-amber-300' : 'text-amber-300/30'}`}
                    />
                  ))}
                </div>
                <span className="text-violet-100 ml-2">{stats.rating.toFixed(1)} ({stats.reviewCount} reviews)</span>
              </div>
            )}

            <p className="text-violet-100 text-lg max-w-2xl">
              {user.bio || 'Passionate pet lover and experienced breeder.'} Member since {new Date(user.joinedAt || Date.now()).getFullYear()}.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.petsListed}</div>
              <div className="text-violet-200 text-sm">Pets Listed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.successfulSales}</div>
              <div className="text-violet-200 text-sm">Successful Sales</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.rating.toFixed(1)}</div>
              <div className="text-violet-200 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
