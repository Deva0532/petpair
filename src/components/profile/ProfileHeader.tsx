import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { StarRating } from '../ui/StarRating';

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
  const { showToast } = useToast();
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
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
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
          showToast('Profile photo updated successfully!', 'success');
        } else {
          showToast('Failed to update profile photo', 'error');
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        showToast('Error reading file', 'error');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      showToast('Error uploading photo', 'error');
      setIsUploading(false);
    }

    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  if (!user) return null;

  const avatarUrl = currentAvatar || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=ffffff&size=150`;

  const isKennel = user.userType === 'kennel';
  const isAdmin = user.role === 'admin';

  return (
    <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-2xl border ${isAdmin ? 'bg-white/90 border-cyan-200/50 shadow-cyan-900/5' : isKennel ? 'bg-white/90 border-amber-200/50 shadow-amber-900/5' : 'bg-white/80 border-white shadow-violet-900/5'}`}>
        
        {/* Decorative inner glow */}
        {isAdmin ? (
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-200/40 to-blue-200/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 mix-blend-multiply opacity-70 pointer-events-none"></div>
        ) : isKennel ? (
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-amber-200/40 to-rose-200/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 mix-blend-multiply opacity-70 pointer-events-none"></div>
        ) : (
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        )}

        <div className="relative z-10 flex flex-col xl:flex-row items-center xl:items-start gap-8 xl:gap-10">
          {/* Profile Picture */}
          <div className="relative group flex-shrink-0">
            <div className={`absolute -inset-1.5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isAdmin ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : isKennel ? 'bg-gradient-to-r from-amber-400 to-rose-400' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}></div>
            <img
              src={avatarUrl}
              alt={user.name}
              className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-xl object-cover transition-transform duration-500 group-hover:scale-[1.02] ${isAdmin ? 'border-cyan-500/50' : isKennel ? 'border-amber-100' : 'border-white'}`}
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
              className={`absolute bottom-2 right-2 p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''} ${isAdmin ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400' : isKennel ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-violet-600 hover:text-white hover:bg-violet-600'}`}
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

          {/* Profile Info + Stats Row */}
          <div className="flex-1 min-w-0 flex flex-col xl:flex-row xl:items-start gap-6 xl:gap-8 w-full">
            {/* Profile Info */}
            <div className="flex-1 min-w-0 text-center xl:text-left flex flex-col justify-center pt-2">
              <div className="mb-3">
                <h1 className={`text-3xl md:text-5xl font-black tracking-tight truncate ${isAdmin ? 'bg-gradient-to-r from-cyan-900 to-blue-800 bg-clip-text text-transparent' : isKennel ? 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent'}`}>
                  {user.name}
                </h1>
                
                <div className="flex flex-wrap justify-center xl:justify-start gap-2 items-center mt-3">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold shadow-sm">
                      <ShieldCheckIcon className="w-4 h-4" />
                      System Administrator
                    </span>
                  )}
                  {isKennel && !isAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-rose-50 border border-amber-200 text-amber-800 text-sm font-bold shadow-sm">
                      <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                      Kennel Partner
                    </span>
                  )}
                  {(user.emailVerified && user.mobileVerified && !isAdmin) && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${isKennel ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                      <ShieldCheckIcon className={`w-4 h-4 ${isKennel ? 'text-slate-500' : 'text-emerald-500'}`} />
                      Verified User
                    </span>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-center xl:justify-start gap-2 mb-4 font-medium ${isAdmin ? 'text-cyan-700/80' : isKennel ? 'text-amber-700/80' : 'text-slate-500'}`}>
                <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
                <span className="opacity-40 flex-shrink-0">•</span>
                <span className="whitespace-nowrap flex-shrink-0">Member since {new Date(user.joinedAt || Date.now()).getFullYear()}</span>
              </div>

              <p className={`text-lg max-w-2xl mx-auto xl:mx-0 leading-relaxed font-medium ${isAdmin ? 'text-slate-600' : isKennel ? 'text-slate-600' : 'text-slate-600'}`}>
                {user.bio || 'Edit your bio to share your passion for pets!'}
              </p>
            </div>

            {/* Stats Dashboard Widgets - Hide for admin to keep it clean */}
            {!isAdmin && (
              <div className="grid grid-cols-3 gap-3 md:gap-4 flex-shrink-0 xl:self-center" style={{ minWidth: '280px' }}>
                <div className={`flex flex-col items-center justify-center p-4 md:px-8 shadow-sm rounded-2xl border transition-transform hover:-translate-y-1 ${isKennel ? 'bg-gradient-to-b from-white to-amber-50/50 border-amber-100/60' : 'bg-white border-violet-100 shadow-violet-100/50'}`}>
                  <span className={`text-3xl font-black ${isKennel ? 'text-amber-700' : 'text-violet-600'}`}>{stats.petsListed}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${isKennel ? 'text-amber-900/50' : 'text-slate-400'}`}>Pets</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-4 md:px-8 shadow-sm rounded-2xl border transition-transform hover:-translate-y-1 ${isKennel ? 'bg-gradient-to-b from-white to-amber-50/50 border-amber-100/60' : 'bg-white border-violet-100 shadow-violet-100/50'}`}>
                  <span className={`text-3xl font-black ${isKennel ? 'text-amber-700' : 'text-violet-600'}`}>{stats.successfulSales}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${isKennel ? 'text-amber-900/50' : 'text-slate-400'}`}>Sales</span>
                </div>
                <div className={`flex flex-col items-center justify-center p-4 md:px-8 shadow-sm rounded-2xl border transition-transform hover:-translate-y-1 ${isKennel ? 'bg-gradient-to-b from-white to-amber-50/50 border-amber-100/60' : 'bg-white border-violet-100 shadow-violet-100/50'}`}>
                  <span className={`text-3xl font-black flex items-center gap-1 ${isKennel ? 'text-amber-700' : 'text-violet-600'}`}>
                    {stats.rating > 0 ? stats.rating.toFixed(1) : '-'}
                    <StarSolidIcon className="w-5 h-5 text-yellow-400 pb-0.5" />
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider mt-1 ${isKennel ? 'text-amber-900/50' : 'text-slate-400'}`}>
                    {stats.reviewCount} Reviews
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
