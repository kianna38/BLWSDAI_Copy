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
                {/* Redesigned Consumer Info Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center border border-gray-100">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#fb8500] to-[#023047] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                            {consumer.firstName[0]}{consumer.lastName[0]}
                        </div>
                        <span className="mt-2 text-sm text-gray-500 font-medium">Consumer</span>
                    </div>
                    {/* Info Fields */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 01-8 0M12 3v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4m-8 0v4m0 0a4 4 0 004 4h4m-8-4a4 4 0 01-4 4H4' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Full Name</p>
                                <p className="font-bold text-lg text-gray-900">{consumer.lastName}, {consumer.firstName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2-2zm0 0V7m0 4v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Meter Number</p>
                                <p className="font-medium text-gray-800">{consumer.meterNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Email</p>
                                <p className="font-medium text-gray-800">{consumer.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.48 19h9.04a2 2 0 001.83-3.3L17 13M7 13V6a1 1 0 011-1h6a1 1 0 011 1v7' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Phone Number</p>
                                <p className="font-medium text-gray-800">{consumer.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 0V4m0 4v4m0 0a4 4 0 01-4 4H4m8-4a4 4 0 014 4h4' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Purok</p>
                                <p className="font-medium text-gray-800">{consumer.purok.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Notification Preference</p>
                                <p className="font-medium text-gray-800">{consumer.notifPreference}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6l4 2' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Created At</p>
                                <p className="font-medium text-gray-800">{formatDate(consumer.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#fb8500]">
                                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4' /></svg>
                            </span>
                            <div>
                                <p className="text-gray-500 font-semibold text-xs">Status</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${
                                    consumer.status === 'Active'
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : consumer.status === 'Disconnected'
                                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                                            : 'bg-red-100 text-red-700 border-red-300'
                                }`}>
                                    {consumer.status}
                                </span>
                            </div>
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
                                    <th className="p-3 text-center">Date Paid</th>
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
                                    <th className="p-3 text-center">System Loss</th>
                                    <th className="p-3 text-center">Penalty</th>
                                    <th className="p-3 text-center">Debit</th>
                                    <th className="p-3 text-center">Credit</th>
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
                                            <td className="p-3 text-center text-gray-600">
                                                {info.paymentDate ? formatDate(info.paymentDate) : '-'}
                                            </td>
                                            <td className="p-3 text-center">
                                                {new Date(info.monthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="p-3 text-center">{info.cubicUsed} m³</td>
                                            <td className="p-3 text-center text-sky-600">₱{info.totalAmount.toFixed(2)}</td>
                                            <td className="p-3 text-center text-red-600">₱{info.balance.toFixed(2)}</td>
                                            <td className="p-3 text-center text-orange-600">₱{info.systemLoss.toFixed(2)}</td>
                                            <td className="p-3 text-center text-purple-600">₱{(info.penalty || 0).toFixed(2)}</td>
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
                                        <td colSpan={10} className="text-center py-6 text-gray-500">
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
                        size: A4 landscape;
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
                        font-size: 10pt !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        padding: 0.5rem !important;
                        border: 1px solid #e5e7eb !important;
                        text-align: center !important;
                        white-space: nowrap !important;
                    }
                    th {
                        background-color: #f9fafb !important;
                        font-weight: 600 !important;
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
                    /* Column widths for better fit */
                    th:nth-child(1), td:nth-child(1) { /* Date Paid */
                        width: 10% !important;
                    }
                    th:nth-child(2), td:nth-child(2) { /* Billing Month */
                        width: 12% !important;
                    }
                    th:nth-child(3), td:nth-child(3) { /* Cubic Used */
                        width: 8% !important;
                    }
                    th:nth-child(4), td:nth-child(4) { /* Amount */
                        width: 8% !important;
                    }
                    th:nth-child(5), td:nth-child(5) { /* Balance */
                        width: 8% !important;
                    }
                    th:nth-child(6), td:nth-child(6) { /* System Loss */
                        width: 8% !important;
                    }
                    th:nth-child(7), td:nth-child(7) { /* Penalty */
                        width: 8% !important;
                    }
                    th:nth-child(8), td:nth-child(8) { /* Debit */
                        width: 10% !important;
                    }
                    th:nth-child(9), td:nth-child(9) { /* Credit */
                        width: 10% !important;
                    }
                    th:nth-child(10), td:nth-child(10) { /* Status */
                        width: 8% !important;
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
                    /* Adjust overflow for table */
                    .overflow-x-auto {
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ConsumerDetailPage;
