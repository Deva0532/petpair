import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { BellIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string;
  read: boolean;
  createdAt: string;
}

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const expandedIdParam = searchParams.get('expandedId');
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(expandedIdParam || null);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (expandedIdParam && notifications.length > 0) {
      setExpandedId(expandedIdParam);
      // Optional: scroll into view
      setTimeout(() => {
        const el = document.getElementById(`notif-${expandedIdParam}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [expandedIdParam, notifications]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
      
      for (const id of unreadIds) {
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications([]);
        setExpandedId(null);
      }
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <BellIcon className="w-16 h-16 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view notifications</h2>
          <p className="text-gray-600">Keep track of your activity by signing in.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3 rounded-xl shadow-lg shadow-violet-200">
              <BellIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Your recent updates</p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center space-x-3">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 font-semibold rounded-lg shadow-sm border border-violet-100 hover:bg-violet-50 transition-colors"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 font-semibold rounded-lg shadow-sm border border-red-100 hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-16 text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <BellIcon className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h2>
            <p className="text-gray-600">You're all caught up!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const isExpanded = expandedId === notification._id;
              return (
              <Card 
                key={notification._id} 
                id={`notif-${notification._id}`}
                className={`p-6 transition-all duration-300 border-l-4 ${!notification.read ? 'border-l-violet-500 bg-violet-50/30' : 'border-l-transparent bg-white'} hover:shadow-md cursor-pointer`}
              >
                <div 
                  className="flex justify-between items-start mb-2"
                  onClick={() => {
                    if (!notification.read) markAsRead(notification._id);
                    setExpandedId(isExpanded ? null : notification._id);
                  }}
                >
                  <div className="flex-1 flex flex-col">
                    <h3 className={`text-lg pr-4 ${!notification.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {notification.title}
                    </h3>
                    {notification.senderName && (
                      <div className="flex items-center space-x-2 mt-2">
                        {notification.senderAvatar ? (
                          <img src={notification.senderAvatar} alt={notification.senderName} className="w-6 h-6 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs uppercase shadow-sm">
                            {notification.senderName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">{notification.senderName}</span>
                        {notification.senderRole && notification.senderRole !== 'user' && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center ${notification.senderRole === 'admin' ? 'bg-indigo-100 text-indigo-700' : notification.senderRole === 'kennel' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                            {notification.senderRole === 'admin' && 'Admin'}
                            {notification.senderRole === 'kennel' && 'Kennel'}
                            {notification.senderRole === 'system' && 'System'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                    <button 
                      onClick={(e) => deleteNotification(e, notification._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete notification"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-violet-600 transition-colors">
                      {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div 
                  className={`text-base overflow-hidden transition-all duration-300 ease-in-out ${!notification.read ? 'text-gray-700' : 'text-gray-600'} ${isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                >
                  <div className="pt-2 border-t border-gray-100 whitespace-pre-wrap">
                    {notification.message}
                  </div>
                </div>
              </Card>
            )})}
          </div>
        )}
      </div>
    </div>
  );
};
