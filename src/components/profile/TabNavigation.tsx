import React from 'react';
import {
  UserIcon,
  CogIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: UserIcon },
  { id: 'pets', label: 'My Pets', icon: HeartIcon },
  { id: 'settings', label: 'Settings', icon: CogIcon },
  { id: 'feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const isKennel = user?.userType === 'kennel';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex justify-center mt-6 sm:-mt-10 lg:-mt-12 relative z-20 px-4">
      <div className={`p-1.5 rounded-full backdrop-blur-3xl shadow-xl flex items-center space-x-1 sm:space-x-2 border transition-colors ${
        isAdmin ? 'bg-white/80 border-cyan-200/50 shadow-cyan-900/5' : isKennel ? 'bg-amber-900/5 min-w-max border-amber-200/50 shadow-amber-900/10' : 'bg-white/40 min-w-max border-white/60 shadow-violet-900/5'
      }`}>
        {tabs.filter(t => isAdmin ? (t.id === 'personal' || t.id === 'settings') : true).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-2.5 px-5 sm:px-6 rounded-full font-bold text-sm sm:text-base transition-all duration-300 ${
                isActive
                  ? (isAdmin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/25' : isKennel ? 'bg-gradient-to-r from-amber-500 to-rose-400 text-white shadow-md shadow-amber-500/25 rotate-0 scale-100' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25')
                  : (isAdmin ? 'text-cyan-900/60 hover:text-cyan-900 hover:bg-cyan-50/50' : isKennel ? 'text-amber-900/60 hover:text-amber-900 hover:bg-amber-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
              <span className="hidden sm:inline-block tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};