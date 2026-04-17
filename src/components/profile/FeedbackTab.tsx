import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FeedbackItem {
  _id: string;
  type: string;
  priority: string;
  comment: string;
  status: string;
  createdAt: string;
}

export const FeedbackTab: React.FC = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [priority, setPriority] = useState('medium');
    const [type, setType] = useState('suggestion');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/feedback/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFeedbacks(data);
            }
        } catch (error) {
            console.error('Failed to fetch feedbacks', error);
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!comment.trim()) {
            showToast('Please provide your feedback comment', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, priority, comment })
            });

            if (res.ok) {
                showToast('Thank you for your feedback! We appreciate it.', 'success');
                setPriority('medium');
                setType('suggestion');
                setComment('');
                fetchFeedbacks(); // Refresh the list
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to submit feedback.', 'error');
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            showToast('Failed to submit feedback. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Platform Feedback</h2>
                <p className="text-slate-600">Help us improve your experience by sharing your thoughts, bug reports, and suggestions for our website.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <Card className="p-6 md:p-8 border-slate-200/60 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type of feedback */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-3">What kind of feedback is this?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'suggestion', label: '💡 Suggestion' },
                                        { id: 'bug', label: '🐛 Bug Report' },
                                        { id: 'other', label: '💭 Other' }
                                    ].map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center justify-center py-3 px-4 rounded-xl cursor-pointer border-2 transition-all font-medium text-sm ${
                                                type === opt.id 
                                                ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm' 
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="feedbackType"
                                                className="hidden"
                                                value={opt.id}
                                                checked={type === opt.id}
                                                onChange={(e) => setType(e.target.value)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Priority Meter */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-3">Priority Level</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'low', label: 'Low', color: 'emerald' },
                                        { id: 'medium', label: 'Medium', color: 'amber' },
                                        { id: 'high', label: 'High', color: 'rose' }
                                    ].map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center justify-center py-2.5 px-4 rounded-xl cursor-pointer border-2 transition-all font-bold text-sm ${
                                                priority === opt.id 
                                                ? `border-${opt.color}-500 bg-${opt.color}-50 text-${opt.color}-700 shadow-sm` 
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="priority"
                                                className="hidden"
                                                value={opt.id}
                                                checked={priority === opt.id}
                                                onChange={(e) => setPriority(e.target.value)}
                                            />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Details */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-3">Details</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-y"
                                    rows={5}
                                    placeholder="Please describe your experience or the issue you encountered in detail..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 hover:shadow-lg hover:shadow-violet-200"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                        <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">We Value Your Voice</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                            Your feedback helps us make the platform better for everyone. Whether it's a small glitch, a brilliant idea, or a compliment, we read every submission!
                        </p>
                    </Card>
                    
                    <Card className="p-6 bg-white border border-slate-100">
                        <h4 className="font-semibold text-sm text-slate-900 mb-3 uppercase tracking-wider">Common Questions</h4>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li>
                                <span className="font-medium text-slate-900 block mb-1">When will I hear back?</span>
                                Usually within 48 hours for critical issues. Feature suggestions are reviewed weekly.
                            </li>
                            <li>
                                <span className="font-medium text-slate-900 block mb-1">Is this anonymous?</span>
                                Your feedback is submitted along with your profile information to help us better assist you.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Past Feedbacks */}
            {!isLoadingFeedbacks && feedbacks.length > 0 && (
                <div className="mt-12 animate-fadeInUp">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        My Feedback History
                        <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{feedbacks.length}</span>
                    </h3>
                    <div className="space-y-4">
                        {feedbacks.map((fb) => (
                            <Card key={fb._id} className="p-5 border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-sm font-bold text-slate-700 capitalize bg-slate-100 px-2.5 py-0.5 rounded-full">
                                            {fb.type === 'bug' ? '🐛 Bug' : fb.type === 'suggestion' ? '💡 Suggestion' : '💭 Other'}
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            fb.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                                            fb.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {fb.priority} Priority
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium ml-2">
                                            {new Date(fb.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{fb.comment}</p>
                                </div>
                                
                                <div className="shrink-0 flex items-center md:flex-col md:items-end gap-2 md:gap-1 pl-0 md:pl-4 md:border-l border-slate-100">
                                    {fb.status === 'resolved' ? (
                                        <>
                                            <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                            <span className="text-sm font-bold text-emerald-600">Resolved</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClockIcon className="w-6 h-6 text-amber-500" />
                                            <span className="text-sm font-bold text-amber-600">Pending Review</span>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
