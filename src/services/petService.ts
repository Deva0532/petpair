const CLOUDINARY_CLOUD_NAME = 'peto';
const CLOUDINARY_UPLOAD_PRESET = 'petpair';

export interface PetData {
    name: string;
    breed: string;
    age: number;
    type: string;
    price: number;
    location: string;
    description: string;
    vaccinated: boolean;
    neutered: boolean;
    availableForMating: boolean;
    availableForSale: boolean;
    featured: boolean;
    imageUrls: string[];
    createdAt?: any;
}

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
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
        const response = await fetch('http://localhost:5000/api/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
        const response = await fetch('http://localhost:5000/api/pets');
        if (!response.ok) {
            throw new Error('Failed to fetch pets');
        }
        const data = await response.json();

        // Map backend data to frontend Pet interface
        return data.map((pet: any) => ({
            ...pet,
            id: pet._id,
            image: pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800', // Fallback image
            owner: pet.ownerId ? {
                ...pet.ownerId,
                id: pet.ownerId._id
            } : {
                id: 'unknown',
                name: 'Unknown User',
                verified: false,
                location: 'Unknown'
            }
        }));
    } catch (error) {
        console.error("Error fetching pets: ", error);
        return [];
    }
};
