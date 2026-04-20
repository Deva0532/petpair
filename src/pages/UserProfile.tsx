import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TabNavigation } from '../components/profile/TabNavigation';
import { PersonalInfoTab } from '../components/profile/PersonalInfoTab';
import { MyPetsTab } from '../components/profile/MyPetsTab';
import { PreferencesTab } from '../components/profile/PreferencesTab';
import { FeedbackTab } from '../components/profile/FeedbackTab';

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

  const isKennel = user.userType === 'kennel';
  const isAdmin = user.role === 'admin';
  const isPendingKennel = isKennel && !user.isApproved;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab />;
      case 'pets':
        return <MyPetsTab />;
      case 'settings':
        return <PreferencesTab />;
      case 'feedback':
        return <FeedbackTab />;
      default:
        return <PersonalInfoTab />;
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isAdmin ? 'bg-cyan-50/30' : isKennel ? 'bg-[#FCFAF8]' : 'bg-slate-50'}`}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {isAdmin ? (
          /* Cyberspace Admin Aesthetic */
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3"></div>
            <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-blue-300/15 rounded-full blur-[120px] -translate-x-1/4"></div>
            <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-sky-400/20 rounded-full blur-[100px] translate-y-1/4"></div>
          </>
        ) : isKennel ? (
          /* Warm Premium Kennel Aesthetic */
          <>
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/20 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3"></div>
            <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] -translate-x-1/4"></div>
            <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-yellow-600/15 rounded-full blur-[130px] translate-y-1/4"></div>
            {/* Grainy warm noise overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
          </>
        ) : (
          /* Vibrant Standard User Aesthetic */
          <>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-400/20 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4"></div>
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-fuchsia-400/20 rounded-full blur-[80px] -translate-x-1/4"></div>
            <div className="absolute top-1/2 left-1/3 w-[800px] h-[800px] bg-blue-300/15 rounded-full blur-[120px] -translate-y-1/2"></div>
          </>
        )}
      </div>

      <div className="relative z-10 pb-20">
        <ProfileHeader />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {/* Pending Kennel Warning Banner */}
          {isPendingKennel && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm animate-fadeInUp">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-amber-800 font-bold text-lg">Pending Kennel Approval</h3>
                  <p className="text-amber-700 mt-1 font-medium">
                    Your account is currently under review by administrators. You can explore the platform and draft pet listings, but <strong>your pets will not be listed publicly</strong> until you are approved.
                  </p>
                  <p className="text-amber-600/80 text-sm mt-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Tip: Verifying your mobile number and email increases your chances of a faster approval.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="transition-all duration-300 animate-fadeInUp">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};