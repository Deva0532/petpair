import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, SparklesIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { uploadImage, addPet } from '../services/petService';

interface HealthRecord {
  visitType: string;
  date: string;
  notes: string;
  vetName: string;
}

interface PetFormData {
  name: string;
  breed: string;
  customBreed: string;
  age: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  customType: string;
  gender: 'male' | 'female';
  price: string;
  location: string;
  description: string;
  vaccinated: boolean;
  neutered: boolean;
  availableForMating: boolean;
  availableForSale: boolean;
  images: File[];
  weight: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  activityLevel: 'low' | 'moderate' | 'high';
  goodWithKids: boolean;
  goodWithPets: boolean;
  houseTrained: boolean;
  specialNeeds: boolean;
  healthRecords: HealthRecord[];
  medicalNotes: string;
  healthProblems: string[];
}

const petTypes = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐱' },
  { value: 'bird', label: 'Bird', icon: '🦜' },
  { value: 'fish', label: 'Fish', icon: '🐠' },
  { value: 'reptile', label: 'Reptile', icon: '🦎' },
  { value: 'other', label: 'Other', icon: '🐾' }
];

const breedsByType: Record<string, string[]> = {
  dog: ['Golden Retriever', 'German Shepherd', 'Labrador', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Chihuahua', 'Husky', 'Boxer', 'Other'],
  cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengal', 'Sphynx', 'Scottish Fold', 'Other'],
  bird: ['Parakeet', 'Canary', 'Cockatiel', 'Parrot', 'Finch', 'Lovebird', 'Other'],
  fish: ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Other'],
  reptile: ['Gecko', 'Python', 'Turtle', 'Iguana', 'Chameleon', 'Other'],
  other: ['Other']
};

const visitTypes = [
  'Regular Checkup', 'Vaccination', 'Surgery', 'Emergency', 'Dental', 'Grooming', 'Deworming', 'Other'
];

const commonHealthProblems = [
  'Allergies', 'Arthritis', 'Blindness', 'Deafness', 'Diabetes', 'Epilepsy', 'Heart Disease',
  'Hip Dysplasia', 'Kidney Disease', 'Obesity', 'Skin Conditions', 'Anxiety', 'None'
];

export const AddPet: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    breed: '',
    customBreed: '',
    age: '',
    type: 'dog',
    customType: '',
    gender: 'male',
    price: '',
    location: user?.location || '',
    description: '',
    vaccinated: false,
    neutered: false,
    availableForMating: false,
    availableForSale: true,
    images: [],
    weight: '',
    size: 'medium',
    activityLevel: 'moderate',
    goodWithKids: false,
    goodWithPets: false,
    houseTrained: false,
    specialNeeds: false,
    healthRecords: [],
    medicalNotes: '',
    healthProblems: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-violet-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to post your pet.</p>
          <button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg">
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addHealthRecord = () => {
    setFormData(prev => ({
      ...prev,
      healthRecords: [...prev.healthRecords, { visitType: '', date: '', notes: '', vetName: '' }]
    }));
  };

  const updateHealthRecord = (index: number, field: keyof HealthRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      healthRecords: prev.healthRecords.map((record, i) => i === index ? { ...record, [field]: value } : record)
    }));
  };

  const removeHealthRecord = (index: number) => {
    setFormData(prev => ({ ...prev, healthRecords: prev.healthRecords.filter((_, i) => i !== index) }));
  };

  const toggleHealthProblem = (problem: string) => {
    setFormData(prev => {
      if (problem === 'None') {
        return { ...prev, healthProblems: prev.healthProblems.includes('None') ? [] : ['None'] };
      }
      const filtered = prev.healthProblems.filter(p => p !== 'None');
      if (filtered.includes(problem)) {
        return { ...prev, healthProblems: filtered.filter(p => p !== problem) };
      }
      return { ...prev, healthProblems: [...filtered, problem] };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Pet name is required';
      const finalBreed = formData.breed === 'Other' ? formData.customBreed : formData.breed;
      if (!finalBreed.trim()) newErrors.breed = 'Breed is required';
      if (!formData.age.trim()) newErrors.age = 'Age is required';
      if (formData.type === 'other' && !formData.customType.trim()) newErrors.customType = 'Pet type is required';
    }
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    if (step === 3) {
      if (formData.availableForSale && !formData.price) newErrors.price = 'Price is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 3)); };
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      for (const image of formData.images) {
        try {
          const url = await uploadImage(image);
          uploadedImageUrls.push(url);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
        }
      }

      const finalBreed = formData.breed === 'Other' ? formData.customBreed : formData.breed;
      const finalType = formData.type === 'other' ? formData.customType : formData.type;

      const petData = {
        name: formData.name,
        breed: finalBreed,
        customBreed: formData.breed === 'Other' ? formData.customBreed : undefined,
        age: parseFloat(formData.age) || 0,
        type: finalType,
        customType: formData.type === 'other' ? formData.customType : undefined,
        gender: formData.gender,
        price: parseFloat(formData.price) || 0,
        location: formData.location,
        description: formData.description,
        vaccinated: formData.vaccinated,
        neutered: formData.neutered,
        availableForMating: formData.availableForMating,
        availableForSale: formData.availableForSale,
        imageUrls: uploadedImageUrls,
        weight: parseFloat(formData.weight) || undefined,
        size: formData.size,
        activityLevel: formData.activityLevel,
        goodWithKids: formData.goodWithKids,
        goodWithPets: formData.goodWithPets,
        houseTrained: formData.houseTrained,
        specialNeeds: formData.specialNeeds,
        healthRecords: formData.healthRecords.filter(r => r.visitType && r.date),
        medicalNotes: formData.medicalNotes,
        healthProblems: formData.healthProblems.filter(p => p !== 'None')
      };

      await addPet(petData);
      showToast('🎉 Pet posted successfully! Your listing is now live.', 'success', 5000);
      navigate('/');
    } catch (error) {
      console.error("Error posting pet:", error);
      setErrors({ general: 'Failed to post pet. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Listing' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Post Your Pet
          </h1>
          <p className="text-gray-600">Find the perfect home for your furry friend</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.num ? 'bg-emerald-500 text-white' : currentStep === step.num ? 'bg-violet-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStep > step.num ? <CheckCircleIcon className="w-6 h-6" /> : step.num}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${currentStep >= step.num ? 'text-violet-600' : 'text-gray-400'}`}>{step.title}</span>
                </div>
                {index < steps.length - 1 && <div className={`w-16 h-1 rounded-full ${currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 overflow-hidden">
          {errors.general && (
            <div className="bg-red-50 border-b border-red-200 p-4">
              <p className="text-sm text-red-700 text-center">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">🐾 Basic Information</h2>

                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pet Type</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {petTypes.map(type => (
                      <button key={type.value} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value as any, breed: '', customBreed: '', customType: '' }))}
                        className={`p-3 rounded-xl border-2 transition-all ${formData.type === type.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 hover:border-violet-300'}`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Pet Type (if Other selected) */}
                {formData.type === 'other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Pet Type</label>
                    <input type="text" name="customType" value={formData.customType} onChange={handleInputChange}
                      placeholder="e.g., Hamster, Rabbit, Ferret..."
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${errors.customType ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.customType && <p className="mt-1 text-sm text-red-600">{errors.customType}</p>}
                  </div>
                )}

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ value: 'male', label: 'Male', icon: '♂️' }, { value: 'female', label: 'Female', icon: '♀️' }].map(g => (
                      <button key={g.value} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: g.value as 'male' | 'female' }))}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${formData.gender === g.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 hover:border-violet-300'}`}
                      >
                        <span className="text-2xl">{g.icon}</span>
                        <span className="font-semibold text-gray-700">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pet Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder="Enter pet's name"
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                    <select name="breed" value={formData.breed} onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 ${errors.breed ? 'border-red-300' : 'border-gray-200'}`}
                    >
                      <option value="">Select breed</option>
                      {(breedsByType[formData.type] || ['Other']).map(breed => (
                        <option key={breed} value={breed}>{breed}</option>
                      ))}
                    </select>
                    {errors.breed && <p className="mt-1 text-sm text-red-600">{errors.breed}</p>}
                  </div>

                  {/* Custom Breed (if Other selected) */}
                  {formData.breed === 'Other' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Breed</label>
                      <input type="text" name="customBreed" value={formData.customBreed} onChange={handleInputChange}
                        placeholder="Enter custom breed name..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}

                  {/* Age - Manual Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age (in years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange}
                      placeholder="e.g., 2.5"
                      step="0.1"
                      min="0"
                      max="30"
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 ${errors.age ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                  </div>

                  {/* Weight - Manual Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (in kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleInputChange}
                      placeholder="e.g., 15.5"
                      step="0.1"
                      min="0"
                      max="200"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Size</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'small', label: 'Small', desc: 'Under 10kg' },
                      { value: 'medium', label: 'Medium', desc: '10-25kg' },
                      { value: 'large', label: 'Large', desc: '25-45kg' },
                      { value: 'extra-large', label: 'XL', desc: 'Over 45kg' }
                    ].map(size => (
                      <button key={size.value} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, size: size.value as any }))}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${formData.size === size.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                      >
                        <div className="font-medium text-gray-900">{size.label}</div>
                        <div className="text-xs text-gray-500">{size.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Low', icon: '😴', desc: 'Relaxed' },
                      { value: 'moderate', label: 'Moderate', icon: '🚶', desc: 'Regular' },
                      { value: 'high', label: 'High', icon: '🏃', desc: 'Very active' }
                    ].map(level => (
                      <button key={level.value} type="button"
                        onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.value as any }))}
                        className={`p-4 rounded-xl border-2 transition-all ${formData.activityLevel === level.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                      >
                        <div className="text-2xl mb-1">{level.icon}</div>
                        <div className="font-medium text-gray-900">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">📝 Details & Photos</h2>

                {/* Vaccinated - Prominent */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input type="checkbox" name="vaccinated" checked={formData.vaccinated} onChange={handleInputChange}
                      className="w-6 h-6 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-lg font-semibold text-emerald-800">✅ Vaccinated</span>
                      <p className="text-sm text-emerald-600">Pet has up-to-date vaccinations</p>
                    </div>
                  </label>
                </div>

                {/* Health Problems */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">🏥 Health Conditions</label>
                  <p className="text-sm text-gray-500 mb-3">Select any health conditions or problems your pet has</p>
                  <div className="flex flex-wrap gap-2">
                    {commonHealthProblems.map(problem => (
                      <button key={problem} type="button" onClick={() => toggleHealthProblem(problem)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.healthProblems.includes(problem)
                          ? problem === 'None' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {problem}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Boolean Options */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'neutered', label: 'Neutered/Spayed', icon: '✂️' },
                    { name: 'houseTrained', label: 'House Trained', icon: '🏠' },
                    { name: 'goodWithKids', label: 'Good with Kids', icon: '👶' },
                    { name: 'goodWithPets', label: 'Good with Pets', icon: '🐕' },
                    { name: 'specialNeeds', label: 'Special Needs', icon: '💝' }
                  ].map(option => (
                    <label key={option.name} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${(formData as any)[option.name] ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}>
                      <input type="checkbox" name={option.name} checked={(formData as any)[option.name]} onChange={handleInputChange} className="w-5 h-5 text-violet-600 rounded" />
                      <span className="text-lg">{option.icon}</span>
                      <span className="font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us about your pet's personality, habits, favorite activities..."
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 resize-none ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Medical Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Notes (Optional)</label>
                  <textarea name="medicalNotes" value={formData.medicalNotes} onChange={handleInputChange}
                    rows={2}
                    placeholder="Any medical conditions, allergies, or special care instructions..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                {/* Health Records */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">🩺 Health & Vet Records</label>
                    <button type="button" onClick={addHealthRecord}
                      className="flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200"
                    >
                      <PlusIcon className="w-4 h-4" /> Add Record
                    </button>
                  </div>
                  {formData.healthRecords.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No health records added yet. Click "Add Record" to add a vet visit.</p>
                  )}
                  <div className="space-y-4">
                    {formData.healthRecords.map((record, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-700">Record #{index + 1}</span>
                          <button type="button" onClick={() => removeHealthRecord(index)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select value={record.visitType} onChange={e => updateHealthRecord(index, 'visitType', e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500"
                          >
                            <option value="">Select visit type</option>
                            {visitTypes.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                          <input type="date" value={record.date} onChange={e => updateHealthRecord(index, 'date', e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500"
                          />
                          <input type="text" value={record.vetName} onChange={e => updateHealthRecord(index, 'vetName', e.target.value)}
                            placeholder="Vet/Clinic name"
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500"
                          />
                          <input type="text" value={record.notes} onChange={e => updateHealthRecord(index, 'notes', e.target.value)}
                            placeholder="Notes (optional)"
                            className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Photos (Max 5)</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" multiple />
                      </label>
                    )}
                  </div>
                  {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Listing */}
            {currentStep === 3 && (
              <div className="p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">💰 Listing Details</h2>

                {/* Listing Options */}
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${formData.availableForSale ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}>
                    <input type="checkbox" name="availableForSale" checked={formData.availableForSale} onChange={handleInputChange} className="w-5 h-5 text-violet-600 rounded" />
                    <div>
                      <span className="font-semibold text-gray-900">🏷️ Available for Sale</span>
                      <p className="text-sm text-gray-600">List your pet for sale</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer ${formData.availableForMating ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}>
                    <input type="checkbox" name="availableForMating" checked={formData.availableForMating} onChange={handleInputChange} className="w-5 h-5 text-rose-600 rounded" />
                    <div>
                      <span className="font-semibold text-gray-900">💕 Available for Mating</span>
                      <p className="text-sm text-gray-600">List on pet dating service</p>
                    </div>
                  </label>
                </div>

                {/* Price and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.availableForSale && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                        placeholder="Enter price"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 ${errors.price ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>
                  )}
                  <div className={formData.availableForSale ? '' : 'md:col-span-2'}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleInputChange}
                      placeholder="City, State"
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-violet-500 ${errors.location ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-violet-50 to-rose-50 p-6 rounded-xl border border-violet-200">
                  <h3 className="font-semibold text-gray-900 mb-4">📋 Listing Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Pet:</span> <span className="font-medium">{formData.name}</span></div>
                    <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{formData.type === 'other' ? formData.customType : formData.type}</span></div>
                    <div><span className="text-gray-500">Breed:</span> <span className="font-medium">{formData.breed === 'Other' ? formData.customBreed : formData.breed}</span></div>
                    <div><span className="text-gray-500">Age:</span> <span className="font-medium">{formData.age} years</span></div>
                    <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize">{formData.gender}</span></div>
                    {formData.weight && <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{formData.weight} kg</span></div>}
                    <div><span className="text-gray-500">Photos:</span> <span className="font-medium">{formData.images.length} uploaded</span></div>
                    {formData.availableForSale && <div><span className="text-gray-500">Price:</span> <span className="font-medium text-violet-600">₹{formData.price}</span></div>}
                    {formData.healthProblems.length > 0 && formData.healthProblems[0] !== 'None' && (
                      <div className="col-span-2"><span className="text-gray-500">Health Conditions:</span> <span className="font-medium text-rose-600">{formData.healthProblems.join(', ')}</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between">
              {currentStep > 1 ? (
                <button type="button" onClick={handlePrev} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Back
                </button>
              ) : <div />}
              {currentStep < 3 ? (
                <button type="button" onClick={handleNext} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg">
                  Continue
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
                  ) : (
                    <><SparklesIcon className="w-5 h-5" /> Post Pet</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};