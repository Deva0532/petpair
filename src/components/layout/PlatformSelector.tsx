import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';

interface PlatformSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  isWelcome?: boolean;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ isOpen, onClose, isWelcome = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mode-switcher-modal')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOnMarketplace = location.pathname === '/' && (!location.search.includes('mode=') || location.search.includes('mode=sell'));
  const isOnDating = location.pathname === '/' && location.search.includes('mode=dating');
  const isOnVets = location.pathname === '/vets';

  const showMarketplace = isWelcome || !isOnMarketplace;
  const showDating = isWelcome || !isOnDating;
  const showVets = isWelcome || !isOnVets;

  // ─── Welcome / First-Visit Layout ────────────────────────────────
  if (isWelcome) {
    return (
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div className="mode-switcher-modal bg-white rounded-[2rem] shadow-2xl px-6 sm:px-8 pt-8 pb-10 max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14">
              <svg viewBox="0 0 50 50" className="w-full h-full">
                <defs>
                  <linearGradient id="wGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                  <linearGradient id="wGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
                <g transform="translate(5, 0) rotate(-20, 15, 12)">
                  <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#wGrad1)" />
                  <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#wGrad1)" />
                  <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#wGrad1)" />
                  <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#wGrad1)" />
                </g>
                <g transform="translate(15, 22) rotate(20, 15, 12)">
                  <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#wGrad2)" />
                  <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#wGrad2)" />
                  <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#wGrad2)" />
                  <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#wGrad2)" />
                </g>
              </svg>
            </div>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5">Welcome to Peto!</h2>
            <p className="text-gray-400 font-medium text-sm">What would you like to do today?</p>
          </div>

          {/* Horizontal 3-column card row */}
          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-2.5 relative z-10 w-full">
            {/* Marketplace */}
            <button
              onClick={() => { navigate('/?mode=sell'); onClose(); }}
              className="group flex-1 max-w-[320px] md:max-w-none w-full flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-4 bg-gray-50/80 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-3 md:mr-0 md:mb-3">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1 md:flex-none">
                <h3 className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-violet-700 transition-colors mb-0.5">Marketplace</h3>
                <p className="text-[10px] md:text-[11px] text-gray-400 leading-snug">Buy, sell, or adopt pets</p>
              </div>
            </button>

            {/* Pet Dating */}
            <button
              onClick={() => { navigate('/?mode=dating'); onClose(); }}
              className="group flex-1 max-w-[320px] md:max-w-none w-full flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-4 bg-gray-50/80 hover:bg-rose-50 border border-gray-100 hover:border-rose-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-3 md:mr-0 md:mb-3">
                <HeartIcon className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
              </div>
              <div className="min-w-0 flex-1 md:flex-none">
                <h3 className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-rose-700 transition-colors mb-0.5">Pet Dating</h3>
                <p className="text-[10px] md:text-[11px] text-gray-400 leading-snug">Playdate & mating</p>
              </div>
            </button>

            {/* Find Vets */}
            <button
              onClick={() => { navigate('/vets'); onClose(); }}
              className="group flex-1 max-w-[320px] md:max-w-none w-full flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-4 bg-gray-50/80 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-3 md:mr-0 md:mb-3">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1 md:flex-none">
                <h3 className="text-xs md:text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-0.5">Find Vets</h3>
                <p className="text-[10px] md:text-[11px] text-gray-400 leading-snug">Trusted vets near you</p>
              </div>
            </button>
          </div>

          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
        </div>
      </div>
    );
  }

  // ─── Normal Platform Switcher (navbar click) ─────────────────────
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="mode-switcher-modal bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Choose Platform</h2>
          <p className="text-gray-500 font-medium">Select how you want to use Peto today</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-4 relative z-10 w-full max-w-3xl mx-auto px-4">
          {showMarketplace && (
            <button
              onClick={() => { navigate('/?mode=sell'); onClose(); }}
              className="group relative bg-white border-2 border-violet-100 hover:border-violet-500 rounded-2xl p-4 md:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full max-w-[320px] md:max-w-xs flex-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-fuchsia-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex flex-row md:flex-col items-center md:items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-4 md:mr-0 md:mb-4">
                  <svg className="w-5 h-5 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 group-hover:text-violet-700 transition-colors">Marketplace</h3>
                  <p className="text-xs md:text-sm text-gray-500 leading-snug">Buy, sell, or adopt your perfect companion.</p>
                </div>
              </div>
            </button>
          )}

          {showDating && (
            <button
              onClick={() => { navigate('/?mode=dating'); onClose(); }}
              className="group relative bg-white border-2 border-rose-100 hover:border-rose-500 rounded-2xl p-4 md:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full max-w-[320px] md:max-w-xs flex-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex flex-row md:flex-col items-center md:items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-4 md:mr-0 md:mb-4">
                  <HeartIcon className="w-5 h-5 md:w-7 md:h-7 text-rose-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 group-hover:text-rose-700 transition-colors">Pet Dating</h3>
                  <p className="text-xs md:text-sm text-gray-500 leading-snug">Find playdates and mating partners.</p>
                </div>
              </div>
            </button>
          )}

          {showVets && (
            <button
              onClick={() => { navigate('/vets'); onClose(); }}
              className="group relative bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-4 md:p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full max-w-[320px] md:max-w-xs flex-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative flex flex-row md:flex-col items-center md:items-start">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0 mr-4 md:mr-0 md:mb-4">
                  <svg className="w-5 h-5 md:w-7 md:h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-0.5 md:mb-1 group-hover:text-emerald-700 transition-colors">Find Vets</h3>
                  <p className="text-xs md:text-sm text-gray-500 leading-snug">Locate trusted veterinarians near you.</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>
    </div>
  );
};
