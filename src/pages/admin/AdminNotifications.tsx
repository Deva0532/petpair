import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000';

interface User {
    _id: string;
    name: string;
    email: string;
    userType: 'individual' | 'store';
    storeName?: string;
}

export const AdminNotifications: React.FC = () => {
    const { showToast } = useToast();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'individual' | 'store' | 'selected'>('all');
    const [isSending, setIsSending] = useState(false);

    // User selection state
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');

    // Fetch users when target type changes to individual or store
    useEffect(() => {
        if (targetType === 'individual' || targetType === 'store') {
            fetchUsers(targetType);
            setShowUserList(true);
        } else {
            setShowUserList(false);
            setSelectedUsers([]);
        }
    }, [targetType]);

    // Filter users based on search query
    useEffect(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(users.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                (u.storeName && u.storeName.toLowerCase().includes(query))
            ));
        } else {
            setFilteredUsers(users);
        }
    }, [searchQuery, users]);

    const fetchUsers = async (type: 'individual' | 'store') => {
        setIsLoadingUsers(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/users?type=${type}&limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsers(data.users || []);
            setFilteredUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const toggleUserSelection = (user: User) => {
        setSelectedUsers(prev => {
            const isSelected = prev.some(u => u._id === user._id);
            if (isSelected) {
                return prev.filter(u => u._id !== user._id);
            } else {
                return [...prev, user];
            }
        });
    };

    const selectAllFiltered = () => {
        setSelectedUsers(prev => {
            const newSelected = [...prev];
            filteredUsers.forEach(user => {
                if (!newSelected.some(u => u._id === user._id)) {
                    newSelected.push(user);
                }
            });
            return newSelected;
        });
    };

    const deselectAll = () => {
        setSelectedUsers([]);
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            showToast('Please enter both subject and message', 'error');
            return;
        }

        if ((targetType === 'individual' || targetType === 'store') && selectedUsers.length === 0) {
            showToast('Please select at least one user', 'error');
            return;
        }

        const targetDescription = targetType === 'all'
            ? 'all users'
            : targetType === 'individual'
                ? `${selectedUsers.length} individual owner(s)`
                : `${selectedUsers.length} store owner(s)`;

        setConfirmMessage(`Are you sure you want to send this notification to ${targetDescription}?`);
        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        setShowConfirmModal(false);

        setIsSending(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject,
                    message,
                    targetType: targetType === 'all' ? 'all' : targetType,
                    selectedUserIds: selectedUsers.map(u => u._id)
                })
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'Notifications sent successfully!', 'success');
                setSubject('');
                setMessage('');
                setSelectedUsers([]);
            } else {
                showToast(data.message || 'Failed to send notification', 'error');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            showToast('Error sending notification. Please try again.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Send Notifications</h1>

            <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="space-y-6">
                    {/* Target Audience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => setTargetType('all')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${targetType === 'all'
                                    ? 'border-violet-500 bg-violet-50'
                                    : 'border-gray-200 hover:border-violet-300'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">All Users</div>
                                <div className="text-sm text-gray-500">Send to everyone with email notifications enabled</div>
                            </button>
                            <button
                                onClick={() => setTargetType('individual')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${targetType === 'individual'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">Individual Owners</div>
                                <div className="text-sm text-gray-500">Select specific individual pet owners</div>
                            </button>
                            <button
                                onClick={() => setTargetType('store')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${targetType === 'store'
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <div className="font-medium text-gray-900">Store Owners</div>
                                <div className="text-sm text-gray-500">Select specific pet store owners</div>
                            </button>
                        </div>
                    </div>

                    {/* User Selection (when individual or store is selected) */}
                    {showUserList && (
                        <div className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="font-medium text-gray-900">
                                    Select {targetType === 'individual' ? 'Individual Owners' : 'Store Owners'}
                                    {selectedUsers.length > 0 && (
                                        <span className="ml-2 text-sm text-violet-600">({selectedUsers.length} selected)</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={selectAllFiltered}
                                        className="text-sm text-violet-600 hover:text-violet-700"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={deselectAll}
                                        className="text-sm text-gray-600 hover:text-gray-700"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or store name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>

                            {/* Selected Users Pills */}
                            {selectedUsers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                                    {selectedUsers.map(user => (
                                        <span
                                            key={user._id}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 text-violet-800"
                                        >
                                            {user.name}
                                            <button
                                                onClick={() => toggleUserSelection(user)}
                                                className="ml-2 hover:text-violet-900"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* User List */}
                            <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-lg">
                                {isLoadingUsers ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {searchQuery ? 'No users match your search' : 'No users found'}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredUsers.map(user => {
                                            const isSelected = selectedUsers.some(u => u._id === user._id);
                                            return (
                                                <label
                                                    key={user._id}
                                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-violet-50' : ''
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleUserSelection(user)}
                                                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                        {user.storeName && (
                                                            <div className="text-sm text-violet-600">{user.storeName}</div>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Special Holiday Offer!"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your notification message here..."
                            rows={6}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Preview */}
                    {(subject || message) && (
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <p className="text-sm font-medium text-gray-500 mb-2">Preview:</p>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="font-semibold text-gray-900">{subject || '(No subject)'}</p>
                                <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                                    Hi [User Name],{'\n\n'}{message || '(No message)'}{'\n\n'}Best regards,{'\n'}The Peto Team
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={isSending || !subject.trim() || !message.trim() || ((targetType === 'individual' || targetType === 'store') && selectedUsers.length === 0)}
                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <PaperAirplaneIcon className="w-5 h-5" />
                                <span>
                                    Send Notification
                                    {(targetType === 'individual' || targetType === 'store') && selectedUsers.length > 0 &&
                                        ` to ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`
                                    }
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Send</h3>
                        <p className="text-gray-600 mb-6">{confirmMessage}</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
