import React, { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, MagnifyingGlassIcon, XMarkIcon, UserGroupIcon, UserIcon, BuildingStorefrontIcon, SparklesIcon, MegaphoneIcon, WrenchScrewdriverIcon, BellIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../contexts/ToastContext';

const API_BASE_URL = 'http://localhost:5000';

interface User {
    _id: string;
    name: string;
    email: string;
    userType: 'individual' | 'store' | 'kennel';
    storeName?: string;
    avatar?: string;
}

const QUICK_TEMPLATES = [
    {
        id: 'welcome',
        name: 'Welcome',
        icon: SparklesIcon,
        subject: 'Welcome to Peto! 🎉',
        message: 'We are thrilled to have you here. Explore our community, post your pets, and find your perfect companions.\n\nNeed help getting started? Check out our FAQ section.',
        color: 'text-amber-600',
        bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        icon: WrenchScrewdriverIcon,
        subject: 'Scheduled System Maintenance 🛠️',
        message: 'We will be performing scheduled maintenance on our platform tonight at 2:00 AM. The site may be unavailable for up to 1 hour.\n\nThank you for your patience!',
        color: 'text-blue-600',
        bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
        id: 'promo',
        name: 'Special Offer',
        icon: MegaphoneIcon,
        subject: 'Weekend Special: Premium Features Unlocked! 🌟',
        message: 'Great news! All premium kennel features are unlocked this weekend for everyone. Try out the advanced analytics and priority listing features for free.',
        color: 'text-pink-600',
        bg: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    }
];

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto resize textarea
    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
        setSubject(template.subject);
        setMessage(template.message);
        if (textareaRef.current) {
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
            }, 0);
        }
    };

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
        <div className="max-w-6xl mx-auto pb-12 animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-gray-900 tracking-tight">Send Notifications</h1>
                    <p className="text-gray-500 mt-2">Broadcast messages and alerts to your users.</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                    <PaperAirplaneIcon className="w-6 h-6 text-violet-600" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Quick Templates */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Quick Templates</h2>
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">Optional</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {QUICK_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => applyTemplate(template)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${template.bg}`}
                                >
                                    <div className={`p-2 bg-white rounded-lg shadow-sm ${template.color}`}>
                                        <template.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm text-gray-800">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-4">Select Target Audience</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTargetType('all')}
                                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${targetType === 'all'
                                        ? 'border-violet-500 bg-violet-50/50 shadow-md shadow-violet-100 scale-[1.02]'
                                        : 'border-gray-100 hover:border-violet-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {targetType === 'all' && (
                                        <div className="absolute top-4 right-4 w-3 h-3 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse"></div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${targetType === 'all' ? 'bg-violet-200 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <UserGroupIcon className="w-5 h-5" />
                                    </div>
                                    <div className="font-bold text-gray-900 mb-1">Everyone</div>
                                    <div className="text-xs text-gray-500 leading-relaxed">Broadcast to all active users on the platform.</div>
                                </button>

                                <button
                                    onClick={() => setTargetType('individual')}
                                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${targetType === 'individual'
                                        ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100 scale-[1.02]'
                                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {targetType === 'individual' && (
                                        <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${targetType === 'individual' ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div className="font-bold text-gray-900 mb-1">Individuals</div>
                                    <div className="text-xs text-gray-500 leading-relaxed">Select specialized standard pet owners.</div>
                                </button>

                                <button
                                    onClick={() => setTargetType('store')}
                                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${targetType === 'store'
                                        ? 'border-pink-500 bg-pink-50/50 shadow-md shadow-pink-100 scale-[1.02]'
                                        : 'border-gray-100 hover:border-pink-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {targetType === 'store' && (
                                        <div className="absolute top-4 right-4 w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse"></div>
                                    )}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${targetType === 'store' ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <BuildingStorefrontIcon className="w-5 h-5" />
                                    </div>
                                    <div className="font-bold text-gray-900 mb-1">Kennels/Stores</div>
                                    <div className="text-xs text-gray-500 leading-relaxed">Message verified kennel business partners.</div>
                                </button>
                            </div>
                        </div>

                        {/* User Selection List Filter */}
                        <div className={`transition-all duration-300 overflow-hidden ${showUserList ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="border border-gray-200 bg-gray-50/30 rounded-2xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        Select {targetType === 'individual' ? 'Specific Individuals' : 'Specific Kennels'}
                                        {selectedUsers.length > 0 && (
                                            <span className="bg-violet-100 text-violet-700 py-0.5 px-2 rounded-md text-xs font-bold">{selectedUsers.length} selected</span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm font-semibold">
                                        <button onClick={selectAllFiltered} className="text-violet-600 hover:text-violet-700 transition-colors">Select All</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={deselectAll} className="text-gray-500 hover:text-gray-700 transition-colors">Clear</button>
                                    </div>
                                </div>

                                <div className="relative mb-4">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or store name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white shadow-sm transition-all text-sm"
                                    />
                                </div>

                                {selectedUsers.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4 max-h-[100px] overflow-y-auto custom-scrollbar">
                                        {selectedUsers.map(user => (
                                            <span key={user._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white shadow-sm animate-fadeIn">
                                                {user.name.split(' ')[0]}
                                                <button onClick={() => toggleUserSelection(user)} className="hover:text-violet-200 transition-colors">
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="h-[240px] overflow-y-auto border border-gray-200 bg-white rounded-xl custom-scrollbar relative">
                                    {isLoadingUsers ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-600"></div>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="p-8 text-center flex flex-col items-center justify-center h-full text-gray-500">
                                            <MagnifyingGlassIcon className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-sm font-medium">{searchQuery ? 'No matching users found.' : 'No users available.'}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredUsers.map(user => {
                                                const isSelected = selectedUsers.some(u => u._id === user._id);
                                                return (
                                                    <label key={user._id} className={`flex items-center p-3 cursor-pointer transition-colors hover:bg-violet-50/50 ${isSelected ? 'bg-violet-50/80' : ''}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleUserSelection(user)}
                                                            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500 transition-all cursor-pointer"
                                                        />
                                                        <div className="ml-4 flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-sm flex-shrink-0">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="truncate">
                                                                <div className="font-semibold text-sm text-gray-900 truncate">{user.name}</div>
                                                                <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                            </div>
                                                        </div>
                                                        {(user.userType === 'store' || user.userType === 'kennel') && (
                                                            <span className="hidden sm:inline-block ml-2 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 whitespace-nowrap">
                                                                Kennel
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Compose Message */}
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-900">Subject Line</label>
                                    <span className={`text-xs font-medium ${subject.length > 80 ? 'text-red-500' : 'text-gray-400'}`}>{subject.length}/100</span>
                                </div>
                                <input
                                    type="text"
                                    value={subject}
                                    maxLength={100}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter a clear, concise subject..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 focus:bg-white transition-all text-sm font-medium"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-900">Message Body</label>
                                    <span className={`text-xs font-medium ${message.length > 800 ? 'text-red-500' : 'text-gray-400'}`}>{message.length}/1000</span>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={handleMessageChange}
                                    maxLength={1000}
                                    placeholder="Write your comprehensive notification message here..."
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 focus:bg-white transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side Sticky Preview & Action */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        
                        {/* Live Preview Interface */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform transition-all relative">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-800 flex items-center gap-2">
                                <BellIcon className="w-5 h-5 text-gray-300" />
                                <h3 className="font-bold text-white text-sm">Preview: User App View</h3>
                            </div>
                            
                            <div className="p-6 bg-gray-50 min-h-[300px] flex items-start justify-center">
                                {/* Simulated Notification Dropdown */}
                                <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-fadeIn">
                                    <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white z-10 sticky top-0">
                                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                        <div className="w-4 h-4 text-gray-400"><XMarkIcon /></div>
                                    </div>
                                    
                                    <div className="p-0">
                                        {subject || message ? (
                                            <div className="px-4 py-4 border-b border-gray-50 bg-violet-50/50 relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                                                <div className="flex items-start justify-between mb-1.5 pl-2 leading-tight">
                                                    <h4 className="text-[13px] font-bold text-violet-900 pr-2">
                                                        {subject || '(No subject)'}
                                                    </h4>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap mt-0.5">Just now</span>
                                                </div>
                                                <p className="text-[12px] text-gray-600 leading-relaxed pl-2 break-words whitespace-pre-wrap">
                                                    {message || '(Message body goes here)'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-center flex items-center justify-center flex-col opacity-50">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                                    <BellIcon className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">Start typing to see live preview</p>
                                            </div>
                                        )}
                                        {/* Mock second notification to show list appearance */}
                                        <div className="px-4 py-4 pl-6 opacity-40 grayscale pointer-events-none">
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="text-[13px] font-semibold text-gray-900">Welcome to Peto</h4>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">2d ago</span>
                                            </div>
                                            <p className="text-[12px] text-gray-500 leading-relaxed truncate">Thanks for joining our amazing community!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Send Action */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                             <button
                                onClick={handleSend}
                                disabled={isSending || !subject.trim() || !message.trim() || ((targetType === 'individual' || targetType === 'store') && selectedUsers.length === 0)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
                            >
                                {isSending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>Broadcasting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Notification Now</span>
                                        <PaperAirplaneIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
                                {(targetType === 'individual' || targetType === 'store') && selectedUsers.length > 0
                                    ? `This will immediately notify ${selectedUsers.length} selected user(s).`
                                    : targetType === 'all' ? 'This represents a platform-wide broadcast.' : 'Select audience and compose message to proceed.'}
                            </p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-slideUp">
                        <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-12">
                            <PaperAirplaneIcon className="w-8 h-8 -rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold font-display text-center text-gray-900 mb-2">Confirm Broadcast</h3>
                        <p className="text-gray-500 text-center mb-8 leading-relaxed text-sm">
                            {confirmMessage}
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-200 transition-all"
                            >
                                Send Automatically
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
