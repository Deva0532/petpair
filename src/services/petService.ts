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

export const getPets = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${API_BASE}/pets`);
        if (!response.ok) {
            throw new Error('Failed to fetch pets');
        }
        const data = await response.json();
        return data.map((pet: any) => ({
            ...pet,
            id: pet._id,
            image: pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
            owner: pet.ownerId ? { ...pet.ownerId, id: pet.ownerId._id } : { id: 'unknown', name: 'Unknown User', verified: false, location: 'Unknown' }
        }));
    } catch (error) {
        console.error("Error fetching pets: ", error);
        return [];
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
            image: pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
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
            image: pet.imageUrls?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
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
    } catch (error) {
        console.error("Error removing from wishlist: ", error);
        throw error;
    }
};
