'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';  // Fetch search params (consumerId)
import { useConsumerById, useFilterConsumerBills } from '@/hooks/useConsumer';  // Fetch consumer by ID
import { PencilIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import EditConsumerModal from '@/components/modals/EditConsumerModal'; // Modal component for adding a consumer
import FilterConsumerBillsModal from '@/components/modals/FilterConsumersModal';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';

const ConsumerDetailPage = () => {
    const searchParams = useSearchParams(); // For reading the query params
    const consumerId = searchParams.get('consumerId'); // Get consumerId from URL query params
    const router = useRouter();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState('monthYear');
    const [sortDirection, setSortDirection] = useState('asc');
    const [filter, setFilter] = useState({
        consumerId: consumerId,
        page: 1,
        pageSize: 10
    });

    // Fetch consumer details by ID
    const { getConsumer } = useConsumerById(consumerId);
    // Fetch filtered consumer bills based on filter
    const { filterConsumerBills } = useFilterConsumerBills(filter);

    // Handle search and filtering logic
    const filteredInfo = useMemo(() => {
        if (!filterConsumerBills?.data?.data) return [];
        return filterConsumerBills.data.data.filter(info => {
            const formattedMonthYear = new Date(info.monthYear).toLocaleString('default', { month: 'long', year: 'numeric' }).toLowerCase();
            const status = info.status.toLowerCase();
            const paymentType = info.paymentType?.toLowerCase() || '';
            return (
                formattedMonthYear.includes(searchQuery.toLowerCase()) ||
                status.includes(searchQuery.toLowerCase()) ||
                paymentType.includes(searchQuery.toLowerCase())
            );
        });
    }, [filterConsumerBills?.data?.data, searchQuery]);

    // Handle sorting logic
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const sortedInfo = useMemo(() => {
        return [...filteredInfo].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredInfo, sortColumn, sortDirection]);

    // Make sure hooks are always executed in the same order
    if (getConsumer.isLoading || filterConsumerBills.isLoading) {
        return <div>Loading...</div>;
    }

    if (getConsumer.error || filterConsumerBills.error) {
        return <div>Error loading data</div>;
    }

    // Destructure consumer and bills data from the response
    const consumer = getConsumer.data;
    const consumerBillsInfo = sortedInfo;

    const total = filterConsumerBills?.data?.totalCount || 0;
    const start = (filter.page - 1) * filter.pageSize + 1;
    const end = start + consumerBillsInfo.length - 1;

    const handleApplyFilter = (newFilter) => {
        setFilter(newFilter);
    };

    // Handle row click for navigation
    const handleRowClick = ( consumerId, monthYear ) => {
        router.push(`/billings_payment/bill_pay/?consumerId=${consumerId}&monthYear=${monthYear}`);
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            <div className="flex p-2 bg-white shadow-inner justify-between items-center">
                <div className="flex sm:flex-row flex-col ">
                    <Link href="/consumers">
                        <h1 className="text-2xl font-bold pl-2 cursor-pointer hover:text-blue-500 hover:underline hover:undeline-offset-1">
                            Consumer
                        </h1>
                    </Link>
                    <h1 className="text-2xl font-bold pl-2"> {consumer.firstName} {consumer.lastName}</h1>
                </div>
                <button
                    className="justify-center bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => setEditModalOpen(true)}
                >
                    <PencilIcon className="w-4 h-5 text-white" />Consumer
                </button>
            </div>

            <div className="flex flex-col p-6 space-y-6">
                {/* Consumer Information */}
                <div className=" p-6 ">
                    <h1 className="text-2xl mb-4 font-bold">{consumer.lastName}, {consumer.firstName}</h1>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Meter Number:</p>
                            <p>{consumer.meterNumber}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Purok:</p>
                            <p>{consumer.purok.replace('_', ' ')}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Email:</p>
                            <p>{consumer.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Phone Number:</p>
                            <p>{consumer.phoneNumber}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Notification Preference:</p>
                            <p>{consumer.notifPreference}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Status:</p>
                            <p>{consumer.status}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="w-32 font-semibold">Created At:</p>
                            <p>{formatDate(consumer.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Information Table */}
                <div className="">
                    <div className="flex flex-col justify-between items-center mt-12 mb-4 md:flex-row">
                        <h2 className="text-xl text-slate-600 font-bold ml-4 mb-5 md:mb-0">Billing information</h2>

                        <div className="flex justify-end space-x-5 items-center mb-2">
                            <button onClick={() => setFilterModalOpen(true)}
                                className="flex items-center gap-1 border border-cyan-400/40 bg-white shadow px-4 py-2 rounded hover:bg-cyan-100 hover:shadow-sm">
                                <FunnelIcon className="w-4.5 h-4.5 text-cyan-400 mr-1" /> Filter
                            </button>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-5 h-5 text-cyan-400" />
                                <input
                                    type="text"
                                    placeholder="Search Month or Status"
                                    className="placeholder:text-sm pl-8 bg-cyan-50 p-2 rounded shadow"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-cyan-50 rounded-lg overflow-hidden shadow-sm">

                    <table className="w-full text-sm text-left text-slate-700">
                        <thead className="bg-cyan-100 text-gray-500">
                            <tr>
                                <th
                                    className="p-3 cursor-pointer text-center"
                                    onClick={() => handleSort('monthYear')}
                                >
                                    Billing Month <span className={`ml-2 ${sortColumn === 'monthYear' ? (sortDirection === 'asc' ? 'text-blue-500' : 'text-red-500') : 'text-gray-500'}`}>↑↓</span>
                                </th>
                                <th
                                    className="p-3 cursor-pointer text-center"
                                    onClick={() => handleSort('totalAmount')}
                                >
                                    Total Amount <span className={`ml-2 ${sortColumn === 'totalAmount' ? (sortDirection === 'asc' ? 'text-blue-500' : 'text-red-500') : 'text-gray-500'}`}>↑↓</span>
                                </th>
                                <th className="p-3 text-center">Status</th>
                                <th
                                    className="p-3 cursor-pointer text-center"
                                    onClick={() => handleSort('amountPaid')}
                                >
                                    Amount Paid <span className={`ml-2 ${sortColumn === 'amountPaid' ? (sortDirection === 'asc' ? 'text-blue-500' : 'text-red-500') : 'text-gray-500'}`}>↑↓</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {consumerBillsInfo.length ? (
                                consumerBillsInfo.map(info => (
                                    <tr key={info.billId}
                                        onClick={() => handleRowClick(info.consumerId, info.monthYear)}
                                        className="border-t border-b border-cyan-200 hover:bg-cyan-200 text-center">
                                        <td className="p-3">{new Date(info.monthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                                        <td className="p-3">₱{info.totalAmount.toFixed(2)}</td>
                                        <td className={`p-3 ${info.status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                                            {info.status}
                                        </td>
                                        <td className="p-3">₱{info.amountPaid}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">No billing data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 flex justify-end space-x-5 items-center text-sm text-gray-600">
                        <div>
                            Rows per page: {filter.pageSize} | {start}-{end} of {total}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filter.page <= 1}
                                className="px-3 py-1 border rounded disabled:opacity-30"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filter.page * filter.pageSize >= total}
                                className="px-3 py-1 border rounded disabled:opacity-30"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            {/* Edit Consumer Modal */}
            {isEditModalOpen && (
                <EditConsumerModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    consumer={consumer} // pass the current consumer data
                />
            )}

        </div>
    );
};

export default ConsumerDetailPage;
