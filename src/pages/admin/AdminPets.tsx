import React, { useState, useEffect } from 'react';
import { TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

import { API_BASE_URL } from '../../config';

interface Pet {
    _id: string;
    name: string;
    breed: string;
    type: string;
    price: number;
    status: 'active' | 'sold' | 'deleted';
    ownerId: {
        _id: string;
        name: string;
        email: string;
        storeName?: string;
        userType: string;
    };
    imageUrls?: string[];
}

export const AdminPets: React.FC = () => {
    const { showToast } = useToast();
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold' | 'deleted'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchPets();
    }, [page, filterStatus]);

    const fetchPets = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(searchQuery && { search: searchQuery })
            });

            const response = await fetch(`${API_BASE_URL}/api/admin/pets?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setPets(data.pets);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchPets();
    };

    const openDeleteModal = (pet: Pet) => {
        setPetToDelete(pet);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!petToDelete || !deleteReason.trim()) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/pets/${petToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: deleteReason })
            });

            if (response.ok) {
                setPets(pets.map(p => p._id === petToDelete._id ? { ...p, status: 'deleted' } : p));
                setShowDeleteModal(false);
                setPetToDelete(null);
                setDeleteReason('');
                showToast('Pet listing deleted successfully!', 'success');
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to delete pet', 'error');
            }
        } catch (error) {
            console.error('Error deleting pet:', error);
            showToast('Error deleting pet', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'sold':
                return 'bg-blue-100 text-blue-800';
            case 'deleted':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pets</h1>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, breed, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                        <option value="deleted">Deleted</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Pets Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                    </div>
                ) : pets.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No pets found</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pet</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Owner</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pets.map((pet) => (
                                <tr key={pet._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {pet.imageUrls?.[0] ? (
                                                    <img src={pet.imageUrls[0]} alt={pet.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">🐾</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{pet.name}</p>
                                                <p className="text-sm text-gray-500">{pet.breed} • {pet.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{pet.ownerId?.name}</p>
                                            <p className="text-sm text-gray-500">{pet.ownerId?.email}</p>
                                            {pet.ownerId?.storeName && (
                                                <p className="text-sm text-violet-600">{pet.ownerId.storeName}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">
                                            {pet.price > 0 ? `₹${pet.price.toLocaleString()}` : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(pet.status)}`}>
                                            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pet.status !== 'deleted' && (
                                            <button
                                                onClick={() => openDeleteModal(pet)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete pet"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && petToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Delete Pet Listing</h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4 p-4 bg-red-50 rounded-xl">
                            <p className="text-red-800">
                                You are about to delete pet listing <strong>"{petToDelete.name}"</strong>
                                {petToDelete.ownerId?.name && (
                                    <> belonging to <strong>{petToDelete.ownerId.name}</strong></>
                                )}.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Please provide a reason for removing this listing. This will be sent to the owner's email."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                An email notification will be sent to the pet owner explaining the removal.
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!deleteReason.trim() || isDeleting}
                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
