'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PencilIcon, PlusIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'; // Import useRouter from Next.js
import { useBillsByMonthYear } from '@/hooks/useBill'; // Filter consumers
import { useFilterConsumers } from '@/hooks/useConsumer'; // Filter consumers
import { useMotherMeterReadings, useSystemLoss } from '@/hooks/useMotherMeter'; // Get all mother meter readings

export default function BillingsAndPaymentPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const today = new Date();
    const initialMonthYear = `${today.getFullYear()} ${today.toLocaleString('default', { month: 'long' })}`;

    const [selectedMonthYear, setSelectedMonthYear] = useState(initialMonthYear);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'ascending'
    });

    const { readingsQuery } = useMotherMeterReadings(); // Fetch all mother meter readings
    const { getMonthBills } = useBillsByMonthYear(selectedMonthYear, page, pageSize);
    const { data: consumerData, isLoading: consumerLoading } = useFilterConsumers({ status: 'Active', pageSize: 500 });

    // Filter the consumer data based on the search query
    const filteredConsumers = useMemo(() => {
        if (!searchQuery) return consumerData?.data || [];
        return consumerData?.data.filter(consumer => {
            const fullName = `${consumer.firstName} ${consumer.lastName}`.toLowerCase();
            const purok = consumer.purok?.toLowerCase() || '';
            return fullName.includes(searchQuery.toLowerCase()) || purok.includes(searchQuery.toLowerCase());
        }) || [];
    }, [consumerData, searchQuery]);

    // Filter readings based on matching consumerId
    const filteredBills = useMemo(() => {
        if (!getMonthBills?.data?.data || filteredConsumers.length === 0) return [];
        return getMonthBills.data.data.filter(reading =>
            filteredConsumers.some(consumer => consumer.consumerId === reading.consumerId)
        );
    }, [getMonthBills?.data?.data, filteredConsumers]);

    // Sorting function
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Sort the filtered bills
    const sortedBills = useMemo(() => {
        if (!sortConfig.key) return filteredBills;

        return [...filteredBills].sort((a, b) => {
            const consumerA = consumerData.data.find(consumer => consumer.consumerId === a.consumerId);
            const consumerB = consumerData.data.find(consumer => consumer.consumerId === b.consumerId);

            if (sortConfig.key === 'purok') {
                const purokA = consumerA?.purok?.replace('_', ' ') || '';
                const purokB = consumerB?.purok?.replace('_', ' ') || '';
                return sortConfig.direction === 'ascending' 
                    ? purokA.localeCompare(purokB)
                    : purokB.localeCompare(purokA);
            }

            if (sortConfig.key === 'name') {
                const nameA = consumerA ? `${consumerA.lastName}, ${consumerA.firstName}` : '';
                const nameB = consumerB ? `${consumerB.lastName}, ${consumerB.firstName}` : '';
                return sortConfig.direction === 'ascending'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }

            return 0;
        });
    }, [filteredBills, sortConfig, consumerData]);

    // Sort indicator component
    const SortIndicator = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronUpIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
        }
        return sortConfig.direction === 'ascending' 
            ? <ChevronUpIcon className="w-4 h-4 ml-1" />
            : <ChevronDownIcon className="w-4 h-4 ml-1" />;
    };

    if (getMonthBills.isLoading || consumerLoading) return <div>Loading...</div>;
    if (getMonthBills.isError) return <div>Error loading bills...</div>;

    // Extract available months from the fetched mother meter readings
    // what to do if there is the bills were not yet generated for the current reading month? 
    const availableMonths = readingsQuery?.data?.map((reading) => {
        const monthYear = new Date(reading.monthYear);
        const year = monthYear.getFullYear();
        const month = monthYear.toLocaleString('default', { month: 'long' }); // Full month name like January, February, etc.
        return `${year} ${month}`;
    }) || [];


    // Remove duplicates
    const uniqueAvailableMonths = [...new Set(availableMonths)];


    // Extract necessary data from queries
    const bills = getMonthBills.data?.data || [];

    const handleMonthYearChange = (e) => {
        setSelectedMonthYear(e.target.value);
    };

    // Handle row click for navigation
    const handleRowClick = (consumerId, monthYear) => {
        router.push(`/billings_payment/bill_pay/?consumerId=${consumerId}&monthYear=${monthYear}`);
    };


    // Handle pagination (previous and next page)
    const handleNextPage = () => {
        if (page * pageSize < getFilteredReading.data?.totalCount) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    console.log(bills);

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Header */}
            <div className="flex p-4 bg-white shadow-md justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold pl-2 text-[#023047]">Billings and Payment</h1>
                </div>
            </div>

            <div className="p-4 md:p-6">
                {/* Main Container */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Filters Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center">
                                <label htmlFor="monthYear" className="text-lg font-semibold text-[#023047]">Date</label>
                                <select
                                    id="monthYear"
                                    value={selectedMonthYear}
                                    onChange={handleMonthYearChange}
                                    className="ml-2 border border-gray-300 rounded-md p-2 h-fit focus:ring-2 focus:ring-[#023047] focus:border-[#023047] transition-colors"
                                >
                                    {uniqueAvailableMonths.map((monthYear) => (
                                        <option key={monthYear} value={monthYear}>
                                            {monthYear}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative w-full md:w-64">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#023047]" />
                                <input
                                    type="text"
                                    placeholder="Search Purok or Name"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#023047] focus:border-[#023047] transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-700">
                            <thead className="bg-[#e5e5e5] text-gray-600 font-medium">
                                {/* Mobile Header */}
                                <tr className="md:hidden">
                                    <th className="p-4 text-center">
                                        Bills Information
                                    </th>
                                </tr>

                                {/* Desktop Header */}
                                <tr className="hidden md:table-row">
                                    <th 
                                        className="p-4 w-1/11 text-center cursor-pointer group hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('purok')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Purok
                                            <SortIndicator columnKey="purok" />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 w-2/11 text-center cursor-pointer group hover:bg-gray-200 transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Name
                                            <SortIndicator columnKey="name" />
                                        </div>
                                    </th>
                                    <th className="p-4 w-2/11 text-center">Amount</th>
                                    <th className="p-4 w-2/11 text-center">Balance</th>
                                    <th className="p-4 w-2/11 text-center">Total Amount</th>
                                    <th className="p-4 w-2/11 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedBills.map((bill, index) => {
                                    const consumer = consumerData.data.find(consumer => consumer.consumerId === bill.consumerId);
                                    return (
                                        <tr 
                                            key={index}
                                            onClick={() => handleRowClick(consumer.consumerId, bill.monthYear)}
                                            className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        >
                                            {/* Mobile View */}
                                            <td className="md:hidden p-4">
                                                <div className="flex flex-col space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Purok:</span>
                                                        <span className="text-gray-800">{consumer?.purok.replace('_', ' ') || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Name:</span>
                                                        <span className="text-gray-800">{consumer ? `${consumer.lastName}, ${consumer.firstName}` : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Amount:</span>
                                                        <span className="text-sky-600 font-medium">₱ {bill.totalAmount - bill.balance} </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Balance:</span>
                                                        <span className="text-red-600 font-medium">₱ {bill.balance}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Total Amount:</span>
                                                        <span className="text-green-600 font-medium">₱ {bill.totalAmount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-600">Status:</span>
                                                        <span className={`font-medium ${
                                                            bill.status === 'Paid'
                                                                ? 'text-green-600'
                                                                : bill.status === 'Partial'
                                                                    ? 'text-yellow-500'
                                                                    : 'text-red-600'
                                                        }`}>
                                                            {bill.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Desktop View */}
                                            <td className="hidden md:table-cell p-4 text-center text-gray-800">
                                                {consumer?.purok.replace('_', ' ') || 'N/A'}
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-center">
                                                <span className="font-medium text-gray-800">
                                                    {consumer ? `${consumer.lastName}, ${consumer.firstName}` : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-center">
                                                <span className="text-sky-600 font-medium">₱ {bill.totalAmount - bill.balance}</span>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-center">
                                                <span className="text-red-600 font-medium">₱ {bill.balance}</span>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-center">
                                                <span className="text-green-600 font-medium">₱ {bill.totalAmount}</span>
                                            </td>
                                            <td className="hidden md:table-cell p-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    bill.status === 'Paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : bill.status === 'Partial'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing {(page - 1) * pageSize + 1} to {Math.min((page - 1) * pageSize + pageSize, getMonthBills.data?.totalCount || 0)} of {getMonthBills.data?.totalCount || 0} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page <= 1}
                                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={page * pageSize >= getMonthBills.data?.totalCount}
                                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
