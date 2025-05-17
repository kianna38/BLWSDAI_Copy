'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFilterConsumers, useCreateConsumer } from '@/hooks/useConsumer'; // Your consumer hooks
import AddConsumerModal from '@/components/modals/AddConsumerModal'; // Modal component for adding a consumer
import FilterConsumersModal from '@/components/modals/FilterConsumersModal'; // Import Filter Modal
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js

export default function ConsumersPage() {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    const [filter, setFilter] = useState({
        Puroks: [],
        Statuses: [],
        NotifPreferences: [],
        SortBy: 'createdAt',
        SortDir: 'asc',
        Page: 1,
        PageSize: 500, // Set page size to 500 consumers
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [internalSortDir, setInternalSortDir] = useState(filter.SortDir);
    const [sortColumn, setSortColumn] = useState('lastName');

    const router = useRouter();
    const { data: consumers, isLoading, error } = useFilterConsumers(filter);

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
                    <p className="text-xs text-gray-500 mt-2">Consumers with an active water connection.</p>
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
                    <p className="text-xs text-gray-500 mt-2">Consumers whose connection has been temporarily disconnected.</p>
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
                    <p className="text-xs text-gray-500 mt-2">Consumers whose connection has been permanently cut off.</p>
                </div>
            </div>

            {/* Main Container for Controls and Table */}
            <div className="px-4 md:px-8 pb-0 mt-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Search, Filter, and Add Button Container */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => setFilterModalOpen(true)}
                                    className="flex items-center justify-center border border-gray-200 bg-white shadow-sm px-4 py-2.5 rounded-lg hover:bg-gray-50 hover:shadow transition-all duration-200"
                                >
                                    <FunnelIcon className="w-5 h-5 text-gray-600 mr-2" /> Filter
                                </button>
                                <div className="relative w-full sm:w-64">
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
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="bg-[#fb8500] text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 flex items-center gap-2 shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap w-full sm:w-auto"
                            >
                                <PlusIcon className="w-5 h-5 text-white" /> Add Consumer
                            </button>
                        </div>
                    </div>

                    {/* Consumers Table */}
                    <div className="overflow-x-auto">
                        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        <th 
                                            className="p-3 text-left cursor-pointer hover:bg-gray-300 font-semibold text-gray-900 border-b border-gray-300"
                                            onClick={() => handleSort('lastName')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Name
                                                <span className={`text-sm ${sortColumn === 'lastName' ? (internalSortDir === 'asc' ? 'text-blue-700' : 'text-red-700') : 'text-gray-600'}`}>
                                                    {sortColumn === 'lastName' ? (internalSortDir === 'asc' ? '↑' : '↓') : '↕'}
                                                </span>
                                            </div>
                                        </th>
                                        <th 
                                            className="p-3 text-center cursor-pointer hover:bg-gray-300 font-semibold text-gray-900 border-b border-gray-300"
                                            onClick={() => handleSort('purok')}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                Purok
                                                <span className={`text-sm ${sortColumn === 'purok' ? (internalSortDir === 'asc' ? 'text-blue-700' : 'text-red-700') : 'text-gray-600'}`}>
                                                    {sortColumn === 'purok' ? (internalSortDir === 'asc' ? '↑' : '↓') : '↕'}
                                                </span>
                                            </div>
                                        </th>
                                        <th className="p-3 text-center font-semibold text-gray-900 border-b border-gray-300">Meter No.</th>
                                        <th className="p-3 text-center font-semibold text-gray-900 border-b border-gray-300">Notification Preference</th>
                                        <th className="p-3 text-center font-semibold text-gray-900 border-b border-gray-300">Status</th>
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
                                                <td className="p-3 text-center text-gray-600">{consumer.notifPreference ? consumer.notifPreference.replace(/_/g, ' ').replace('SMS and Email', 'SMS and Email') : '-'}</td>
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
