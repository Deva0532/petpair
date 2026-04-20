import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
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
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close mode switcher and notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showModeSwitcher && !target.closest('.mode-switcher-modal')) {
        setShowModeSwitcher(false);
      }
      if (isNotificationsOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModeSwitcher, isNotificationsOpen]);

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
                {!isAdmin && (
                  <Link
                    to="/add-pet"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-violet-200 transition-all transform hover:-translate-y-0.5"
                  >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Post Pet</span>
                  </Link>
                )}
                {/* Find Vets removed per request */}
                <button onClick={() => setShowModeSwitcher(true)} className="px-4 py-2 text-gray-600 hover:text-violet-600 font-semibold transition-colors flex items-center gap-1.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Platform
                </button>
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
                {/* Notification Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className={`relative p-2 transition-colors ${isNotificationsOpen ? 'text-violet-600' : 'text-gray-400 hover:text-gray-900'}`}
                  >
                    <BellIcon className="w-7 h-7" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 transform origin-top-right animate-fadeIn z-[60]">
                      <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                          notifications.slice(0, 3).map(n => (
                            <Link 
                              key={n._id} 
                              to={`/notifications?expandedId=${n._id}`}
                              onClick={() => { setIsNotificationsOpen(false); markAsRead(n._id); }} 
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-violet-50/50' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-medium text-gray-800'} line-clamp-1`}>{n.title}</p>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{formatTimeAgo(n.createdAt)}</span>
                              </div>
                              {n.senderName && (
                                <div className="flex items-center space-x-1.5 mb-1.5">
                                  {n.senderAvatar ? (
                                    <img src={n.senderAvatar} alt={n.senderName} className="w-4 h-4 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-[8px] uppercase">
                                      {n.senderName.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-[10px] font-medium text-gray-600">{n.senderName}</span>
                                  {n.senderRole && n.senderRole !== 'user' && (
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center ${n.senderRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : n.senderRole === 'kennel' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                      {n.senderRole === 'admin' && 'Admin'}
                                      {n.senderRole === 'kennel' && 'Kennel'}
                                      {n.senderRole === 'system' && 'System'}
                                    </span>
                                  )}
                                </div>
                              )}
                              <p className={`text-xs ${!n.read ? 'text-gray-700' : 'text-gray-500'} line-clamp-2`}>{n.message}</p>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-50">
                        <Link 
                          to="/notifications" 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="block w-full text-center py-2 text-sm font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                        >
                          Show All
                        </Link>
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
                  {!isAdmin && (
                    <Link to="/add-pet" className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold shadow-lg shadow-violet-200">
                      <PlusCircleIcon className="w-5 h-5" />
                      Post Pet
                    </Link>
                  )}
                  {/* Find Vets removed per request */}
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
                  <Link 
                    to="/notifications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium"
                  >
                    <BellIcon className="w-5 h-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowModeSwitcher(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-left"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Switch Platform
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

      {/* Mode Switcher Modal */}
      {showModeSwitcher && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="mode-switcher-modal bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full transform transition-all relative overflow-hidden">
            <button 
              onClick={() => setShowModeSwitcher(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Choose Platform</h2>
              <p className="text-gray-500 font-medium">Select how you want to use Peto today</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 w-full max-w-2xl mx-auto">
              {!(location.pathname === '/' && (!location.search.includes('mode=') || location.search.includes('mode=sell'))) && (
                <button 
                  onClick={() => {
                    navigate('/?mode=sell');
                    setShowModeSwitcher(false);
                  }}
                  className="group relative bg-white border-2 border-violet-100 hover:border-violet-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-fuchsia-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-4 text-violet-600 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">Marketplace</h3>
                    <p className="text-sm text-gray-500">Buy, sell, or adopt your perfect companion.</p>
                  </div>
                </button>
              )}
              
              {!(location.pathname === '/' && location.search.includes('mode=dating')) && (
                <button 
                  onClick={() => {
                    navigate('/?mode=dating');
                    setShowModeSwitcher(false);
                  }}
                  className="group relative bg-white border-2 border-rose-100 hover:border-rose-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform">
                      <HeartIcon className="w-7 h-7 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-rose-700 transition-colors">Pet Dating</h3>
                    <p className="text-sm text-gray-500">Find playdates and mating partners.</p>
                  </div>
                </button>
              )}

              {!(location.pathname === '/vets') && (
                <button 
                  onClick={() => {
                    navigate('/vets');
                    setShowModeSwitcher(false);
                  }}
                  className="group relative bg-white border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">Find Vets</h3>
                    <p className="text-sm text-gray-500">Locate trusted veterinarians near you.</p>
                  </div>
                </button>
              )}
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          </div>
        </div>
      )}
    </header>
  );
};