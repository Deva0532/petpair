import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000';

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    userType: string;
}

interface Feedback {
    _id: string;
    userId: UserInfo;
    type: string;
    priority: string;
    comment: string;
    status: string;
    createdAt: string;
}

export const AdminFeedbacks: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [filter, setFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/feedback`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error('Failed to fetch admin feedbacks', error);
            showToast('Failed to load feedbacks.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkResolved = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/admin/feedback/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'resolved' })
            });

            if (res.ok) {
                setFeedbacks(prev => prev.map(f => f._id === id ? { ...f, status: 'resolved' } : f));
                showToast('Feedback marked as resolved.', 'success');
            } else {
                showToast('Failed to resolve feedback.', 'error');
            }
        } catch (error) {
            console.error('Error resolving feedback:', error);
            showToast('Error updating status.', 'error');
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (filter === 'all') return true;
        return f.type === filter;
    });

    return (
        <div className="space-y-6 animate-fadeInUp">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">User Feedbacks</h1>
                <div className="flex flex-wrap gap-2">
                    {['all', 'suggestion', 'bug', 'other'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                filter === f 
                                    ? 'bg-violet-100 text-violet-700 shadow-sm border border-violet-200' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
                            <div className="text-2xl font-bold text-violet-600">{feedbacks.length}</div>
                            <div className="text-gray-600 text-sm">Total Reports</div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                            <div className="text-2xl font-bold text-amber-600">{feedbacks.filter(f => f.type === 'bug').length}</div>
                            <div className="text-gray-600 text-sm">Bug Reports</div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
                            <div className="text-2xl font-bold text-emerald-600">{feedbacks.filter(f => f.status === 'pending').length}</div>
                            <div className="text-gray-600 text-sm">Pending Review</div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        {filteredFeedbacks.length > 0 ? filteredFeedbacks.map((feedback) => (
                            <Card key={feedback._id} className={`p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all border-l-4 ${
                                feedback.status === 'resolved' ? 'border-emerald-400 opacity-75' :
                                feedback.priority === 'high' ? 'border-rose-400' :
                                feedback.priority === 'medium' ? 'border-amber-400' : 'border-blue-400'
                            }`}>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={feedback.userId?.avatar || `https://ui-avatars.com/api/?name=${feedback.userId?.name || 'U'}&background=8b5cf6&color=ffffff`} 
                                                alt={feedback.userId?.name || 'User'} 
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">
                                                    {feedback.userId?.name || 'Deleted User'}
                                                    {feedback.userId?.userType === 'kennel' && <span className="ml-2 text-[0.65rem] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">KENNEL</span>}
                                                </h3>
                                                <p className="text-xs text-gray-500">{feedback.userId?.email || 'N/A'}</p>
                                            </div>
                                            <span className={`ml-4 px-2.5 py-1 text-[0.65rem] font-bold uppercase rounded-full ${
                                                feedback.type === 'bug' ? 'bg-amber-100 text-amber-700' : 
                                                feedback.type === 'suggestion' ? 'bg-emerald-100 text-emerald-700' : 
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {feedback.type}
                                            </span>
                                            <span className={`px-2.5 py-1 text-[0.65rem] font-bold uppercase rounded-full ${
                                                feedback.priority === 'high' ? 'bg-rose-100 text-rose-700' : 
                                                feedback.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 
                                                'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {feedback.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm mb-4 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                                        {feedback.comment}
                                    </p>
                                    
                                    <p className="text-xs text-gray-400 font-medium pb-2">
                                        Submitted on {new Date(feedback.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 justify-end items-end md:pl-6 md:border-l border-gray-100 w-full md:w-auto">
                                    {feedback.status === 'pending' ? (
                                        <Button 
                                            onClick={() => handleMarkResolved(feedback._id)}
                                            size="sm" 
                                            className="w-full md:w-auto min-w-[140px] bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" /> Resolve
                                        </Button>
                                    ) : (
                                        <div className="w-full md:w-auto min-w-[140px] px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-emerald-100">
                                            <CheckCircleIcon className="w-5 h-5" /> Resolved
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
                                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Feedbacks Found</h3>
                                <p className="text-gray-500">There are no feedbacks matching this filter.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
