import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlagIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { useToast } from '../../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000';

interface ReportedReview {
    _id: string;
    petId: {
        _id: string;
        name: string;
        imageUrls: string[];
    };
    userId: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    rating: number;
    comment: string;
    reportCount: number;
    reportReasons?: string[];
    createdAt: string;
}

export const AdminReportedReviews: React.FC = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<ReportedReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [dismissingId, setDismissingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReportedReviews();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchReportedReviews();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchReportedReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/reported-reviews`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                showToast('Failed to fetch reported reviews', 'error');
            }
        } catch (error) {
            console.error('Error fetching reported reviews:', error);
            showToast('Error fetching reported reviews', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review? The author will be notified.')) {
            return;
        }

        try {
            setDeletingId(reviewId);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showToast('Review deleted successfully', 'success');
                setReviews(reviews.filter(r => r._id !== reviewId));
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to delete review', 'error');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            showToast('Error deleting review', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewPet = (petId: string) => {
        navigate(`/pet/${petId}?tab=reviews`);
    };

    const handleDismissReport = async (reviewId: string) => {
        if (!confirm('Dismiss this report? The review will remain but report flags will be cleared. Reporters will be notified.')) {
            return;
        }

        try {
            setDismissingId(reviewId);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}/dismiss`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showToast('Report dismissed successfully', 'success');
                setReviews(reviews.filter(r => r._id !== reviewId));
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to dismiss report', 'error');
            }
        } catch (error) {
            console.error('Error dismissing report:', error);
            showToast('Error dismissing report', 'error');
        } finally {
            setDismissingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Reported Reviews</h1>

            {reviews.length === 0 ? (
                <Card className="p-12 text-center">
                    <FlagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reported Reviews</h3>
                    <p className="text-gray-600">All reviews are clean! No reports to moderate.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card key={review._id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4 flex-1">
                                    {/* Pet Image */}
                                    <img
                                        src={review.petId.imageUrls?.[0] || 'https://placehold.co/100x100'}
                                        alt={review.petId.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />

                                    {/* Review Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{review.petId.name}</h3>
                                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center space-x-1">
                                                <FlagIcon className="w-4 h-4" />
                                                <span>{review.reportCount} {review.reportCount === 1 ? 'report' : 'reports'}</span>
                                            </span>
                                        </div>

                                        {/* Reviewer */}
                                        <div className="flex items-center space-x-3 mb-3">
                                            <img
                                                src={review.userId.avatar || `https://ui-avatars.com/api/?name=${review.userId.name}&background=8b5cf6&color=ffffff`}
                                                alt={review.userId.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{review.userId.name}</p>
                                                <p className="text-sm text-gray-500">{review.userId.email}</p>
                                            </div>
                                        </div>

                                        {/* Rating & Date */}
                                        <div className="flex items-center space-x-3 mb-3">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="text-sm text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        {/* Comment */}
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>

                                        {/* Report Reasons */}
                                        {review.reportReasons && review.reportReasons.length > 0 && (
                                            <div className="mt-3 bg-red-50 rounded-lg p-3 border border-red-200">
                                                <p className="text-sm font-semibold text-red-900 mb-2">Report Reasons:</p>
                                                <ul className="space-y-1">
                                                    {review.reportReasons.map((reason, idx) => (
                                                        <li key={idx} className="text-sm text-red-800 flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>{reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col space-y-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewPet(review.petId._id)}
                                        className="flex items-center space-x-2"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        <span>View Pet</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDismissReport(review._id)}
                                        disabled={dismissingId === review._id}
                                        className="flex items-center space-x-2 text-gray-600 border-gray-300 hover:bg-gray-50"
                                    >
                                        <span>{dismissingId === review._id ? 'Dismissing...' : 'Dismiss'}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteReview(review._id)}
                                        disabled={deletingId === review._id}
                                        className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        <span>{deletingId === review._id ? 'Deleting...' : 'Delete'}</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
