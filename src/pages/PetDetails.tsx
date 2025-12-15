import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    HeartIcon,
    MapPinIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    ShareIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserIcon,
    HomeIcon,
    CakeIcon,
    ScaleIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    FlagIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarRating } from '../components/ui/StarRating';
import { Pet } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/petService';
import { useToast } from '../contexts/ToastContext';

export const PetDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Check for tab query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab') as 'overview' | 'health' | 'owner' | 'reviews' | null;
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'owner' | 'reviews'>(tabParam || 'overview');
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reportingReview, setReportingReview] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [editingReview, setEditingReview] = useState<any | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editReviewData, setEditReviewData] = useState({ rating: 0, comment: '' });

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/pets/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    const transformedPet: Pet = {
                        ...data,
                        id: data._id,
                        image: (data.imageUrls && data.imageUrls.length > 0) ? data.imageUrls[0] : 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image',
                        owner: {
                            ...data.ownerId,
                            id: data.ownerId._id,
                            joinedAt: data.ownerId.createdAt || new Date().toISOString()
                        }
                    };
                    setPet(transformedPet);
                } else {
                    setError('Pet not found');
                }
            } catch (err) {
                console.error('Failed to load pet details:', err);
                setError('Failed to load pet details');
            } finally {
                setLoading(false);
            }
        };
        fetchPetDetails();
    }, [id]);

    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user || !id) return;
            try {
                const wishlist = await getWishlist();
                const isInWishlist = wishlist.some((item: any) => item.pet?.id === id || item.pet?._id === id);
                setIsFavorited(isInWishlist);
            } catch (error) {
                console.error('Failed to check wishlist status:', error);
            }
        };
        checkWishlistStatus();
    }, [user, id]);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!id) return;
            try {
                setReviewsLoading(true);
                const response = await fetch(`http://localhost:5000/api/pets/${id}/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!user) {
            showToast('Please sign in to add to wishlist', 'info');
            return;
        }
        if (!id || wishlistLoading) return;
        setWishlistLoading(true);
        try {
            if (isFavorited) { await removeFromWishlist(id); setIsFavorited(false); }
            else { await addToWishlist(id); setIsFavorited(true); }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const images = pet ? (pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls : (pet.image ? [pet.image] : [])) : [];
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };
    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };

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
        // Prevent messaging yourself
        if (pet && user.id === pet.owner.id) {
            return;
        }
        if (pet && pet.owner.phone && pet.availableForSale) {
            window.open(`https://wa.me/${pet.owner.phone}`, '_blank');
        }
    };
    const handleContact = () => {
        if (!user) { navigate('/login'); return; }
        showToast('Contact feature coming soon!', 'info');
    };
    const handleShare = () => {
        if (navigator.share) { navigator.share({ title: `${pet.name} - ${pet.breed}`, text: `Check out ${pet.name}!`, url: window.location.href }); }
        else { navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard!', 'success'); }
    };

    const handleSubmitReview = async () => {
        if (!user) {
            showToast('Please sign in to write a review', 'info');
            return;
        }
        if (newReview.rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }
        if (!newReview.comment.trim()) {
            showToast('Please write a comment', 'error');
            return;
        }
        try {
            setSubmittingReview(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/pets/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newReview)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Review submitted successfully!', 'success');
                setReviews([data, ...reviews]);
                setNewReview({ rating: 0, comment: '' });
            } else {
                showToast(data.message || 'Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Failed to submit review', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleReportReview = async (reviewId: string) => {
        if (!user) {
            showToast('Please sign in to report reviews', 'info');
            return;
        }
        setReportingReview(reviewId);
        setShowReportModal(true);
    };

    const handleEditReview = (review: any) => {
        setEditingReview(review);
        setEditReviewData({ rating: review.rating, comment: review.comment });
        setShowEditModal(true);
    };

    const submitEditReview = async () => {
        if (editReviewData.rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }
        if (!editReviewData.comment.trim()) {
            showToast('Please write a comment', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/pets/${id}/reviews/${editingReview._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editReviewData)
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Review updated successfully!', 'success');
                setReviews(reviews.map(r => r._id === editingReview._id ? data : r));
                setShowEditModal(false);
                setEditingReview(null);
                setEditReviewData({ rating: 0, comment: '' });
            } else {
                showToast(data.message || 'Failed to update review', 'error');
            }
        } catch (error) {
            console.error('Failed to update review:', error);
            showToast('Failed to update review', 'error');
        }
    };

    const canEditReview = (review: any) => {
        if (!user || review.userId._id !== user.id) return false;
        const reviewDate = new Date(review.createdAt);
        const now = new Date();
        const hoursSinceReview = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceReview < 24; // Can edit within 24 hours
    };

    const submitReport = async () => {
        if (!reportReason) {
            showToast('Please select a reason', 'error');
            return;
        }
        if (reportReason === 'Other' && !customReason.trim()) {
            showToast('Please provide a reason', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const finalReason = reportReason === 'Other' ? customReason : reportReason;
            const response = await fetch(`http://localhost:5000/api/reviews/${reportingReview}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: finalReason })
            });
            const data = await response.json();
            if (response.ok) {
                showToast('Review reported successfully', 'success');
                setShowReportModal(false);
                setReportReason('');
                setCustomReason('');
            } else {
                showToast(data.message || 'Failed to report review', 'error');
            }
        } catch (error) {
            console.error('Failed to report review:', error);
            showToast('Failed to report review', 'error');
        } finally {
            setReportingReview(null);
        }
    };

    const displayType = pet.type === 'other' && pet.customType ? pet.customType : pet.type;
    const displayBreed = pet.breed === 'Other' && pet.customBreed ? pet.customBreed : pet.breed;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />Back to Search
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-lg bg-gray-100 group">
                                <img src={images[selectedImageIndex] || pet.image} alt={pet.name} className="w-full h-full object-contain bg-gray-100" />
                                {images.length > 1 && (
                                    <>
                                        <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white opacity-0 group-hover:opacity-100">
                                            <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                                        </button>
                                        <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white opacity-0 group-hover:opacity-100">
                                            <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                                        </button>
                                    </>
                                )}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {images.map((_, index) => (
                                            <button key={index} onClick={() => setSelectedImageIndex(index)} className={`w-2 h-2 rounded-full ${selectedImageIndex === index ? 'bg-violet-600 w-4' : 'bg-gray-400'}`} />
                                        ))}
                                    </div>
                                )}
                                <button onClick={handleToggleFavorite} disabled={wishlistLoading} className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110">
                                    {isFavorited ? <HeartSolidIcon className="w-6 h-6 text-rose-500" /> : <HeartIcon className="w-6 h-6 text-gray-600" />}
                                </button>
                            </div>
                        </div>

                        {/* Pet Info */}
                        <div className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{pet.name}</h1>
                                        <div className="flex items-center text-gray-600 text-lg">
                                            <span className="font-medium">{displayBreed}</span>
                                            <span className="mx-2">•</span>
                                            <MapPinIcon className="w-5 h-5 mr-1" />{pet.location}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-violet-600">₹{pet.price}</div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${pet.availableForSale ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {pet.availableForSale ? 'Available' : 'Adopted'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <div className="text-sm text-gray-500 mb-1">Age</div>
                                        <div className="font-semibold text-gray-900">{pet.age} years</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <div className="text-sm text-gray-500 mb-1">Type</div>
                                        <div className="font-semibold text-gray-900 capitalize">{displayType}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                                        <div className="text-sm text-gray-500 mb-1">Gender</div>
                                        <div className="font-semibold text-gray-900 capitalize">{pet.gender || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex space-x-4 mb-8">
                                    <Button
                                        size="lg"
                                        className="flex-1 text-lg"
                                        onClick={handleMessage}
                                        disabled={!pet.owner.phone || !pet.availableForSale || pet.status === 'sold' || Boolean(user && user.id === pet.owner.id)}
                                    >
                                        {user && user.id === pet.owner.id ? 'This is your pet' : `Message ${pet.owner.name}`}
                                    </Button>
                                    <Button size="lg" variant="outline" className="flex-1 text-lg" onClick={handleShare}>
                                        <ShareIcon className="w-5 h-5 mr-2" />Share
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100" onClick={() => setActiveTab('owner')}>
                                <div className="flex items-center space-x-4">
                                    <img src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`} alt={pet.owner.name} className="w-12 h-12 rounded-full" />
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
                <div className="flex space-x-8 border-b border-gray-200 mb-8">
                    {['overview', 'health', 'owner', 'reviews'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-lg font-medium capitalize ${activeTab === tab ? 'text-violet-600 border-b-2 border-violet-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab} {tab === 'reviews' && `(${reviews.length})`}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 text-center">
                                <CakeIcon className="w-8 h-8 text-violet-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{pet.age}</div>
                                <div className="text-sm text-gray-600">Years Old</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 text-center">
                                <ScaleIcon className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900">{pet.weight || 'N/A'}</div>
                                <div className="text-sm text-gray-600">kg</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
                                <HomeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900 capitalize">{displayType}</div>
                                <div className="text-sm text-gray-600">Pet Type</div>
                            </div>
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 text-center">
                                <UserIcon className="w-8 h-8 text-rose-600 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-gray-900 capitalize">{pet.gender || 'N/A'}</div>
                                <div className="text-sm text-gray-600">Gender</div>
                            </div>
                        </div>

                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">About {pet.name}</h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{pet.description}</p>
                        </Card>

                        {pet.personality && pet.personality.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personality</h3>
                                <div className="flex flex-wrap gap-3">
                                    {pet.personality.map((trait) => (
                                        <span key={trait} className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">{trait}</span>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Health Tab */}
                {activeTab === 'health' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className={`p-6 border-2 ${pet.vaccinated ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    {pet.vaccinated ? <CheckCircleIcon className="w-8 h-8 text-emerald-600" /> : <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />}
                                    <span className="font-semibold text-lg">Vaccinations</span>
                                </div>
                                <p className="text-gray-600">{pet.vaccinated ? 'Up to date' : 'Needs updating'}</p>
                            </Card>
                            <Card className={`p-6 border-2 ${pet.neutered ? 'border-blue-200 bg-blue-50' : 'border-yellow-200 bg-yellow-50'}`}>
                                <div className="flex items-center space-x-3 mb-3">
                                    <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                                    <span className="font-semibold text-lg">Spayed/Neutered</span>
                                </div>
                                <p className="text-gray-600">{pet.neutered ? 'Yes' : 'No'}</p>
                            </Card>
                            <Card className="p-6 border-2 border-purple-200 bg-purple-50">
                                <div className="flex items-center space-x-3 mb-3">
                                    <UserIcon className="w-8 h-8 text-purple-600" />
                                    <span className="font-semibold text-lg">Gender</span>
                                </div>
                                <p className="text-gray-600 capitalize">{pet.gender || 'Not specified'}</p>
                            </Card>
                        </div>

                        {/* Health Problems */}
                        {pet.healthProblems && pet.healthProblems.length > 0 && (
                            <Card className="p-6 border-2 border-rose-200 bg-rose-50">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">⚠️ Health Conditions</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pet.healthProblems.map((problem, index) => (
                                        <span key={index} className="px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-sm font-medium border border-rose-200">
                                            {problem}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Health Records Timeline */}
                        {pet.healthRecords && pet.healthRecords.length > 0 && (
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">🏥 Health Records</h3>
                                <div className="space-y-4">
                                    {pet.healthRecords
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((record, index) => (
                                            <div key={index} className="relative pl-8 pb-4 border-l-2 border-violet-200 last:border-l-0 last:pb-0">
                                                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-violet-500 rounded-full border-2 border-white shadow-sm"></div>
                                                <div className="bg-gray-50 rounded-xl p-4 hover:bg-violet-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-semibold text-gray-900">{record.visitType || record.type}</span>
                                                        <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    {(record.vetName || record.veterinarian) && (
                                                        <p className="text-sm text-violet-600 mb-1">🩺 {record.vetName || record.veterinarian}</p>
                                                    )}
                                                    {(record.notes || record.description) && (
                                                        <p className="text-gray-600 text-sm">{record.notes || record.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        )}

                        {(!pet.healthRecords || pet.healthRecords.length === 0) && (
                            <Card className="p-6 text-center">
                                <div className="text-4xl mb-3">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No Health Records</h3>
                                <p className="text-gray-500">No vet visits have been recorded for this pet.</p>
                            </Card>
                        )}

                        {pet.medicalNotes && (
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Medical Notes</h3>
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-800">{pet.medicalNotes}</p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Owner Tab */}
                {activeTab === 'owner' && (
                    <div className="space-y-8">
                        <Card className="p-6 bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-100">
                            <div className="flex items-start space-x-6">
                                <img src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`} alt={pet.owner.name} className="w-20 h-20 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-2xl font-semibold text-gray-900">{pet.owner.name}</h3>
                                        {(pet.owner.emailVerified || pet.owner.mobileVerified) && (
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
                                    <p className="text-gray-500">Member since {pet.owner.joinedAt ? new Date(pet.owner.joinedAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-3">
                                <Button
                                    onClick={handleMessage}
                                    className="flex-1 flex items-center justify-center space-x-2"
                                    disabled={!pet.owner.phone || !pet.availableForSale || pet.status === 'sold' || Boolean(user && user.id === pet.owner.id)}
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" /><span>{user && user.id === pet.owner.id ? 'This is your pet' : 'Message Owner'}</span>
                                </Button>
                                <Button variant="outline" onClick={handleContact} className="flex-1 flex items-center justify-center space-x-2">
                                    <PhoneIcon className="w-5 h-5" /><span>Contact</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="space-y-8">
                        {/* Average Rating */}
                        {reviews.length > 0 && (
                            <Card className="p-6 bg-gradient-to-r from-violet-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                                        <div className="flex items-center space-x-3">
                                            <StarRating rating={reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length} size="lg" />
                                            <span className="text-3xl font-bold text-gray-900">
                                                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                                            </span>
                                            <span className="text-gray-600">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Write Review (Non-owners only) */}
                        {user && pet.owner.id !== user.id && !reviews.some(r => r.userId._id === user.id) && (
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <StarRating
                                            rating={newReview.rating}
                                            editable
                                            onChange={(rating) => setNewReview({ ...newReview, rating })}
                                            size="lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            rows={4}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                            placeholder="Share your experience with this pet..."
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className="w-full"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {reviewsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <div className="text-4xl mb-3">⭐</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Reviews Yet</h3>
                                    <p className="text-gray-500">Be the first to review this pet!</p>
                                </Card>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review._id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={review.userId.avatar || `https://ui-avatars.com/api/?name=${review.userId.name}&background=8b5cf6&color=ffffff`}
                                                    alt={review.userId.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{review.userId.name}</h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <StarRating rating={review.rating} size="sm" />
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {canEditReview(review) ? (
                                                <button
                                                    onClick={() => handleEditReview(review)}
                                                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                    title="Edit review"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleReportReview(review._id)}
                                                    disabled={reportingReview === review._id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Report review"
                                                >
                                                    <FlagIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Report Review</h3>
                        <p className="text-gray-600 mb-4">Please select a reason for reporting this review:</p>

                        <div className="space-y-3 mb-4">
                            {['Spam or fake review', 'Offensive language', 'Misleading information', 'Harassment', 'Other'].map((reason) => (
                                <label key={reason} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="w-4 h-4 text-violet-600"
                                    />
                                    <span className="text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {reportReason === 'Other' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please describe the issue..."
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 mb-4 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        )}

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setReportReason('');
                                    setCustomReason('');
                                    setReportingReview(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReport}
                                disabled={!reportReason || (reportReason === 'Other' && !customReason.trim())}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Review Modal */}
            {showEditModal && editingReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Your Review</h3>

                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <StarRating
                                    rating={editReviewData.rating}
                                    editable
                                    onChange={(rating) => setEditReviewData({ ...editReviewData, rating })}
                                    size="lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <textarea
                                    value={editReviewData.comment}
                                    onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Update your review..."
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingReview(null);
                                    setEditReviewData({ rating: 0, comment: '' });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitEditReview}
                                disabled={!editReviewData.rating || !editReviewData.comment.trim()}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Update Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};