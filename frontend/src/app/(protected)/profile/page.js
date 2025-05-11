'use client';

import { useState, useMemo, useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore'; // Zustand store for auth state
import { useUserById, useUserLogs } from '@/hooks/useUser';
import EditProfileModal from '@/components/modals/EditProfileModal';
import {
    PencilIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js

export default function ProfilePage() {
    // Getting userId and token from Zustand
    const router = useRouter();
    const { token, userId, userRole } = useAuthStore(state => state);

    // Fetch user data by ID using useQuery (always called)
    const { data: user, isLoading: userLoading } = useUserById(userId);

    // State variables for managing modals, search query, etc.
    const [isModalOpen, setModalOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [filter, setFilter] = useState({
        Process: null,
        Page: 1,
        PageSize: 10,
        SortDir: 'desc',
    });

    const [internalSortDir, setInternalSortDir] = useState(filter.SortDir);

    useEffect(() => {
        // Update filter when sorting direction changes
        setFilter(prev => ({ ...prev, SortDir: internalSortDir, Page: 1 }));
    }, [internalSortDir]);

    // Fetch user logs only if user data is available
    const { data: logs, isLoading: logsLoading } = useUserLogs(userId, filter);

    // Memoize the logs filtering logic
    const filteredLogs = useMemo(() => {
        if (!logs?.data) return [];

        if (!searchQuery) return logs.data;

        return logs.data.filter(log =>
            log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.process.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.date.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [logs?.data, logs?.process, logs?.date, searchQuery]);

    console.log(logs?.data);

    const total = logs?.totalCount || 0;
    const start = (filter.Page - 1) * filter.PageSize + 1;
    const end = start + filteredLogs.length - 1;

    const handleDateSort = () => {
        setInternalSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // Handle row click for navigation
    const handleRowClick = (consumerId, monthYear) => {
        router.push(`/billings_payment/bill_pay/?consumerId=${consumerId}&monthYear=${monthYear}`);
    };

    // Render loading state for user data and logs
    if (userLoading || logsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fb8500]"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-5 sm:px-5 lg:px-5 py-5">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-extrabold text-[#023047]">Profile</h1>
                        <button
                            className="bg-[#fb8500] text-white px-4 py-2 rounded-lg hover:bg-[#fb8500]/90 transition-colors flex items-center gap-2"
                            onClick={() => setModalOpen(true)}
                        >
                            <PencilIcon className="w-5 h-5" />
                           
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <img
                                src={`images/${user?.role?.toLowerCase() || 'staff'}.png`}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full border-4 border-[#fb8500] shadow-lg"
                            />
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#fb8500] text-white px-4 py-1 rounded-full text-sm font-medium">
                                {user?.role}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-[#023047] mb-2">{user?.name}</h2>
                            <p className="text-gray-600 mb-4">{user?.email}</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                                    <p className="text-sm text-gray-500">User ID</p>
                                    <p className="font-semibold text-[#023047]">{user?.userId}</p>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-lg">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-semibold text-[#023047]">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Logs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-[#023047]">Activity Logs</h2>
                        <div className="relative w-full md:w-64">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fb8500] focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={handleDateSort}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            {internalSortDir === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 text-[#fb8500]" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 text-[#fb8500]" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLogs.length ? (
                                    filteredLogs.map((log, idx) => (
                                        <tr
                                            key={`${log.process}-${log.processID}-${idx}`}
                                            onClick={log.process === "Payment" ? () => handleRowClick(log.processID, log.date) : undefined}
                                            className={`hover:bg-slate-50 transition-colors ${log.process === "Payment" ? "cursor-pointer" : ""}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#fb8500]/10 text-[#fb8500]">
                                                    {log.process}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(log.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                            No logs found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing {start}-{end} of {total} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter(prev => ({ ...prev, Page: prev.Page - 1 }))}
                                disabled={filter.Page <= 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilter(prev => ({ ...prev, Page: prev.Page + 1 }))}
                                disabled={filter.Page * filter.PageSize >= total}
                                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <EditProfileModal
                    user={user}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}
