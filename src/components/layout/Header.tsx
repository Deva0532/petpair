import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BellIcon,
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

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface HeaderProps {
  onOpenDating?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      } else {
        setWishlistCount(0);
      }
    };
    
    fetchWishlistCount();

    window.addEventListener('wishlistUpdated', fetchWishlistCount);
    return () => window.removeEventListener('wishlistUpdated', fetchWishlistCount);
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data.slice(0, 10)); // Show latest 10
            setUnreadCount(data.filter((n: Notification) => !n.read).length);
          }
        } catch (error) {
          console.error('Failed to fetch notifications');
        }
      }
    };
    fetchNotifications();

    // Poll for new notifications every 5 seconds for real-time updates
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
      ? 'bg-white shadow-lg border-b border-gray-100'
      : 'bg-white shadow-sm border-b border-gray-100'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
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
            <span className="text-2xl font-bold text-gray-900">Pe<span className="text-violet-600">to</span></span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-12">
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`); }} className="relative w-full group">
              <button type="submit" className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-300 group-focus-within:text-violet-500 transition-colors" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pets, breeds, locations..."
                className="w-full pl-12 pr-6 py-3 bg-gray-50 border-0 rounded-full focus:ring-0 focus:bg-gray-100 transition-all text-sm font-medium text-gray-700 placeholder-gray-400"
              />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/add-pet"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-violet-200 transition-all transform hover:-translate-y-0.5"
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  <span>Post Pet</span>
                </Link>
                <Link to="/vets" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors">
                  Find Vets
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="px-4 py-2 text-violet-600 hover:text-violet-700 font-semibold">
                    Admin
                  </Link>
                )}
                <Link to="/wishlist" className="relative p-2 text-gray-400 hover:text-rose-500 transition-colors">
                  <HeartIcon className="w-7 h-7" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-0 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
                {/* Notification Bell */}
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <BellIcon className="w-7 h-7" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto scroll-smooth">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => markAsRead(notification._id)}
                              className={`px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-violet-50/50' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <h4 className={`text-sm font-semibold ${!notification.read ? 'text-violet-900' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-medium ml-2 uppercase tracking-wide">{formatTimeAgo(notification.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{notification.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative group ml-2">
                  <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-bold text-gray-700 hidden lg:block uppercase tracking-wide text-[11px]">{user.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-4 w-60 bg-white rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 transform origin-top-right">
                    <div className="px-6 py-4 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors">
                        <UserCircleIcon className="w-5 h-5" />
                        My Profile
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" className="font-bold text-gray-600 hover:text-gray-900">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" className="rounded-full px-6 py-2.5 font-bold shadow-lg shadow-violet-200">Sign Up</Button>
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
          <div className="md:hidden py-4 border-t border-gray-100 animate-slideDown">
            <div className="space-y-4 px-2">
              {/* Mobile Search */}
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`); setIsMobileMenuOpen(false); } }} className="relative">
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all"
                  placeholder="Search pets..."
                />
              </form>

              {user ? (
                <div className="space-y-1">
                  <Link to="/add-pet" className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold shadow-lg shadow-violet-200">
                    <PlusCircleIcon className="w-5 h-5" />
                    Post Pet
                  </Link>
                  <Link to="/vets" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">
                    Find Vets
                  </Link>
                  <Link to="/stores" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">
                    Pet Stores
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-violet-600 hover:bg-violet-50 rounded-xl font-medium">
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">
                    <HeartIcon className="w-5 h-5" />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{wishlistCount}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    <BellIcon className="w-5 h-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
                    )}
                  </button>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium">
                      <UserCircleIcon className="w-5 h-5" />
                      Profile
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium">
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full justify-center font-bold text-gray-600">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button variant="primary" className="w-full justify-center font-bold rounded-xl">Sign Up</Button>
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