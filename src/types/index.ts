export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  price: number;
  location: string;
  image: string;
  imageUrls?: string[];
  description: string;
  owner: User;
  vaccinated: boolean;
  neutered: boolean;
  availableForMating: boolean;
  availableForSale: boolean;
  featured: boolean;
  weight?: number;
  personality?: string[];
  careRequirements?: {
    exercise: string;
    space: string;
  };
  healthRecords?: HealthRecord[];
  medicalNotes?: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'treatment' | 'surgery';
  description: string;
  veterinarian: string;
  documents?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  verified: boolean;
  joinedAt: string;
  phone?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  petsListed?: number;
  successfulSales?: number;
}

export interface Veterinarian {
  id: string;
  name: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  phone: string;
  image: string;
  emergencyService: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface ChatRoom {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}