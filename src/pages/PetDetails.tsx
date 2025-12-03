import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HeartIcon,
    MapPinIcon,
    StarIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    ShareIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    HomeIcon,
    CakeIcon,
    ScaleIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Pet } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { mockPets } from '../data/mockData';

export const PetDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'owner'>('overview');

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                // Try fetching from API first
                const response = await fetch(`http://localhost:5000/api/pets/${id}`);

                if (response.ok) {
                    const data = await response.json();
                    // Transform MongoDB _id to id and ownerId to owner to match Pet interface
                    const transformedPet: Pet = {
                        ...data,
                        id: data._id,
                        image: data.imageUrls?.[0] || '', // Default to first image or empty string
                        owner: {
                            ...data.ownerId,
                            id: data.ownerId._id,
                            joinedAt: data.ownerId.createdAt || new Date().toISOString() // Fallback for joinedAt
                        }
                    };
                    setPet(transformedPet);
                } else {
                    // Fallback to mock data if API fails (e.g. 404)
                    const foundPet = mockPets.find(p => p.id === id);
                    if (foundPet) {
                        setPet(foundPet);
                    } else {
                        setError('Pet not found');
                    }
                }
            } catch (err) {
                console.error('Error fetching pet details:', err);
                // Fallback to mock data on network error
                const foundPet = mockPets.find(p => p.id === id);
                if (foundPet) {
                    setPet(foundPet);
                } else {
                    setError('Failed to load pet details');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPetDetails();
    }, [id]);

    // Use imageUrls if available, otherwise fallback to single image or empty array
    const images = pet ? (pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls : (pet.image ? [pet.image] : [])) : [];

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const mockHealthRecords = [
        { date: '2024-01-15', type: 'Vaccination', description: 'Annual vaccines updated', vet: 'Dr. Smith' },
        { date: '2023-12-10', type: 'Checkup', description: 'Regular health checkup', vet: 'Dr. Johnson' },
        { date: '2023-11-05', type: 'Treatment', description: 'Dental cleaning', vet: 'Dr. Smith' }
    ];

    const mockSimilarPets = [
        { id: '1', name: 'Buddy', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) + 200, image: pet?.image || '' },
        { id: '2', name: 'Max', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) - 100, image: pet?.image || '' },
        { id: '3', name: 'Luna', breed: pet?.breed || 'Golden Retriever', price: (pet?.price || 1000) + 50, image: pet?.image || '' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pet details...</p>
                </div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-4">{error || 'Pet not found'}</p>
                    <Button onClick={() => navigate('/')}>Back to Home</Button>
                </div>
            </div>
        );
    }

    const handleMessage = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate('/messages');
    };

    const handleContact = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        alert('Contact feature would be implemented here');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${pet.name} - ${pet.breed}`,
                text: `Check out ${pet.name}, a beautiful ${pet.breed} available on PetPair!`,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-center">
                                <CakeIcon className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{pet.age}</div>
                                <div className="text-sm text-gray-600">Years Old</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 text-center">
                                <ScaleIcon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{pet.weight || 'N/A'}</div>
                                <div className="text-sm text-gray-600">lbs</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
                                <HomeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900 capitalize">{pet.type}</div>
                                <div className="text-sm text-gray-600">Pet Type</div>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 text-center">
                                <UserIcon className="w-8 h-8 text-rose-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{pet.neutered ? 'Yes' : 'No'}</div>
                                <div className="text-sm text-gray-600">Neutered</div>
                            </div>
                        </div>

                        {/* Description */}
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">About {pet.name}</h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{pet.description}</p>
                        </Card>

                        {/* Personality Traits */}
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality</h3>
                            <div className="flex flex-wrap gap-3">
                                {pet.personality && pet.personality.length > 0 ? (
                                    pet.personality.map((trait) => (
                                        <span
                                            key={trait}
                                            className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-medium"
                                        >
                                            {trait}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No personality traits listed.</p>
                                )}
                            </div>
                        </Card>

                        {/* Care Requirements */}
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Care Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <ClockIcon className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Exercise</div>
                                        <div className="text-sm text-gray-600">{pet.careRequirements?.exercise || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <HomeIcon className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-medium text-gray-900">Space</div>
                                        <div className="text-sm text-gray-600">{pet.careRequirements?.space || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                );

            case 'health':
                return (
                    <div className="space-y-8">
                        {/* Health Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className={`p-6 border-2 ${pet.vaccinated ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    {pet.vaccinated ? (
                                        <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                                    ) : (
                                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                                    )}
                                    <span className="font-semibold text-lg">Vaccinations</span>
                                </div>
                                <p className="text-gray-600">
                                    {pet.vaccinated ? 'Up to date' : 'Needs updating'}
                                </p>
                            </Card>

                            <Card className={`p-6 border-2 ${pet.neutered ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                                    <span className="font-semibold text-lg">Spayed/Neutered</span>
                                </div>
                                <p className="text-gray-600">
                                    {pet.neutered ? 'Yes' : 'No'}
                                </p>
                            </Card>

                            <Card className="p-6 border-2 border-emerald-200 bg-emerald-50">
                                <div className="flex items-center space-x-3 mb-3">
                                    <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                                    <span className="font-semibold text-lg">Health Check</span>
                                </div>
                                <p className="text-gray-600">Recent checkup clear</p>
                            </Card>
                        </div>

                        {/* Health Records */}
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Records</h3>
                            <div className="space-y-4">
                                {mockHealthRecords.map((record, index) => (
                                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-3 h-3 bg-violet-600 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900 text-lg">{record.type}</span>
                                                <span className="text-sm text-gray-500">{record.date}</span>
                                            </div>
                                            <p className="text-gray-600 mb-1">{record.description}</p>
                                            <p className="text-sm text-gray-500">By {record.vet}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Medical Notes */}
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical Notes</h3>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-800">
                                    {pet.medicalNotes || 'No medical notes available.'}
                                </p>
                            </div>
                        </Card>
                    </div>
                );

            case 'owner':
                return (
                    <div className="space-y-8">
                        {/* Owner Profile */}
                        <Card className="p-6 bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-100">
                            <div className="flex items-start space-x-6">
                                <img
                                    src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
                                    alt={pet.owner.name}
                                    className="w-20 h-20 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-2xl font-semibold text-gray-900">{pet.owner.name}</h3>
                                        {pet.owner.verified && (
                                            <div className="flex items-center space-x-1">
                                                <StarSolidIcon className="w-6 h-6 text-amber-400" />
                                                <span className="text-sm text-emerald-600 font-medium">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600 mb-3">
                                        <MapPinIcon className="w-5 h-5" />
                                        <span className="text-lg">{pet.owner.location}</span>
                                    </div>
                                    <p className="text-gray-500">
                                        Member since {pet.owner.joinedAt ? new Date(pet.owner.joinedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{pet.owner.rating || 4.9}</div>
                                    <div className="text-sm text-gray-600">Rating</div>
                                </div>
                                <div className="text-center border-l border-gray-200">
                                    <div className="text-2xl font-bold text-gray-900">{pet.owner.reviewCount || 12}</div>
                                    <div className="text-sm text-gray-600">Reviews</div>
                                </div>
                                <div className="text-center border-l border-gray-200">
                                    <div className="text-2xl font-bold text-gray-900">{pet.owner.successfulSales || 5}</div>
                                    <div className="text-sm text-gray-600">Adopted</div>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <Button onClick={handleMessage} className="flex-1 flex items-center justify-center space-x-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    <span>Message Owner</span>
                                </Button>
                                <Button variant="outline" onClick={handleContact} className="flex-1 flex items-center justify-center space-x-2">
                                    <PhoneIcon className="w-5 h-5" />
                                    <span>Contact</span>
                                </Button>
                            </div>
                        </Card>

                        {/* Owner Bio */}
                        {pet.owner.bio && (
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">About the Owner</h3>
                                <p className="text-gray-700 leading-relaxed">{pet.owner.bio}</p>
                            </Card>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section with Image Gallery */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Search
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-lg bg-gray-100 group">
                                <img
                                    src={images[selectedImageIndex] || pet.image}
                                    alt={pet.name}
                                    className="w-full h-full object-contain bg-gray-100"
                                />

                                {/* Navigation Arrows */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                                        </button>
                                    </>
                                )}

                                {/* Dots Indicator */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${selectedImageIndex === index
                                                    ? 'bg-violet-600 w-4'
                                                    : 'bg-gray-400 hover:bg-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsFavorited(!isFavorited)}
                                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                                >
                                    {isFavorited ? (
                                        <HeartSolidIcon className="w-6 h-6 text-rose-500" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Pet Info Header */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                                        <div className="flex items-center text-gray-600 text-lg">
                                            <span className="font-medium">{pet.breed}</span>
                                            <span className="mx-2">•</span>
                                            <MapPinIcon className="w-5 h-5 mr-1" />
                                            {pet.location}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-violet-600">${pet.price}</div>
                                        {pet.availableForSale ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 mt-2">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mt-2">
                                                Adopted
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="text-sm text-gray-500 mb-1">Gender</div>
                                        <div className="font-semibold text-gray-900">Male</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="text-sm text-gray-500 mb-1">Size</div>
                                        <div className="font-semibold text-gray-900">Medium</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4 mb-8">
                                    <Button size="lg" className="flex-1 text-lg" onClick={handleMessage}>
                                        Message {pet.owner.name}
                                    </Button>
                                    <Button size="lg" variant="outline" className="flex-1 text-lg" onClick={handleShare}>
                                        <ShareIcon className="w-5 h-5 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>

                            {/* Owner Preview */}
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setActiveTab('owner')}>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
                                        alt={pet.owner.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{pet.owner.name}</div>
                                        <div className="text-sm text-gray-500">View full profile</div>
                                    </div>
                                </div>
                                <ArrowLeftIcon className="w-5 h-5 text-gray-400 rotate-180" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex space-x-8 border-b border-gray-200 mb-8 overflow-x-auto">
                    {['overview', 'health', 'owner'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 text-lg font-medium capitalize whitespace-nowrap transition-colors relative ${activeTab === tab
                                ? 'text-violet-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {renderTabContent()}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Pets</h3>
                            <div className="space-y-4">
                                {mockSimilarPets.map((similarPet) => (
                                    <div
                                        key={similarPet.id}
                                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/pet/${similarPet.id}`)}
                                    >
                                        <img
                                            src={similarPet.image}
                                            alt={similarPet.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{similarPet.name}</h4>
                                            <p className="text-sm text-gray-500">{similarPet.breed}</p>
                                            <p className="text-sm font-medium text-violet-600">${similarPet.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/')}>
                                View All Pets
                            </Button>
                        </Card>

                        <Card className="p-6 bg-violet-50 border-violet-100">
                            <h3 className="text-lg font-semibold text-violet-900 mb-2">Safety Tips</h3>
                            <ul className="space-y-2 text-sm text-violet-700">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Meet in a public place
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Never transfer money before meeting
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    Check vaccination records
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};