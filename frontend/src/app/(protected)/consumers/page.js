'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFilterConsumers, useCreateConsumer } from '@/hooks/useConsumer'; // Your consumer hooks
import AddConsumerModal from '@/components/modals/AddConsumerModal'; // Modal component for adding a consumer
import FilterConsumersModal from '@/components/modals/FilterConsumersModal'; // Import Filter Modal
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js

export default function ConsumersPage() {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false); // State for filter modal
    const [filter, setFilter] = useState({
        Puroks: [],
        Statuses: [],
        NotifPreferences: [],
        SortBy: 'createdAt',
        SortDir: 'asc',
        Page: 1,
        PageSize: 10, // Pagination per page
    });
    const [searchQuery, setSearchQuery] = useState('');

    const router = useRouter();
    // Use the useFilterConsumers hook to get filtered data
    const { data: consumers, isLoading, error } = useFilterConsumers(filter);

    const [internalSortDir, setInternalSortDir] = useState(filter.SortDir);

    // Reset to page 1 if filter changes
    useEffect(() => {
        setFilter(prev => ({ ...prev, SortDir: internalSortDir, Page: 1 }));
    }, [internalSortDir]);

    const filteredConsumers = useMemo(() => {
        if (!consumers?.data) return [];

        if (!searchQuery) return consumers.data;

        return consumers.data.filter(con =>
            con.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            con.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            con.purok?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [consumers?.data, searchQuery]);

    const total = consumers?.totalCount || 0;  // Total consumers from pagination
    const start = (filter.Page - 1) * filter.PageSize + 1;  // Start index for current page
    const end = start + filteredConsumers.length - 1;  // End index for current page

    const handleApplyFilter = (newFilter) => {
        setFilter(newFilter);
    };

    // Handle row click for navigation
    const handleRowClick = (consumerId) => {
        router.push(`/consumers/consumer?consumerId=${consumerId}`);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading consumers: {error.message}</div>;
    }

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-2 bg-white shadow-inner justify-between items-start">
                <h1 className="text-2xl font-bold pl-2">Consumers</h1>
            </div>

            <div className="flex flex-col p-6 space-y-6">
                <div className="flex justify-between items-center flex-col space-y-5 md:space-y-0 md:flex-row">
                    <div className="">
                        <button
                            className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            onClick={() => setAddModalOpen(true)}
                        >
                            <PlusIcon className="w-4 h-5 text-white" /> Add Consumer
                        </button>
                    </div>

                    <div className="flex justify-end space-x-5 items-center mb-2">
                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="flex items-center gap-1 border border-cyan-400/40 bg-white shadow px-4 py-2 rounded hover:bg-cyan-100 hover:shadow-sm"
                        >
                            <FunnelIcon className="w-4.5 h-4.5 text-cyan-400 mr-1" /> Filter
                        </button>
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-cyan-400" />
                            <input
                                type="text"
                                placeholder="Search Purok or Consumer"
                                className="pl-8 bg-cyan-50 p-2 rounded shadow"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left text-slate-700">
                        <thead className="bg-cyan-100 text-gray-500 font-medium">
                            <tr>
                                <th className="p-3 text-center">Name</th>
                                <th className="p-3 text-center">Purok</th>
                                <th className="p-3 text-center">Meter No.</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsumers.length ? (
                                filteredConsumers.map(consumer => (
                                    <tr
                                        key={consumer.consumerId}
                                        className="border-t border-b border-cyan-200 hover:bg-cyan-200"
                                        onClick={() => handleRowClick(consumer.consumerId)}>
                                        <td className="p-3 text-center">{consumer.lastName}, {consumer.firstName}</td>
                                        <td className="p-3 text-center">{consumer.purok.replace(/^_/, '')}</td>
                                        <td className="p-3 text-center">{consumer.meterNumber}</td>
                                        <td className="p-3 text-center">
                                            <span className={`text-sm px-2 py-1 rounded-md ${consumer.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {consumer.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No consumers found</td>
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

            {/* Add Consumer Modal */}
            {isAddModalOpen && (
                <AddConsumerModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                />
            )}

            {/* Filter Modal */}
            <FilterConsumersModal
                isOpen={isFilterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={handleApplyFilter}
                filter={filter}
            />
        </div>
    );
}
