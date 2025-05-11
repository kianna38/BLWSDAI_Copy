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
    const [sortColumn, setSortColumn] = useState('lastName');

    // Reset to page 1 if filter changes
    useEffect(() => {
        setFilter(prev => ({ ...prev, SortDir: internalSortDir, Page: 1 }));
    }, [internalSortDir]);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setInternalSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setInternalSortDir('asc');
        }
    };

    const filteredConsumers = useMemo(() => {
        if (!consumers?.data) return [];

        let filtered = consumers.data;
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(con =>
                con.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                con.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                con.purok?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortColumn];
            let bValue = b[sortColumn];

            // Special handling for purok sorting
            if (sortColumn === 'purok') {
                aValue = parseInt(aValue.replace('_', ''));
                bValue = parseInt(bValue.replace('_', ''));
            }

            if (aValue < bValue) return internalSortDir === 'asc' ? -1 : 1;
            if (aValue > bValue) return internalSortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [consumers?.data, searchQuery, sortColumn, internalSortDir]);

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
            <div className="flex p-4 bg-white shadow-md justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Consumers</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-8 px-4 md:px-8">
                {/* Active Consumers */}
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300 flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-600">Active Consumers</h2>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xl font-bold">
                                {filteredConsumers.filter(c => c.status === 'Active').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Disconnected Consumers */}
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300 flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-600">Disconnected Consumers</h2>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xl font-bold">
                                {filteredConsumers.filter(c => c.status === 'Disconnected').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cut Consumers */}
                <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-lg hover:shadow-xl transition-shadow duration-300 flex-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-600">Cut Consumers</h2>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-xl font-bold">
                                {filteredConsumers.filter(c => c.status === 'Cut').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col pt-6 px-4 md:px-8 pb-10 space-y-6 bg-white shadow-lg rounded-xl mx-4 md:mx-8">
                <div className="flex flex-col md:flex-row md:items-center w-full gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full">
                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="flex items-center justify-center border border-gray-200 bg-white shadow-sm px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:shadow transition-all duration-200 w-full md:w-auto"
                        >
                            <FunnelIcon className="w-5 h-5 text-gray-600 mr-2" /> Filter
                        </button>
                        <div className="relative w-full md:w-64 mt-2 md:mt-0">
                            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Purok or Consumer"
                                className="pl-10 bg-gray-50 p-2.5 rounded-lg shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end w-full md:w-auto">
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="bg-[#fb8500] text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 flex items-center gap-2 shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap w-full md:w-auto"
                        >
                            <PlusIcon className="w-5 h-5 text-white" /> Add Consumer
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="overflow-x-auto md:overflow-x-visible">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-gray-600 font-medium">
                                <tr>
                                    <th 
                                        className="p-3 pl-6 text-left cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('lastName')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Name
                                            <span className={`text-sm ${sortColumn === 'lastName' ? (internalSortDir === 'asc' ? 'text-blue-500' : 'text-red-500') : 'text-gray-400'}`}>
                                                {sortColumn === 'lastName' ? (internalSortDir === 'asc' ? '↑' : '↓') : '↕'}
                                            </span>
                                        </div>
                                    </th>
                                    <th 
                                        className="p-3 text-center cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('purok')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Purok
                                            <span className={`text-sm ${sortColumn === 'purok' ? (internalSortDir === 'asc' ? 'text-blue-500' : 'text-red-500') : 'text-gray-400'}`}>
                                                {sortColumn === 'purok' ? (internalSortDir === 'asc' ? '↑' : '↓') : '↕'}
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-3 text-center">Meter No.</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConsumers.length ? (
                                    filteredConsumers.map(consumer => (
                                        <tr
                                            key={consumer.consumerId}
                                            className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                            onClick={() => handleRowClick(consumer.consumerId)}>
                                            <td className="p-3 pl-6 font-bold text-gray-900">{consumer.lastName}, {consumer.firstName}</td>
                                            <td className="p-3 text-center text-gray-600">{consumer.purok.replace(/^_/, '')}</td>
                                            <td className="p-3 text-center text-gray-600">{consumer.meterNumber}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                                    consumer.status === 'Active' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : consumer.status === 'Disconnected'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {consumer.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-500">No consumers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 flex justify-between items-center text-sm text-gray-600 border-t border-gray-100">
                        <div className="text-gray-500">
                            Showing {start}-{end} of {total} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, Page: prev.Page - 1 }))}
                                disabled={filter.Page <= 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors duration-200"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, Page: prev.Page + 1 }))}
                                disabled={filter.Page * filter.PageSize >= total}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors duration-200"
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
