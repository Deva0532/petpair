import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000';

interface Vet {
    _id: string;
    name: string;
    specialty: string[];
    rating: number;
    reviewCount: number;
    location: string;
    address: string;
    phone: string;
    image: string;
    emergencyService: boolean;
    availableDays: string[];
    availableTime: string;
    createdAt: string;
}

const SPECIALTIES = [
    'General Practice',
    'Surgery',
    'Exotic Pets',
    'Emergency Care',
    'Dermatology',
    'Internal Medicine',
    'Dentistry',
    'Cardiology',
    'Oncology',
    'Neurology'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AdminVets: React.FC = () => {
    const { showToast } = useToast();
    const [vets, setVets] = useState<Vet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVet, setEditingVet] = useState<Vet | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        specialty: [] as string[],
        location: '',
        address: '',
        phone: '',
        image: '',
        emergencyService: false,
        availableDays: [] as string[],
        availableTime: ''
    });

    useEffect(() => {
        fetchVets();
    }, []);

    const fetchVets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/vets`);
            const data = await response.json();
            setVets(data);
        } catch (error) {
            console.error('Error fetching vets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/vets?search=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setVets(data);
        } catch (error) {
            console.error('Error searching vets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingVet(null);
        setFormData({
            name: '',
            specialty: [],
            location: '',
            address: '',
            phone: '',
            image: '',
            emergencyService: false,
            availableDays: [],
            availableTime: ''
        });
        setShowModal(true);
    };

    const openEditModal = (vet: Vet) => {
        setEditingVet(vet);
        setFormData({
            name: vet.name,
            specialty: vet.specialty || [],
            location: vet.location || '',
            address: vet.address || '',
            phone: vet.phone || '',
            image: vet.image || '',
            emergencyService: vet.emergencyService || false,
            availableDays: vet.availableDays || [],
            availableTime: vet.availableTime || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            showToast('Vet name is required', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingVet
                ? `${API_BASE_URL}/api/admin/vets/${editingVet._id}`
                : `${API_BASE_URL}/api/admin/vets`;
            const method = editingVet ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowModal(false);
                fetchVets();
                showToast(editingVet ? 'Vet updated successfully!' : 'Vet added successfully!', 'success');
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to save vet', 'error');
            }
        } catch (error) {
            console.error('Error saving vet:', error);
            showToast('Error saving vet', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (vet: Vet) => {
        if (!confirm(`Are you sure you want to delete "${vet.name}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/vets/${vet._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setVets(vets.filter(v => v._id !== vet._id));
                showToast('Vet deleted successfully!', 'success');
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to delete vet', 'error');
            }
        } catch (error) {
            console.error('Error deleting vet:', error);
            showToast('Error deleting vet', 'error');
        }
    };

    const toggleSpecialty = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specialty: prev.specialty.includes(spec)
                ? prev.specialty.filter(s => s !== spec)
                : [...prev.specialty, spec]
        }));
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Veterinarians</h1>
                <button
                    onClick={openAddModal}
                    className="flex items-center space-x-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Vet</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Vets Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                    </div>
                ) : vets.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p className="mb-4">No veterinarians found</p>
                        <button
                            onClick={openAddModal}
                            className="text-violet-600 hover:text-violet-700 font-medium"
                        >
                            Add your first vet
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Vet</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Specialty</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Location</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Emergency</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vets.map((vet) => (
                                <tr key={vet._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                {vet.image ? (
                                                    <img src={vet.image} alt={vet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">🩺</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{vet.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    ⭐ {vet.rating?.toFixed(1) || '0.0'} ({vet.reviewCount || 0} reviews)
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {vet.specialty?.slice(0, 2).map((spec) => (
                                                <span
                                                    key={spec}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                            {vet.specialty?.length > 2 && (
                                                <span className="text-xs text-gray-500">+{vet.specialty.length - 2} more</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{vet.location || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{vet.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {vet.emergencyService ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                24/7
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(vet)}
                                                className="p-2 text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vet)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingVet ? 'Edit Veterinarian' : 'Add Veterinarian'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Dr. John Smith"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Specialty */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specialties
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALTIES.map((spec) => (
                                        <button
                                            key={spec}
                                            type="button"
                                            onClick={() => toggleSpecialty(spec)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.specialty.includes(spec)
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location & Address */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Mumbai, Maharashtra"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+91 9876543210"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    placeholder="123 Veterinary Street, Area, City"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                    placeholder="https://example.com/vet-photo.jpg"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Available Days */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.availableDays.includes(day)
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Available Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Hours
                                </label>
                                <input
                                    type="text"
                                    value={formData.availableTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, availableTime: e.target.value }))}
                                    placeholder="9:00 AM - 6:00 PM"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Emergency Service */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="emergencyService"
                                    checked={formData.emergencyService}
                                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyService: e.target.checked }))}
                                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                />
                                <label htmlFor="emergencyService" className="text-sm font-medium text-gray-700">
                                    Offers 24/7 Emergency Service
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : (editingVet ? 'Update Vet' : 'Add Vet')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
