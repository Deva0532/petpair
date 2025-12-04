import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  HeartIcon
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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Two Paws Stacked */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative w-10 h-10">
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
                {/* Top paw - angled left */}
                <g transform="translate(5, 0) rotate(-20, 15, 12)">
                  <ellipse cx="6" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                  <ellipse cx="15" cy="4" rx="3" ry="3.5" fill="url(#pawGrad1)" />
                  <ellipse cx="24" cy="6" rx="3.5" ry="4" fill="url(#pawGrad1)" />
                  <ellipse cx="15" cy="16" rx="8" ry="7" fill="url(#pawGrad1)" />
                </g>
                {/* Bottom paw - angled right */}
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
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search pets, breeds, locations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/add-pet" className="text-gray-700 hover:text-violet-600 transition-colors">
                  Post Pet
                </Link>
                <Link to="/vets" className="text-gray-700 hover:text-violet-600 transition-colors">
                  Find Vets
                </Link>
                <Link to="/wishlist" className="relative flex items-center text-gray-700 hover:text-rose-500 transition-colors">
                  <HeartIcon className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/messages" className="flex items-center space-x-1 text-gray-700 hover:text-violet-600 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>Messages</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-violet-600 transition-colors">
                    <UserCircleIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search pets..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500" />
              </div>
              {user ? (
                <>
                  <Link to="/add-pet" className="block py-2 text-gray-700">Post Pet</Link>
                  <Link to="/vets" className="block py-2 text-gray-700">Find Vets</Link>
                  <Link to="/wishlist" className="flex items-center py-2 text-gray-700">
                    <HeartIcon className="w-5 h-5 mr-2" />
                    Wishlist
                    {wishlistCount > 0 && <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                  </Link>
                  <Link to="/messages" className="block py-2 text-gray-700">Messages</Link>
                  <Link to="/profile" className="block py-2 text-gray-700">Profile</Link>
                  <button onClick={logout} className="block w-full text-left py-2 text-gray-700">Sign Out</button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full">
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="block w-full">
                    <Button variant="primary" className="w-full">Sign Up</Button>
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