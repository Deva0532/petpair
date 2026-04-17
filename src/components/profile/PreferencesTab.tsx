import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserPreferences, updateUserPreferences } from '../../services/userService';

export const PreferencesTab: React.FC = () => {
  const { user, logout, refreshToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  // Verification state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'mobile'>('email');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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

    // Call API to change password
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password updated successfully', 'success');
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        showToast(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('An error occurred. Please try again.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showToast('Account deleted successfully', 'success');
        logout(); // Clear context and local storage
        navigate('/');
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Verification handlers
  const handleStartVerification = (type: 'email' | 'mobile') => {
    setVerificationType(type);
    setVerificationOtp('');
    setOtpSent(false);
    setShowVerificationModal(true);
  };

  const handleSendVerificationOtp = async () => {
    setSendingOtp(true);
    try {
      const token = localStorage.getItem('token');
      const value = verificationType === 'email' ? user?.email : user?.phone;

      if (!value) {
        showToast(`Please add your ${verificationType} first`, 'error');
        setSendingOtp(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/send-profile-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: verificationType, value })
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        showToast(`Verification code sent to your ${verificationType}`, 'success');
      } else {
        showToast(data.message || 'Failed to send verification code', 'error');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      showToast('Failed to send verification code', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationOtp || verificationOtp.length !== 6) {
      showToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/verify-profile-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: verificationType, otp: verificationOtp })
      });

      const data = await response.json();
      if (response.ok) {
        // Update token to reflect new verification status
        if (data.token) {
          localStorage.setItem('token', data.token);
          refreshToken();
        }
        showToast(`${verificationType === 'email' ? 'Email' : 'Mobile'} verified successfully!`, 'success');
        setShowVerificationModal(false);
      } else {
        showToast(data.message || 'Invalid verification code', 'error');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showToast('Failed to verify code', 'error');
    } finally {
      setVerifyingOtp(false);
    }
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

      {/* Verification Settings */}
      <Card className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Account Verification</h2>
            <p className="text-sm text-gray-500">Verify your email and phone to get a verification badge</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email Verification */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Email Verification</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            {user?.emailVerified ? (
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartVerification('email')}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                Verify Email
              </Button>
            )}
          </div>

          {/* Mobile Verification */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">Mobile Verification</h3>
                <p className="text-sm text-gray-500">{user?.phone || 'No phone number added'}</p>
              </div>
            </div>
            {user?.mobileVerified ? (
              <div className="flex items-center space-x-2 text-emerald-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartVerification('mobile')}
                disabled={!user?.phone}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
              >
                Verify Mobile
              </Button>
            )}
          </div>

          {/* Verification Badge Info */}
          {user?.emailVerified && user?.mobileVerified ? (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800 font-medium">Your account is fully verified!</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">You'll see a verification badge on your profile.</p>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Verify both email and mobile to get a verification badge on your profile,
                which helps build trust with other users.
              </p>
            </div>
          )}
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
              {(user?.emailVerified && user?.mobileVerified) ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
              ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">Account Status</h3>
                <p className="text-sm text-gray-500">
                  {(user?.emailVerified && user?.mobileVerified) 
                    ? 'Your account is active and verified' 
                    : 'Your account is active but pending verification'}
                </p>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Don't remember your current password?</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user?.email }),
                      });
                      if (response.ok) {
                        showToast('OTP sent to your email. Please check your inbox.', 'success');
                        navigate('/forgot-password', { state: { email: user?.email, otpSent: true, fromProfile: true } });
                      } else {
                        showToast('Failed to send OTP', 'error');
                      }
                    } catch (e) {
                      showToast('Error sending OTP', 'error');
                    }
                  }}
                >
                  Send OTP to Reset Password
                </Button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or update manually</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

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

      {/* Verification OTP Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {verificationType === 'email' ? (
                  <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
                ) : (
                  <DevicePhoneMobileIcon className="w-8 h-8 text-indigo-600" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Verify {verificationType === 'email' ? 'Email' : 'Mobile'}
              </h3>
              <p className="text-gray-500 mt-2">
                {otpSent
                  ? `Enter the 6-digit code sent to your ${verificationType}`
                  : `We'll send a verification code to ${verificationType === 'email' ? user?.email : user?.phone}`
                }
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <Button
                  onClick={handleSendVerificationOtp}
                  disabled={sendingOtp}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {sendingOtp ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVerificationModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    maxLength={6}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setOtpSent(false);
                      setVerificationOtp('');
                    }}
                    className="flex-1"
                    disabled={verifyingOtp}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || verificationOtp.length !== 6}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
                <button
                  onClick={handleSendVerificationOtp}
                  disabled={sendingOtp}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  {sendingOtp ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};