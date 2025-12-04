import { Pet, User, Veterinarian, Message, ChatRoom } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'San Francisco, CA',
    verified: true,
    joinedAt: '2023-01-15'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Los Angeles, CA',
    verified: true,
    joinedAt: '2023-03-20'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    location: 'Seattle, WA',
    verified: false,
    joinedAt: '2023-06-10'
  }
];

export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Luna',
    breed: 'Golden Retriever',
    age: 2,
    price: 1200,
    type: 'dog',
    location: 'San Francisco, CA',
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Beautiful and friendly Golden Retriever. Great with kids and other pets.',
    owner: mockUsers[0],
    vaccinated: true,
    neutered: false,
    availableForMating: true,
    featured: true,
    size: 'large',
    activityLevel: 'high',
    goodWithKids: true,
    goodWithPets: true,
    houseTrained: true,
    spayedNeutered: false,
    specialNeeds: false
  },
  {
    id: '2',
    name: 'Max',
    breed: 'German Shepherd',
    age: 3,
    price: 1500,
    type: 'dog',
    location: 'Los Angeles, CA',
    image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Well-trained German Shepherd. Excellent guard dog and family companion.',
    owner: mockUsers[1],
    vaccinated: true,
    neutered: true,
    availableForMating: false,
    featured: true,
    size: 'large',
    activityLevel: 'high',
    goodWithKids: true,
    goodWithPets: false,
    houseTrained: true,
    spayedNeutered: true,
    specialNeeds: false
  },
  {
    id: '3',
    name: 'Whiskers',
    breed: 'Persian',
    age: 1,
    price: 800,
    type: 'cat',
    location: 'Seattle, WA',
    image: 'https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Adorable Persian kitten with beautiful blue eyes.',
    owner: mockUsers[2],
    vaccinated: true,
    neutered: false,
    availableForMating: true,
    featured: false,
    size: 'small',
    activityLevel: 'low',
    goodWithKids: true,
    goodWithPets: true,
    houseTrained: false,
    spayedNeutered: false,
    specialNeeds: false
  },
  {
    id: '4',
    name: 'Charlie',
    breed: 'Labrador',
    age: 4,
    price: 1000,
    type: 'dog',
    location: 'San Francisco, CA',
    image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Energetic Labrador perfect for active families.',
    owner: mockUsers[0],
    vaccinated: true,
    neutered: false,
    availableForMating: true,
    featured: false,
    size: 'large',
    activityLevel: 'high',
    goodWithKids: true,
    goodWithPets: true,
    houseTrained: true,
    spayedNeutered: false,
    specialNeeds: false
  },
  {
    id: '5',
    name: 'Bella',
    breed: 'Siamese',
    age: 2,
    price: 600,
    type: 'cat',
    location: 'Los Angeles, CA',
    image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Elegant Siamese cat with striking blue eyes.',
    owner: mockUsers[1],
    vaccinated: true,
    neutered: true,
    availableForMating: false,
    featured: true,
    size: 'small',
    activityLevel: 'moderate',
    goodWithKids: false,
    goodWithPets: false,
    houseTrained: true,
    spayedNeutered: true,
    specialNeeds: false
  },
  {
    id: '6',
    name: 'Rocky',
    breed: 'Bulldog',
    age: 5,
    price: 1800,
    type: 'dog',
    location: 'Seattle, WA',
    image: 'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Gentle Bulldog with a calm temperament.',
    owner: mockUsers[2],
    vaccinated: true,
    neutered: true,
    availableForMating: false,
    featured: false,
    size: 'medium',
    activityLevel: 'low',
    goodWithKids: true,
    goodWithPets: true,
    houseTrained: true,
    spayedNeutered: true,
    specialNeeds: true
  }
];

export const mockVeterinarians: Veterinarian[] = [
  {
    id: '1',
    name: 'Dr. Jennifer Martinez',
    specialty: ['General Practice', 'Surgery'],
    rating: 4.8,
    reviewCount: 156,
    location: 'San Francisco, CA',
    address: '123 Pet Care Blvd, San Francisco, CA 94102',
    phone: '(415) 555-0123',
    image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=300',
    emergencyService: true
  },
  {
    id: '2',
    name: 'Dr. Robert Kim',
    specialty: ['Exotic Pets', 'Emergency Care'],
    rating: 4.9,
    reviewCount: 203,
    location: 'Los Angeles, CA',
    address: '456 Animal Hospital Way, Los Angeles, CA 90210',
    phone: '(213) 555-0456',
    image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300',
    emergencyService: true
  },
  {
    id: '3',
    name: 'Dr. Lisa Thompson',
    specialty: ['Dermatology', 'Internal Medicine'],
    rating: 4.7,
    reviewCount: 98,
    location: 'Seattle, WA',
    address: '789 Veterinary Center Dr, Seattle, WA 98101',
    phone: '(206) 555-0789',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=300',
    emergencyService: false
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Hi! I\'m interested in Luna. Is she still available?',
    timestamp: '2024-01-15T10:30:00Z',
    read: true
  },
  {
    id: '2',
    senderId: '1',
    receiverId: '2',
    content: 'Yes, she is! Would you like to schedule a meet and greet?',
    timestamp: '2024-01-15T10:45:00Z',
    read: true
  },
  {
    id: '3',
    senderId: '2',
    receiverId: '1',
    content: 'That would be great! What times work for you this weekend?',
    timestamp: '2024-01-15T11:00:00Z',
    read: false
  }
];

export const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: mockMessages[2],
    unreadCount: 1
  }
];