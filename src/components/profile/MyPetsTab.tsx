import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, CheckCircleIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { getPets, updatePet, deletePet, markPetAsSold, uploadImage } from '../../services/petService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Pet } from '../../types';

const petTypes = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'fish', label: 'Fish' },
  { value: 'reptile', label: 'Reptile' },
  { value: 'other', label: 'Other' }
];

const breedsByType: Record<string, string[]> = {
  dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Chihuahua', 'Husky', 'Boxer', 'Other'],
  cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal', 'Sphynx', 'Scottish Fold', 'Other'],
  bird: ['Parakeet', 'Canary', 'Cockatiel', 'Parrot', 'Finch', 'Lovebird', 'Other'],
  fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Other'],
  reptile: ['Gecko', 'Python', 'Turtle', 'Iguana', 'Chameleon', 'Other'],
  other: ['Other']
};

interface EditModalProps {
  pet: Pet;
  onClose: () => void;
  onSave: (petId: string, data: any) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const EditPetModal: React.FC<EditModalProps> = ({ pet, onClose, onSave, showToast }) => {
  const [formData, setFormData] = useState({
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    price: pet.price,
    description: pet.description,
    location: pet.location,
    weight: pet.weight || 0,
    vaccinated: pet.vaccinated || false,
    neutered: pet.neutered || false,
    availableForMating: pet.availableForMating || false,
    availableForSale: pet.availableForSale !== false,
    medicalNotes: pet.medicalNotes || '',
    personality: pet.personality || [],
    careRequirements: pet.careRequirements || { exercise: '', space: '' },
    size: pet.size || 'medium',
    activityLevel: pet.activityLevel || 'moderate',
    goodWithKids: pet.goodWithKids || false,
    goodWithPets: pet.goodWithPets || false,
    houseTrained: pet.houseTrained || false,
    imageUrls: pet.imageUrls || [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'health' | 'photos'>('basic');
  const [newPersonality, setNewPersonality] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('care.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        careRequirements: { ...prev.careRequirements, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({ ...prev, type: newType as any, breed: '' }));
  };

  const addPersonality = () => {
    if (newPersonality.trim() && !formData.personality.includes(newPersonality.trim())) {
      setFormData(prev => ({ ...prev, personality: [...prev.personality, newPersonality.trim()] }));
      setNewPersonality('');
    }
  };

  const removePersonality = (trait: string) => {
    setFormData(prev => ({ ...prev, personality: prev.personality.filter(t => t !== trait) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.imageUrls.length + newImages.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    setNewImages(prev => [...prev, ...files]);
    files.forEach(file => setImagePreviews(prev => [...prev, URL.createObjectURL(file)]));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      await onSave(pet.id, {
        ...formData,
        imageUrls: [...formData.imageUrls, ...uploadedUrls]
      });
      onClose();
    } catch (error) {
      console.error('Failed to update pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableBreeds = breedsByType[formData.type] || breedsByType['other'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Edit Pet: {pet.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/80 rounded-lg transition-colors">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4 bg-white/50 p-1 rounded-lg">
            {[
              { id: 'basic', label: '📝 Basic Info' },
              { id: 'details', label: '🐾 Details' },
              { id: 'health', label: '💉 Health' },
              { id: 'photos', label: '📷 Photos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  >
                    {petTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed *</label>
                  <select
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    required
                  >
                    <option value="">Select breed</option>
                    {availableBreeds.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age (years) *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="availableForSale" checked={formData.availableForSale} onChange={handleInputChange} className="rounded text-violet-600" />
                  <span className="text-sm text-gray-700">Available for Sale</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="availableForMating" checked={formData.availableForMating} onChange={handleInputChange} className="rounded text-violet-600" />
                  <span className="text-sm text-gray-700">Available for Mating</span>
                </label>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                >
                  <option value="low">Low 😴</option>
                  <option value="moderate">Moderate 🚶</option>
                  <option value="high">High 🏃</option>
                </select>
              </div>

              {/* Personality Traits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personality Traits</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newPersonality}
                    onChange={(e) => setNewPersonality(e.target.value)}
                    placeholder="e.g., Playful, Friendly"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersonality())}
                  />
                  <Button type="button" onClick={addPersonality} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personality.map((trait, i) => (
                    <span key={i} className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm flex items-center">
                      {trait}
                      <button type="button" onClick={() => removePersonality(trait)} className="ml-2 text-violet-500 hover:text-violet-700">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Care Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Needs</label>
                  <input
                    type="text"
                    name="care.exercise"
                    value={formData.careRequirements.exercise}
                    onChange={handleInputChange}
                    placeholder="e.g., 1-2 hours daily"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Space Requirements</label>
                  <input
                    type="text"
                    name="care.space"
                    value={formData.careRequirements.space}
                    onChange={handleInputChange}
                    placeholder="e.g., Large yard preferred"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Compatibility */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Compatibility</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="goodWithKids" checked={formData.goodWithKids} onChange={handleInputChange} className="rounded text-violet-600" />
                    <span className="text-sm text-gray-700">👶 Good with Kids</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="goodWithPets" checked={formData.goodWithPets} onChange={handleInputChange} className="rounded text-violet-600" />
                    <span className="text-sm text-gray-700">🐾 Good with Pets</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="houseTrained" checked={formData.houseTrained} onChange={handleInputChange} className="rounded text-violet-600" />
                    <span className="text-sm text-gray-700">🏠 House Trained</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Health Tab */}
          {activeTab === 'health' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="vaccinated" checked={formData.vaccinated} onChange={handleInputChange} className="rounded text-violet-600" />
                  <span className="text-sm text-gray-700">💉 Vaccinated</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="neutered" checked={formData.neutered} onChange={handleInputChange} className="rounded text-violet-600" />
                  <span className="text-sm text-gray-700">✂️ Spayed/Neutered</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical Notes</label>
                <textarea
                  name="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any health conditions, allergies, or medical history..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Photos</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={url} alt={`Pet ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((url, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden group border-2 border-violet-300">
                      <img src={url} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-violet-500 text-white text-xs px-2 py-0.5 rounded">New</div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formData.imageUrls.length + newImages.length < 5 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add More Photos (Max 5 total)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">Click to upload</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </label>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex space-x-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText: string;
  confirmClassName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, confirmText, confirmClassName, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex space-x-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={onConfirm} className={confirmClassName || "flex-1 bg-red-600 hover:bg-red-700"} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </div>
  </div>
);

export const MyPetsTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);
  const [markingSold, setMarkingSold] = useState<Pet | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserPets = async () => {
    if (!user) return;
    try {
      const { pets: allPets } = await getPets(1, 1000); // Get all pets for filtering user's pets
      const userPets = allPets.filter(pet => pet.owner?.id === user.id && pet.status !== 'deleted');
      setPets(userPets);
    } catch (error) {
      console.error("Failed to fetch user pets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserPets(); }, [user]);

  const handleUpdatePet = async (petId: string, data: any) => {
    await updatePet(petId, data);
    await fetchUserPets();
  };

  const handleDeletePet = async () => {
    if (!deletingPet) return;
    setActionLoading(true);
    try {
      await deletePet(deletingPet.id);
      await fetchUserPets();
      setDeletingPet(null);
    } catch (error) {
      console.error('Failed to delete pet:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    if (!markingSold) return;
    setActionLoading(true);
    try {
      await markPetAsSold(markingSold.id);
      await fetchUserPets();
      setMarkingSold(null);
    } catch (error) {
      console.error('Failed to mark pet as sold:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const activePets = pets.filter(p => p.status === 'active' || !p.status);
  const soldPets = pets.filter(p => p.status === 'sold');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Pets</h2>
          <p className="text-gray-600 mt-1">Manage your pet listings</p>
        </div>
        <Link to="/add-pet">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600">
            <PlusIcon className="w-5 h-5" />
            <span>Add New Pet</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <div className="text-2xl font-bold text-violet-600">{pets.length}</div>
          <div className="text-gray-600 text-sm">Total Pets</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">{activePets.length}</div>
          <div className="text-gray-600 text-sm">Active Listings</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <div className="text-2xl font-bold text-amber-600">{soldPets.length}</div>
          <div className="text-gray-600 text-sm">Sold</div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100">
          <div className="text-2xl font-bold text-rose-600">0</div>
          <div className="text-gray-600 text-sm">Total Views</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => {
          const hasImage = pet.imageUrls && pet.imageUrls.length > 0 && !pet.image?.includes('placehold.co');
          return (
          <Card key={pet.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${pet.status === 'sold' ? 'opacity-75' : ''}`}>
            <div className="relative">
              {hasImage ? (
                <img src={pet.image} alt={pet.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
                  <PhotoIcon className="w-12 h-12 text-gray-300" />
                  <p className="text-sm text-gray-400 mt-1 font-medium">No Image</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingPet(pet); }}
                    className="mt-2 text-xs bg-violet-600 text-white px-3 py-1 rounded-full font-medium hover:bg-violet-700 transition-colors"
                  >
                    📷 Add Photo
                  </button>
                </div>
              )}
              {pet.featured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">⭐ Club</div>
              )}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${pet.status === 'sold' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {pet.status === 'sold' ? '🏷️ Sold' : '✓ Active'}
              </div>
            </div>
            {/* No Image Warning */}
            {!hasImage && pet.status !== 'sold' && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  ⚠️ Pets with photos get <strong>3x more views</strong>
                </p>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
                <span className="text-lg font-bold text-violet-600">${pet.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{pet.breed} • {pet.age} year{pet.age !== 1 ? 's' : ''} old</p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{pet.description}</p>
              <div className="flex flex-wrap gap-2">
                <Link to={`/pet/${pet.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-1">
                    <EyeIcon className="w-4 h-4" /><span>View</span>
                  </Button>
                </Link>
                {pet.status !== 'sold' && (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1" onClick={() => setEditingPet(pet)}>
                      <PencilIcon className="w-4 h-4" /><span>Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1 text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => setMarkingSold(pet)}>
                      <CheckCircleIcon className="w-4 h-4" /><span>Sold</span>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setDeletingPet(pet)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets listed yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first pet to the marketplace.</p>
          <Link to="/add-pet">
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600">Add Your First Pet</Button>
          </Link>
        </div>
      )}

      {editingPet && <EditPetModal pet={editingPet} onClose={() => setEditingPet(null)} onSave={handleUpdatePet} showToast={showToast} />}
      {deletingPet && (
        <ConfirmModal
          title="Delete Pet"
          message={`Are you sure you want to delete "${deletingPet.name}"? This pet will be removed from the marketplace.`}
          confirmText="Delete"
          onConfirm={handleDeletePet}
          onCancel={() => setDeletingPet(null)}
          loading={actionLoading}
        />
      )}
      {markingSold && (
        <ConfirmModal
          title="Mark as Sold"
          message={`Mark "${markingSold.name}" as sold?`}
          confirmText="Mark as Sold"
          confirmClassName="flex-1 bg-amber-600 hover:bg-amber-700"
          onConfirm={handleMarkSold}
          onCancel={() => setMarkingSold(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};