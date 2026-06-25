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
    ChevronRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { StarRating } from '../components/ui/StarRating';
import { Pet } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { addToWishlist, removeFromWishlist, getWishlist } from '../services/petService';
import { useToast } from '../contexts/ToastContext';
import { API_BASE_URL } from '../config';

const petTypeEmojis: Record<string, string> = {
    dog: '🐕', cat: '🐈', bird: '🐦', fish: '🐠', reptile: '🦎', other: '🐾',
};

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

    // Scroll to top when pet ID changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/pets/${id}`);
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
                const petIdStr = String(id);
                const isInWishlist = wishlist.some((item: any) => {
                    const pet = item.pet || item;
                    if (!pet) return false;
                    const itemPetId = String(pet.id || pet._id || '');
                    return itemPetId === petIdStr;
                });
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
                const response = await fetch(`${API_BASE_URL}/api/pets/${id}/reviews`);
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
            if (isFavorited) { await removeFromWishlist(id); setIsFavorited(false); showToast('Removed from wishlist', 'info'); }
            else { await addToWishlist(id); setIsFavorited(true); showToast('Added to wishlist ❤️', 'success'); }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
            showToast('Failed to update wishlist', 'error');
        } finally {
            setWishlistLoading(false);
        }
    };

    const rawImages = pet ? (pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls : (pet.image ? [pet.image] : [])) : [];
    const videoUrl = pet ? (pet as any).videoUrl : null;
    
    // Build media array: images first, but insert video as 2nd item if it exists
    const media: { type: 'image' | 'video'; url: string }[] = [];
    rawImages.forEach((img, i) => {
        if (i === 1 && videoUrl) {
            media.push({ type: 'video', url: videoUrl });
        }
        media.push({ type: 'image', url: img });
    });
    // If only 0 or 1 images, append video at the end
    if (videoUrl && rawImages.length <= 1) {
        media.push({ type: 'video', url: videoUrl });
    }

    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1)); };
    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setSelectedImageIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1)); };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center animate-fadeInUp">
                    <div className="w-16 h-16 mx-auto mb-5 relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse opacity-20"></div>
                        <div className="absolute inset-2 rounded-xl bg-white flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-violet-100 border-t-violet-600"></div>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium">Loading pet details...</p>
                </div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center animate-fadeInUp max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
                    <p className="text-slate-500 mb-6">{error || 'Pet not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const handleMessage = () => {
        if (!user) {
            navigate('/login');
            return;
        }
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
        if (!user) { showToast('Please sign in to write a review', 'info'); return; }
        if (newReview.rating === 0) { showToast('Please select a rating', 'error'); return; }
        if (!newReview.comment.trim()) { showToast('Please write a comment', 'error'); return; }
        try {
            setSubmittingReview(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/pets/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        if (!user) { showToast('Please sign in to report reviews', 'info'); return; }
        setReportingReview(reviewId);
        setShowReportModal(true);
    };

    const handleEditReview = (review: any) => {
        setEditingReview(review);
        setEditReviewData({ rating: review.rating, comment: review.comment });
        setShowEditModal(true);
    };

    const submitEditReview = async () => {
        if (editReviewData.rating === 0) { showToast('Please select a rating', 'error'); return; }
        if (!editReviewData.comment.trim()) { showToast('Please write a comment', 'error'); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/pets/${id}/reviews/${editingReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        if (!reportReason) { showToast('Please select a reason', 'error'); return; }
        if (reportReason === 'Other' && !customReason.trim()) { showToast('Please provide a reason', 'error'); return; }
        try {
            const token = localStorage.getItem('token');
            const finalReason = reportReason === 'Other' ? customReason : reportReason;
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reportingReview}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
    const typeEmoji = petTypeEmojis[pet.type] || '🐾';
    const isKennel = (pet.owner as any)?.userType === 'kennel';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-violet-50/50 via-white to-slate-50/50 pointer-events-none" />

            {/* Top Navigation Bar */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleFavorite}
                            disabled={wishlistLoading}
                            className={`p-2.5 rounded-xl transition-all shadow-sm ${
                                isFavorited
                                    ? 'bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600'
                                    : 'bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-500 hover:text-rose-500 hover:bg-white hover:border-rose-200'
                            }`}
                        >
                            {isFavorited ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-500 hover:text-violet-600 hover:bg-white hover:border-violet-200 transition-all shadow-sm"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fadeInUp">
                    {/* Image/Video Gallery - Left side (3 cols) */}
                    <div className="lg:col-span-3 space-y-3">
                        <div className="relative rounded-[1.5rem] overflow-hidden bg-white shadow-lg shadow-slate-200/50 group aspect-[4/3]">
                            {/* Main media display with crossfade */}
                            {media[selectedImageIndex]?.type === 'video' ? (
                                <video
                                    key={`video-${selectedImageIndex}`}
                                    src={media[selectedImageIndex].url}
                                    className="w-full h-full object-contain bg-slate-900 animate-fadeIn"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                />
                            ) : (
                                <img
                                    key={`img-${selectedImageIndex}`}
                                    src={media[selectedImageIndex]?.url || pet.image}
                                    alt={pet.name}
                                    className="w-full h-full object-contain bg-slate-50 animate-fadeIn"
                                />
                            )}

                            {/* Image overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                            {/* Navigation arrows */}
                            {media.length > 1 && (
                                <>
                                    <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
                                        <ChevronLeftIcon className="w-5 h-5 text-slate-700" />
                                    </button>
                                    <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white opacity-0 group-hover:opacity-100 transition-all hover:scale-105">
                                        <ChevronRightIcon className="w-5 h-5 text-slate-700" />
                                    </button>
                                </>
                            )}

                            {/* Dot indicators */}
                            {media.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
                                    {media.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(index); }}
                                            className={`rounded-full transition-all duration-300 ${
                                                selectedImageIndex === index
                                                    ? 'w-5 h-2 bg-white'
                                                    : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {isKennel && (
                                    <span className="kennel-badge-premium inline-flex items-center gap-1.5 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                                        Kennel
                                    </span>
                                )}
                                {pet.vaccinated && (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/25">
                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Vaccinated
                                    </span>
                                )}
                                {pet.featured && (
                                    <span className="inline-flex items-center gap-1 bg-violet-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-violet-500/25">
                                        <SparklesIcon className="w-3.5 h-3.5" /> Featured
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail strip with smooth snap scroll */}
                        {media.length > 1 && (
                            <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory scroll-smooth px-1">
                                {media.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                                            selectedImageIndex === index
                                                ? 'border-violet-500 shadow-lg shadow-violet-100 scale-105 ring-2 ring-violet-200'
                                                : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-200'
                                        }`}
                                    >
                                        {item.type === 'video' ? (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                                                <video src={item.url} className="w-full h-full object-cover opacity-70" muted />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                                                        <svg className="w-3 h-3 text-slate-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <img src={item.url} alt={`${pet.name} ${index + 1}`} className="w-full h-full object-cover" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pet Info - Right side (2 cols) */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-[1.5rem] border border-slate-100/80 shadow-lg shadow-slate-100/50 p-6 space-y-5">
                            {/* Name + Price */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-2xl">{typeEmoji}</span>
                                        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{pet.name}</h1>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                        pet.availableForSale
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                        {pet.availableForSale ? '● Available' : 'Adopted'}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium text-sm mb-3">{displayBreed} · {pet.age} yr{pet.age !== 1 ? 's' : ''} old</p>
                                <div className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                                    ₹{pet.price?.toLocaleString('en-IN')}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-2 sm:p-3.5 text-center border border-violet-100/50 min-w-0">
                                    <CakeIcon className="w-5 h-5 text-violet-500 mx-auto mb-1.5" />
                                    <div className="text-base sm:text-lg font-extrabold text-slate-900 truncate" title={String(pet.age)}>{pet.age}</div>
                                    <div className="text-[0.6rem] sm:text-[0.65rem] text-slate-500 font-semibold uppercase tracking-wider">Years</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-2 sm:p-3.5 text-center border border-blue-100/50 min-w-0">
                                    <HomeIcon className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                                    <div className="text-base sm:text-lg font-extrabold text-slate-900 capitalize truncate" title={displayType}>{displayType}</div>
                                    <div className="text-[0.6rem] sm:text-[0.65rem] text-slate-500 font-semibold uppercase tracking-wider">Type</div>
                                </div>
                                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-2 sm:p-3.5 text-center border border-rose-100/50 min-w-0">
                                    <UserIcon className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
                                    <div className="text-base sm:text-lg font-extrabold text-slate-900 capitalize truncate" title={pet.gender || 'N/A'}>{pet.gender || 'N/A'}</div>
                                    <div className="text-[0.6rem] sm:text-[0.65rem] text-slate-500 font-semibold uppercase tracking-wider">Gender</div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <MapPinIcon className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{pet.location}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2.5">
                                <button
                                    onClick={handleMessage}
                                    disabled={!pet.owner.phone || !pet.availableForSale || pet.status === 'sold' || Boolean(user && user.id === pet.owner.id)}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-[0.95rem] hover:shadow-xl hover:shadow-violet-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    {user && user.id === pet.owner.id ? 'This is your pet' : `Message ${pet.owner.name}`}
                                </button>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all"
                                    >
                                        <ShareIcon className="w-4 h-4" />
                                        Share
                                    </button>
                                    <button
                                        onClick={handleContact}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all"
                                    >
                                        <PhoneIcon className="w-4 h-4" />
                                        Contact
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Owner Card */}
                        <div
                            className="bg-white rounded-[1.5rem] border border-slate-100/80 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all group"
                            onClick={() => navigate(`/user/${pet.owner.id}`)}
                        >
                            <img
                                src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
                                alt={pet.owner.name}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-violet-100"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">{pet.owner.name}</h4>
                                    {/* TODO: change to && when adding SMS API, currently keeping users unverified if mobile is missing */}
                                    {(pet.owner.emailVerified && pet.owner.mobileVerified) && (
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    )}
                                    {isKennel && (
                                        <span className="text-[0.6rem] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md">KENNEL</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 font-medium">View seller profile</p>
                            </div>
                            <ArrowLeftIcon className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                {/* Tab Navigation */}
                <div className="grid grid-cols-4 md:flex gap-1 p-1 bg-white rounded-2xl border border-slate-100 shadow-sm mb-8 w-full md:max-w-fit">
                    {[
                        { key: 'overview', label: 'Overview', icon: '📋' },
                        { key: 'health', label: 'Health', icon: '🏥' },
                        { key: 'owner', label: 'Owner', icon: '👤' },
                        { key: 'reviews', label: `Reviews (${reviews.length})`, icon: '⭐' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-sm transition-all ${
                                activeTab === tab.key
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200/50'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <span className="hidden sm:inline text-sm">{tab.icon}</span>
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fadeInUp">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-5 text-center border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <CakeIcon className="w-6 h-6 text-violet-600" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900">{pet.age}</div>
                                <div className="text-xs text-slate-500 font-semibold mt-0.5">Years Old</div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 text-center border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                                    <ScaleIcon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900">{pet.weight || 'N/A'}</div>
                                <div className="text-xs text-slate-500 font-semibold mt-0.5">Weight (kg)</div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 text-center border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                                    <HomeIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 capitalize">{displayType}</div>
                                <div className="text-xs text-slate-500 font-semibold mt-0.5">Pet Type</div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 text-center border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-rose-600" />
                                </div>
                                <div className="text-2xl font-extrabold text-slate-900 capitalize">{pet.gender || 'N/A'}</div>
                                <div className="text-xs text-slate-500 font-semibold mt-0.5">Gender</div>
                            </div>
                        </div>

                        {/* Quick info tags */}
                        <div className="flex flex-wrap gap-2">
                            {pet.size && (
                                <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wide">📏 {pet.size}</span>
                            )}
                            {pet.neutered && (
                                <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">✂️ Neutered</span>
                            )}
                            {pet.goodWithKids && (
                                <span className="px-3.5 py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold">👶 Kid Friendly</span>
                            )}
                            {pet.goodWithPets && (
                                <span className="px-3.5 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-xs font-bold">🐾 Pet Friendly</span>
                            )}
                            {pet.houseTrained && (
                                <span className="px-3.5 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold">🏠 House Trained</span>
                            )}
                            {pet.availableForMating && (
                                <span className="px-3.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">💕 Available for Mating</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <span>📝</span> About {pet.name}
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-[0.95rem]">{pet.description}</p>
                        </div>

                        {/* Personality */}
                        {pet.personality && pet.personality.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span>✨</span> Personality
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {pet.personality.map((trait) => (
                                        <span key={trait} className="px-4 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 rounded-xl text-sm font-semibold border border-violet-100/60">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Health Tab */}
                {activeTab === 'health' && (
                    <div className="space-y-6 animate-fadeInUp">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${pet.vaccinated ? 'border-emerald-200/60' : 'border-red-200/60'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${pet.vaccinated ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {pet.vaccinated ? <CheckCircleIcon className="w-6 h-6 text-emerald-600" /> : <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Vaccinations</h4>
                                <p className="text-sm text-slate-500">{pet.vaccinated ? 'Up to date ✓' : 'Needs updating'}</p>
                            </div>
                            <div className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${pet.neutered ? 'border-blue-200/60' : 'border-amber-200/60'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${pet.neutered ? 'bg-blue-100' : 'bg-amber-100'}`}>
                                    <ShieldCheckIcon className={`w-6 h-6 ${pet.neutered ? 'text-blue-600' : 'text-amber-600'}`} />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Spayed / Neutered</h4>
                                <p className="text-sm text-slate-500">{pet.neutered ? 'Yes ✓' : 'No'}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border-2 border-purple-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-purple-100">
                                    <UserIcon className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Gender</h4>
                                <p className="text-sm text-slate-500 capitalize">{pet.gender || 'Not specified'}</p>
                            </div>
                        </div>

                        {/* Health Problems */}
                        {pet.healthProblems && pet.healthProblems.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border-2 border-rose-200/60 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><span>⚠️</span> Health Conditions</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pet.healthProblems.map((problem, index) => (
                                        <span key={index} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-semibold border border-rose-200/60">{problem}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Health Records Timeline */}
                        {pet.healthRecords && pet.healthRecords.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><span>🏥</span> Health Records</h3>
                                <div className="space-y-4">
                                    {pet.healthRecords
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((record, index) => (
                                            <div key={index} className="relative pl-8 pb-4 border-l-2 border-violet-200 last:border-l-0 last:pb-0">
                                                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-violet-500 rounded-full border-2 border-white shadow-sm"></div>
                                                <div className="bg-slate-50 rounded-xl p-4 hover:bg-violet-50/50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-slate-900 text-sm">{record.visitType || record.type}</span>
                                                        <span className="text-xs text-slate-400 font-medium">{new Date(record.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    {(record.vetName || record.veterinarian) && (
                                                        <p className="text-xs text-violet-600 font-medium mb-1">🩺 {record.vetName || record.veterinarian}</p>
                                                    )}
                                                    {(record.notes || record.description) && (
                                                        <p className="text-slate-500 text-sm">{record.notes || record.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {(!pet.healthRecords || pet.healthRecords.length === 0) && (
                            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100/80 shadow-sm">
                                <div className="text-5xl mb-4">📋</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">No Health Records</h3>
                                <p className="text-slate-500 text-sm">No vet visits have been recorded for this pet.</p>
                            </div>
                        )}

                        {pet.medicalNotes && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2"><span>📝</span> Medical Notes</h3>
                                <div className="p-4 bg-blue-50 border border-blue-200/60 rounded-xl">
                                    <p className="text-blue-800 text-sm leading-relaxed">{pet.medicalNotes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Owner Tab */}
                {activeTab === 'owner' && (
                    <div className="space-y-6 animate-fadeInUp">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm overflow-hidden relative">
                            {/* Decorative bg */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full pointer-events-none" />
                            <div className="relative flex items-start gap-5">
                                <img
                                    src={pet.owner.avatar || `https://ui-avatars.com/api/?name=${pet.owner.name}&background=8b5cf6&color=ffffff`}
                                    alt={pet.owner.name}
                                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-violet-100 shadow-lg cursor-pointer"
                                    onClick={() => navigate(`/user/${pet.owner.id}`)}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <h3 
                                            className="text-xl font-extrabold text-slate-900 cursor-pointer hover:text-violet-600 transition-colors"
                                            onClick={() => navigate(`/user/${pet.owner.id}`)}
                                        >
                                            {pet.owner.name}
                                        </h3>
                                        {/* TODO: change to && when adding SMS API, currently keeping users unverified if mobile is missing */}
                                        {(pet.owner.emailVerified && pet.owner.mobileVerified) && (
                                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-200/60">
                                                <CheckCircleIcon className="w-3.5 h-3.5" /> Verified
                                            </div>
                                        )}
                                        {isKennel && (
                                            <span className="kennel-badge-premium inline-flex items-center gap-1 text-white text-[0.6rem] font-bold px-2 py-1 rounded-md">
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                                                Kennel
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                                        <MapPinIcon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{pet.owner.location}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">Member since {pet.owner.joinedAt ? new Date(pet.owner.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'N/A'}</p>
                                </div>
                            </div>

                            <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={handleMessage}
                                    className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-violet-200/50 transition-all disabled:opacity-50"
                                    disabled={!pet.owner.phone || !pet.availableForSale || pet.status === 'sold' || Boolean(user && user.id === pet.owner.id)}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    {user && user.id === pet.owner.id ? 'Your pet' : 'Message'}
                                </button>
                                <button
                                    onClick={handleContact}
                                    className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                                >
                                    <PhoneIcon className="w-4 h-4" />
                                    Contact
                                </button>
                                <button
                                    onClick={() => navigate(`/user/${pet.owner.id}`)}
                                    className="flex items-center justify-center gap-2 py-3 bg-violet-50 text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-100 transition-all"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Full Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-fadeInUp">
                        {/* Average Rating */}
                        {reviews.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl font-extrabold text-violet-600">
                                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <StarRating rating={reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length} size="lg" />
                                        <p className="text-sm text-slate-500 font-medium mt-1">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Write Review */}
                        {user && pet.owner.id !== user.id && !reviews.some(r => r.userId._id === user.id) && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-100/80 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><span>✍️</span> Write a Review</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Rating</label>
                                        <StarRating rating={newReview.rating} editable onChange={(rating) => setNewReview({ ...newReview, rating })} size="lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Comment</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            rows={4}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-400"
                                            placeholder="Share your experience with this pet..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200/50 transition-all disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-3">
                            {reviewsLoading ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-violet-100 border-t-violet-600 mx-auto"></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center border border-slate-100/80 shadow-sm">
                                    <div className="text-5xl mb-4">⭐</div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">No Reviews Yet</h3>
                                    <p className="text-slate-500 text-sm">Be the first to review this pet!</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review._id} className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={review.userId.avatar || `https://ui-avatars.com/api/?name=${review.userId.name}&background=8b5cf6&color=ffffff`}
                                                    alt={review.userId.name}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                />
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{review.userId.name}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <StarRating rating={review.rating} size="sm" />
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {canEditReview(review) ? (
                                                <button
                                                    onClick={() => handleEditReview(review)}
                                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                    title="Edit review"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleReportReview(review._id)}
                                                    disabled={reportingReview === review._id}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Report review"
                                                >
                                                    <FlagIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Report Review</h3>
                        <p className="text-sm text-slate-500 mb-5">Please select a reason for reporting:</p>

                        <div className="space-y-2 mb-5">
                            {['Spam or fake review', 'Offensive language', 'Misleading information', 'Harassment', 'Other'].map((reason) => (
                                <label key={reason} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${reportReason === reason ? 'border-violet-300 bg-violet-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason}
                                        checked={reportReason === reason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="w-4 h-4 text-violet-600"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {reportReason === 'Other' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please describe the issue..."
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2 mb-4 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            />
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowReportModal(false); setReportReason(''); setCustomReason(''); setReportingReview(null); }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReport}
                                disabled={!reportReason || (reportReason === 'Other' && !customReason.trim())}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Edit Your Review</h3>

                        <div className="space-y-4 mb-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Rating</label>
                                <StarRating
                                    rating={editReviewData.rating}
                                    editable
                                    onChange={(rating) => setEditReviewData({ ...editReviewData, rating })}
                                    size="lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Comment</label>
                                <textarea
                                    value={editReviewData.comment}
                                    onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                                    rows={4}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                    placeholder="Update your review..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowEditModal(false); setEditingReview(null); setEditReviewData({ rating: 0, comment: '' }); }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitEditReview}
                                disabled={!editReviewData.rating || !editReviewData.comment.trim()}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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