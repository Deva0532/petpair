import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { getWishlist } from '../../services/petService';

interface HeaderProps {
  onOpenDating?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (user) {
        try {
          const items = await getWishlist();
          setWishlistCount(items.length);
        } catch (error) {
          console.error('Failed to fetch wishlist count');
        }
      }
    };
    fetchWishlistCount();
  }, [user]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-violet-100'
        : 'bg-white shadow-sm border-b border-gray-200'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
              <svg viewBox="0 0 50 50" className="w-full h-full">
                <defs>
                  <linearGradient id="pawGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                  <linearGradient id="pawGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
                <g transform="translate(5, 0) rotate(-20, 15, 12)">
                  <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                  <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#pawGrad1)" />
                  <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                  <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#pawGrad1)" />
                </g>
                <g transform="translate(15, 22) rotate(20, 15, 12)">
                  <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#pawGrad2)" />
                  <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#pawGrad2)" />
                  <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#pawGrad2)" />
                  <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#pawGrad2)" />
                </g>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Peto</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              <input
                type="text"
                placeholder="Search pets, breeds, locations..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/add-pet"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Post Pet</span>
                </Link>
                <Link to="/vets" className="px-4 py-2 text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all font-medium">
                  Find Vets
                </Link>
                <Link to="/wishlist" className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-rose-500 hover:bg-rose-50 transition-all">
                  <HeartIcon className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-md">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/messages" className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      <UserCircleIcon className="w-5 h-5" />
                      My Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" className="font-medium shadow-md hover:shadow-lg transition-shadow">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all"
          >
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slideDown">
            <div className="space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pets..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {user ? (
                <div className="space-y-1">
                  <Link to="/add-pet" className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-medium">
                    <PlusCircleIcon className="w-5 h-5" />
                    Post Pet
                  </Link>
                  <Link to="/vets" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 rounded-xl">
                    Find Vets
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 rounded-xl">
                    <HeartIcon className="w-5 h-5" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>
                    )}
                  </Link>
                  <Link to="/messages" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 rounded-xl">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Messages
                  </Link>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-violet-50 rounded-xl">
                      <UserCircleIcon className="w-5 h-5" />
                      Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full justify-center">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button variant="primary" className="w-full justify-center">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};