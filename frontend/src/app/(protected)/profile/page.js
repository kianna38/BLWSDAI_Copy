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
        return <div>Loading...</div>;
    }


    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Profile</h1>
            </div>

            <div className="flex flex-col p-6">
                <div className="flex items-end justify-end">
                    <button
                        className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        onClick={() => setModalOpen(true)}
                    >
                        <PencilIcon className="w-4 h-5 text-white" /> Edit Profile
                    </button>
                </div>

                <div className="flex items-center justify-center mt-6">
                    <img
                        src={`images/${user?.role || 'staff'}.png`}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mr-6"
                    />
                    <div>
                        <p className="text-xl font-semibold">{user?.name}</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                        <p className="uppercase text-black font-bold mt-1">{user?.role}</p>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col justify-between items-center mt-12 mb-4 md:flex-row">
                        <h2 className="text-xl text-slate-600 font-bold ml-4 mb-5 md:mb-0">Your Logs</h2>

                        <div className="flex justify-end space-x-5 items-center mb-2">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-cyan-400" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="pl-8 bg-cyan-50 p-2 rounded shadow"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyan-50 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left text-slate-700 table-fixed">
                            <thead className="bg-cyan-100 uppercase text-gray-500 font-medium">
                                <tr>
                                    <th className="p-3 w-1/4 text-center">Process</th>
                                    <th
                                        className="p-3 w-1/4 text-center cursor-pointer select-none"
                                        onClick={handleDateSort}
                                    >
                                        <div className="flex items-center justify-center space-x-1">
                                            <span>Date</span>
                                            {internalSortDir === 'asc' ? (
                                                <ChevronUpIcon className="w-4 h-4 inline  text-blue-500" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 inline text-blue-500" />
                                            )}
                                        </div>
                                    </th>


                                    <th className="p-3 w-2/4 text-center">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length ? (
                                    filteredLogs.map((log, idx) => (
                                        <tr
                                            key={`${log.process}-${log.processID}-${idx}`}
                                            onClick={log.process === "Payment" ? () => handleRowClick(log.processID, log.date) : undefined}
                                            className={`border-t border-b border-cyan-200 ${log.process === "Payment" ? "hover:bg-cyan-200 cursor-pointer" : ""}`}
                                        >
                                            <td className="p-3 text-center font-semibold">{log.process}</td>
                                            <td className="p-3 text-center">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="p-3 text-center">{log.details}</td>
                                        </tr>

                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4">No logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="p-4 flex justify-end space-x-5 items-center text-sm text-gray-600">
                            <div>
                                Rows per page: {filter.PageSize} | {start}-{end} of {total}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter((prev) => ({ ...prev, Page: prev.Page - 1 }))}
                                    disabled={filter.Page <= 1}
                                    className="px-3 py-1 border rounded disabled:opacity-30"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setFilter((prev) => ({ ...prev, Page: prev.Page + 1 }))}
                                    disabled={filter.Page * filter.PageSize >= total}
                                    className="px-3 py-1 border rounded disabled:opacity-30"
                                >
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
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
