import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserPreferences, updateUserPreferences } from '../../services/userService';

export const PreferencesTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    profileVisibility: 'public',
    showContact: false,
    showLocation: true
  });

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      if (user?.id) {
        try {
          const prefs = await getUserPreferences(user.id);
          if (prefs) {
            setPreferences(prev => ({
              emailNotifications: prefs.emailNotifications ?? prev.emailNotifications,
              smsNotifications: prefs.smsNotifications ?? prev.smsNotifications,
              marketingEmails: prefs.marketingEmails ?? prev.marketingEmails,
              profileVisibility: prefs.profileVisibility ?? prev.profileVisibility,
              showContact: prefs.showContact ?? prev.showContact,
              showLocation: prefs.showLocation ?? prev.showLocation
            }));
          }
        } catch (error) {
          console.error('Failed to fetch preferences:', error);
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [user?.id]);

  const updatePreference = async (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    // Auto-save on change
    if (user?.id) {
      try {
        await updateUserPreferences(user.id, newPrefs);
        showToast('Setting updated', 'success', 2000);
      } catch (error) {
        console.error('Failed to save preference:', error);
        showToast('Failed to save setting', 'error');
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordData.new.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    // For now, show a message - password change would need a backend endpoint
    showToast('Password change feature coming soon', 'info');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleDeleteAccount = async () => {
    // For now, show a message - account deletion would need a backend endpoint
    showToast('For account deletion, please contact support', 'info');
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Notification Settings */}
      <Card className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
            <BellIcon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">Manage how you receive notifications</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive emails about messages, matches, and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Receive text messages for urgent updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => updatePreference('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">Marketing Emails</h3>
              <p className="text-sm text-gray-500">Receive promotional content and special offers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketingEmails}
                onChange={(e) => updatePreference('marketingEmails', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <EyeIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
            <p className="text-sm text-gray-500">Control your profile visibility and data</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="py-3 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={preferences.profileVisibility}
              onChange={(e) => updatePreference('profileVisibility', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="public">Public - Anyone can see your profile</option>
              <option value="private">Private - Only you can see your profile</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Show Contact Information</h3>
              <p className="text-sm text-gray-500">Display your phone number and email to other users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showContact}
                onChange={(e) => updatePreference('showContact', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">Show Location</h3>
              <p className="text-sm text-gray-500">Display your city/location on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showLocation}
                onChange={(e) => updatePreference('showLocation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
            <p className="text-sm text-gray-500">Manage your account security</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setShowPasswordModal(true)}
            >
              <KeyIcon className="w-4 h-4" />
              <span>Change</span>
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-500">Your account is active and verified</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-8 border-2 border-red-200 bg-red-50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            <p className="text-sm text-red-700">Irreversible actions</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-red-900">Delete Account</h3>
            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-100"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(p => ({ ...p, current: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(p => ({ ...p, new: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-violet-600" onClick={handlePasswordChange}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete Account?</h3>
              <p className="text-gray-500 mt-2">This action cannot be undone. All your data, pets, and messages will be permanently deleted.</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};