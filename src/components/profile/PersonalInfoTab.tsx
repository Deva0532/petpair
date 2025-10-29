import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

export const PersonalInfoTab: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth(); // Destructure new function and isLoading
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Initialize state with current user data, using blank strings as fallbacks
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    phone: user?.phone || '', 
    bio: user?.bio || 'Edit your bio to share your passion for pets!',
  });

  // Synchronize local formData state whenever the global user context changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        phone: user.phone || '', 
        bio: user.bio || 'Edit your bio to share your passion for pets!', 
      });
    }
  }, [user]); 

  // --- UPDATED handleSave FUNCTION ---
  const handleSave = async () => {
    setUpdateError('');
    // Extract only the editable fields
    const fieldsToUpdate = {
      name: formData.name,
      location: formData.location,
      phone: formData.phone,
      bio: formData.bio,
      // NOTE: Email is excluded as it usually requires re-authentication
    };

    const success = await updateProfile(fieldsToUpdate);

    if (success) {
      setIsEditing(false);
    } else {
      setUpdateError('Failed to save profile. Please try again.');
    }
  };
  // -----------------------------------

  const handleCancel = () => {
    // Reset form data to current state values from context
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      location: user?.location || '',
      phone: user?.phone || '',
      bio: user?.bio || 'Edit your bio to share your passion for pets!',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
        <div className="text-center text-lg text-red-500 py-12">
            User not found. Please log in.
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        {updateError && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {updateError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={!isEditing}
          />
          
          <Input
            label="Email Address (Read Only)"
            type="email"
            value={formData.email}
            disabled={true} // Email should not be editable here
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
            placeholder="Enter your phone number"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            disabled={!isEditing}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Tell us about yourself and your experience with pets..."
          />
        </div>

        {/* Additional Information */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-2">Member Since</h4>
              <p className="text-gray-600">{new Date(user.joinedAt || '').toLocaleDateString()}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-2">Verification Status</h4>
              <p className="text-emerald-600 font-medium">
                {user.verified ? '✓ Verified Account' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};