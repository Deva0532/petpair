import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    HomeIcon,
    UsersIcon,
    HeartIcon,
    BuildingStorefrontIcon,
    BellIcon,
    ArrowLeftOnRectangleIcon,
    ChartBarIcon,
    FlagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminPets } from './AdminPets';
import { AdminKennelApprovals } from './AdminKennelApprovals';
import { AdminNotifications } from './AdminNotifications';
import { AdminVets } from './AdminVets';
import { AdminReportedReviews } from './AdminReportedReviews';
import { AdminFeedbacks } from './AdminFeedbacks';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface NotificationItem {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: ChartBarIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/pets', label: 'Pets', icon: HeartIcon },
    { path: '/admin/vets', label: 'Veterinarians', icon: HeartIcon },
    { path: '/admin/kennel-approvals', label: 'Kennel Approvals', icon: BuildingStorefrontIcon },
    { path: '/admin/reported-reviews', label: 'Reported Reviews', icon: FlagIcon },
    { path: '/admin/feedbacks', label: 'User Feedbacks', icon: ChatBubbleLeftRightIcon },
    { path: '/admin/notifications', label: 'Send Notifications', icon: BellIcon },
];

export const AdminLayout: React.FC = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [isInitializing, setIsInitializing] = React.useState(true);
    
    // Notifications state
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    // Fetch notifications
    React.useEffect(() => {
        const fetchNotifications = async () => {
            if (user && isAdmin) {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:5000/api/notifications', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setNotifications(data.slice(0, 10)); // Show latest 10
                        setUnreadCount(data.filter((n: NotificationItem) => !n.read).length);
                    }
                } catch (error) {
                    console.error('Failed to fetch notifications');
                }
            }
        };
        
        if (!isInitializing) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [user, isAdmin, isInitializing]);

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
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showNotifications && !target.closest('.admin-notification-dropdown')) {
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

    // Wait for initial auth check to complete
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 100); // Small delay to let AuthContext initialize
        return () => clearTimeout(timer);
    }, []);

    console.log('AdminLayout render - user:', user?.email, 'isAdmin:', isAdmin, 'initializing:', isInitializing);

    // Show loading while checking auth
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
        );
    }

    // Redirect non-admin users
    if (!user) {
        console.log('AdminLayout: No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        console.log('AdminLayout: User is not admin, showing access denied');
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg fixed h-full">
                <div className="p-6">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <HeartIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">Peto</span>
                            <span className="block text-xs text-gray-500">Admin Panel</span>
                        </div>
                    </Link>
                </div>

                <nav className="mt-6">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-6 py-3 transition-colors ${isActive
                                    ? 'bg-violet-50 text-violet-600 border-r-4 border-violet-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <span className="text-violet-600 font-semibold">{user.name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); window.location.href = '/'; }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors w-full"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 bg-gray-50 min-h-screen flex flex-col">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-end items-center sticky top-0 z-10 shadow-sm">
                    {/* Notification Bell */}
                    <div className="relative admin-notification-dropdown">
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
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
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
                </header>

                <div className="p-8 flex-1">
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/pets" element={<AdminPets />} />
                        <Route path="/vets" element={<AdminVets />} />
                        <Route path="/kennel-approvals" element={<AdminKennelApprovals />} />
                        <Route path="/reported-reviews" element={<AdminReportedReviews />} />
                        <Route path="/feedbacks" element={<AdminFeedbacks />} />
                        <Route path="/notifications" element={<AdminNotifications />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};
