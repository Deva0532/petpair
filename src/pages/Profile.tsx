import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraIcon, StarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    phone: '',
    bio: ''
  });

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

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-5 sm:p-6 text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=ffffff&size=150`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto"
                />
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.location}</span>
              </div>
              
              {user.verified && (
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-green-600 font-medium">Verified Member</span>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                Member since {new Date(user.joinedAt).toLocaleDateString()}
              </p>

              <div className="mt-6 space-y-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-500">Pets Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-500">Successful Matches</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <Button
                  variant={isEditing ? "primary" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={!isEditing}
                />
                
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Tell us about yourself and your love for pets..."
                />
              </div>
            </Card>

            {/* Account Settings */}
            <Card className="p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive emails about new messages and matches</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                    <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-5 sm:p-6 border-red-200">
              <h3 className="text-lg font-semibold text-red-600 mb-6">Danger Zone</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};