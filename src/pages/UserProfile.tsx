import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TabNavigation } from '../components/profile/TabNavigation';
import { PersonalInfoTab } from '../components/profile/PersonalInfoTab';
import { MyPetsTab } from '../components/profile/MyPetsTab';
import { AccountSettingsTab } from '../components/profile/AccountSettingsTab';
import { PreferencesTab } from '../components/profile/PreferencesTab';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab />;
      case 'pets':
        return <MyPetsTab />;
      case 'settings':
        return <AccountSettingsTab />;
      case 'preferences':
        return <PreferencesTab />;
      default:
        return <PersonalInfoTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      <ProfileHeader />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-12">
        {renderTabContent()}
      </div>
    </div>
  );
};