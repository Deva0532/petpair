import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage, addPet } from '../services/petService';

interface PetFormData {
  name: string;
  breed: string;
  age: number;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  price: number;
  location: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  availableForMating: boolean;
  availableForSale: boolean;
  featured: boolean;
  images: File[];
}

const petTypes = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' }
];

const popularBreeds = [
  'Golden Retriever', 'German Shepherd', 'Labrador', 'Persian', 'Siamese',
  'Maine Coon', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Chihuahua',
  'British Shorthair', 'Ragdoll', 'Bengal', 'Parakeet', 'Canary', 'Goldfish',
  'Betta', 'Gecko', 'Python', 'Other'
];

export const AddPet: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    breed: '',
    age: 0,
    type: 'dog',
    price: 0,
    location: user?.location || '',
    description: '',
    vaccinated: false,
    neutered: false,
    availableForMating: false,
    availableForSale: true,
    featured: false,
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to post your pet.</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    const newImages = [...formData.images, ...files];
    setFormData(prev => ({ ...prev, images: newImages }));

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Pet name is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (formData.age < 0 || formData.age > 30) newErrors.age = 'Please enter a valid age';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.availableForSale && formData.price <= 0) newErrors.price = 'Price is required for pets for sale';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.availableForSale && !formData.availableForMating) {
      newErrors.availability = 'Pet must be available for sale or mating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await Promise.all(
        formData.images.map(image => uploadImage(image))
      );

      // Prepare pet data
      const petData = {
        name: formData.name,
        breed: formData.breed,
        age: formData.age,
        type: formData.type,
        price: formData.price,
        location: formData.location,
        description: formData.description,
        vaccinated: formData.vaccinated,
        neutered: formData.neutered,
        availableForMating: formData.availableForMating,
        availableForSale: formData.availableForSale,
        featured: formData.featured,
        imageUrls: imageUrls
      };

      // Save to Firestore
      await addPet(petData);

      // Show success message and redirect
      alert('Pet posted successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error posting pet:", error);
      setErrors({ general: 'Failed to post pet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Post Your Pet
          </h1>
          <p className="text-lg text-gray-600">
            Share your pet with our community for sale or mating
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pet Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter your pet's name"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    {petTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breed
                  </label>
                  <select
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Select breed</option>
                    {popularBreeds.map(breed => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                  {errors.breed && <p className="mt-1 text-sm text-red-600">{errors.breed}</p>}
                </div>

                <Input
                  label="Age (years)"
                  name="age"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={errors.age}
                  placeholder="Enter age in years"
                />

                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={errors.location}
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="availableForSale"
                      checked={formData.availableForSale}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for Sale</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="availableForMating"
                      checked={formData.availableForMating}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for Mating</span>
                  </label>
                </div>

                {errors.availability && (
                  <p className="text-sm text-red-600">{errors.availability}</p>
                )}

                {formData.availableForSale && (
                  <div className="max-w-xs">
                    <Input
                      label="Price ($)"
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      error={errors.price}
                      placeholder="Enter price"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Information</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="vaccinated"
                    checked={formData.vaccinated}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vaccinated</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="neutered"
                    checked={formData.neutered}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Spayed/Neutered</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                placeholder="Tell us about your pet's personality, habits, and any special care requirements..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Images */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB (Max 5 images)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {errors.images && (
                  <p className="text-sm text-red-600">{errors.images}</p>
                )}

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Options */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Options</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Make this a Club pet (Featured listing - $10 extra)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Club pets appear at the top of search results and get more visibility
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Posting Pet...' : 'Post Pet'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};