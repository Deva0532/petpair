const CLOUDINARY_CLOUD_NAME = 'peto';
const CLOUDINARY_UPLOAD_PRESET = 'petpair';

export interface PetData {
    name: string;
    breed: string;
    customBreed?: string;
    age: number;
    type: string;
    customType?: string;
    gender?: 'male' | 'female';
    price: number;
    location: string;
    description: string;
    vaccinated: boolean;
    neutered: boolean;
    availableForMating: boolean;
    availableForSale: boolean;
    featured?: boolean;
    imageUrls: string[];
    videoUrl?: string;
    weight?: number;
    createdAt?: any;
    size?: 'small' | 'medium' | 'large' | 'extra-large';
    activityLevel?: 'low' | 'moderate' | 'high';
    goodWithKids?: boolean;
    goodWithPets?: boolean;
    houseTrained?: boolean;
    spayedNeutered?: boolean;
    specialNeeds?: boolean;
    healthRecords?: Array<{
        visitType: string;
        date: string;
        notes?: string;
        vetName?: string;
    }>;
    healthProblems?: string[];
    medicalNotes?: string;
    status?: 'active' | 'sold' | 'deleted';
}

const API_BASE = 'http://localhost:5000/api';

const DEFAULT_PET_IMAGE = 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image';

const getPetImage = (pet: any): string => {
    if (pet.imageUrls && pet.imageUrls.length > 0) {
        return pet.imageUrls[0];
    }
    return DEFAULT_PET_IMAGE;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Image upload failed');
        }
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading image to Cloudinary: ", error);
        throw error;
    }
};

export const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // Cloudinary might accept 'video' directly
    formData.append('resource_type', 'video');

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
            { method: 'POST', body: formData }
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Video upload failed');
        }
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading video to Cloudinary: ", error);
        throw error;
    }
};

export const addPet = async (petData: PetData): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/pets`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(petData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add pet');
        }
        const data = await response.json();
        console.log("Pet created with ID: ", data._id);
        return data._id;
    } catch (error) {
        console.error("Error adding pet: ", error);
        throw error;
    }
};

export const getPets = async (
    page: number = 1,
    limit: number = 12,
    sortBy: string = 'recent',
    filters: any = {},
    activeTab: string = 'sell'
): Promise<{
    pets: any[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPets: number;
        petsPerPage: number;
    };
}> => {
    try {
        // Build query string with filters
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            tab: activeTab
        });

        // Add filters to query params
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.breed) params.append('breed', filters.breed);
        if (filters.gender && filters.gender !== 'any') params.append('gender', filters.gender);
        if (filters.sizePreference && filters.sizePreference !== 'any') params.append('size', filters.sizePreference);
        if (filters.activityLevel && filters.activityLevel !== 'any') params.append('activityLevel', filters.activityLevel);
        if (filters.minAge) params.append('minAge', filters.minAge.toString());
        if (filters.maxAge) params.append('maxAge', filters.maxAge.toString());
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.location) params.append('location', filters.location);
        if (filters.vaccinated !== undefined) params.append('vaccinated', filters.vaccinated.toString());
        if (filters.availableForMating !== undefined) params.append('availableForMating', filters.availableForMating.toString());
        if (filters.goodWithKids !== undefined) params.append('goodWithKids', filters.goodWithKids.toString());
        if (filters.goodWithPets !== undefined) params.append('goodWithPets', filters.goodWithPets.toString());
        if (filters.houseTrained !== undefined) params.append('houseTrained', filters.houseTrained.toString());
        if (filters.spayedNeutered !== undefined) params.append('spayedNeutered', filters.spayedNeutered.toString());
        if (filters.specialNeeds !== undefined) params.append('specialNeeds', filters.specialNeeds.toString());
        if (filters.q) params.append('q', filters.q);

        const response = await fetch(`${API_BASE}/pets?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch pets');
        }
        const data = await response.json();
        return {
            pets: data.pets.map((pet: any) => ({
                ...pet,
                id: pet._id,
                image: getPetImage(pet),
                owner: pet.ownerId ? { ...pet.ownerId, id: pet.ownerId._id } : { id: 'unknown', name: 'Unknown User', verified: false, location: 'Unknown' }
            })),
            pagination: data.pagination
        };
    } catch (error) {
        console.error("Error fetching pets: ", error);
        return { pets: [], pagination: { currentPage: 1, totalPages: 0, totalPets: 0, petsPerPage: 12 } };
    }
};

export const getPetById = async (petId: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_BASE}/pets/${petId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch pet');
        }
        const pet = await response.json();
        return {
            ...pet,
            id: pet._id,
            image: getPetImage(pet),
            owner: pet.ownerId ? { ...pet.ownerId, id: pet.ownerId._id } : null
        };
    } catch (error) {
        console.error("Error fetching pet: ", error);
        return null;
    }
};

export const updatePet = async (petId: string, petData: Partial<PetData>): Promise<any> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/pets/${petId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(petData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update pet');
        }
        const pet = await response.json();
        return {
            ...pet,
            id: pet._id,
            image: getPetImage(pet),
            owner: pet.ownerId ? { ...pet.ownerId, id: pet.ownerId._id } : null
        };
    } catch (error) {
        console.error("Error updating pet: ", error);
        throw error;
    }
};

export const deletePet = async (petId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/pets/${petId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete pet');
        }
    } catch (error) {
        console.error("Error deleting pet: ", error);
        throw error;
    }
};

export const markPetAsSold = async (petId: string): Promise<any> => {
    return updatePet(petId, { status: 'sold' });
};

// --- WISHLIST FUNCTIONS ---
export const getWishlist = async (): Promise<any[]> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/wishlist`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to fetch wishlist');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching wishlist: ", error);
        return [];
    }
};

export const addToWishlist = async (petId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/wishlist/${petId}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to wishlist');
        }
        window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
        console.error("Error adding to wishlist: ", error);
        throw error;
    }
};

export const removeFromWishlist = async (petId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/wishlist/${petId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove from wishlist');
        }
        window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
        console.error("Error removing from wishlist: ", error);
        throw error;
    }
};

// --- PET COUNT & BULK UPLOAD FUNCTIONS ---

export const getUserPetCount = async (): Promise<{
    count: number;
    maxPets: number;
    userType: string;
    canPost: boolean;
}> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/pets/my-count`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch pet count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching pet count: ", error);
        return { count: 0, maxPets: 2, userType: 'normal', canPost: true };
    }
};

export const downloadBulkTemplate = async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    try {
        const response = await fetch(`${API_BASE}/pets/bulk-template`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to download template');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'peto_pet_upload_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading template: ", error);
        throw error;
    }
};

export const bulkUploadPets = async (file: File): Promise<{
    message: string;
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
}> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('User not authenticated');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/pets/bulk-upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Bulk upload failed');
        return data;
    } catch (error) {
        console.error("Error bulk uploading pets: ", error);
        throw error;
    }
};
