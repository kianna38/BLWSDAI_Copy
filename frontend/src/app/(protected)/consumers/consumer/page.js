'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';  // Fetch search params (consumerId)
import { useConsumerById, useFilterConsumerBills } from '@/hooks/useConsumer';  // Fetch consumer by ID
import { PencilIcon, FunnelIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, ArrowLeftIcon, PrinterIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import EditConsumerModal from '@/components/modals/EditConsumerModal'; // Modal component for adding a consumer
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';

const ConsumerDetailPage = () => {
    const searchParams = useSearchParams(); // For reading the query params
    const consumerId = searchParams.get('consumerId'); // Get consumerId from URL query params
    const router = useRouter();

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
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

    const handlePrint = () => {
        window.print();
    };

    // Sort indicator component
    const SortIndicator = ({ columnKey }) => {
        if (sortColumn !== columnKey) {
            return <ChevronUpIcon className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-50" />;
        }
        return sortDirection === 'asc' 
            ? <ChevronUpIcon className="w-4 h-4 ml-1" />
            : <ChevronDownIcon className="w-4 h-4 ml-1" />;
    };

    return (
        <div className="bg-slate-100 text-black min-h-screen">
            {/* Header */}
            <div className="flex p-4 bg-white shadow-md justify-between items-center print:hidden">
                <div className="flex items-center">
                    <Link href="/consumers" className="flex items-center group">
                        <ArrowLeftIcon className="w-6 h-6 text-[#fb8500] group-hover:-translate-x-1 transition mr-1" />
                        <h1 className="text-2xl font-bold pl-2 cursor-pointer group-hover:text-[#fb8500] hover:underline">
                            Consumer
                        </h1>
                    </Link>
                </div>
                <div className="flex gap-2">
                    <button
                        className="bg-[#023047] text-white px-4 py-2 rounded-lg hover:bg-[#fb8500] flex items-center gap-2 transition"
                        onClick={handlePrint}
                    >
                        <PrinterIcon className="w-5 h-5" />
                        <span>Print</span>
                    </button>
                    <button
                        className="bg-[#fb8500] text-white px-4 py-2 rounded-lg hover:bg-[#023047] flex items-center gap-2 transition"
                        onClick={() => setEditModalOpen(true)}
                    >
                        <PencilIcon className="w-5 h-5" />
                        <span>Edit Consumer</span>
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-6">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="print:flex print:justify-between print:items-center print:mb-4">
                        <h1 className="text-3xl font-bold text-[#023047] mb-6 print:mb-0">
                            {consumer.lastName}, {consumer.firstName}
                        </h1>
                        <div className="print:text-right">
                            <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Meter Number</p>
                            <p className="font-medium text-gray-800">{consumer.meterNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Purok</p>
                            <p className="font-medium text-gray-800">{consumer.purok.replace('_', ' ')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Phone Number</p>
                            <p className="font-medium text-gray-800">{consumer.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Email</p>
                            <p className="font-medium text-gray-800">{consumer.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Notification Preference</p>
                            <p className="font-medium text-gray-800">{consumer.notifPreference}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                consumer.status === 'Active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : consumer.status === 'Disconnected'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-red-100 text-red-700'
                            }`}>
                                {consumer.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-gray-500 font-semibold mb-1">Created At</p>
                            <p className="font-medium text-gray-800">{formatDate(consumer.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Information */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 print:mb-4">
                        <h2 className="text-2xl font-bold text-[#023047]">Billing Information</h2>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto print:hidden">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search Month or Status"
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th 
                                        className="p-3 text-center cursor-pointer group hover:bg-gray-100"
                                        onClick={() => handleSort('monthYear')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Billing Month
                                            <SortIndicator columnKey="monthYear" />
                                        </div>
                                    </th>
                                    <th className="p-3 text-center">Cubic Used</th>
                                    <th className="p-3 text-center">Amount</th>
                                    <th className="p-3 text-center">Balance</th>
                                    <th className="p-3 text-center">Total Amount</th>
                                    <th className="p-3 text-center">Amount Paid</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consumerBillsInfo.length ? (
                                    consumerBillsInfo.map((info) => (
                                        <tr
                                            key={info.billId}
                                            onClick={() => !window.print && handleRowClick(info.consumerId, info.monthYear)}
                                            className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 print:border-gray-300"
                                        >
                                            <td className="p-3 text-center">
                                                {new Date(info.monthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="p-3 text-center">{info.cubicUsed} m³</td>
                                            <td className="p-3 text-center text-sky-600">₱{info.totalAmount.toFixed(2)}</td>
                                            <td className="p-3 text-center text-red-600">₱{info.balance.toFixed(2)}</td>
                                            <td className="p-3 text-center text-green-600">₱{(info.totalAmount + info.balance).toFixed(2)}</td>
                                            <td className="p-3 text-center">₱{info.amountPaid.toFixed(2)}</td>
                                            <td className="p-3 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                                    info.status === 'Paid' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : info.status === 'Partial'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {info.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-6 text-gray-500">
                                            No billing data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 print:hidden">
                        <div className="text-sm text-gray-600">
                            Showing {start}-{end} of {total} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filter.page <= 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors duration-200"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilter((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filter.page * filter.pageSize >= total}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-white transition-colors duration-200"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditConsumerModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    consumer={consumer}
                />
            )}

            {/* Add print styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Hide sidebar */
                    aside, nav, [role="navigation"] {
                        display: none !important;
                    }
                    /* Adjust main content to full width */
                    main {
                        margin-left: 0 !important;
                        width: 100% !important;
                    }
                    /* Hide the back button and edit buttons */
                    .flex.p-4.bg-white.shadow-md {
                        display: none !important;
                    }
                    /* Hide filter and search controls */
                    .flex.flex-col.md\\:flex-row.justify-between.items-start.md\\:items-center.gap-4.mb-6 {
                        display: none !important;
                    }
                    /* Hide pagination */
                    .flex.flex-col.sm\\:flex-row.justify-between.items-center.gap-4.mt-6.pt-4.border-t.border-gray-100 {
                        display: none !important;
                    }
                    /* Adjust main content for print */
                    .bg-slate-100 {
                        background: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Hide background colors */
                    .bg-white {
                        background: none !important;
                    }
                    /* Remove shadows and borders */
                    .shadow-lg {
                        box-shadow: none !important;
                    }
                    .rounded-xl {
                        border-radius: 0 !important;
                    }
                    /* Adjust borders for print */
                    .border {
                        border: 1px solid #e5e7eb !important;
                    }
                    .border-t {
                        border-top: 1px solid #e5e7eb !important;
                    }
                    .border-gray-100 {
                        border-color: #e5e7eb !important;
                    }
                    /* Adjust background colors */
                    .bg-gray-50 {
                        background-color: #f9fafb !important;
                    }
                    /* Text colors */
                    .text-gray-600 {
                        color: #4b5563 !important;
                    }
                    .text-gray-700 {
                        color: #374151 !important;
                    }
                    .text-gray-800 {
                        color: #1f2937 !important;
                    }
                    .text-gray-900 {
                        color: #111827 !important;
                    }
                    .text-[#023047] {
                        color: #023047 !important;
                    }
                    /* Status colors */
                    .bg-green-100 {
                        background-color: #d1fae5 !important;
                    }
                    .text-green-700 {
                        color: #047857 !important;
                    }
                    .bg-red-100 {
                        background-color: #fee2e2 !important;
                    }
                    .text-red-700 {
                        color: #b91c1c !important;
                    }
                    /* Adjust spacing */
                    .p-4, .md\\:p-6 {
                        padding: 0 !important;
                    }
                    .mb-6 {
                        margin-bottom: 1rem !important;
                    }
                    /* Table styles */
                    table {
                        page-break-inside: auto !important;
                        width: 100% !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    thead {
                        display: table-header-group !important;
                    }
                    tbody {
                        display: table-row-group !important;
                    }
                    /* Ensure content fits page */
                    .min-h-screen {
                        min-height: auto !important;
                    }
                    /* Add page break between sections */
                    .bg-white.rounded-xl.shadow-lg.p-6.mb-6 {
                        page-break-after: always !important;
                    }
                    /* Adjust consumer details section */
                    .grid.grid-cols-1.md\\:grid-cols-2.gap-6 {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 1rem !important;
                    }
                    /* Ensure proper spacing in consumer details */
                    .text-gray-500.font-semibold.mb-1 {
                        margin-bottom: 0.25rem !important;
                    }
                    .font-medium.text-gray-800 {
                        margin-bottom: 0.5rem !important;
                    }
                    /* Ensure content is visible */
                    .print\\:hidden {
                        display: none !important;
                    }
                    /* Show content sections */
                    .bg-white.rounded-xl.shadow-lg.p-6 {
                        display: block !important;
                        visibility: visible !important;
                    }
                    /* Ensure text is visible */
                    .text-3xl, .text-2xl, .text-sm, .text-base {
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ConsumerDetailPage;
