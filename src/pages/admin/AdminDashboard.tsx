import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, HeartIcon, BuildingStorefrontIcon, ClockIcon } from '@heroicons/react/24/outline';

import { API_BASE_URL } from '../../config';

interface Stats {
    totalUsers: number;
    totalPets: number;
    pendingApprovals: number;
    activeStores: number;
    individualUsers: number;
}

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'from-blue-500 to-blue-600' },
        { label: 'Total Pets', value: stats.totalPets, icon: HeartIcon, color: 'from-pink-500 to-pink-600' },
        { label: 'Active Kennels', value: stats.activeStores, icon: BuildingStorefrontIcon, color: 'from-amber-500 to-amber-600' },
        { label: 'Pending Approvals', value: stats.pendingApprovals, icon: ClockIcon, color: 'from-amber-500 to-amber-600' },
    ] : [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card) => (
                        <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-gray-600">{card.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {stats && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* User Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Individual Owners</span>
                                    <span className="font-medium">{stats.individualUsers}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(stats.individualUsers / stats.totalUsers) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Kennel Partners</span>
                                    <span className="font-medium">{stats.activeStores}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-amber-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(stats.activeStores / stats.totalUsers) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link
                                to="/admin/kennel-approvals"
                                className="flex items-center justify-between p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <ClockIcon className="w-5 h-5 text-amber-600" />
                                    <span className="font-medium text-amber-800">Review Pending Kennel Approvals</span>
                                </div>
                                {stats.pendingApprovals > 0 && (
                                    <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                                        {stats.pendingApprovals}
                                    </span>
                                )}
                            </Link>
                            <Link
                                to="/admin/feedbacks"
                                className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <span className="font-medium text-emerald-800">Review User Feedbacks</span>
                                </div>
                            </Link>
                            <Link
                                to="/admin/notifications"
                                className="flex items-center justify-between p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium text-blue-800">Send Notification to Users</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
